import { useSession, getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default function ProjectView({ project }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <div className="w-full bg-cover bg-center" style={{ height: '32rem', backgroundImage: `url(${project.image_cover})` }}>
          <div className="flex items-center justify-center h-full w-full bg-gray-900 bg-opacity-50">
            <div className="text-center">
              <h1 className="text-white text-2xl font-semibold uppercase md:text-3xl">
                Build Your new
                <span className="underline text-blue-400">Saas</span>
              </h1>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm uppercase font-medium rounded hover:bg-blue-500 focus:outline-none focus:bg-blue-500" type="button">
                {project.name}
              </button>
            </div>
          </div>
        </div>
        <div className="flex w-full overflow-hidden relative" style={{ height: '30vh' }} />
        <div className="container mx-auto max-w-5xl mt-20">
          <div className="pt-12 pb-6 mx-auto space-y-2 px-4">
            <h1 className="text-center text-3xl font-medium text-slate-600">
              {project.name}
            </h1>
            <span>{JSON.stringify(project)}</span>
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
  const project = await prisma.projects
    .findUnique({
      where: {
        slug: context.params.slug,
      },
    });
  if (project == null) {
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
