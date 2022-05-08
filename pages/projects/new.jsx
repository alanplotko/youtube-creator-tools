import { getSession, useSession } from 'next-auth/react';
import CreateProjectStage1 from '@/components/CreateProjectStage1';
import CreateProjectStage2 from '@/components/CreateProjectStage2';
import prisma from '@/lib/prisma';
import { useState } from 'react';

export default function ProjectForm({ project }) {
  const { data: session } = useSession();
  const [state, setState] = useState({ published: false });

  const onPublishHandler = () => {
    setState({ published: true });
  };

  const steps = [];
  // Step 1: Basic Details
  if (!project) {
    steps.push(
      <li key="step1" className="step step-primary">Basic Details</li>,
      <li key="step2" className="step">Add Videos</li>,
      <li key="step3" className="step">Done!</li>,
    );
  // Step 2: Add Videos
  } else if (project && !state.published) {
    steps.push(
      <li key="step1" className="step" data-content="✓">Basic Details</li>,
      <li key="step2" className="step step-primary">Add Videos</li>,
      <li key="step3" className="step">Done!</li>,
    );
  // Step 3: Done!
  } else {
    steps.push(
      <li key="step1" className="step" data-content="✓">Basic Details</li>,
      <li key="step2" className="step" data-content="✓">Add Videos</li>,
      <li key="step3" className="step step-primary" data-content="✓">Done!</li>,
    );
  }

  if (session) {
    return (
      <div className="container mx-auto px-5 py-24">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">New Project Wizard</h3>
              <p className="mt-1 text-md text-gray-600">
                Provide some basic information about the videos you&apos;ll
                be working on in this session. Choose a descriptive name,
                so that you can locate this project later.
              </p>
              <ul className="steps steps-vertical">
                {steps}
              </ul>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              {project ? (
                <CreateProjectStage2 project={project} completeCallback={onPublishHandler} />
              ) : (
                <CreateProjectStage1 />
              )}
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

  const slug = context?.query?.slug;
  if (slug) {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (project == null || project.archived || project.published) {
      return {
        redirect: {
          destination: '/projects/new',
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

  return {
    props: {
      session,
    },
  };
}
