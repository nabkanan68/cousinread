import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { candidates, votes } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { dataCache } from "~/server/cache";

export const candidatesRouter = createTRPCRouter({
  // Get all candidates
  getAll: publicProcedure.query(async () => {
    return db.query.candidates.findMany({
      orderBy: (candidates, { asc }) => [asc(candidates.region_id), asc(candidates.number)],
      with: {
        region: true,
      },
    });
  }),

  // Get candidates by region
  getByRegion: publicProcedure
    .input(z.object({ regionId: z.number() }))
    .query(async ({ input }) => {
      return db.query.candidates.findMany({
        where: eq(candidates.region_id, input.regionId),
        orderBy: (candidates, { asc }) => [asc(candidates.number)],
        with: {
          region: true,
        },
      });
    }),

  // Get election results (total votes) for candidates by region
  getResultsByRegion: publicProcedure
    .input(z.object({ regionId: z.number() }))
    .query(async ({ input }) => {
      // Import the getElectionResultsByRegion function from our data-cache module
      const { getElectionResultsByRegion } = await import('~/server/data-cache');
      // Use our cached data function that refreshes every minute
      return getElectionResultsByRegion(input.regionId);
    }),
});
