import { useSession, getSession } from 'next-auth/react';
import clientPromise from '@/lib/mongodb';

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
    const client = await clientPromise;
    const project = await client.db()
        .collection('projects')
        .findOne({ slug: context.params.slug });
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
