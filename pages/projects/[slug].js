import { useSession, getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import Image from 'next/image';
import Navigation from 'components/navigation';

export default function ProjectView({ project }) {
    const { data: session } = useSession();

    if (session) {
        return (
            <div>
                <Navigation user={session.user} />
                <div className="flex w-full overflow-hidden relative" style={{ height: '30vh' }}>
                    <Image layout="fill" objectFit="cover" src={project.image_cover} alt={`Project cover art for ${project.name}`} />
                </div>
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
                slug: context.params.slug
            }
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
        }
    };
}
