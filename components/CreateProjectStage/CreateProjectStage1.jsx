import Alert from '@/components/Alert';
import TextArea from '@/components/Form/TextArea';
import TextInput from '@/components/Form/TextInput';
import ToggleInput from '@/components/Form/ToggleInput';
import UploadInput from '@/components/Form/UploadInput';
import axios from 'axios';
import classNames from 'classnames';
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
      // Validate slug
      await axios.post('/api/projects/validate', Object.fromEntries(project));
      // Upload thumbnail
      const uploadResponse = await axios.post('/api/projects/upload', project);
      // Persist project to database
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
          alertHeading="Project Saved!"
          alertText={`Begin adding videos to ${state.projectName} \u00BB`}
          alertLink={{
            pathname: '/projects/new',
            query: { slug: state.projectSlug },
          }}
        />
      )}
      <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
        <form id="createProject" onSubmit={handleSubmit}>
          <fieldset id="fields" disabled={state.isLoading ? 'disabled' : ''}>
            <div className="main-grid">
              <div className="col-span-6">
                {/* Project Name */}
                <TextInput
                  label="Project Name"
                  helpText="A name for your project."
                  id="name"
                  name="name"
                  required
                  placeholder="Triangle Strategy Playthrough"
                  customAttributes={{
                    onChange: handleNameChange,
                  }}
                />

                {/* Project Slug */}
                <ToggleInput
                  label="Project Slug"
                  helpText="The slug for the project page URL. Only lowercase letters, numbers, and dashes are allowed."
                  id="slug"
                  toggleId="customSlug"
                  name="slug"
                  required
                  pattern="^[a-z0-9](-?[a-z0-9])*$"
                  defaultAttributes={{
                    readOnly: 'readOnly',
                    hidden: state.override,
                    onInput: handleSlugify,
                  }}
                  toggleAttributes={{
                    hidden: !state.override,
                    disabled: state.override ? '' : 'disabled',
                  }}
                  button={{
                    hidden: !state.override,
                    onClick: handleOverrideSlug,
                    text: state.override ? 'Reset' : 'Override',
                  }}
                />

                {/* Project Description */}
                <TextArea
                  label="Project Description"
                  helpText="Describe what the project is about."
                  id="description"
                  name="description"
                  required
                  placeholder="Gameplay for the Triangle Strategy playthrough on Nintendo Switch."
                />

                {/* Thumbnail URL */}
                <UploadInput
                  label="Upload Thumbnail"
                  helpText="Upload a custom thumbnail for this project (3MB limit, type = PNG, JPG, or JPEG)."
                  id="thumbnail"
                  name="thumbnail"
                  required
                  uploadValid={state.uploadValid}
                  uploadFileName={state.uploadFileName}
                  uploadResultMessage={state.uploadResultMessage}
                  customAttributes={{
                    onChange: handleSizeLimitCheck,
                  }}
                />
                <div className="bg-gray-100 px-4 py-3 mt-5 rounded-lg text-right sm:px-6">
                  <button
                    id="submit"
                    type="submit"
                    disabled={state.isLoading}
                    className={classNames('btn btn-primary btn-wide', {
                      loading: state.isLoading,
                    })}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}
