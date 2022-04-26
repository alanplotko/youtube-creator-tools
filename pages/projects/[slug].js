import { useSession, getSession } from 'next-auth/react';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function ProjectView({ project }) {
    const { data: session } = useSession();

    if (session) {
        return (
            <pre>{JSON.stringify(project)}</pre>
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
