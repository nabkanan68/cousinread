import { Suspense } from "react";
import Layout from "~/app/_components/Layout";
import { api } from "~/trpc/server";
import FieldNameEditorClient from "~/app/_components/FieldNameEditorClient";

export default async function FieldNamesAdminPage() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Field Names Admin</h1>
        <p className="text-gray-600">
          Edit the display names of fields in the database. Only the name field can be edited.
        </p>
      </div>

      <Suspense fallback={<div>Loading field names...</div>}>
        <FieldNameEditorWrapper />
      </Suspense>
    </Layout>
  );
}

async function FieldNameEditorWrapper() {
  // Fetch all tables data
  const regions = await api.regions.getAll();
  const candidates = await api.candidates.getAll();
  const stations = await api.stations.getAll();
  const votes = await api.votes.getAll();

  // Prepare data for client component by serializing it
  const serializedData = {
    regions: JSON.parse(JSON.stringify(regions)),
    candidates: JSON.parse(JSON.stringify(candidates)),
    stations: JSON.parse(JSON.stringify(stations)),
    votes: JSON.parse(JSON.stringify(votes))
  };

  return (
    <div className="space-y-8">
      <FieldNameEditorClient data={serializedData} />
    </div>
  );
}
