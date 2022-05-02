import '@/styles/globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { SessionProvider, signIn } from 'next-auth/react';
import Layout from '@/components/Layout';
import { useEffect } from 'react';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  // Check for session error due to token expiration
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      // Force sign in to attempt resolving the error
      signIn();
    }
  }, [session]);

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
