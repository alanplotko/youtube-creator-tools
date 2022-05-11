import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { getToken } from 'next-auth/jwt';
import moment from 'moment';
import prisma from '@/lib/prisma';
import qs from 'qs';

const secret = process.env.NEXTAUTH_SECRET;
const SEARCH = 'https://youtube.googleapis.com/youtube/v3/search';
const VIDEOS = 'https://www.googleapis.com/youtube/v3/videos';

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
    const { forceRefresh } = req.query;

    try {
      // Get latest stats from database
      let stats = await prisma.TopVideos
        .findFirst({
          where: { user },
          include: { videos: { orderBy: { viewCount: 'desc' } } },
        })
        .then((response) => JSON.parse(JSON.stringify(response)));

      // Stats = null when not found in database for user
      const isStale = stats?.updatedAt && moment().diff(stats.updatedAt, 'hours') >= 4;
      if (forceRefresh === 'false' && stats !== null && !isStale) {
        return res.status(200).json(stats);
      }

      const searchResponse = await axios.get(SEARCH, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          part: 'snippet',
          forMine: true,
          maxResults: 10,
          type: 'video',
          order: 'viewCount',
        },
        paramsSerializer: (params) => qs.stringify(params, {
          encode: false, arrayFormat: 'repeat',
        }),
      });

      const videos = searchResponse.data.items.map((video) => video.id.videoId);
      const videoResponse = await axios.get(VIDEOS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          part: ['snippet', 'statistics'],
          id: videos,
        },
        paramsSerializer: (params) => qs.stringify(params, {
          encode: false, arrayFormat: 'repeat',
        }),
      });

      const topVideos = await Promise.all(videoResponse.data.items.map(async (video) => {
        const {
          id,
          snippet: {
            publishedAt, title, tags, thumbnails: { maxres: { url } },
          },
          statistics: {
            viewCount, likeCount, dislikeCount, favoriteCount, commentCount,
          },
        } = video;
        const result = await uploadThumbnail(url, `${user}/top_videos/${id}`);
        return {
          user,
          videoId: id,
          publishedAt,
          title,
          tags: tags.join(','),
          image_thumbnail: result.secure_url,
          viewCount: parseInt(viewCount, 10),
          likeCount: parseInt(likeCount, 10),
          dislikeCount: parseInt(dislikeCount, 10),
          favoriteCount: parseInt(favoriteCount, 10),
          commentCount: parseInt(commentCount, 10),
        };
      }));

      if (stats === null) {
        const data = {
          user,
          videos: { create: topVideos },
        };
        stats = await prisma.TopVideos.create({
          where: { user },
          data,
          include: {
            videos: {
              orderBy: {
                viewCount: 'desc',
              },
            },
          },
        });
      } else {
        await prisma.TopVideos.update({
          where: { user },
          data: {
            videos: { deleteMany: {} },
          },
        });
        stats = await prisma.TopVideos.update({
          where: { user },
          data: {
            user,
            videos: { create: topVideos },
          },
          include: {
            videos: {
              orderBy: {
                viewCount: 'desc',
              },
            },
          },
        });
      }

      return res.status(200).json(stats);
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
