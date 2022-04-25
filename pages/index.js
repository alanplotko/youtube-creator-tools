import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Navigation from 'components/navigation';
// import styles from '../styles/HomeLoggedOut.module.css'

export default function Login() {
  const { data: session, status } = useSession();

  if (status === 'authenticated') {
    return (
      <div className='flex h-screen'>
        <Navigation user={session.user} />
        <div className='m-auto px-4 py-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10'>
          <div className='text-center mb-4 text-xl font-light text-gray-600 sm:text-3xl dark:text-white'>
            Welcome back, {session.user.name}!
          </div>
          <div className='text-center mb-4'>
            <Image src={session.user.image} alt='Avatar' width={128} height={128} className='rounded-full' />
          </div>
          <div className='flex gap-4 item-center'>
            <button type='button' onClick={() => signOut()} className='py-2 px-4 flex justify-center items-center  bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg'>
              Sign Out
            </button>
            <Link href="/projects" passHref>
              <button type='button' className='py-2 px-4 flex justify-center items-center  bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg'>
                My Projects
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  } else if (status === 'unauthenticated') {
    return (
      <div className='flex h-screen'>
        <Navigation />
        <div className='m-auto px-4 py-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10'>
          <div className='text-center mb-4 text-xl font-light text-gray-600 sm:text-3xl dark:text-white'>
            Hi there!
          </div>
          <div className='text-center mb-4'>
            <i className='bi bi-person-square text-gray-800' style={{ fontSize: 128 }} ></i>
          </div>
          <div className='flex gap-4 item-center'>
            <button type='button' onClick={() => signIn('google')} className='py-2 px-4 flex justify-center items-center  bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg'>
              <i className='bi bi-youtube'></i>&nbsp;
              Login with YouTube
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className='flex h-screen'>
        <Navigation />
        <div className='m-auto px-4 py-8 bg-white rounded-lg shadow dark:bg-gray-800 sm:px-6 md:px-8 lg:px-10'>
        <div className="w-64 h-44 bg-gray-200 animate-pulse"></div>
          <div className="mt-8 h-32 w-full space-y-3">
            <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
}