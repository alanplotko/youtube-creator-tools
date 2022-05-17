import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
];
const userNavigation = [
  { name: 'Settings', path: '/settings' },
];

export default function Navigation() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="navbar bg-base-100 backdrop-blur-md shadow-md h-20">
      <div className="container mx-auto">
        <div className="navbar-start">
          <Link href="/" passHref>
            <a className="btn btn-ghost normal-case text-xl">
              <i className="bi bi-youtube text-4xl text-red-600 mr-2" />
              YouTube Creator Tools
            </a>
          </Link>
        </div>
        {session && (
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal p-0 text-lg">
              {navigation.map((link) => (
                <Link key={link.name} href={link.path} passHref>
                  <li>
                    <a className={`${router.pathname === link.path ? 'font-semibold' : ''}`}>{link.name}</a>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        )}
        <div className="navbar-end">
          {!isLoading && !session && (
            <div className="dropdown dropdown-end float-right">
              <button className="btn btn-primary rounded-lg text-lg" type="button" onClick={() => signIn('google')}>Sign In</button>
            </div>
          )}
          {session && (
            <div className="dropdown dropdown-end float-right">
              <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  {!isLoading && <Image src={session.user.image} width={48} height={48} alt="" />}
                </div>
              </label>
              <ul tabIndex="0" className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 text-lg">
                {userNavigation.map((link) => (
                  <li key={link.name}>
                    <Link key={link.name} href={link.path} passHref>
                      <a>{link.name}</a>
                    </Link>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={() => signOut()}>Sign out</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
