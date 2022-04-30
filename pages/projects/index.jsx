import { getSession, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import prisma from '@/lib/prisma';

export default function Projects({ projects }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <h1 className="text-center text-3xl font-medium text-slate-600">
          {session.user.name}
          &apos;s Projects
        </h1>
        {
          projects.length === 0 && (
            <div className="mx-auto p-5 w-6/12 card bg-base-100 shadow-md rounded-lg border">
              <div className="card-body items-center text-center">
                <i className="bi bi-folder-plus text-9xl text-gray-600" />
                <h2 className="card-title text-2xl">No Projects</h2>
                <p className="text-lg">Get started by creating a new project.</p>
                <div className="text-center mt-8">
                  <Link href="/projects/new" passHref>
                    <button className="btn btn-primary gap-2 text-lg" type="button">
                      Create Project
                      <i className="bi bi-arrow-right" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )
        }
        {
          projects.length > 0 && (
            <div className="grid justify-center md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-5 my-10">
              <Link href="/projects/new" passHref>
                <div className="w-96 card bg-white shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer rounded-lg border">
                  <div className="card-body items-center text-center justify-center">
                    <i className="bi bi-folder-plus text-9xl text-gray-600" />
                    <h2 className="card-title text-2xl">New Project</h2>
                    <span className="text-lg">Click to create a new project!</span>
                  </div>
                </div>
              </Link>
              {projects.map((project) => (
                <Link key={project.slug} href={`/projects/${project.slug}`} passHref>
                  <div className="w-96 card bg-white shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer rounded-lg border group">
                    <figure>
                      <Image className="group-hover:brightness-90" width={400} height={225} src={project.image_thumbnail} alt={`Project thumbnail for ${project.name}`} />
                    </figure>
                    <div className="card-body">
                      <p className="text-sm uppercase font-bold">{moment(project.createdAt).fromNow()}</p>
                      <h2 className="card-title text-2xl">{project.name}</h2>
                      <p className="text-lg line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </>
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
      user: session.user.name,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return {
    props: {
      session,
      projects: JSON.parse(JSON.stringify(projects)),
    },
  };
}
