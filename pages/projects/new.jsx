import { getSession, useSession } from 'next-auth/react';
import CreateProjectStage1 from '@/components/CreateProjectStage/CreateProjectStage1';
import CreateProjectStage2 from '@/components/CreateProjectStage/CreateProjectStage2';
import Steps from '@/components/Steps';
import prisma from '@/lib/prisma';
import { useState } from 'react';

export default function ProjectForm({ project }) {
  const { data: session } = useSession();
  const [state, setState] = useState({ published: false });

  const onPublishHandler = () => {
    setState({ published: true });
  };

  const steps = ['Basic Details', 'Add Videos', 'Done!'];
  const currentStepIndex = (() => {
    if (!project) {
      return 0;
    }
    if (project && !state.published) {
      return 1;
    }
    return 2;
  })();

  if (session) {
    return (
      <div className="main-container">
        <div className="main-grid">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="main-section-header">New Project Wizard</h3>
              <p className="main-section-description">
                Provide some basic information about the videos you&apos;ll
                be working on in this session. Choose a descriptive name,
                so that you can locate this project later.
              </p>
              <Steps steps={steps} currentStepIndex={currentStepIndex} />
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
