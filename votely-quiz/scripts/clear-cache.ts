// Clear the cached stats to force a refresh
// Usage: npx tsx scripts/clear-cache.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { debugLog, debugError } from '../lib/debug-logger';

async function clearCache() {
  try {
    // Sign in
    debugLog('Signing in...');
    await signInAnonymously(auth);
    
    // Delete the cached daily stats
    debugLog('Clearing cached daily stats...');
    const dailyStatsRef = doc(db, 'cachedStats', 'daily');
    await deleteDoc(dailyStatsRef);
    debugLog('✅ Cached stats cleared!');
    
    debugLog('\nNow refresh your app - it will recalculate with the correct count of 1169.');
    
  } catch (error) {
    debugError('Error:', error);
  }
  
  process.exit(0);
}

clearCache();