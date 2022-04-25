import Navigation from "components/navigation";
import { useSession, getSession } from 'next-auth/react';


export default function ProjectForm() {
    const { data: session } = useSession();
    return <Navigation user={session.user} />;
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
    return {
      props: {
        session
      }
    };
  }