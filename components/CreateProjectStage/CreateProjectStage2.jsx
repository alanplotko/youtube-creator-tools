import { shortenString, truncateString } from '@/lib/macros';
import Alert from '@/components/Alert';
import Image from 'next/image';
import Link from 'next/link';
import SearchInput from '@/components/Form/SearchInput';
import axios from 'axios';
import classNames from 'classnames';
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
        <Alert
          type="error"
          alertText={state.error}
        />
      )}
      {state.success && (
        <Alert
          type="success"
          alertHeading="Project Updated!"
          alertText={`Navigate to ${project.name} \u00BB`}
          alertLink={`/projects/${project.slug}`}
        />
      )}
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <form id="videoSearch" onSubmit={handleSearch}>
          <fieldset id="searchFields" disabled={(state.isSubmitLoading || state.isSearchLoading || state.success) ? 'disabled' : ''}>
            <div className="main-grid">
              <div className="col-span-2">
                {/* Search */}
                <SearchInput
                  label="Video Search Query"
                  helpText="Search across your videos to add to this project."
                  id="search"
                  name="search"
                  required
                  placeholder="Search videos, e.g. Triangle Strategy"
                  button={{
                    disabled: state.isSearchLoading || state.success,
                    isLoading: state.isSearchLoading,
                    text: 'Search',
                  }}
                />
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
                disabled={state.isSubmitLoading || !state.isFormValid || state.success}
                className={classNames('btn btn-primary btn-wide mb-2', {
                  loading: state.isSubmitLoading,
                })}
              >
                Save
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
