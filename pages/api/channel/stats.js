import { buildError, errors } from '@/constants/errors';
import axios from 'axios';
import moment from 'moment';
import prisma from '@/lib/prisma';

const host = process.env.NEXTJS_HOST;

const refreshStats = async (user, accessToken) => {
  const channels = await axios.get(`${host}/api/youtube/channels`, { params: { user, accessToken } }).then((response) => response.data);
  const fromDate = channels.publishedAt;
  const stats = await axios.get(`${host}/api/youtube/stats`, { params: { fromDate, accessToken } }).then((response) => response.data);
  const data = {
    ...channels,
    ...stats,
    user,
  };
  const result = await prisma.ChannelStats.upsert({
    where: { user },
    create: data,
    update: data,
  });
  return result;
};

export default async function handler(req, res) {
  const { user, accessToken, forceRefresh } = req.query;

  // forceRefresh comes in as a string via query params
  if (forceRefresh === 'true') {
    const stats = await refreshStats(user, accessToken);
    return res.status(200).json({ stats });
  }

  try {
    // Get latest stats from database
    let stats = await prisma.ChannelStats
      .findUnique({ where: { user } })
      .then((response) => JSON.parse(JSON.stringify(response)));

    // Stats = null when not found in database for user
    const isStale = stats?.updatedAt && moment().diff(stats.updatedAt, 'hours') >= 4;
    if (stats === null || isStale) {
      stats = await refreshStats(user, accessToken);
    }
    return res.status(200).json({ stats });
  } catch (e) {
    return buildError(res, errors.USER_STATS_GENERIC_ERROR);
  }
}
