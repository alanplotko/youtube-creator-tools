import { getSession, useSession } from 'next-auth/react';
import CreateProjectStage1 from '@/components/CreateProjectStage/CreateProjectStage1';
// import CreateProjectStage2 from '@/components/CreateProjectStage/CreateProjectStage2';
import Steps from '@/components/Steps';
import prisma from '@/lib/prisma';
import { useState } from 'react';

export default function EditProjectForm({ project }) {
  const { data: session } = useSession();
  const [state, setState] = useState({ published: false });

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
              </h3>
              <p className="main-section-description">
                Update the basic details for your project,
                {' '}
                change the slug name, or update the image thumbnail.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <CreateProjectStage1 editing={project} />
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

  return {
    props: {
      session,
    },
  };
}
