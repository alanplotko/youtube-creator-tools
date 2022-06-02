import { getSession, useSession } from 'next-auth/react';
import Alert from '@/components/Alert';
import CSVDownloaderInput from '@/components/Form/CSVDownloaderInput';
import Image from 'next/image';
import Link from 'next/link';
import NoDataCard from '@/components/Card/NoDataCard';
import ProjectBreadcrumbs from '@/components/ProjectBreadcrumbs';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { truncateString } from '@/lib/macros';
import { useState } from 'react';

export default function ProjectView({ project }) {
  const { data: session } = useSession();
  const defaultState = {
    error: false,
    isArchiving: false,
    archived: false,
    isRefreshing: false,
    refreshed: false,
  };
  const [state, setState] = useState(defaultState);

  const archiveProject = async (e, slug) => {
    e.preventDefault();
    setState({ ...state, isArchiving: true });
    try {
      await axios.delete('/api/projects', { params: { slug } });
      setState({ ...defaultState, archived: true });
      window.location.replace('/projects');
    } catch (err) {
      setState({ ...defaultState, error: true });
    }
  };

  const handleRefreshVideos = async (e) => {
    e.preventDefault();
    setState({ ...state, isRefreshing: true });
    try {
      const videoIds = project.videos.map((video) => video.videoId).join(',');
      await axios.post('/api/youtube/refresh', { videoIds });
      setState({ ...defaultState, refreshed: true });
      window.location.reload();
    } catch (err) {
      setState({ ...defaultState });
    }
  };

  if (session) {
    return (
      <>
        <div className="w-full bg-cover bg-center h-80 relative" style={{ backgroundImage: `url(${project.image_cover})` }}>
          <h1 className="absolute left-10 bottom-10 text-center text-6xl font-medium text-white bg-black p-2">
            {project.name}
          </h1>
        </div>
        <div className="container mx-auto mt-20">
          <div className="flex flex-wrap w-full mb-10">
            <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">{project.name}</h1>
              <div className="h-1 w-60 bg-primary rounded" />
              <p className="text-sm mt-2 mb-10 font-bold">
                Project last updated on
                {' '}
                {moment(project.updatedAt).format('MMMM D, YYYY, h:mm a')}
              </p>
            </div>
            <p className="lg:w-1/2 w-full leading-relaxed text-gray-600">{project.description}</p>
            <div className="flex flex-row flex-1 place-items-end">
              <div className="justify-start">
                <ProjectBreadcrumbs projectTitle={project.name} />
              </div>
              <div className="justify-end space-x-3 ml-auto mb-2">
                <CSVDownloaderInput
                  label="Download Template"
                  slug={project.slug}
                  data={
                    project.videos
                      .map((video) => ({
                        videoId: video.videoId,
                        title: video.title,
                        episode: null,
                      }))
                  }
                />
                <button
                  type="button"
                  className={classNames('btn btn-primary gap-2', { loading: state.isRefreshing })}
                  disabled={state.isRefreshing || state.refreshed}
                  onClick={(e) => handleRefreshVideos(e)}
                >
                  <i className="bi bi-youtube text-lg" />
                  Refresh
                </button>
                {(
                  project?.template
                  && JSON.parse(project.template.titleTemplate).length === project.videos.length
                )
                && (
                  <Link href={`/projects/${project.slug}/preview`} passHref>
                    <button type="button" className="btn btn-primary gap-2">
                      <i className="bi bi-save2-fill text-lg" />
                      Preview Changes
                    </button>
                  </Link>
                )}
                <div className="dropdown dropdown-hover">
                  <label tabIndex="0" className="btn btn-primary gap-2">
                    <i className="bi bi-pencil-fill text-lg" />
                    Edit...
                  </label>
                  <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <Link href={`/projects/${project.slug}/template`} passHref>
                        <a>Edit Template</a>
                      </Link>
                    </li>
                    <li>
                      <Link href={`/projects/${project.slug}/thumbnails`} passHref>
                        <a>Upload Thumbnails</a>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={{
                          pathname: `/projects/${project.slug}/edit`,
                          query: { step: 1 },
                        }}
                        passHref
                      >
                        <a>Edit Project</a>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={{
                          pathname: `/projects/${project.slug}/edit`,
                          query: { step: 2 },
                        }}
                        passHref
                      >
                        <a>Edit Videos</a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <label htmlFor="project" className="btn btn-primary modal-button gap-2">
                  <i className="bi bi-archive-fill text-lg" />
                  Archive Project
                </label>
              </div>
            </div>
            <div className="h-0.5 w-full bg-secondary rounded opacity-25 mb-5" />
            <div className="container mt-5">
              <h1 className="float-left text-3xl font-medium text-slate-600">
                Videos
              </h1>
              <input
                type="checkbox"
                id="project"
                className="modal-toggle"
                onChange={() => { setState({ ...state, error: false }); }}
              />
              <label htmlFor="project" className="modal cursor-pointer">
                <label className="modal-box relative">
                  {state.error && (
                    <Alert
                      className="w-full absolute top-0 left-0 rounded-b-none space-y-10"
                      includeHeading={false}
                      type="error"
                      alertText="Error archiving project, please try again in a few moments."
                    />
                  )}
                  <h3
                    className={classNames('text-lg font-bold', {
                      'mt-10': state.error,
                    })}
                  >
                    Archive project?
                  </h3>
                  <p className="py-4">This will hide the project from the project listing. Click &quot;cancel&quot; or anywhere outside the modal to cancel.</p>
                  <div className="modal-action">
                    <label htmlFor="project">
                      <div
                        className={classNames('btn btn-primary float-right', { loading: state.isArchiving })}
                        disabled={state.isArchiving || state.archived}
                        onClick={(e) => { archiveProject(e, project.slug); }}
                        role="presentation"
                      >
                        Archive
                      </div>
                    </label>
                    <label htmlFor="project" className="btn" disabled={state.isArchiving || state.archived}>Cancel</label>
                  </div>
                </label>
              </label>
            </div>
          </div>
          {project.videos.length === 0 && (
            <NoDataCard
              title="No Videos"
              callToAction="Get started by adding videos."
              link={`/projects/new?slug=${project.slug}`}
              buttonText="Add Videos"
              icon="bi-youtube"
            />
          )}
          {project.videos.length > 0 && (
            <section className="text-gray-600 body-font grid md:grid-cols-3 gap-4 pb-40">
              {project.videos.map((video) => (
                <Link key={video.videoId} href={`https://www.youtube.com/watch?v=${video.videoId}`} passHref>
                  <a target="_blank">
                    <div className="flex relative">
                      <Image className="w-full h-full object-cover object-center" layout="fill" src={video.image_thumbnail} alt="Video thumbnail" />
                      <div className="px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100">
                        <h2 className="tracking-widest text-sm title-font font-medium text-indigo-500 mb-1">
                          Uploaded
                          {' '}
                          {moment(video.publishedAt).fromNow()}
                        </h2>
                        <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{video.title}</h1>
                        <p className="leading-relaxed">{video.description ? truncateString(video.description, 250) : 'No description'}</p>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </section>
          )}
        </div>
      </>
    );
  }
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
  const { slug } = context.params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      videos: {
        orderBy: {
          publishedAt: 'asc',
        },
      },
      template: true,
    },
  });
  if (project == null || project.archived || !project.published) {
    return {
      redirect: {
        destination: '/projects',
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
      project: JSON.parse(JSON.stringify(project)),
    },
  };
}
