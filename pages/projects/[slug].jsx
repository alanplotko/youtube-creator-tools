import { getSession, useSession } from 'next-auth/react';
import axios from 'axios';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { useState } from 'react';

export default function ProjectView({ project }) {
  const { data: session } = useSession();
  const defaultState = { error: false, isArchiving: false, archived: false };
  const [state, setState] = useState(defaultState);

  const archiveProject = async (e, slug) => {
    e.preventDefault();
    setState({ ...state, isArchiving: true });
    try {
      await axios.delete('/api/projects', { params: { slug } });
      setState({ ...defaultState, archived: true });
      window.setTimeout(() => window.location.replace('/projects'), 3000);
    } catch (err) {
      setState({ ...defaultState, error: true });
    }
  };

  if (session) {
    return (
      <>
        <div className="w-full bg-cover bg-center h-96 relative" style={{ backgroundImage: `url(${project.image_cover})` }}>
          <h1 className="absolute left-10 bottom-10 text-center text-6xl font-medium text-white bg-black p-2">
            {project.name}
          </h1>
        </div>
        <div className="container mx-auto max-w-5xl mt-20">
          <div className="flex flex-wrap w-full mb-20">
            <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">{project.name}</h1>
              <div className="h-1 w-60 bg-primary rounded" />
              <p className="text-sm mt-2 font-bold">
                Created on
                {' '}
                {moment(project.createdAt).format('MMMM D, YYYY, h:mm a')}
              </p>
            </div>
            <p className="lg:w-1/2 w-full leading-relaxed text-gray-600">{project.description}</p>
            <div className="mt-10 h-0.5 w-full bg-secondary rounded opacity-25" />
            <div className="container mt-5">
              <label htmlFor="project" className="btn btn-primary modal-button float-right">Archive Project</label>
              <input type="checkbox" id="project" className="modal-toggle" />
              <label htmlFor="project" className="modal cursor-pointer">
                <label className="modal-box relative">
                  {(state.error || state.archived) && (
                    <div className={`alert ${state.archived ? 'alert-success' : 'alert-error'} shadow-lg rounded-none absolute top-0 left-0`}>
                      <div>
                        {state.archived && (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{`Successfully archived "${project.name}". Redirecting shortly...`}</span>
                          </>
                        )}
                        {!state.archived && (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Error archiving project, please try again in a few moments.</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <h3 className={`${state.error || state.archived ? 'mt-14' : ''} text-lg font-bold`}>Archive project?</h3>
                  <p className="py-4">This will hide the project from the project listing. Click &quot;cancel&quot; or anywhere outside the modal to cancel.</p>
                  <div className="modal-action">
                    <label htmlFor="project">
                      <div
                        className={`${state.isArchiving ? 'loading' : ''} btn btn-primary float-right`}
                        disabled={state.isArchiving || state.archived}
                        onClick={(e) => { archiveProject(e, project.slug); }}
                        role="presentation"
                      >
                        {!state.archived && `Archive "${project.name}"`}
                        {state.archived && 'Archived'}
                      </div>
                    </label>
                    <label htmlFor="project" className="btn">Cancel</label>
                  </div>
                </label>
              </label>
            </div>
          </div>
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
  const project = await prisma.projects.findUnique({ where: { slug } });
  if (project == null || project.archived) {
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
