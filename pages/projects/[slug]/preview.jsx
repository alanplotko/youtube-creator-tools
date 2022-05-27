import Alert from '@/components/Alert';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { useState } from 'react';
import ProjectBreadcrumbs from '@/components/ProjectBreadcrumbs';

export default function PreviewTemplate({ project }) {
  const defaultState = {
    error: null,
    isExecuting: false,
    executed: false,
    progress: 0,
    percentDone: null,
  };
  const [state, setState] = useState(defaultState);

  const confirmChanges = async (e) => {
    e.preventDefault();
    setState({ ...state, isExecuting: true });
    try {
      const results = [];
      for (let i = 0; i < project.videos.length; i += 1) {
        const titleTemplate = JSON.parse(project.template.titleTemplate)
          .find((vid) => vid.videoId === project.videos[i].videoId);
        if (!titleTemplate) {
          return;
        }
        results.push(new Promise((resolve) => {
          axios.post('/api/youtube/update', {
            data: {
              videoId: project.videos[i].videoId,
              title: titleTemplate.finalTitle,
              tags: project.template.tags.split(','),
              description: project.template.description,
            },
          })
            .then(() => setState((prevState) => ({
              ...prevState,
              progress: prevState.progress + 1,
              percentDone: Math.round(((prevState.progress + 1) / project.videos.length) * 100),
            })))
            .then(() => resolve(true));
        }));
      }
      await Promise.all(results).then(() => setState((prevState) => ({
        ...prevState,
        isExecuting: false,
        error: null,
        executed: true,
      })));
    } catch (err) {
      setState({ ...defaultState, error: true });
    }
  };

  return (
    <>
      <div className="w-full bg-cover bg-center h-80 relative" style={{ backgroundImage: `url(${project.image_cover})` }}>
        <h1 className="absolute left-10 bottom-10 text-center text-6xl font-medium text-white bg-black p-2">
          {project.name}
          {' | '}
          Preview Changes
        </h1>
      </div>
      <div className="container mx-auto mt-20">
        <div className="flex flex-wrap w-full mb-10">
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
              Previewing Changes
            </h1>
            <div className="h-1 w-1/2 bg-primary rounded" />
            {project?.template?.updatedAt && (
              <p className="text-sm mt-2 mb-10 font-bold">
                Template last updated on
                {' '}
                {moment(project.template.updatedAt).format('MMMM D, YYYY, h:mm a')}
              </p>
            )}
            <ProjectBreadcrumbs projectTitle={project.name} slug={project.slug} finalPage="Previewing Changes" />
          </div>
          <p className="lg:w-1/2 w-full leading-relaxed text-gray-600">Preview the changes to be applied with the template before committing changes.</p>
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
              <h1 className="text-xl font-bold border-b-2">Video Tags</h1>
              <div className="flex flex-row flex-wrap gap-2 pb-10">
                {project.template.tags.split(',').map((tag) => (
                  <div key={tag} className="badge badge-lg badge-secondary">
                    {tag}
                  </div>
                ))}
              </div>
              <h1 className="text-xl font-bold border-b-2">Description</h1>
              <p className="whitespace-pre-line pb-10">
                {project.template.description}
              </p>
              <h1 className="text-xl font-bold border-b-2">Episode Titles</h1>
              <div className="overflow-x-auto pb-10">
                <table className="table table-compact w-full">
                  <thead>
                    <tr>
                      <th>Episode #</th>
                      <th>Current Title</th>
                      <th>New Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.videos.map((video) => {
                      const titleTemplate = JSON.parse(project.template.titleTemplate)
                        .find((vid) => vid.videoId === video.videoId);
                      return (
                        <tr key={video.videoId}>
                          <td>{titleTemplate.episode}</td>
                          <td>{video.title}</td>
                          <td>{titleTemplate.finalTitle}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
