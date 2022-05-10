import Link from 'next/link';
import axios from 'axios';
import { shortenString } from '@/lib/macros';
import { useState } from 'react';

function toSlug(s) {
  return s.toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

function handleNameChange(e) {
  e.preventDefault();
  document.querySelector('input#slug').value = toSlug(document.querySelector('input#name').value);
}

function handleSlugify(e) {
  e.preventDefault();
  document.querySelector('input#customSlug').value = toSlug(document.querySelector('input#customSlug').value);
}

export default function CreateProjectStage1() {
  const defaultState = {
    override: false,
    isLoading: false,
    error: null,
    uploadValid: null,
    uploadResultMessage: 'Attach a file',
    uploadFileName: null,
  };
  const [state, setState] = useState(defaultState);
  const handleOverrideSlug = (e) => {
    e.preventDefault();
    if (state.override) {
      document.querySelector('input#customSlug').value = '';
    }
    setState({
      ...state,
      override: !state.override,
    });
  };
  const handleSizeLimitCheck = (e) => {
    e.preventDefault();
    const input = document.querySelector('input#thumbnail');
    let uploadValid = null;
    let uploadResultMessage = null;
    let uploadFileName = null;
    if (!['image/png', 'image/jpeg'].includes(input.files[0].type)) {
      input.value = '';
      uploadValid = false;
      uploadResultMessage = 'File is not of type PNG, JPG, or JPEG, please select a valid file.';
    } else if (input.files[0].size > 3000000) {
      input.value = '';
      uploadValid = false;
      uploadResultMessage = 'File size > 3MB, please select a smaller file.';
    } else {
      uploadValid = true;
      uploadResultMessage = 'File selected!';
      uploadFileName = shortenString(input.files[0].name, 20);
    }
    setState({
      ...state,
      uploadValid,
      uploadResultMessage,
      uploadFileName,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({
      ...state,
      isLoading: true,
    });

    const project = new FormData(document.querySelector('form#createProject'));

    // Use axios to submit the form
    try {
      const uploadResponse = await axios.post('/api/projects/upload', project);
      const saveResponse = await axios.post('/api/projects', uploadResponse.data.project);
      setState({
        ...defaultState,
        success: true,
        projectSlug: saveResponse.data.project.slug,
        projectName: saveResponse.data.project.name,
      });
      document.querySelector('form#createProject').reset();
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
        <form id="createProject" onSubmit={handleSubmit}>
          <fieldset id="fields" disabled={state.isLoading ? 'disabled' : ''}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-6">
                {/* Project Name */}
                <label htmlFor="name" className="block first-line:text-md font-medium text-gray-700">
                  Project Name
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">A name for your project.</p>
                <input
                  id="name"
                  name="name"
                  className="w-full h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline shadow-sm"
                  type="text"
                  required="required"
                  onChange={handleNameChange}
                  placeholder="Triangle Strategy Playthrough"
                />
                {/* Project Slug */}
                <label htmlFor="slug" className="block mt-5 first-line:text-md font-medium text-gray-700">
                  Project Slug
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">The slug for the project page URL. Only lowercase letters, numbers, and dashes are allowed.</p>
                <input
                  id="slug"
                  name="slug"
                  className="cursor-not-allowed w-10/12 h-12 px-4 mb-2 bg-gray-100 text-lg text-gray-700 placeholder-gray-600 border rounded-l-lg focus:shadow-outline shadow-sm"
                  type="text"
                  required="required"
                  readOnly="readonly"
                  hidden={state.override}
                />
                <input
                  id="customSlug"
                  name="slug"
                  className="w-10/12 h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-l-lg focus:shadow-outline shadow-sm"
                  type="text"
                  pattern="^[a-z0-9](-?[a-z0-9])*$"
                  onInput={handleSlugify}
                  disabled={state.override ? '' : 'disabled'}
                  hidden={!state.override}
                />
                <input
                  type="button"
                  onClick={handleOverrideSlug}
                  value={state.override ? 'Reset' : 'Override'}
                  className="cursor-pointer px-4 w-2/12 h-12 border border-l-0 border-b-1 text-lg text-white rounded-r-lg bg-gray-600 hover:bg-gray-700 focus:outline-none"
                />
                {/* Project Description */}
                <label htmlFor="description" className="block mt-5 first-line:text-md font-medium text-gray-700">
                  Project Description
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Describe what the project is about.</p>
                <textarea
                  id="description"
                  name="description"
                  required="required"
                  className="w-full h-32 px-3 py-2 text-lg text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline shadow-sm"
                  placeholder="Gameplay for the Triangle Strategy playthrough on Nintendo Switch."
                />
                {/* Thumbnail URL */}
                <label htmlFor="thumbnail" className="block mt-5 first-line:text-md font-medium text-gray-700">
                  Upload Thumbnail
                  <span className="text-red-500">*</span>
                </label>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Upload a custom thumbnail for this project (3MB limit, type = PNG, JPG, or JPEG).</p>
                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 ${state.uploadValid == null || state.uploadValid ? 'border-gray-200 hover:border-gray-300' : 'border-red-400 hover:border-red-500'}`}>
                    <div className="flex flex-col items-center justify-center pt-7 cursor-pointer">
                      <p className="flex items-center space-x-2 text-xl text-gray-400 group-hover:text-gray-600">
                        <i className={`bi bi-cloud-upload mr-2 text-4xl ${state.uploadValid == null || state.uploadValid ? 'text-gray-400 group-hover:text-gray-600' : 'text-red-400 group-hover:text-red-600'}`} />
                        {state.uploadFileName && state.uploadFileName}
                      </p>
                      <p className={`pt-1 text-md tracking-wider ${state.uploadValid == null || state.uploadValid ? 'text-gray-400 group-hover:text-gray-600' : 'text-red-400 group-hover:text-red-600'}`}>
                        {state.uploadResultMessage}
                      </p>
                    </div>
                    <input id="thumbnail" type="file" name="thumbnail" onChange={handleSizeLimitCheck} className="opacity-0" required="required" />
                  </label>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 mt-5 bg-gray-100 rounded-lg text-right sm:px-6">
              <button id="submit" type="submit" disabled={state.isLoading ? 'disabled' : ''} className={`${state.isLoading ? 'opacity-50 cursor-not-allowed loading' : ''} btn btn-primary inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-md font-medium leading-6 rounded-md text-white`}>
                {state.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
