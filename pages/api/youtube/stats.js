import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getSession } from 'next-auth/react';
import moment from 'moment';
import qs from 'qs';

const ANALYTICS = 'https://youtubeanalytics.googleapis.com/v2/reports';
const dateFormat = 'YYYY-MM-DD';

export default async function handler(req, res) {
  const session = await getSession({ req });
  const accessToken = session?.accessToken ?? req.query.accessToken;

  // Signed in
  if (accessToken) {
    // Get start date for channel
    const { fromDate } = req.query;
    // Generate bounds for lifetime stats
    const startDate = moment(fromDate).format(dateFormat);
    const endDate = moment().format(dateFormat);

    try {
      // Get general channel information
      const response = await axios.get(ANALYTICS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          startDate,
          endDate,
          ids: 'channel==MINE',
          metrics: [
            // View metrics
            'views',
            // Watch time metrics
            'estimatedMinutesWatched',
            // Engagement metrics
            'comments', 'likes', 'dislikes', 'shares',
          ].join(','),
        },
        paramsSerializer: (params) => qs.stringify(params, { encode: false, arrayFormat: 'repeat' }),
      });

      // Translate data from csv representation (in JSON) to key-value pairs
      const data = {};
      response.data.columnHeaders.forEach((column, index) => {
        data[column.name] = response.data.rows[0][index];
      });

      return res.status(response.status).json(data);
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
