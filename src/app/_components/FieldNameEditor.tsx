"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface FieldNameEditorProps {
  title: string;
  items: any[];
  tableName: "regions" | "candidates" | "stations" | "votes";
  excludeColumns?: string[];
  editableColumns?: string[];
}

export default function FieldNameEditor({
  title,
  items,
  tableName,
  excludeColumns = [],
  editableColumns = [],
}: FieldNameEditorProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Get the updateFieldName mutation
  const updateFieldName = api.admin.updateFieldName.useMutation({
    onSuccess: () => {
      // Refresh the data after successful update
      window.location.reload();
    },
  });

  if (!items || items.length === 0) {
    return <div>No data available for {title}</div>;
  }

  // Get column names from the first item
  const firstItem = items[0];
  const columns = Object.keys(firstItem).filter(
    (col) => !excludeColumns.includes(col)
  );

  const handleEdit = (item: any, columnName: string) => {
    if (!editableColumns.includes(columnName)) return;
    
    setEditingItem(item.id);
    setEditValue(item[columnName]);
  };

  const handleSave = (item: any, columnName: string) => {
    updateFieldName.mutate({
      tableName,
      id: item.id,
      fieldName: columnName,
      newValue: editValue,
    });
    setEditingItem(null);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValue("");
  };

  // Helper function to render different types of values
  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return "-";
    }
    
    if (typeof value === "object") {
      // If it's a Date object
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      
      // If it's a relation or complex object, display a placeholder or relevant property
      if (value.name) {
        return value.name;
      }
      
      // For other objects, show a simplified representation
      return JSON.stringify(value);
    }
    
    // For simple values (strings, numbers, booleans)
    return String(value);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                  {editableColumns.includes(col) && (
                    <span className="ml-1 text-green-500">✓</span>
                  )}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${item.id}-${col}`} className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item.id && col === "name" ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className={`${editableColumns.includes(col) ? "cursor-pointer hover:text-blue-600" : ""}`}
                        onClick={() => handleEdit(item, col)}
                      >
                        {renderValue(item[col])}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingItem === item.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleSave(item, "name")}
                        className="text-green-600 hover:text-green-900"
                        disabled={updateFieldName.isPending}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item, "name")}
                      className={`text-blue-600 hover:text-blue-900 ${editableColumns.includes("name") ? "" : "opacity-50 cursor-not-allowed"}`}
                      disabled={!editableColumns.includes("name")}
                    >
                      Edit Name
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
