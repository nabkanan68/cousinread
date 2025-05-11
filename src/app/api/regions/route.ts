import { NextResponse } from "next/server";
import { getAllRegions } from "~/server/data-cache";

// Set cache control headers to cache the response for 60 seconds (1 minute)
const cacheControl = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
}; 

export async function GET() {
  try {
    // Get all regions using our cached function
    const regions = await getAllRegions();
    
    // Return the results with caching headers
    return NextResponse.json(regions, { 
      status: 200,
      headers: cacheControl
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" }, 
      { status: 500 }
    );
  }
}
