import Alert from '@/components/Alert';
import ProjectBreadcrumbs from '@/components/ProjectBreadcrumbs';
import UploadInput from '@/components/Form/UploadInput';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { useState } from 'react';

export default function UploadThumbnails({ project }) {
  const defaultState = {
    error: null,
    isExecuting: false,
    executed: false,
    progress: 0,
    percentDone: null,
    uploadValid: null,
    uploadResultMessage: 'Attach file(s)',
    thumbnailList: null,
  };
  const [state, setState] = useState(defaultState);

  const confirmChanges = async (e) => {
    e.preventDefault();
    setState({ ...state, isExecuting: true });
    try {
      const results = [];
      for (let i = 0; i < state.thumbnailList.length; i += 1) {
        const video = JSON.parse(project.template.titleTemplate)
          .find((vid) => vid.episode === state.thumbnailList[i].episode);
        if (!video) {
          return;
        }
        const formData = new FormData();
        formData.append('file', state.thumbnailList[i].file);
        results.push(new Promise((resolve, reject) => {
          axios.post('/api/youtube/thumbnails', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: { videoId: video.videoId },
          })
            .then(() => setState((prevState) => ({
              ...prevState,
              progress: prevState.progress + 1,
              percentDone: Math.round((
                (prevState.progress + 1) / state.thumbnailList.length) * 100),
            })))
            .then(() => resolve(true))
            .catch((err) => reject(err));
        }));
      }
      await Promise.all(results).then(() => setState((prevState) => ({
        ...prevState,
        isExecuting: false,
        error: null,
        executed: true,
      }))).catch((err) => {
        throw new Error(err);
      });
    } catch (err) {
      setState({
        ...defaultState,
        isExecuting: false,
        error: true,
      });
    }
  };

  const handleSizeLimitCheck = (e) => {
    e.preventDefault();
    const input = document.querySelector('input#thumbnails');
    let uploadValid = null;
    let uploadResultMessage = null;
    const thumbnailList = Array
      .from(input.files)
      .map((file) => ({ file, episode: parseInt(file.name.match(/\d+/), 10) }))
      .sort((a, b) => ((a.episode > b.episode) ? 1 : -1));
    thumbnailList.forEach((thumbnail) => {
      if (!['image/png', 'image/jpeg'].includes(thumbnail.file.type)) {
        input.value = '';
        uploadValid = false;
        uploadResultMessage = `File "${thumbnail.file.name}" is not of type PNG, JPG, or JPEG, please select a valid file.`;
      } else if (thumbnail.file.size > 2000000) {
        input.value = '';
        uploadValid = false;
        uploadResultMessage = `File "${thumbnail.file.name}" has size > 2MB, please select a smaller file.`;
      }
    });
    // If no failures occurred above, then set uploadValid to true
    if (uploadValid === null && uploadResultMessage === null) {
      uploadValid = true;
      uploadResultMessage = `${input.files.length} files selected!`;
    }
    setState({
      ...state,
      uploadValid,
      uploadResultMessage,
      thumbnailList,
    });
  };

  return (
    <>
      <div className="w-full bg-cover bg-center h-80 relative" style={{ backgroundImage: `url(${project.image_cover})` }}>
        <h1 className="absolute left-10 bottom-10 text-center text-6xl font-medium text-white bg-black p-2">
          {project.name}
          {' | '}
          Upload Thumbnails
        </h1>
      </div>
      <div className="container mx-auto mt-20">
        <div className="flex flex-wrap w-full mb-10">
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
              Upload Thumbnails
            </h1>
            <div className="h-1 w-1/2 bg-primary rounded" />
            {project?.template?.updatedAt && (
              <p className="text-sm mt-2 mb-10 font-bold">
                Project last updated on
                {' '}
                {moment(project.updatedAt).format('MMMM D, YYYY, h:mm a')}
              </p>
            )}
            <ProjectBreadcrumbs projectTitle={project.name} slug={project.slug} finalPage="Upload Thumbnails" />
          </div>
          <p className="lg:w-1/2 w-full leading-relaxed text-gray-600">Upload the thumbnails for the videos associated to the project.</p>
          <div className="mb-10 h-0.5 w-full bg-secondary rounded opacity-25" />
          <div className="w-2/3 px-4 py-5 bg-white sm:p-6 mb-32">
            <label
              htmlFor="confirm-changes-modal"
              className="btn btn-primary modal-button mb-10"
              disabled={state.isExecuting || state.executed}
            >
              Confirm Changes
            </label>
            <input
              type="checkbox"
              id="confirm-changes-modal"
              className="modal-toggle"
              onChange={() => { setState({ ...state, error: false }); }}
            />
            <label htmlFor="confirm-changes-modal" className="modal cursor-pointer">
              <label className="modal-box relative" htmlFor="">
                {state.error && (
                  <Alert
                    className="w-full absolute top-0 left-0 rounded-b-none space-y-10"
                    includeHeading={false}
                    type="error"
                    alertText="Error committing changes, please try again in a few moments."
                  />
                )}
                <h3
                  className={classNames('text-lg font-bold', {
                    'mt-10': state.error,
                  })}
                >
                  Are you sure you want to commit changes?
                </h3>
                <p className="py-4">Once confirmed, do not navigate away from this page until complete.</p>
                <div className="flex flex-col items-center gap-2 italic text-gray-500">
                  {state.progress}
                  {' '}
                  of
                  {' '}
                  {project.videos.length}
                  {' '}
                  updated
                  <progress className="progress w-full" value={`${state.percentDone ?? 0}`} max="100" />
                </div>
                <div className="modal-action">
                  <label htmlFor="confirm-changes-modal">
                    <div
                      className={classNames('btn btn-primary float-right', { loading: state.isExecuting })}
                      disabled={state.isExecuting || state.executed}
                      onClick={(e) => { confirmChanges(e); }}
                      role="presentation"
                    >
                      Confirm
                    </div>
                  </label>
                  <label htmlFor="confirm-changes-modal" className="btn" disabled={state.isExecuting || state.executed}>Cancel</label>
                </div>
              </label>
            </label>
            <div className="space-y-6">
              <form id="uploadThumbnails">
                {/* Thumbnails */}
                <UploadInput
                  label="Upload Thumbnails"
                  helpText="Upload custom thumbnails for the videos (2MB limit, type = PNG, JPG, or JPEG)."
                  id="thumbnails"
                  name="thumbnails"
                  required
                  multiple
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                  uploadValid={state.uploadValid}
                  uploadResultMessage={state.uploadResultMessage}
                  customAttributes={{
                    onChange: handleSizeLimitCheck,
                  }}
                />
                {state.thumbnailList && (
                  <div className="overflow-x-auto pb-10 mt-5">
                    <table className="table table-compact w-full">
                      <thead>
                        <tr>
                          <th>Inferred Episode #</th>
                          <th>Video New Title</th>
                          <th>Thumbnail Filename</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.thumbnailList.map((thumbnail) => {
                          const video = JSON.parse(project.template.titleTemplate)
                            .find((vid) => vid.episode === thumbnail.episode);
                          return (
                            <tr key={video.videoId}>
                              <td>{thumbnail.episode}</td>
                              <td>{video.finalTitle}</td>
                              <td>{thumbnail.file.name}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const slug = context?.query?.slug;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      videos: true,
      template: true,
    },
  });
  if (project !== null && !project.archived) {
    return {
      props: {
        session,
        project: JSON.parse(JSON.stringify(project)),
      },
    };
  }

  return {
    redirect: {
      destination: '/projects',
      permanent: false,
    },
  };
}
