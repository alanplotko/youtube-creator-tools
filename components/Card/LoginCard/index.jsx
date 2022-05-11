import Image from 'next/image';

export default function LoginCard({ status, session }) {
  return (
    <div className="main-card-side mb-10">
      <figure>
        {status === 'loading' && <div className="w-32 h-32 main-loading-indicator" />}
        {status === 'authenticated' && <Image src={session.user.image} alt="" width={128} height={128} />}
      </figure>
      <div className="card-body">
        {status === 'authenticated' && (
          <h2 className="card-title">
            Welcome back,
            {' '}
            {session.user.name}
          </h2>
        )}
        {status === 'unauthenticated' && (
          <h2 className="card-title">Please login!</h2>
        )}
        {status === 'loading' && <div className="w-1/2 h-4 mb-2 rounded-full main-loading-indicator" />}
      </div>
    </div>
  );
}
