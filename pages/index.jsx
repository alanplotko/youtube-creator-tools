import ChannelStats from '@/components/ChannelStats';
import LoginCard from '@/components/Card/LoginCard';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="main-container">
      <LoginCard status={status} session={session} />
      {session && (
        <ChannelStats user={session.user.name} />
      )}
    </div>
  );
}
