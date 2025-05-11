"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface AutoRefreshRegionResultsProps {
  regionId: number;
}

export default function AutoRefreshRegionResults({ regionId }: AutoRefreshRegionResultsProps) {
  const { data: region } = api.regions.getById.useQuery({ id: regionId });
  const { data: initialResults, isLoading } = api.candidates.getResultsByRegion.useQuery({ regionId });
  const [results, setResults] = useState(initialResults);
  const [countdown, setCountdown] = useState(90); // 90 seconds = 1.5 minutes
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = useCallback(() => {
    try {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    if (initialResults) {
      setResults(initialResults);
    }
  }, [initialResults]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [regionId, handleRefresh]);

  if (isLoading && !results) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse">Loading results...</div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">No results available yet</h3>
        <p className="text-gray-600">
          Results for this region will appear here once votes are counted.
        </p>
      </div>
    );
  }

  // Calculate total votes for percentage calculation
  interface CandidateResult {
  candidateId: number;
  candidateName: string;
  candidateNumber: number;
  total_votes: unknown;
}

// Type guard to ensure total_votes is a number
function getTotalVotes(candidate: CandidateResult): number {
  if (typeof candidate.total_votes === 'number') {
    return candidate.total_votes;
  }
  if (typeof candidate.total_votes === 'string') {
    const parsed = Number(candidate.total_votes);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const totalVotes = results.reduce((sum: number, candidate: CandidateResult) => {
  return sum + getTotalVotes(candidate);
}, 0);
  
  // Highlight the top 6 candidates (representatives)
  const representativeCount = region?.total_representatives ?? 6;
  const isRepresentative = (index: number) => index < representativeCount;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">
            {region?.name} Results
          </h3>
          <p className="text-sm opacity-80">
            Top {representativeCount} candidates will be elected as representatives
          </p>
        </div>
        <div className="text-xs bg-blue-800 py-1 px-3 rounded-full flex items-center">
          <span className={`inline-block ${refreshing ? "animate-spin" : ""} mr-1`}>⟳</span>
          Auto-refresh in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">No.</th>
              <th className="py-3 px-4 text-left">Candidate</th>
              <th className="py-3 px-4 text-right">Votes</th>
              <th className="py-3 px-4 text-right">Percentage</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((candidate: CandidateResult, index: number) => (
              <tr 
                key={candidate.candidateId}
                className={`border-b last:border-0 ${
                  isRepresentative(index) ? "bg-green-50" : ""
                }`}
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{candidate.candidateNumber}</td>
                <td className="py-3 px-4 font-medium">{candidate.candidateName}</td>
                <td className="py-3 px-4 text-right">
                  {getTotalVotes(candidate).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {totalVotes > 0
                    ? `${((getTotalVotes(candidate) / totalVotes) * 100).toFixed(2)}%`
                    : "0.00%"}
                </td>
                <td className="py-3 px-4 text-center">
                  {isRepresentative(index) ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Elected
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
