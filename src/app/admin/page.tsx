import Layout from "~/app/_components/Layout";
import VoteEntry from "~/app/_components/VoteEntry";
import { api } from "~/trpc/server";

export default async function AdminPage() {
  const regions = await api.regions.getAll();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600">
          Enter vote counts for each candidate by region and polling station.
        </p>
        <div className="mt-4">
          <a href="/admin/fieldnames" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Edit Field Names
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {regions.map((region: { id: number; name: string }) => (
          <div key={region.id}>
            <h2 className="text-2xl font-semibold mb-4">{region.name}</h2>
            <VoteEntry regionId={region.id} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
