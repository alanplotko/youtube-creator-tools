import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import qs from 'qs';

const CHANNELS = 'https://youtube.googleapis.com/youtube/v3/channels';

export default async function handler(req, res) {
  const session = await getSession({ req });
  const { user } = req.query;
  const accessToken = session?.accessToken ?? req.query.accessToken;

  // Signed in
  if (accessToken) {
    try {
      // Get general channel information
      const response = await axios.get(CHANNELS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          part: ['snippet', 'contentDetails', 'statistics'],
          mine: true,
        },
        paramsSerializer: (params) => qs.stringify(params, { encode: false, arrayFormat: 'repeat' }),
      });

      // Extract channel
      const data = response.data.items
        .find((channel) => channel.snippet.title === user);
      const { snippet: { title, description, publishedAt } } = data;
      let { statistics: { subscriberCount, videoCount } } = data;
      subscriberCount = parseInt(subscriberCount, 10);
      videoCount = parseInt(videoCount, 10);

      return res.status(response.status).json({
        title, description, publishedAt, subscriberCount, videoCount,
      });
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
