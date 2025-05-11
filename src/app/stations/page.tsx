'use client';

import Layout from "~/app/_components/Layout";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Loading component to display while suspense boundary is active
function StationsLoading() {
  return (
    <Layout>
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading stations data...</div>
      </div>
    </Layout>
  );
}

// Separate component that uses the search params inside Suspense
function StationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regionId = searchParams.get('id') ? Number(searchParams.get('id')) : 0;

  const [regions, setRegions] = useState<Array<{id: number; name: string}>>([]);
  
  // Define specific types for our data structure
  type Candidate = {
    id: number;
    name: string;
    number: number;
    region_id: number;
  };
  
  type Station = {
    id: number;
    name: string;
    region_id: number;
  };
  
  type VoteData = {
    candidate: Candidate;
    voteCount: number;
  };
  
  type StationData = {
    station: Station;
    totalVotes: number;
    votes: VoteData[];
  };
  
  type StationDetails = { 
    region?: { id: number; name: string }; 
    stations: StationData[] 
  } | null;

  const [stationDetails, setStationDetails] = useState<StationDetails>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch regions on initial load
  useEffect(() => {
    async function fetchRegions() {
      try {
        setLoading(true);
        // Use our new API endpoint instead of tRPC
        const response = await fetch(`/api/regions`);
        const rawData: unknown = await response.json();
        
        // Type guard for array of regions
        if (
          Array.isArray(rawData) &&
          rawData.every(
            (region): region is { id: number; name: string } =>
              !!region &&
              typeof region === 'object' &&
              'id' in region &&
              typeof (region as { id: unknown }).id === 'number' &&
              'name' in region &&
              typeof (region as { name: unknown }).name === 'string'
          )
        ) {
          setRegions(rawData);
        } else {
          console.error('Expected regions to be an array of {id, name} but got:', rawData);
          setRegions([]); // Fallback to empty array
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        setRegions([]);
      } finally {
        setLoading(false);
      }
    }

    void (async () => { await fetchRegions(); })();
  }, []);

  // Fetch station details when regionId changes
  useEffect(() => {
    void (async () => {
      if (regionId > 0) {
        try {
          setDetailsLoading(true);
          // Type for the region API response
          type RegionResponse = {
            result?: {
              data?: {
                id: number;
                name: string;
              }
            }
          }[];

          // Fetch region data
          const regionResponse = await fetch(`/api/trpc/regions.getById?batch=1&input=%7B%22json%22%3A%7B%22id%22%3A${regionId}%7D%7D`);
          const regionData = await regionResponse.json() as RegionResponse;
          
          // Use our custom endpoint to get station details
          const stationsResponse = await fetch(`/api/stations?regionId=${regionId}`);
          const stationsData = await stationsResponse.json() as StationData[];
          
          // Safely set the station details with proper typing
          setStationDetails({
            region: regionData[0]?.result?.data,
            stations: Array.isArray(stationsData) ? stationsData : []
          });
        } catch (error) {
          console.error("Error fetching station details:", error);
          setStationDetails(null);
        } finally {
          setDetailsLoading(false);
        }
      }
    })();
  }, [regionId]);

  // Function to view a specific region
  const viewRegion = (id: number) => {
    router.push(`/stations?id=${id}`);
  };

  // Function to go back to region list
  const backToRegions = () => {
    router.push('/stations');
  };

  // Show loading state
  if (loading && regionId === 0) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <div className="animate-pulse">Loading regions...</div>
        </div>
      </Layout>
    );
  }

  // Show region list
  if (regionId === 0) {
    return (
      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Polling Stations</h1>
          <p className="text-gray-600">Select a region to view its polling stations and results.</p>
        </div>
        
        {regions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => {
              return (
                <div
                  key={region.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{region.name}</h3>
                    <div className="mt-4">
                      <span
                        onClick={() => viewRegion(region.id)}
                        className="inline-flex items-center text-blue-600 cursor-pointer hover:text-blue-800"
                      >
                        View Details
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">No regions found. Please check back later.</p>
          </div>
        )}
      </Layout>
    );
  }

  // Show details loading state
  if (detailsLoading || !stationDetails) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <div className="animate-pulse">Loading station details...</div>
        </div>
      </Layout>
    );
  }

  // Show station details
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={backToRegions}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Regions
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {stationDetails.region?.name} - Polling Station Details
        </h1>
        <p className="text-gray-600">
          Detailed voting results from each polling station in this region.
        </p>
      </div>

      {stationDetails.stations.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">No polling stations found for this region.</p>
        </div>
      ) : (
        stationDetails.stations.map((stationData: StationData) => (
          <div key={stationData.station.id} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-700 text-white px-6 py-4">
              <h3 className="text-xl font-semibold">
                Station: {stationData.station.name}
              </h3>
              <p className="text-sm opacity-80">
                Total Votes: {stationData.totalVotes.toLocaleString()}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">No.</th>
                    <th className="py-3 px-4 text-left">Candidate</th>
                    <th className="py-3 px-4 text-right">Votes</th>
                    <th className="py-3 px-4 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {stationData.votes.map((voteData: VoteData) => {
                    // Calculate percentage
                    const percentage = stationData.totalVotes > 0
                      ? (voteData.voteCount / stationData.totalVotes) * 100
                      : 0;

                    return (
                      <tr
                        key={voteData.candidate.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 px-4">{voteData.candidate.number}</td>
                        <td className="py-3 px-4 font-medium">{voteData.candidate.name}</td>
                        <td className="py-3 px-4 text-right">{voteData.voteCount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{percentage.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}

// Export the main page component with Suspense boundary
// Use useSearchParams() inside a Suspense boundary to fix the build error
export default function StationsPage() {
  return (
    <Suspense fallback={<StationsLoading />}>
      <StationsContent />
    </Suspense>
  );
}

// Mark this route as dynamic to prevent static generation issues
export const dynamic = "force-dynamic";
