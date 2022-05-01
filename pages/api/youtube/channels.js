import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import qs from 'qs';

const CHANNELS = 'https://youtube.googleapis.com/youtube/v3/channels';

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Signed in
  if (session) {
    try {
      // Get general channel information
      const response = await axios.get(CHANNELS, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          part: ['snippet', 'contentDetails', 'statistics'],
          mine: true,
        },
        paramsSerializer: (params) => qs.stringify(params, { encode: false, arrayFormat: 'repeat' }),
      });

      return res.status(response.status).json(response.data);
    } catch (e) {
      // Catch YouTube API error
      if (e.response) {
        return res.status(e.code).json(e.response.data);
      }
      // Catch all other errors
      return buildError(res, errors.PROJECTS_GENERIC_SAVE_ERROR, { code: e.code });
    }
  }

  // Not signed in
  return buildError(res, errors.UNAUTHORIZED);
}
