import Layout from "~/app/_components/Layout";
import { getAllRegions } from "~/server/data-cache";
import RegionResults from "~/app/_components/RegionResults";
import AutoRefreshScript from "~/app/_components/AutoRefreshScript";

// Set revalidation time to ensure server-side data is refreshed every minute
export const revalidate = 60;

export default async function AutoRefreshPage() {
  // Use the same cached data function as the main page
  const regions = await getAllRegions();

  return (
    <Layout>
      {/* Add the auto-refresh script component */}
      <AutoRefreshScript />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Election Results (non-official) ผลการเลือกตั้งไม่เป็นทางการ
        </h1>
        <p className="text-gray-600">
          View the latest Election Results (non-official) ผลการเลือกตั้งไม่เป็นทางการ by region. 
          Top 6 candidates by votes in each region will be elected as representatives.
        </p>
        <div className="mt-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm text-green-600 font-medium">
            Auto-refreshes every 90 seconds (1.5 minutes)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {regions.map((region: { id: number; name: string }) => (
          <div key={region.id} className="relative">
            <RegionResults regionId={region.id} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
