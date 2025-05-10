"use client";

import { useState } from "react";
import FieldNameEditor from "./FieldNameEditor";

// Define proper types for the data structures
type Region = {
  id: number;
  name: string;
  total_stations: number;
  total_representatives: number;
  created_at?: string | Date;
};

type Candidate = {
  id: number;
  name: string;
  region_id: number;
  number: number;
  created_at?: string | Date;
  region?: Region;
};

type Station = {
  id: number;
  name: string;
  region_id: number;
  created_at?: string | Date;
  region?: Region;
};

type Vote = {
  id: number;
  candidate_id: number;
  station_id: number;
  vote_count: number;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  candidate?: Candidate | null;
  station?: Station | null;
};

interface FieldNameEditorClientProps {
  data: {
    regions: Region[];
    candidates: Candidate[];
    stations: Station[];
    votes: Vote[];
  };
}

export default function FieldNameEditorClient({ data }: FieldNameEditorClientProps) {
  // Destructure the data
  const { regions, candidates, stations, votes } = data;

  return (
    <>
      <FieldNameEditor 
        title="Regions" 
        items={regions} 
        tableName="regions"
        excludeColumns={["created_at"]}
        editableColumns={["name"]}
      />
      
      <FieldNameEditor 
        title="Candidates" 
        items={candidates} 
        tableName="candidates"
        excludeColumns={["created_at"]}
        editableColumns={["name"]}
      />
      
      <FieldNameEditor 
        title="Stations" 
        items={stations} 
        tableName="stations"
        excludeColumns={["created_at"]}
        editableColumns={["name"]}
      />
      
      <FieldNameEditor 
        title="Votes" 
        items={votes} 
        tableName="votes"
        excludeColumns={["created_at", "updated_at"]}
        editableColumns={[]}
      />
    </>
  );
}
