import useSWR, { mutate } from 'swr';
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
];
const secondaryStats = [
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
        <h1 className="mb-5 text-3xl font-medium text-slate-600">Channel Stats</h1>
        <div className="w-1/3 alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error loading channel stats. Please try again shortly.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-5 text-3xl font-medium text-slate-600">Channel Stats</h1>
      {!isLoading && (
        <div className="w-1/3 mb-5 h-10 alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Last updated
              {' '}
              {moment(data.updatedAt).fromNow()}
            </span>
          </div>
        </div>
      )}
      <div className="stats shadow">
        {primaryStats.map((stat) => (
          <div key={stat.field} className="stat">
            <div className="stat-figure text-primary">
              {!isLoading && <i className={`bi bi-${stat.icon} text-4xl`} />}
              {isLoading && <div className="w-16 h-16 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-title">
              {!isLoading && stat.title}
              {isLoading && <div className="w-32 h-4 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-value text-primary">
              {!isLoading && data[stat.field].toLocaleString('en-US')}
              {isLoading && <div className="w-16 h-8 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
          </div>
        ))}
      </div>
      <div className="my-5" />
      <div className="stats shadow">
        {secondaryStats.map((stat) => (
          <div key={stat.field} className="stat">
            <div className="stat-figure text-secondary">
              {!isLoading && <i className={`bi bi-${stat.icon} text-4xl`} />}
              {isLoading && <div className="w-16 h-16 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-title">
              {!isLoading && stat.title}
              {isLoading && <div className="w-32 h-4 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
            <div className="stat-value text-secondary">
              {!isLoading && data[stat.field].toLocaleString('en-US')}
              {isLoading && <div className="w-16 h-8 mb-2 bg-gray-200 rounded-full animate-pulse" />}
            </div>
          </div>
        ))}
      </div>
      <div className="my-5" />
      <button id="refresh" type="button" onClick={handleRefresh} className={`btn btn-primary ${state.isRefreshing ? 'loading' : ''}`} disabled={state.isRefreshing}>
        Refresh
      </button>
    </div>
  );
}
