import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { stations } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const stationsRouter = createTRPCRouter({
  // Get all stations
  getAll: publicProcedure.query(async () => {
    return db.query.stations.findMany({
      orderBy: (stations, { asc }) => [asc(stations.id)],
      with: {
        region: true,
      },
    });
  }),

  // Get stations by region ID
  getByRegion: publicProcedure
    .input(z.object({ regionId: z.number() }))
    .query(async ({ input }) => {
      return db.query.stations.findMany({
        where: eq(stations.region_id, input.regionId),
        orderBy: (stations, { asc }) => [asc(stations.name)],
        with: {
          region: true,
        },
      });
    }),
});
