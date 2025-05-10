import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { votes, candidates, stations } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const votesRouter = createTRPCRouter({
  // Get all votes
  getAll: publicProcedure.query(async () => {
    return db.query.votes.findMany({
      orderBy: (votes, { asc }) => [asc(votes.id)],
      with: {
        candidate: true,
        station: true,
      },
      limit: 100, // Limit to prevent too much data
    });
  }),
  // Get votes for a specific station and candidate
  getVote: publicProcedure
    .input(z.object({ stationId: z.number(), candidateId: z.number() }))
    .query(async ({ input }) => {
      return db.query.votes.findFirst({
        where: and(
          eq(votes.station_id, input.stationId),
          eq(votes.candidate_id, input.candidateId)
        ),
      });
    }),

  // Get all votes for a station
  getByStation: publicProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      return db.query.votes.findMany({
        where: eq(votes.station_id, input.stationId),
        with: {
          candidate: true,
        },
      });
    }),

  // Add or update vote count
  upsertVote: publicProcedure
    .input(
      z.object({
        stationId: z.number(),
        candidateId: z.number(),
        voteCount: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      // First check if the vote record exists
      const existingVote = await db.query.votes.findFirst({
        where: and(
          eq(votes.station_id, input.stationId),
          eq(votes.candidate_id, input.candidateId)
        ),
      });

      if (existingVote) {
        // Update existing vote
        return db
          .update(votes)
          .set({ vote_count: input.voteCount, updated_at: new Date() })
          .where(
            and(
              eq(votes.station_id, input.stationId),
              eq(votes.candidate_id, input.candidateId)
            )
          )
          .returning();
      } else {
        // Create new vote record
        return db
          .insert(votes)
          .values({
            station_id: input.stationId,
            candidate_id: input.candidateId,
            vote_count: input.voteCount,
          })
          .returning();
      }
    }),

  // Get votes by region for all stations
  getVotesByRegion: publicProcedure
    .input(z.object({ regionId: z.number() }))
    .query(async ({ input }) => {
      // First get all stations for the region
      const regionStations = await db.query.stations.findMany({
        where: eq(stations.region_id, input.regionId),
      });

      // Get all candidates for the region
      const regionCandidates = await db.query.candidates.findMany({
        where: eq(candidates.region_id, input.regionId),
        orderBy: (candidates, { asc }) => [asc(candidates.number)],
      });

      // For each station, get the votes for each candidate
      const resultArray: Array<{
        station: typeof regionStations[number];
        votes: Array<{
          candidate: typeof regionCandidates[number]; 
          voteCount: number;
        }>;
      }> = [];
      
      for (const station of regionStations) {
        const stationVoteRecords = await db.query.votes.findMany({
          where: eq(votes.station_id, station.id),
          with: {
            candidate: true,
          },
        });

        // Create a map of candidate ID to vote count
        const candidateVotes: Record<number, number> = {};
        stationVoteRecords.forEach((vote) => {
          candidateVotes[vote.candidate_id] = vote.vote_count;
        });

        // Include all candidates, even those with no votes
        const stationData = {
          station,
          votes: regionCandidates.map((candidate) => ({
            candidate,
            voteCount: candidateVotes[candidate.id] ?? 0,
          })),
        };

        resultArray.push(stationData);
      }
      
      return resultArray;
    }),
});
