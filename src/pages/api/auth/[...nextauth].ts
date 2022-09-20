import NextAuth, { type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import { Account } from "@prisma/client";

const spotify = SpotifyProvider({
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  authorization: { params: { scope: "user-read-email playlist-read-private" } },
});

export async function updateRefreshToken(account: Account) {
  try {
    if (account.expires_at && account.expires_at > Date.now()) {
      return account;
    }

    if (
      !spotify.token ||
      typeof spotify.token !== "string" ||
      !account.refresh_token
    ) {
      return false;
    }

    const url = spotify.token;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: spotify.clientId!,
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    // type according to https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
    const refreshedTokens: {
      access_token: string;
      token_type: string;
      scope: string;
      expires_in: number;
    } = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // update tokens in the database
    const updatedAccount = await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token: refreshedTokens.access_token,
        expires_at: Date.now() + refreshedTokens.expires_in,
      },
    });

    return updatedAccount ? true : false;
  } catch (error) {
    console.error("Couldn't refresh token");
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    spotify,
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
