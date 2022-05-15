import useSWR, { mutate } from 'swr';
import Alert from '@/components/Alert';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import moment from 'moment';
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

const loadingBuffer = (new Array(10)).fill(null).map((val, index) => (
  // Simple static list as loading buffer, so index will suffice for key
  // eslint-disable-next-line react/no-array-index-key
  <div key={index} className="indicator">
    <span className="indicator-item indicator-start badge badge-primary text-lg p-3 font-semibold select-none">{index + 1}</span>
    <div className="grid w-64 h-36 bg-base-300 place-items-center">
      <div className="card w-64 h-36 bg-base-100 shadow-lg">
        <figure>
          <div className="w-64 h-36 bg-gray-200 rounded-sm animate-pulse" />
        </figure>
      </div>
      <div className="w-full h-6 mt-2 bg-secondary rounded-sm animate-pulse" />
    </div>
  </div>
));

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
        <Alert
          className="w-1/2"
          type="error"
          alertText="Error loading top videos. Please try again shortly."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="main-header">Top Videos</h1>
      {!isLoading && (
        <Alert
          className="w-1/2 mb-10"
          includeHeading={false}
          type="info"
          alertText={`Last updated ${moment(data.updatedAt).fromNow()}`}
          refreshHandler={handleRefresh}
          isRefreshing={state.isRefreshing}
        />
      )}
      <div className="grid grid-cols-5 gap-x-10 gap-y-20">
        {isLoading && loadingBuffer}
        {!isLoading && data.videos.map((video, index) => (
          <div key={video.videoId} className="indicator">
            <span className="indicator-item indicator-start badge badge-primary text-lg p-3 font-semibold select-none">{index + 1}</span>
            <div className="grid w-64 h-36 bg-base-300 place-items-center">
              <div className="card w-64 h-36 bg-base-100 shadow-lg">
                <Link href={`https://www.youtube.com/watch?v=${video.videoId}`} passHref>
                  <a target="_blank">
                    <figure>
                      <Image src={video.image_thumbnail} layout="fill" alt="Video thumbnail" title={video.title} />
                    </figure>
                  </a>
                </Link>
              </div>
              <div className="flex-row space-x-1 mt-2">
                <div className="tooltip tooltip-info tooltip-bottom" data-tip="Views">
                  <p className="badge badge-lg badge-secondary select-none space-x-1">
                    <i className="bi bi-activity" />
                    <span>{video.viewCount.toLocaleString()}</span>
                  </p>
                </div>
                {video.likeCount > 0 && (
                  <div className="tooltip tooltip-info tooltip-bottom" data-tip="Likes">
                    <p className="badge badge-lg badge-secondary select-none space-x-1">
                      <i className="bi bi-hand-thumbs-up-fill" />
                      <span>{video.likeCount.toLocaleString()}</span>
                    </p>
                  </div>
                )}
                {video.likeCount > 0 && (
                  <div className="tooltip tooltip-info tooltip-bottom" data-tip="Like Ratio">
                    <p className="badge badge-lg badge-secondary select-none space-x-1">
                      <span>
                        {
                          (video.likeCount > 0 || video.dislikeCount > 0)
                          && `${Math.round((video.likeCount / (video.likeCount + video.dislikeCount)) * 100)}`
                        }
                      </span>
                      <i className="bi bi-percent" />
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
