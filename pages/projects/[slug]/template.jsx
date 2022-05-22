import Alert from '@/components/Alert';
import CSVReaderInput from '@/components/Form/CSVReaderInput';
import LinkInput from '@/components/Form/LinkInput';
import TagInput from '@/components/Form/TagInput';
import TextArea from '@/components/Form/TextArea';
import TextInput from '@/components/Form/TextInput';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import moment from 'moment';
import prisma from '@/lib/prisma';
import { useState } from 'react';

const separator = () => '-----------------------------------------------';

export default function SubmitTemplate({ project }) {
  const defaultState = { isLoading: false, error: null };
  const [state, setState] = useState(defaultState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({
      ...state,
      isLoading: true,
    });

    // Get form data
    const formData = Object.fromEntries(new FormData(document.querySelector('form#editTemplate')));

    try {
      // Create formatted description
      formData.description = `${formData.leadingText} ◆ Expand for more!\n\n${separator()}\n★ About ${formData.gameTitle}\n${formData.gameSynopsis}\n`
        + `${separator()}\n★ Follow Me\n${formData.links.split(',').map((link) => `► ${link.split(';')[0]}: ${link.split(';')[1]}`).join('\n')}\n`
        + `${separator()}\n${formData.hashtags.split(',').map((tag) => `#${tag}`).join(' ')}`;
    } catch (err) {
      setState({
        ...defaultState,
        error: `Validation error: ${err.message}`,
      });
    }

    try {
      const { slug } = project;
      const response = await axios.post(`/api/projects/${slug}/template`, { slug, template: formData });
      setState({ ...defaultState, success: response.data });
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
      <div className="w-full bg-cover bg-center h-80 relative" style={{ backgroundImage: `url(${project.image_cover})` }}>
        <h1 className="absolute left-10 bottom-10 text-center text-6xl font-medium text-white bg-black p-2">
          {project.name}
          {' | '}
          Template
        </h1>
      </div>
      <div className="container mx-auto mt-20">
        <div className="flex flex-wrap w-full mb-10">
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">
              Editing Template
            </h1>
            <div className="h-1 w-1/3 bg-primary rounded" />
            {project?.template?.updatedAt && (
              <p className="text-sm mt-2 font-bold">
                Template last updated on
                {' '}
                {moment(project.template.updatedAt).format('MMMM D, YYYY, h:mm a')}
              </p>
            )}
          </div>
          <p className="lg:w-1/2 w-full leading-relaxed text-gray-600">Set the game, titles, description, and tags for your videos.</p>
          <div className="my-10 h-0.5 w-full bg-secondary rounded opacity-25" />
          <div className="w-2/3 px-4 py-5 bg-white space-y-6 sm:p-6">
            <form id="editTemplate" onSubmit={handleSubmit}>
              <fieldset id="fields" className={classNames()}>
                {state.error && (
                  <Alert
                    className="mb-5"
                    type="error"
                    alertText={state.error}
                  />
                )}
                {state.success && (
                  <Alert
                    className="mb-5"
                    type="success"
                    alertHeading="Project Template Saved!"
                    alertText={`Return to ${project.name} \u00BB`}
                    alertLink={`/projects/${project.slug}`}
                  />
                )}

                {/* Game Title */}
                <TextInput
                  label="Game Title"
                  helpText="The title of the video game for the project."
                  id="gameTitle"
                  name="gameTitle"
                  required
                  placeholder="Kirby and the Forgotten Land"
                  defaultValue={project?.template?.gameTitle}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                />

                {/* Leading Text */}
                <TextArea
                  label="Leading Text"
                  helpText="Leading text for your overall description to engage the viewer (250 characters)."
                  id="leadingText"
                  name="leadingText"
                  required
                  placeholder="Nintendo dropped a demo for Kirby and the Forgotten Land on the eShop, so what a great time to check this out before I dive into Triangle Strategy tomorrow..."
                  defaultValue={project?.template?.leadingText}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                  trackCharacterCount
                  maxLength={250}
                />

                {/* Game Synopsis */}
                <TextArea
                  label="Game Synopsis"
                  helpText="A game summary to provide background to the viewer (280 characters)."
                  id="gameSynopsis"
                  name="gameSynopsis"
                  required
                  placeholder="Kirby sets off an a new adventure in a mysterious world with abandoned structures from a past civilization (resembling present-day society)..."
                  defaultValue={project?.template?.gameSynopsis}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                  trackCharacterCount
                  maxLength={500}
                />

                {/* Links */}
                <LinkInput
                  label="Links"
                  helpText="Comma-separated list of &quot;label;link&quot; for the viewer to follow."
                  id="links"
                  name="links"
                  required
                  placeholder="Twitch;https://www.twitch.tv/<your username>"
                  defaultValue={project?.template?.links.split(',')}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                />

                {/* Hashtags */}
                <TagInput
                  label="Hashtags"
                  helpText="Comma-separated list of hashtags for the end of the description. No spaces or hashtags, non-alphanumeric characters will be removed."
                  id="hashtags"
                  name="hashtags"
                  required
                  validation={/[^a-z0-9]+/gi}
                  placeholder="E.g. NintendoSwitch"
                  defaultValue={project?.template?.hashtags.split(',')}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                />

                {/* Video Tags */}
                <TagInput
                  label="Video Tags"
                  helpText="Comma-separated list of video tags."
                  id="tags"
                  name="tags"
                  required
                  placeholder="E.g. Kirby and the Forgotten Land​​​"
                  defaultValue={project?.template?.tags.split(',')}
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                />

                {/* Parse uploaded template */}
                <CSVReaderInput
                  label="Upload Video Title Template"
                  helpText="CSV file containing episode titles and numbers by video ID."
                  id="titleTemplate"
                  name="titleTemplate"
                  defaultValue={
                    project?.template?.titleTemplate
                      ? JSON.parse(project?.template?.titleTemplate) : null
                  }
                  disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                />

                <div className="bg-gray-100 px-4 py-3 mt-5 rounded-lg text-right sm:px-6">
                  <button
                    id="submit"
                    type="submit"
                    disabled={(state.isLoading || state.success) ? 'disabled' : ''}
                    className={classNames('btn btn-primary btn-wide', {
                      loading: state.isLoading,
                    })}
                  >
                    Save
                  </button>
                </div>
              </fieldset>
            </form>
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
