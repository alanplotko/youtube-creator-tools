import { getSession, useSession } from 'next-auth/react';
import CreateProjectStage1 from '@/components/CreateProjectStage/CreateProjectStage1';
import CreateProjectStage2 from '@/components/CreateProjectStage/CreateProjectStage2';
import prisma from '@/lib/prisma';

export default function EditProjectForm({ project, step }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="main-container">
        <div className="main-grid">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="main-section-header">
                Editing
                {' '}
                {project.name}
                {' - '}
                {step === '1' && 'Basic Details'}
                {step === '2' && 'Videos'}
              </h3>
              <p className="main-section-description">
                {step === '1' && (
                  <span>
                    Update the basic details for your project,
                    {' '}
                    change the slug name, or update the image thumbnail.
                  </span>
                )}
                {step === '2' && (
                  <span>
                    Update the videos for your project.
                    {' '}
                    This will replace your current videos with the new selections.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              {step === '1' && (
                <CreateProjectStage1 project={project} isEditing />
              )}
              {step === '2' && (
                <CreateProjectStage2 project={project} isEditing />
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
  const step = context?.query?.step;

  if (slug && ['1', '2'].includes(step)) {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (project !== null && !project.archived) {
      return {
        props: {
          session,
          project: JSON.parse(JSON.stringify(project)),
          step,
        },
      };
    }
  }

  return {
    redirect: {
      destination: '/projects',
      permanent: false,
    },
  };
}
