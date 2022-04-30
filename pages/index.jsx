import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Login() {
  const { data: session, status } = useSession();

  if (status === 'authenticated') {
    return (
      <div className="card card-side bg-base-100 shadow rounded-lg">
        <figure>
          <Image src={session.user.image} alt="" width={128} height={128} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            Welcome back,
            {session.user.name}
          </h2>
        </div>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return (
      <div className="card card-side bg-base-100 shadow rounded-lg">
        <div className="card-body">
          <h2 className="card-title">Please login!</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="m-auto px-4 py-8 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10">
      <div className="w-full space-y-3">
        <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
