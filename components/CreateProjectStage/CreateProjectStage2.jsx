import Alert from '@/components/Alert';
import Image from 'next/image';
import Link from 'next/link';
import SearchInput from '@/components/Form/SearchInput';
import axios from 'axios';
import classNames from 'classnames';
import { errors } from '@/constants/errors';
import { truncateString } from '@/lib/macros';
import { useState } from 'react';
// eslint-disable-next-line sort-imports
import styles from './CreateProjectStage2.module.css';

export default function CreateProjectStage2({ project, completeCallback, isEditing }) {
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
      let response;
      if (isEditing) {
        response = await axios.put('/api/projects', { selections, slug: project.slug, isEditing });
      } else {
        response = await axios.put('/api/projects', { selections, slug: project.slug });
      }
      setState({
        ...state,
        success: response.data.message,
      });
      document.querySelector('fieldset#searchFields').disabled = 'disabled';
      document.querySelector('fieldset#selectFields').disabled = 'disabled';
      if (!isEditing) {
        completeCallback();
      }
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
          className="rounded-b-none"
          type="error"
          alertText={state.error}
        />
      )}
      {state.success && (
        <Alert
          className="rounded-b-none"
          type="success"
          alertHeading="Project Updated!"
          alertText={`Navigate to ${project.name} \u00BB`}
          alertLink={`/projects/${project.slug}`}
        />
      )}
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <form id="videoSearch" onSubmit={handleSearch}>
          <fieldset id="searchFields" disabled={(state.isSubmitLoading || state.isSearchLoading || state.success) ? 'disabled' : ''}>
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
          </fieldset>
        </form>
        <form id="videoSelect" onSubmit={handleSubmit}>
          <fieldset id="selectFields" disabled={(state.isSubmitLoading || state.isSearchLoading || state.success) ? 'disabled' : ''}>
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
            <div>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className={styles.videoTable}>
                      {state.videos.length > 0 && (
                        <label>
                          <input id="selectAll" type="checkbox" className="checkbox w-8 h-8" onClick={handleToggleSelectAll} />
                        </label>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
              {state.videos.length > 0 && state.videos.map((video, index) => (
                <div
                  key={video.videoId}
                  className={classNames('card card-side card-compact card-bordered rounded-none', {
                    'border-b-0': index + 1 !== state.videos.length,
                  })}
                >
                  <label className="cursor-pointer">
                    <input type="checkbox" className="checkbox m-4 w-8 h-8" name="video" value={video.videoId} onChange={handleSelectionChange} />
                  </label>
                  <figure className="relative w-80 flex-shrink-0">
                    <Image layout="fill" objectFit="contain" className="bg-black" src={video.image_thumbnail} alt="Video thumbnail" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title text-lg">{video.title}</h2>
                    <p className="text-sm opacity-50">
                      Video ID:
                      {' '}
                      {video.videoId}
                    </p>
                    <p>{video.description ? truncateString(video.description, 200) : 'No description'}</p>
                    <div className="card-actions justify-end">
                      <Link href={`https://www.youtube.com/watch?v=${video.videoId}`} passHref>
                        <a target="_blank">
                          <button className="btn btn-primary" type="button">View on YouTube</button>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
