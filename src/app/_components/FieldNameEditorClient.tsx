"use client";

import { useState } from "react";
import FieldNameEditor from "./FieldNameEditor";

interface FieldNameEditorClientProps {
  data: {
    regions: any[];
    candidates: any[];
    stations: any[];
    votes: any[];
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
