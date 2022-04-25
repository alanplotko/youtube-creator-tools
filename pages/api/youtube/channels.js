import axios from 'axios';
import { getSession } from 'next-auth/react';
import qs from 'qs';

const CHANNELS = 'https://youtube.googleapis.com/youtube/v3/channels';

export default async function handler(req, res) {
    const session = await getSession({ req });
    if (session) {
        // Signed in
        const result = await axios.get(CHANNELS, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            },
            params: {
                part: ['snippet', 'contentDetails', 'statistics'],
                mine: true
            },
            paramsSerializer: params => qs.stringify(params, { encode: false, arrayFormat: 'repeat' })
        }).catch(error => {
            if (error.response) {
                return error.response.data;
            }
        });
        if (result.error) {
            return res.status(result.error.code).json(result);
        } else {
            return res.status(result.status).json(result.data);
        }
    } else {
        // Not signed in
        return res.status(401).json({
            error: {
                code: 401,
                message: 'Unauthorized, user not signed in.',
            }
        });
    }
}


