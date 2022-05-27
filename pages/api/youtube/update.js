import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import qs from 'qs';

const secret = process.env.NEXTAUTH_SECRET;
const UPDATE = 'https://youtube.googleapis.com/youtube/v3/videos';

export default async function handler(req, res) {
  const token = (await getToken({ req, secret }))?.accessToken ?? req?.query?.accessToken;

  // Signed in
  if (token) {
    if (req.method !== 'POST') {
      return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }

    const { data } = req.body;

    try {
      // Update video title, description, category, and tags
      const response = await axios.put(
        UPDATE,
        {
          id: data.videoId,
          snippet: {
            categoryId: 20, // Gaming category
            description: data.description,
            tags: data.tags,
            title: data.title,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            part: ['snippet'],
          },
          paramsSerializer: (params) => qs.stringify(params, { encode: false, arrayFormat: 'repeat' }),
        },
      );

      // Extract response
      return res.status(response.status).json({ response: response.data });
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
