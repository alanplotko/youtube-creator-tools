import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import axios from 'axios';
import prisma from '@/lib/prisma';

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property.
 *
 * Reference: https://next-auth.js.org/tutorials/refresh-token-rotation
 */
async function refreshAccessToken(token) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken,
  });
  const url = `https://oauth2.googleapis.com/token?${params}`;
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  try {
    const response = await axios.post(url, { headers });

    if (!response.data) {
      throw response.data;
    }

    return {
      ...token,
      accessToken: response.data.access_token,
      accessTokenExpires: Date.now() + response.data.expires_in * 1000,
      // Fall back to old refresh token
      refreshToken: response.data.refresh_token ?? token.refreshToken,
    };
  } catch (e) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

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
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      /* The token object is what returned from the `jwt` callback,
       * it has the `accessToken` that we assigned before. Assign the
       * accessToken to the `session` object, so it will be available
       * on our app through `useSession` hooks
       */
      return {
        ...session,
        user: token.user,
        accessToken: token.accessToken,
        error: token.error,
      };
    },
  },
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: 'offline',
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/yt-analytics.readonly',
        },
      },
    }),
    // ...add more providers here
  ],
});
