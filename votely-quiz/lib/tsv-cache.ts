/**
 * Simple in-memory cache for TSV files to prevent repeated fetches
 * These files are static and don't change, so we can cache them indefinitely
 * during a user session
 */

import { debugLog } from './debug-logger';

const cache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string>>();

export async function fetchTSVWithCache(url: string): Promise<string> {
  // Check if we have it in cache first
  if (cache.has(url)) {
    debugLog(`📦 Cache hit for ${url}`);
    return cache.get(url)!;
  }

  // Server-side: Try reading from file system first
  if (typeof window === 'undefined' && url.startsWith('/')) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', url.slice(1));
      const content = fs.readFileSync(filePath, 'utf-8');
      cache.set(url, content);
      debugLog(`📁 Server-side file read: ${url}`);
      return content;
    } catch (error) {
      debugLog(`⚠️ Server-side file read failed for ${url}, falling back to fetch`);
    }
  }

  // Fallback to fetch approach
  let normalizedUrl = url;
  if (url.startsWith('/') && typeof window !== 'undefined') {
    // Client-side: use window.location.origin
    normalizedUrl = `${window.location.origin}${url}`;
    debugLog(`Client-side normalized URL: ${normalizedUrl}`);
  } else if (url.startsWith('/') && typeof window === 'undefined') {
    // Server-side: construct full URL for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';
    normalizedUrl = `${baseUrl}${url}`;
    debugLog(`Server-side normalized URL: ${normalizedUrl}`);
  }

  // Check if there's already a fetch in progress for this URL
  if (pendingFetches.has(normalizedUrl)) {
    debugLog(`⏳ Waiting for pending fetch of ${url}`);
    return pendingFetches.get(normalizedUrl)!;
  }

  // Create a new fetch promise
  debugLog(`🌐 Fetching ${url} (not in cache)`);
  
  // Safari iOS has issues with certain fetch configurations
  // But we still want browser caching to work to prevent excessive requests
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const fetchOptions: RequestInit = isIOS 
    ? {
        // Use browser cache for iOS to prevent excessive requests
        cache: 'default'
      }
    : {
        // For other browsers, use immutable cache since TSV files don't change
        cache: 'force-cache', // Changed from 'no-cache' to use browser cache
        mode: 'cors',
        credentials: 'same-origin'
      };
  
  const fetchPromise = fetch(normalizedUrl, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${url}`);
      }
      return response.text();
    })
    .then(text => {
      // Store in cache
      cache.set(url, text);
      // Remove from pending
      pendingFetches.delete(normalizedUrl);
      debugLog(`✅ Cached ${url} (${(text.length / 1024).toFixed(1)}KB)`);
      return text;
    })
    .catch(error => {
      // Remove from pending on error
      pendingFetches.delete(normalizedUrl);
      throw error;
    });

  // Store the pending promise
  pendingFetches.set(normalizedUrl, fetchPromise);
  
  return fetchPromise;
}

// Optional: Clear cache (useful for development)
export function clearTSVCache() {
  cache.clear();
  pendingFetches.clear();
  debugLog('🧹 TSV cache cleared');
}

// Clear cache on module load in development
if (process.env.NODE_ENV === 'development') {
  clearTSVCache();
}

// Optional: Get cache stats
export function getTSVCacheStats() {
  return {
    cachedFiles: Array.from(cache.keys()),
    cacheSize: Array.from(cache.values()).reduce((sum, content) => sum + content.length, 0),
    pendingFetches: Array.from(pendingFetches.keys())
  };
}