import { buildError, errors, isPrismaError } from '@/constants/errors';
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
      let stats = await prisma.TopVideos.upsert({
        where: { user },
        update: {},
        create: { user },
        include: { videos: { orderBy: { viewCount: 'desc' } } },
      });

      // Stats = null when not found in database for user
      const isStale = stats?.updatedAt && moment().diff(stats.updatedAt, 'hours') >= 4;
      if (forceRefresh === 'false' && stats.videos.length > 0 && !isStale) {
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
            publishedAt, title, description, tags, thumbnails: { maxres: { url } },
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
          description,
          tags: tags.join(','),
          image_thumbnail: result.secure_url,
          viewCount: parseInt(viewCount, 10),
          likeCount: parseInt(likeCount, 10),
          dislikeCount: parseInt(dislikeCount, 10),
          favoriteCount: parseInt(favoriteCount, 10),
          commentCount: parseInt(commentCount, 10),
        };
      }));

      // Create (or update) underlying top videos in Video schema
      await prisma.$transaction(
        topVideos.map((video) => prisma.Video.upsert({
          where: { videoId: video.videoId },
          update: video,
          create: video,
        })),
      );

      // Update user's top videos to point to latest 10 (since top 10 videos can change)
      stats = await prisma.TopVideos.update({
        where: { user },
        data: {
          user, // Force update of updatedAt timestamp
          videos: {
            set: topVideos.map((video) => ({ videoId: video.videoId })),
          },
        },
        include: {
          videos: {
            orderBy: {
              viewCount: 'desc',
            },
          },
        },
      });

      return res.status(200).json(stats);
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
