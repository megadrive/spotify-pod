import * as trpc from "@trpc/server";
import { updateRefreshToken } from "../../pages/api/auth/[...nextauth]";
import { createRouter } from "./context";

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 */
export function createProtectedRouter() {
  return createRouter()
    .middleware(({ ctx, next }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      return next({
        ctx: {
          ...ctx,
          // infers that `session` is non-nullable to downstream resolvers
          session: { ...ctx.session, user: ctx.session.user },
        },
      });
    })
    .middleware(async ({ ctx, next }) => {
      // verify the token is OK
      const spotifyToken = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!spotifyToken) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }

      if (spotifyToken.expires_at && spotifyToken.expires_at > Date.now()) {
        await updateRefreshToken(spotifyToken);
      }

      return next({
        ctx: {
          ...ctx,
        },
      });
    });
}
