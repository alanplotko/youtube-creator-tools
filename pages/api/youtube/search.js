import { buildError, errors, isPrismaError } from '@/constants/errors';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import qs from 'qs';

const secret = process.env.NEXTAUTH_SECRET;
const SEARCH = 'https://youtube.googleapis.com/youtube/v3/search';

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
    const { query } = req.query;

    try {
      const videoSearch = await prisma.VideoSearch.upsert({
        where: { user_query: { user, query } },
        update: {},
        create: { user, query },
        include: { videos: true },
      });

      // Search query already exists and is non-empty
      if (videoSearch.videos.length > 0) {
        return res.status(200).json(videoSearch);
      }

      // Get general channel information
      const response = await axios.get(SEARCH, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          part: 'snippet',
          forMine: true,
          maxResults: 50,
          q: query,
          type: 'video',
          order: 'date',
        },
        paramsSerializer: (params) => qs.stringify(params, {
          encode: false, arrayFormat: 'repeat',
        }),
      });

      const videos = await Promise.all(response.data.items.map(async (video) => {
        const {
          id: { videoId },
          snippet: {
            title, description, publishedAt, thumbnails: { maxres: { url } },
          },
        } = video;
        const result = await uploadThumbnail(url, `${user}/${query}/${videoId}`);
        const item = {
          user,
          videoId,
          publishedAt,
          title,
          description,
          tags: video?.snippet?.tags?.join(',') ?? null,
          image_thumbnail: result.secure_url,
        };
        return {
          create: item,
          update: item,
          where: { videoId },
        };
      }));

      const result = await prisma.VideoSearch.update({
        where: { user_query: { user, query } },
        data: {
          videos: {
            upsert: videos,
          },
        },
        include: {
          videos: true,
        },
      });

      return res.status(response.status).json(result);
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
