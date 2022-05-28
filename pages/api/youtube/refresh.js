import { buildError, errors, isPrismaError } from '@/constants/errors';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import qs from 'qs';

const secret = process.env.NEXTAUTH_SECRET;
const REFRESH_VIDEOS = 'https://www.googleapis.com/youtube/v3/videos';

async function uploadThumbnail(url, id) {
  return cloudinary.uploader.upload(url, {
    public_id: id,
    upload_preset: 'search-thumbnail',
  }, (error, result) => {
    if (error) {
      return error;
    }
    return result;
  });
}

export default async function handler(req, res) {
  const { accessToken, user: { name } } = await getToken({ req, secret });

  // Signed in
  if (accessToken) {
    const user = name;
    const { videoIds } = req.body;

    try {
      if (req.method !== 'POST') {
        return buildError(res, errors.INVALID_METHOD, { method: req.method });
      }

      // Get general channel information
      const response = await axios.get(REFRESH_VIDEOS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          part: ['id', 'snippet'],
          maxResults: 50,
          id: videoIds,
        },
        paramsSerializer: (params) => qs.stringify(params, {
          encode: false, arrayFormat: 'repeat',
        }),
      });

      const videos = await Promise.all(response.data.items.map(async (video) => {
        const {
          id,
          snippet: {
            title, description, publishedAt, thumbnails: { maxres: { url } },
          },
        } = video;
        const result = await uploadThumbnail(url, `${user}/${id}`);
        return {
          user,
          videoId: id,
          publishedAt,
          title,
          description,
          tags: video?.snippet?.tags?.join(',') ?? null,
          image_thumbnail: result.secure_url,
        };
      }));

      // Create (or update) underlying videos in Video schema
      await prisma.$transaction(
        videos.map((video) => prisma.Video.upsert({
          where: { videoId: video.videoId },
          update: video,
          create: video,
        })),
      );

      return res.status(response.status).json({ message: 'Refresh completed successfully.' });
    } catch (e) {
      // Catch Prisma error
      if (isPrismaError(e)) {
        return buildError(res, errors.PRISMA_GENERIC_ERROR, {
          code: 500,
          message: `[${e.code}] ${e.message}`,
        });
      }
      // Catch YouTube API error
      const error = e?.response?.data?.error;
      if (error) {
        return buildError(res, errors.YOUTUBE_API_GENERIC_ERROR, {
          code: error.code,
          message: error.message,
          serviceMessage: error.message,
        });
      }
      // Catch all other errors
      return buildError(res, errors.CATCH_ALL_GENERIC_ERROR, { code: e.status });
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
