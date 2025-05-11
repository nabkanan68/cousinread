// Cache utility for server-side data
// This will store the election data and refresh it every minute

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

class DataCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private refreshInterval = 60 * 1000; // 1 minute in milliseconds

  // Get data from cache or fetch it using the provided function
  async get(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // If data exists in cache and hasn't expired, return it
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    // Otherwise fetch fresh data
    try {
      const freshData = await fetchFn();
      this.cache.set(key, {
        data: freshData,
        timestamp: now,
        expiresAt: now + this.refreshInterval,
      });
      return freshData;
    } catch (error) {
      // If there's an error fetching fresh data but we have cached data, return that
      if (cached) {
        console.warn(`Failed to fetch fresh data for ${key}, using stale cache:`, error);
        return cached.data;
      }
      // Otherwise throw the error
      throw error;
    }
  }

  // Clear a specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
  }
}

// Create a singleton instance
export const dataCache = new DataCache();
