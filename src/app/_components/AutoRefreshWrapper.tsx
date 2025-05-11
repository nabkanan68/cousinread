"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegionResults from "./RegionResults";

export default function AutoRefreshWrapper() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(90); // 90 seconds = 1.5 minutes
  const [refreshing, setRefreshing] = useState(false);

  // Effect to handle auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        // When countdown reaches 0, trigger refresh
        if (prev <= 1) {
          handleRefresh();
          return 90; // Reset to 90 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to handle refreshing data
  const handleRefresh = () => {
    try {
      setRefreshing(true);
      // Simply refresh the current page to get fresh data from the server
      router.refresh();
      
      // Set a timeout to remove the refreshing indicator after a short delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setRefreshing(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <div className="text-xs bg-blue-700 text-white py-1 px-3 rounded-full flex items-center">
          <span className={`inline-block ${refreshing ? "animate-spin" : ""} mr-1`}>⟳</span>
          Auto-refresh in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
