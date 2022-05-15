import useSWR, { mutate } from 'swr';
import Alert from '@/components/Alert';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';

const fetcher = (params) => axios.get(params.url, { params }).then((res) => res.data);

const useStats = (swrKey) => {
  const { data, error } = useSWR(swrKey, fetcher);

  return {
    data: data?.stats,
    isLoading: !error && !data,
    isError: error,
  };
};

const primaryStats = [
  {
    field: 'subscriberCount',
    icon: 'people',
    title: 'Subscribers',
  },
  {
    field: 'videoCount',
    icon: 'youtube',
    title: 'Videos Published',
  },
  {
    field: 'views',
    icon: 'activity',
    title: 'Views',
  },
  {
    field: 'estimatedMinutesWatched',
    icon: 'pip',
    title: 'Minutes Watched',
  },
  {
    field: 'likes',
    icon: 'hand-thumbs-up',
    title: 'Likes',
  },
  {
    field: 'comments',
    icon: 'reply',
    title: 'Comments',
  },
  {
    field: 'shares',
    icon: 'share',
    title: 'Shares',
  },
];

export default function ChannelStats({ user }) {
  const swrKey = {
    url: '/api/channel/stats', user, forceRefresh: false,
  };
  const { data, isLoading, isError } = useStats(swrKey);
  const [state, setState] = useState({ isRefreshing: false });

  const handleRefresh = async () => {
    setState({ isRefreshing: true });
    await axios
      .get('/api/channel/stats', {
        params: { user, forceRefresh: true },
      })
      .then((res) => res.data)
      .then((stats) => mutate(swrKey, stats))
      .then(() => setState({ isRefreshing: false }));
  };

  if (isError) {
    return (
      <div>
        <h1 className="main-header">Channel Stats</h1>
        <Alert
          className="w-1/2"
          type="error"
          alertText="Error loading channel stats. Please try again shortly."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="main-header">Channel Stats</h1>

      {!isLoading && (
        <Alert
          className="w-1/2 mb-5"
          includeHeading={false}
          type="info"
          alertText={`Last updated ${moment(data.updatedAt).fromNow()}`}
          refreshHandler={handleRefresh}
          isRefreshing={state.isRefreshing}
        />
      )}
      <div className="stats shadow">
        {primaryStats.map((stat) => (
          <div key={stat.field} className="stat">
            <div className="stat-figure text-primary">
              {!isLoading && <i className={`bi bi-${stat.icon} text-4xl`} />}
              {isLoading && <div className="w-12 h-12 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-title">
              {!isLoading && stat.title}
              {isLoading && <div className="w-20 h-4 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-value text-primary">
              {!isLoading && data[stat.field].toLocaleString('en-US')}
              {isLoading && <div className="w-16 h-8 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
