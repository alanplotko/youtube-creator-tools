import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // DB Adapter
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  // Callbacks
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      const updatedToken = token;
      if (account) {
        updatedToken.accessToken = account.access_token;
      }
      return updatedToken;
    },
    async session({ session, token }) {
      /* The token object is what returned from the `jwt` callback,
       * it has the `accessToken` that we assigned before. Assign the
       * accessToken to the `session` object, so it will be available
       * on our app through `useSession` hooks
       */
      const updatedSession = session;
      if (token) {
        updatedSession.accessToken = token.accessToken;
      }
      return updatedSession;
    },
  },
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube',
        },
      },
    }),
    // ...add more providers here
  ],
});
