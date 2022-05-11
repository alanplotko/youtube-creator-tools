import useSWR, { mutate } from 'swr';
import axios from 'axios';
import moment from 'moment';
import { truncateString } from '@/lib/macros';
import { useState } from 'react';

const fetcher = (params) => axios.get(params.url, { params }).then((res) => res.data);

const useStats = (swrKey) => {
  const { data, error } = useSWR(swrKey, fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default function TopVideosList({ user }) {
  const swrKey = {
    url: '/api/youtube/top_videos', user, forceRefresh: false,
  };
  const { data, isLoading, isError } = useStats(swrKey);
  const [state, setState] = useState({ isRefreshing: false });

  const handleRefresh = async () => {
    setState({ isRefreshing: true });
    await axios
      .get('/api/youtube/top_videos', {
        params: { user, forceRefresh: true },
      })
      .then((res) => res.data)
      .then((stats) => mutate(swrKey, stats))
      .then(() => setState({ isRefreshing: false }));
  };

  if (isError) {
    return (
      <div>
        <h1 className="main-header">Top Videos</h1>
        <div className="w-1/2 alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error loading top videos. Please try again shortly.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="main-header">Top Videos</h1>
      {!isLoading && (
        <div className="w-1/2 mb-5 h-10 alert alert-info shadow-lg">
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
      <ul className="steps steps-vertical">
        {!isLoading && data.videos.map((video) => (
          <li key={video.videoId} className="step">
            [
            {video.viewCount}
            {' '}
            views
            {video.likeCount > 0 && `, ${video.likeCount} ${video.likeCount > 1 ? 'likes' : 'like'}`}
            {
              (video.likeCount > 0 || video.dislikeCount > 0)
                && `, ${Math.round((video.likeCount / (video.likeCount + video.dislikeCount)) * 100)}%`
            }
            ]
            {' '}
            {truncateString(video.title, 60)}
          </li>
        ))}
      </ul>
      <div className="my-5" />
      <button id="refresh" type="button" onClick={handleRefresh} className={`btn btn-primary ${state.isRefreshing ? 'loading' : ''}`} disabled={state.isRefreshing}>
        Refresh
      </button>
    </div>
  );
}
