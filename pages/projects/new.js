import React, { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from 'components/navigation';
import axios from 'axios';

function toSlug(s) {
    return s.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
}

function handleNameChange(e) {
    e.preventDefault();
    document.querySelector('input#slug').value = toSlug(document.querySelector('input#name').value);
}

function handleSlugify(e) {
    e.preventDefault();
    document.querySelector('input#customSlug').value = toSlug(document.querySelector('input#customSlug').value);
}

export default function ProjectForm() {
    const { data: session } = useSession();
    const [state, setState] = useState({
        override: false,
        isLoading: false,
        error: null
    });
    const handleOverrideSlug = (e) => {
        e.preventDefault();
        if (state.override) {
            document.querySelector('input#customSlug').value = '';
        }
        setState({
            ...state,
            override: !state.override
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setState({
            ...state,
            isLoading: true
        });

        let project = Object.fromEntries(new FormData(document.querySelector('form#createProject')));
        // Use axios to submit the form
        await axios.post("/api/projects", project)
            .then((result) => {
                console.log(result);
                setState({
                    ...state,
                    isLoading: false,
                    error: null,
                    success: true,
                    projectLink: `/projects/${project.slug}`,
                    projectName: project.name,
                });
                document.querySelector('form#createProject').reset();
            }).catch((err) => {
                let error = err?.response?.data?.error;
                let message = error ? `${error.code} Error: ${error.message}` : err.message;
                setState({
                    ...state,
                    isLoading: false,
                    success: null,
                    error: message
                });
            });
    }

    if (session) {
        return (
            <div className='flex h-screen'>
                <div className="container mx-auto max-w-5xl mt-20">
                    <Navigation user={session.user} />
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <div className="px-4 sm:px-0">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">New Project Wizard</h3>
                                <p className="mt-1 text-md text-gray-600">
                                    Provide some basic information about the videos you&apos;ll be working on in this session.
                                    Choose a descriptive name, so that you can locate this project later.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="shadow sm:rounded-md sm:overflow-hidden">
                                {state.error && (
                                    <div className="bg-orange-100 border-t-4 border-orange-500 text-orange-700 p-4" role="alert">
                                        <p className="font-bold">Error Encountered!</p>
                                        <p>{state.error}</p>
                                    </div>
                                )}
                                {state.success && (
                                    <div className="bg-green-100 border-t-4 border-green-500 text-green-700 p-4" role="alert">
                                        <p className="font-bold">Project Saved!</p>
                                        <p className="underline"><Link href={state.projectLink}>{'Navigate to ' + state.projectName + ' \u00BB'}</Link></p>
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
                                                    </label>
                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">A name for your project.</p>
                                                    <input
                                                        id="name"
                                                        name="name"
                                                        className="w-full h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline shadow-sm"
                                                        type="text"
                                                        required="required"
                                                        onChange={handleNameChange}
                                                        placeholder="Triangle Strategy Playthrough" />
                                                    {/* Project Slug */}
                                                    <label htmlFor="slug" className="block mt-5 first-line:text-md font-medium text-gray-700">
                                                        Project Slug
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
                                                        disabled={state.override ? "" : "disabled"}
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
                                                        Thumbnail URL
                                                    </label>
                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">An image URL for the projects page.</p>
                                                    <input
                                                        id="thumbnail"
                                                        name="thumbnail"
                                                        className="w-full h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline shadow-sm"
                                                        type="url"
                                                        required="required"
                                                        placeholder="E.g. https://unsplash.com/..." />
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 mt-5 bg-gray-100 rounded-lg text-right sm:px-6">
                                                <button id="submit" type="submit" disabled={state.isLoading ? 'disabled' : ''} className={`${state.isLoading ? 'opacity-50 cursor-not-allowed' : ''} inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-md font-medium leading-6 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150`}>
                                                    <svg hidden={!state.isLoading} id="loading" className="animate-spin ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {state.isLoading ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
    return {
        props: {
            session
        }
    };
}
