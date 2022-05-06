import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import qs from 'qs';

const secret = process.env.NEXTAUTH_SECRET;
const SEARCH = 'https://youtube.googleapis.com/youtube/v3/search';

export default async function handler(req, res) {
  const { accessToken, user: { name } } = await getToken({ req, secret });

  // Signed in
  if (accessToken) {
    const user = name;
    const { query } = req.query;

    const videoSearch = await prisma.VideoSearch.findFirst({
      where: { user, query },
      include: { videos: true },
    });
    if (videoSearch) {
      // Search query already exists
      return res.status(200).json(videoSearch);
    }

    try {
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

      const videos = response.data.items.map((video) => {
        const {
          id: { videoId },
          snippet: {
            title, description, publishedAt, thumbnails: { maxres: { url } },
          },
        } = video;
        return {
          user,
          videoId,
          title,
          description,
          publishedAt,
          image_thumbnail: url,
        };
      });

      const result = await prisma.VideoSearch.create({
        data: {
          user,
          query,
          videos: {
            create: videos,
          },
        },
        include: {
          videos: true,
        },
      });

      return res.status(response.status).json(result);
    } catch (e) {
      // Catch YouTube API error
      const error = e?.response?.data?.error;
      if (error) {
        return buildError(res, errors.YOUTUBE_API_GENERIC_ERROR, {
          code: error.code,
          serviceMessage: error.message,
        });
      }
      // Catch all other errors
      return buildError(res, errors.YOUTUBE_API_GENERIC_ERROR, { code: e.status });
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
