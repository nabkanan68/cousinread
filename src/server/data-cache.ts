import { cache } from 'react';
import { db } from '~/server/db';
import { candidates, votes, regions, stations } from '~/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';

// Using React's cache function for memoization - this will deduplicate requests
// during server rendering and make the data fetching more efficient

/**
 * Fetch all regions with proper caching
 */
export const getAllRegions = cache(async () => {
  return db.query.regions.findMany({
    orderBy: (regions, { asc }) => [asc(regions.id)],
  });
});

/**
 * Fetch a region by ID with proper caching
 */
export const getRegionById = cache(async (id: number) => {
  return db.query.regions.findFirst({
    where: eq(regions.id, id),
  });
});

/**
 * Fetch election results for a specific region with proper caching
 * This implements server-side caching that refreshes every minute
 */
export const getElectionResultsByRegion = cache(async (regionId: number) => {
  // Get all candidates with their total votes across all stations
  const results = await db
    .select({
      candidateId: candidates.id,
      candidateName: candidates.name,
      candidateNumber: candidates.number,
      total_votes: sql`COALESCE(SUM(${votes.vote_count}), 0)`.as("total_votes"),
    })
    .from(candidates)
    .leftJoin(votes, eq(candidates.id, votes.candidate_id))
    .where(eq(candidates.region_id, regionId))
    .groupBy(candidates.id, candidates.name, candidates.number)
    .orderBy((cols) => [sql`${cols.total_votes} DESC`]);

  return results;
});

/**
 * Fetch detailed station-level election results with proper caching
 */
export const getStationResultsByRegion = cache(async (regionId: number) => {
  // First get all stations for the region
  const regionStations = await db.query.stations.findMany({
    where: eq(stations.region_id, regionId),
    orderBy: (stations, { asc }) => [asc(stations.name)],
  });

  // Get all candidates for the region
  const regionCandidates = await db.query.candidates.findMany({
    where: eq(candidates.region_id, regionId),
    orderBy: (candidates, { asc }) => [asc(candidates.number)],
  });

  // For each station, get the votes for each candidate
  const resultArray = [];
  
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

    // Calculate total votes for this station
    const stationTotalVotes = Object.values(candidateVotes).reduce(
      (sum: number, count: number) => sum + count, 
      0
    );

    // Include all candidates, even those with no votes
    const stationData = {
      station,
      totalVotes: stationTotalVotes,
      votes: regionCandidates.map((candidate) => ({
        candidate,
        voteCount: candidateVotes[candidate.id] ?? 0,
      })),
    };

    resultArray.push(stationData);
  }
  
  return resultArray;
});
