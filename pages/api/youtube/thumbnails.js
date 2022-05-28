import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import { getToken } from 'next-auth/jwt';
import multiparty from 'multiparty';

const fs = require('fs');

const secret = process.env.NEXTAUTH_SECRET;
const SET_THUMBNAIL = 'https://www.googleapis.com/upload/youtube/v3/thumbnails/set';

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        // Unpack file
        resolve(files.file[0]);
      }
    });
  });
}

export default async function handler(req, res) {
  const token = (await getToken({ req, secret }))?.accessToken ?? req?.query?.accessToken;

  // Signed in
  if (token) {
    if (req.method !== 'POST') {
      return buildError(res, errors.INVALID_METHOD, { method: req.method });
    }

    try {
      const { videoId } = req.query;

      // Extract thumbnail file object
      const thumbnail = await parseForm(req);

      // Send file stream to YouTube API services
      const file = fs.createReadStream(thumbnail.path);
      const response = await axios.post(
        SET_THUMBNAIL,
        file,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...thumbnail.headers,
          },
          params: {
            videoId,
          },
        },
      );

      // Extract response
      return res.status(response.status).json({ response: response.data.items });
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

export const config = {
  api: {
    bodyParser: false,
  },
};
