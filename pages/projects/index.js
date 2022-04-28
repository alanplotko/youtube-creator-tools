import { useSession, getSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from 'components/navigation';
import moment from 'moment';
import prisma from 'lib/prisma';

export default function Projects({ projects }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className='flex h-screen'>
        <div className="container mx-auto max-w-5xl">
          <Navigation user={session.user} />
          <div className="pt-12 pb-6 mx-auto space-y-2 px-4">
            <h1 className="text-center text-3xl font-medium text-slate-600">
              {session.user.name}&apos;s Projects
            </h1>
          </div>
          {projects.length == 0 && (
            <div className="mx-auto p-10 w-6/12 bg-white rounded-lg border shadow-md">
              <div className='text-center'>
                <i className='bi bi-folder-plus text-gray-600' style={{ fontSize: 80 }}></i>
              </div>
              <h2 className="text-2xl text-center leading-6 text-gray-900 my-2">
                No Projects
              </h2>
              <h4 className="text-xl text-center leading-6 text-gray-600 my-2">
                Get started by creating a new project.
              </h4>
              <div className='text-center mt-8'>
                <Link href="/projects/new" passHref>
                  <button type='button' className='inline-flex items-center py-2 px-4 space-x-2 text-lg bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white transition ease-in duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg'>
                    <span>Create Project</span>
                    <i className='bi bi-arrow-right'></i>
                  </button>
                </Link>
              </div>
            </div>
          )}
          {projects.length > 0 && (
            <div className="grid justify-center md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7 my-10">
              <Link href="/projects/new" passHref>
                <div className="bg-white rounded-lg border shadow-md max-w-xs md:max-w-none overflow-hidden cursor-pointer hover:shadow-lg hover:bg-gray-100">
                  <div className='text-center'>
                    <i className='bi bi-folder-plus text-gray-600' style={{ fontSize: 128 }} ></i>
                  </div>
                  <h2 className="text-2xl text-center leading-6 text-gray-900 my-2">
                    New Project
                  </h2>
                  <h4 className="text-xl text-center leading-6 text-gray-600 my-2">
                    Click to create a new project!
                  </h4>
                </div>
              </Link>
              {projects.map(project => (
                <Link key={project._id} href={`/projects/${project.slug}`} passHref>
                  <div className="bg-white rounded-lg border shadow-md max-w-xs md:max-w-none overflow-hidden cursor-pointer hover:shadow-lg hover:bg-gray-50">
                    <Image width={400} height={225} src={project.image_thumbnail} alt={`Project thumbnail for ${project.name}`} />
                    <div className="p-3">
                      <span className="text-sm text-primary">{moment(project.createdAt).fromNow()}</span>
                      <h3 className="font-semibold text-xl leading-6 text-gray-700 my-2">
                        {project.name}
                      </h3>
                      <p className="paragraph-normal text-gray-600">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
  const projects = await prisma.projects.findMany({
    where: {
      user: session.user.name
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return {
    props: {
      session,
      projects: JSON.parse(JSON.stringify(projects)),
    }
  };
}
