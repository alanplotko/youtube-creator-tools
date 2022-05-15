import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { truncateString } from '@/lib/macros';
import { useState } from 'react';

export default function Settings({ archivedProjects }) {
  const { data: session } = useSession();
  const defaultState = {
    isLoading: false,
    isFormValid: false,
  };
  const [state, setState] = useState(defaultState);

  const handleToggleSelectAll = () => {
    const { checked } = document.querySelector('input#selectAll');
    const checkboxes = Array.from(document.querySelectorAll('input[name="project"]'));
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
    const checkboxes = Array.from(document.querySelectorAll('input[name="project"]'));
    const selections = (new FormData(document.forms.projectSelect)).getAll('project');
    // If all projects selected, check off the "select all" checkbox
    document.querySelector('input#selectAll').checked = (checkboxes.length === selections.length);
    setState({
      ...state,
      isFormValid: selections.length > 0,
    });
  };

  const handleModifyProjects = async (e) => {
    e.preventDefault();

    const selections = (new FormData(document.forms.projectSelect)).getAll('project');

    // Use axios to submit the form
    try {
      const action = e.nativeEvent.submitter.name;
      if (action === 'unarchive') {
        setState({
          ...state,
          isUnarchiving: true,
        });
        await axios.post('/api/settings/projects/unarchive', { selections });
        window.location.replace('/settings');
      } else if (action === 'delete') {
        setState({
          ...state,
          isDeleting: true,
        });
        await axios.post('/api/settings/projects/delete', { selections });
        window.location.replace('/settings');
      }
    } catch (err) {
      const error = err?.response?.data?.error;
      setState({
        ...state,
        isSearchLoading: false,
        error: error ? `${error.code} Error: ${error.message}` : err.message,
      });
    }
  };

  if (session) {
    return (
      <div className="main-container">
        <h1 className="main-header">Settings</h1>
        {archivedProjects.length === 0 && (
          <>
            <h2 className="main-subheader">Unarchive Projects</h2>
            <div className="overflow-x-auto w-full">
              <table className="table min-w-fit w-1/2">
                <thead>
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" disabled="disabled" />
                      </label>
                    </th>
                    <th>Project</th>
                    <th>Description</th>
                    <th>Archive Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td />
                    <td className="italic text-gray-600">
                      No archived projects found.
                    </td>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        {archivedProjects.length > 0 && (
          <form id="projectSelect" onSubmit={handleModifyProjects}>
            <h2 className="main-subheader space-x-5">
              <span>Unarchive Projects</span>
              <button
                id="submit"
                type="submit"
                name="unarchive"
                disabled={!state.isFormValid || state.isUnarchiving || state.isDeleting}
                className={classNames('btn btn-primary btn-sm', {
                  loading: state.isUnarchiving,
                })}
              >
                Unarchive Selected
              </button>
              <button
                id="submit"
                type="submit"
                name="delete"
                disabled={!state.isFormValid || state.isUnarchiving || state.isDeleting}
                className={classNames('btn btn-error btn-sm', {
                  loading: state.isDeleting,
                })}
              >
                Delete Selected
              </button>
            </h2>
            {archivedProjects.length > 0 && (
              <fieldset id="searchFields" disabled={(state.isLoading) ? 'disabled' : ''}>
                <div className="overflow-x-auto w-full">
                  <table className="table min-w-fit w-1/2">
                    <thead>
                      <tr>
                        <th>
                          <label>
                            <input id="selectAll" type="checkbox" className="checkbox" onClick={handleToggleSelectAll} />
                          </label>
                        </th>
                        <th>Project</th>
                        <th>Description</th>
                        <th>Archive Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedProjects.map((project) => (
                        <tr key={project.slug}>
                          <td>
                            <label className="cursor-pointer">
                              <input type="checkbox" className="checkbox" name="project" value={project.slug} onChange={handleSelectionChange} />
                            </label>
                          </td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="relative w-20 h-11">
                                  <Image
                                    className={`${project.published ? 'group-hover:brightness-90' : 'brightness-50'} relative`}
                                    layout="fill"
                                    src={project.image_thumbnail}
                                    alt="Project thumbnail"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{project.name}</div>
                                <div className="text-sm opacity-50">
                                  Slug:
                                  {' '}
                                  {project.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {truncateString(project.description, 50)}
                          </td>
                          <td>
                            <p className="text-sm font-bold">
                              {moment(project.updatedAt).format('llll')}
                            </p>
                            <span className="badge badge-ghost badge-sm">{moment(project.updatedAt).fromNow()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </fieldset>
            )}
          </form>
        )}
      </div>
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
  const archivedProjects = await prisma.project
    .findMany({
      where: {
        user: session.user.name,
        archived: true,
      },
      orderBy: [
        { published: 'asc' },
        { updatedAt: 'desc' },
      ],
    })
    .then((response) => JSON.parse(JSON.stringify(response)));

  return {
    props: {
      session,
      archivedProjects,
    },
  };
}
