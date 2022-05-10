import { shortenString, truncateString } from '@/lib/macros';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { errors } from '@/constants/errors';
import { useState } from 'react';

export default function CreateProjectStage2({ project, completeCallback }) {
  const defaultState = {
    isSubmitLoading: false,
    isSearchLoading: false,
    query: 'Search your videos to populate the table below',
    success: null,
    error: null,
    videos: [],
    isFormValid: false,
  };
  const [state, setState] = useState(defaultState);

  const getSubmitButtonText = () => {
    if (state.isSubmitLoading) {
      return 'Saving...';
    }
    return state.success ? 'Saved!' : 'Save';
  };

  const handleToggleSelectAll = () => {
    const { checked } = document.querySelector('input#selectAll');
    const checkboxes = Array.from(document.querySelectorAll('input[name="video"]'));
    for (let i = 0; i < checkboxes.length; i += 1) {
      checkboxes[i].checked = checked;
    }
    // Override isFormValid since this is either
    // selecting all (> 1, isFormValid = true) or none (= 0, isFormValid = false)
    setState({
      ...state,
      isFormValid: checked,
    });
  };

  const handleSelectionChange = () => {
    const checkboxes = Array.from(document.querySelectorAll('input[name="video"]'));
    const formData = new FormData(document.forms.videoSelect);
    const selections = formData.getAll('video').map((videoId) => ({ videoId }));
    // If all videos selected, check off the "select all" checkbox
    document.querySelector('input#selectAll').checked = (checkboxes.length === selections.length);
    setState({
      ...state,
      isFormValid: selections.length > 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({
      ...state,
      isSubmitLoading: true,
    });
    const formData = new FormData(document.forms.videoSelect);
    const selections = formData.getAll('video').map((videoId) => ({ videoId }));
    if (selections.length === 0) {
      setState({
        ...state,
        isSubmitLoading: false,
        success: null,
        error: `${errors.PROJECTS_NO_SELECTION_ERROR.code} Error: ${errors.PROJECTS_NO_SELECTION_ERROR.message}`,
      });
      return;
    }
    try {
      const response = await axios.put('/api/projects', { selections, slug: project.slug });
      setState({
        ...state,
        success: response.data.message,
      });
      document.querySelector('fieldset#searchFields').disabled = 'disabled';
      document.querySelector('fieldset#selectFields').disabled = 'disabled';
      completeCallback();
    } catch (err) {
      const error = err?.response?.data?.error;
      setState({
        ...state,
        isSubmitLoading: false,
        success: null,
        error: error ? `${error.code} Error: ${error.message}` : err.message,
      });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setState({
      ...state,
      isSearchLoading: true,
    });

    const query = document.querySelector('input#search').value;

    // Use axios to submit the form
    try {
      const response = await axios.get('/api/youtube/search', { params: { query } });
      document.forms.videoSelect.reset();
      setState({
        ...defaultState,
        query,
        videos: response.data.videos,
      });
    } catch (err) {
      const error = err?.response?.data?.error;
      setState({
        ...state,
        isSearchLoading: false,
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
          <p className="font-bold">Project Updated!</p>
          <p className="underline">
            <Link href={`/projects/${project.slug}`}>
              {`Navigate to ${project.name} \u00BB`}
            </Link>
          </p>
        </div>
      )}
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <form id="videoSearch" onSubmit={handleSearch}>
          <fieldset id="searchFields" disabled={(state.isSubmitLoading || state.isSearchLoading || state.success) ? 'disabled' : ''}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                {/* Search */}
                <label htmlFor="search" className="block first-line:text-md font-medium text-gray-700">
                  Video Search Query
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Search across your videos to add to this project.</p>
                <div className="input-group">
                  <input
                    id="search"
                    name="search"
                    className="w-10/12 h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-l-lg focus:shadow-outline shadow-sm"
                    type="text"
                    required="required"
                    placeholder="Search videos, e.g. Triangle Strategy"
                  />
                  <button
                    type="submit"
                    disabled={(state.isSearchLoading || state.success) ? 'disabled' : ''}
                    className={`${state.isSearchLoading ? 'loading' : ''} btn btn-primary`}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
        </form>
        <form id="videoSelect" onSubmit={handleSubmit}>
          <fieldset id="selectFields" disabled={(state.isSubmitLoading || state.isSearchLoading || state.success) ? 'disabled' : ''}>
            <div className="col-span-4">
              <hr className="border-0.5 border-gray-300 mb-5" />
              <h1 className="text-xl font-semibold mb-5">
                Video Search Query:
                {' '}
                <span className="font-normal">
                  {state.query}
                </span>
              </h1>
              <button
                id="submit"
                type="submit"
                disabled={(state.isSubmitLoading || !state.isFormValid || state.success) ? 'disabled' : ''}
                className={`${state.isSubmitLoading ? 'loading' : ''} btn btn-primary btn-wide mb-2`}
              >
                {getSubmitButtonText()}
              </button>
              <p className={`${state.isFormValid ? 'invisible' : ''} text-sm mb-5`}>Please select at least 1 video to proceed</p>
              <div className="overflow-x-auto w-full">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>
                        {state.videos.length > 0 && (
                          <label>
                            <input id="selectAll" type="checkbox" className="checkbox" onClick={handleToggleSelectAll} />
                          </label>
                        )}
                      </th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Video Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.videos.length === 0 && (
                      <tr>
                        <td colSpan="4">
                          <span className="text-gray-600 italic">Search for videos to add to the project...</span>
                        </td>
                      </tr>
                    )}
                    {state.videos.length > 0 && state.videos.map((video) => (
                      <tr key={video.title}>
                        <td>
                          <label>
                            <input type="checkbox" className="checkbox" name="video" value={video.videoId} onChange={handleSelectionChange} />
                          </label>
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12 relative">
                                <Image layout="fill" src={video.image_thumbnail} alt={`Video thumbnail for ${video.title.substr(0, 10)}...${video.title.substr(-8)}`} />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{truncateString(video.title)}</div>
                              <div className="text-sm opacity-50">
                                Video ID:
                                {' '}
                                {video.videoId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {video.description ? shortenString(video.description) : 'No description'}
                        </td>
                        <td>
                          <Link href={`https://www.youtube.com/watch?v=${video.videoId}`} passHref>
                            <a target="_blank">
                              <button className="btn btn-ghost btn-md" type="button">View</button>
                            </a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {state.videos.length > 0 && (
                    <tfoot>
                      <tr>
                        <th>&nbsp;</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Video Link</th>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
