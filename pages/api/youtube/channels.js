import axios from 'axios';
import errors from '@/constants/errors';
import { getSession } from 'next-auth/react';
import qs from 'qs';

const CHANNELS = 'https://youtube.googleapis.com/youtube/v3/channels';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (session) {
    // Signed in
    const result = await axios
      .get(CHANNELS, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          part: ['snippet', 'contentDetails', 'statistics'],
          mine: true,
        },
        paramsSerializer: (params) => qs.stringify(params, { encode: false, arrayFormat: 'repeat' }),
      })
      .then((response) => res.status(response.status).json(response.data))
      .catch((error) => {
        if (error.response) {
          return res.status(error.code).json(error.response.data);
        }
        return res.status(error.code).json(errors.PROJECTS_GENERIC_ERROR);
      });
    return result;
  }
  // Not signed in
  return res.status(401).json(errors.UNAUTHORIZED);
}
