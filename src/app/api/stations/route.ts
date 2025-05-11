import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStationResultsByRegion } from "~/server/data-cache";

// Set cache control headers to cache the response for 60 seconds (1 minute)
const cacheControl = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
}; 

export async function GET(request: NextRequest) {
  try {
    // Get region ID from query params
    const searchParams = request.nextUrl.searchParams;
    const regionIdParam = searchParams.get('regionId');
    
    if (!regionIdParam) {
      return NextResponse.json(
        { error: "Region ID is required" }, 
        { status: 400, headers: cacheControl }
      );
    }
    
    const regionId = parseInt(regionIdParam, 10);
    
    if (isNaN(regionId) || regionId <= 0) {
      return NextResponse.json(
        { error: "Invalid region ID" }, 
        { status: 400, headers: cacheControl }
      );
    }

    // Get station results from our cached function
    const stationResults = await getStationResultsByRegion(regionId);
    
    // Return the results with caching headers
    return NextResponse.json(stationResults, { 
      status: 200,
      headers: cacheControl
    });
  } catch (error) {
    console.error("Error fetching station results:", error);
    return NextResponse.json(
      { error: "Failed to fetch station results" }, 
      { status: 500 }
    );
  }
}
