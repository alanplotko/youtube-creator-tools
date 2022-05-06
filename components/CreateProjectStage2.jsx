import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useState } from 'react';

export default function CreateProjectStage2() {
  const defaultState = {
    isLoading: false,
    error: null,
  };
  const [state, setState] = useState(defaultState);

  const handleCheckbox = async (e) => {
    e.preventDefault();
    console.log(e.target.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleSearch = async (e) => {
    console.log(e);
    const query = 'ts';
    e.preventDefault();
    setState({
      ...state,
      isLoading: true,
    });

    // Use axios to submit the form
    try {
      const response = await axios.get('/api/youtube/search', { params: { query } });
      setState({
        ...defaultState,
        videos: response.data.videos,
      });
    } catch (err) {
      const error = err?.response?.data?.error;
      setState({
        ...state,
        isLoading: false,
        success: null,
        error: error ? `${error.code} Error: ${error.message}` : err.message,
      });
    }
  };

  return (
    <>
      {state.error && (
        <div className="bg-orange-100 border-t-4 border-orange-500 text-orange-700 p-4" role="alert">
          <p className="font-bold">Error Encountered!</p>
          <p>{state.error}</p>
        </div>
      )}
      {state.success && (
        <div className="bg-green-100 border-t-4 border-green-500 text-green-700 p-4" role="alert">
          <p className="font-bold">Project Saved!</p>
          <p className="underline">
            <Link
              href={{
                pathname: '/projects/new',
                query: { slug: state.projectSlug },
              }}
            >
              {`Begin adding videos to ${state.projectName} \u00BB`}
            </Link>
          </p>
        </div>
      )}
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <form id="videoSearch" onSubmit={handleSubmit}>
          <fieldset id="fields" disabled={state.isLoading ? 'disabled' : ''}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                {/* Search */}
                <label htmlFor="search" className="block first-line:text-md font-medium text-gray-700">
                  Video Search Query
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Search across your videos to add to this project.</p>
                <input
                  id="search"
                  name="search"
                  className="w-10/12 h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-l-lg focus:shadow-outline shadow-sm"
                  type="text"
                  required="required"
                  placeholder="Triangle Strategy"
                />
                <input
                  type="button"
                  onClick={handleSearch}
                  value="Search"
                  className="cursor-pointer px-4 w-2/12 h-12 border border-l-0 border-b-1 text-lg text-white rounded-r-lg bg-gray-600 hover:bg-gray-700 focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                {state.videos && (
                  <div className="justify-center grid grid-cols-3 gap-4">
                    {state.videos.map((video) => (
                      <div key={video.title} className="card bg-base-100 shadow-xl image-full relative" style={{ width: '256px', height: '144px' }}>
                        <figure>
                          <Image width={256} height={144} src={video.image_thumbnail} alt={`Video thumbnail for ${video.title}`} />
                        </figure>
                        <div className="card-body">
                          <h2 className="card-title">{video.title}</h2>
                          <div className="card-actions justify-end">
                            <input id={video.title} type="checkbox" onChange={(e) => handleCheckbox(e)} className="checkbox checkbox-accent checkbox-lg" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
