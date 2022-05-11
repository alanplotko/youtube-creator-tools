import { getSession, useSession } from 'next-auth/react';
import CreateItemCard from '@/components/Card/CreateItemCard';
import Image from 'next/image';
import Link from 'next/link';
import NoDataCard from '@/components/Card/NoDataCard';
import moment from 'moment';
import prisma from '@/lib/prisma';

export default function Projects({ projects }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="main-container">
        <h1 className="main-header">
          {session.user.name}
          &apos;s Projects
        </h1>
        {projects.length === 0 && (
          <NoDataCard
            title="No Projects"
            callToAction="Get started by creating a new project."
            link="/projects/new"
            buttonText="Create Project"
            icon="bi-folder-plus"
          />
        )}
        {projects.length > 0 && (
          <div className="main-grid my-10">
            <CreateItemCard
              title="New Project"
              callToAction="Click to create a new project!"
              link="/projects/new"
              icon="bi-folder-plus"
            />
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={{
                  pathname: `/projects/${project.published ? project.slug : 'new'}`,
                  query: !project.published ? { slug: project.slug } : null,
                }}
                passHref
              >
                <div className="w-96 card main-hover-card">
                  <figure style={{ contain: 'content' }}>
                    <Image
                      className={`${project.published ? 'group-hover:brightness-90' : 'brightness-50'} relative`}
                      width={400}
                      height={225}
                      src={project.image_thumbnail}
                      alt={`Project thumbnail for ${project.name}`}
                    />
                    {!project.published && (
                      <p className="absolute font-extrabold text-8xl text-white text-opacity-75">DRAFT</p>
                    )}
                  </figure>
                  <div className="card-body">
                    <p className="text-sm uppercase font-bold">
                      Last updated
                      {' '}
                      {moment(project.updatedAt).fromNow()}
                    </p>
                    <h2 className="card-title text-2xl">
                      {!project.published && (
                        <i className="bi bi-pencil" />
                      )}
                      {project.name}
                    </h2>
                    <p className="text-lg line-clamp-2">{project.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
  const projects = await prisma.project
    .findMany({
      where: {
        user: session.user.name,
        archived: false,
      },
      orderBy: [
        { published: 'asc' },
        { updatedAt: 'desc' },
      ],
    })
    .then((response) => JSON.parse(JSON.stringify(response)));

  return {
    props: {
      session,
      projects,
    },
  };
}
