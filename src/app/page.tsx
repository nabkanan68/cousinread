import Layout from "~/app/_components/Layout";
import RegionResults from "~/app/_components/RegionResults";
import { getAllRegions } from "~/server/data-cache";
export const revalidate = 60; // Revalidate this page every 60 seconds (1 minute)

export default async function Home() {
  // Use our cached data function instead of direct API call
  const regions = await getAllRegions();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Election Results (non-official) ผลการเลือกตั้งไม่เป็นทางการ </h1>
        <p className="text-gray-600">
          View the latest Election Results (non-official) ผลการเลือกตั้งไม่เป็นทางการ by region. Top 6 candidates by votes in each region will be elected as representatives.
        </p>
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
