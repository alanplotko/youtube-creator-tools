import { getSession, useSession } from 'next-auth/react';
import CreateProjectStage1 from '@/components/CreateProjectStage1';
import CreateProjectStage2 from '@/components/CreateProjectStage2';
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
    if (!project) return 0;
    if (project && !state.published) return 1;
    return 2;
  })();

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
