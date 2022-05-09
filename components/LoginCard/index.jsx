import Image from 'next/image';
import classNames from 'classnames';
import styles from './LoginCard.module.css';

export default function LoginCard({ status, session }) {
  return (
    <div className={classNames('card card-side mb-10', styles.CardSide)}>
      <figure>
        {status === 'loading' && <div className={classNames('w-32 h-32', styles.Loading)} />}
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
        {status === 'loading' && <div className={classNames('w-1/2 h-4 mb-2 rounded-full', styles.Loading)} />}
      </div>
    </div>
  );
}
