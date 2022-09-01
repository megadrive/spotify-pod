import { createProtectedRouter } from "./protected-router";

import SpotifyWebApi from "spotify-web-api-node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const spotifyRouter = createProtectedRouter()
  .mutation("refresh-token", {
    async resolve({ ctx }) {
      // todo: add refreshing of expired tokens
    },
  })
  .query("get-me", {
    async resolve({ ctx }) {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          accounts: true,
        },
      });

      const account = user?.accounts.find(
        (account) => account.provider === "spotify"
      );

      if (!account || !account.access_token || !account.refresh_token) {
        console.log({ account });
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const spotify = new SpotifyWebApi({
        accessToken: account?.access_token,
        refreshToken: account?.refresh_token,
      });

      return await spotify.getMe();
    },
  })
  .query("get-user-playlists", {
    input: z.object({
      offset: z.number(),
    }),
    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          accounts: {
            where: {
              provider: "spotify",
            },
          },
        },
      });

      const account = user?.accounts[0];

      if (!account || !account.access_token || !account.refresh_token) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No Spotify account associated with thie user.",
        });
        return;
      }

      const spotify = new SpotifyWebApi({
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
      });

      const playlists = await spotify.getUserPlaylists({
        offset: input.offset ?? undefined,
      });

      return playlists.body;
    },
  });
