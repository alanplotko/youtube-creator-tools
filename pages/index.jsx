import ChannelStats from '@/components/ChannelStats';
import LoginCard from '@/components/LoginCard';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-5 py-24">
      <LoginCard status={status} session={session} />
      {session && (<ChannelStats user={session.user.name} />)}
    </div>
  );
}
