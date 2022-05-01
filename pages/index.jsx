import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Login() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-5 py-24">
        <div className="card card-side bg-base-100 shadow rounded-lg">
          <div className="card-body">
            <h2 className="card-title">Please login!</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 py-24">
      <div className="card card-side bg-base-100 shadow rounded-lg">
        <figure>
          {isLoading && <div className="w-32 h-32 bg-gray-200 animate-pulse" />}
          {isAuthenticated && <Image src={session.user.image} alt="" width={128} height={128} />}
        </figure>
        <div className="card-body">
          {isAuthenticated && (
            <h2 className="card-title">
              Welcome back,
              {' '}
              {session.user.name}
            </h2>
          )}
          {isLoading && <div className="w-1/2 h-4 mb-2 bg-gray-200 rounded-full animate-pulse" />}
        </div>
      </div>
    </div>
  );
}
