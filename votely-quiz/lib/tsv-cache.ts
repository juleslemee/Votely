/**
 * Simple in-memory cache for TSV files to prevent repeated fetches
 * These files are static and don't change, so we can cache them indefinitely
 * during a user session
 */

const cache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

export async function fetchTSVWithCache(url: string): Promise<string> {
  // Check if we have it in cache
  if (cache.has(url)) {
    console.log(`📦 Cache hit for ${url}`);
    return cache.get(url)!;
  }

  // Check if there's already a fetch in progress for this URL
  if (pendingFetches.has(url)) {
    console.log(`⏳ Waiting for pending fetch of ${url}`);
    return pendingFetches.get(url)!;
  }

  // Create a new fetch promise
  console.log(`🌐 Fetching ${url} (not in cache)`);
  const fetchPromise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      // Store in cache
      cache.set(url, text);
      // Remove from pending
      pendingFetches.delete(url);
      console.log(`✅ Cached ${url} (${(text.length / 1024).toFixed(1)}KB)`);
      return text;
    })
    .catch(error => {
      // Remove from pending on error
      pendingFetches.delete(url);
      throw error;
    });

  // Store the pending promise
  pendingFetches.set(url, fetchPromise);
  
  return fetchPromise;
}

// Optional: Clear cache (useful for development)
export function clearTSVCache() {
  cache.clear();
  pendingFetches.clear();
  console.log('🧹 TSV cache cleared');
}

// Optional: Get cache stats
export function getTSVCacheStats() {
  return {
    cachedFiles: Array.from(cache.keys()),
    cacheSize: Array.from(cache.values()).reduce((sum, content) => sum + content.length, 0),
    pendingFetches: Array.from(pendingFetches.keys())
  };
}