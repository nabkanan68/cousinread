import { regionsRouter } from "./routers/regions";
import { candidatesRouter } from "./routers/candidates";
import { votesRouter } from "./routers/votes";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  regions: regionsRouter,
  candidates: candidatesRouter,
  votes: votesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.regions.all();
 *       ^? Region[]
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
