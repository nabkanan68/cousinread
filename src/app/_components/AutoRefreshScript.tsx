"use client";

import React, { useEffect, useState, useCallback } from "react";


export default function AutoRefreshScript() {

  const [countdown, setCountdown] = useState(90); // 90 seconds = 1.5 minutes
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle refreshing data - moved outside of effect
  const handleRefresh = useCallback(() => {
    try {
      setRefreshing(true);
      // Use window.location.reload instead of router.refresh
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
      setRefreshing(false);
    }
  }, []);
  
  // Effect to handle auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, trigger refresh
          // Schedule handleRefresh to run after the current render cycle
          setTimeout(() => {
            handleRefresh();
          }, 0);
          return 90; // Reset to 90 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleRefresh]);

  // Router is not used directly for refreshing anymore
  // We're using window.location.reload() instead

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-blue-700 text-white text-xs py-2 px-4 rounded-full flex items-center shadow-lg">
        <span className={`inline-block ${refreshing ? "animate-spin" : ""} mr-2`}>⟳</span>
        Auto-refresh in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
}
