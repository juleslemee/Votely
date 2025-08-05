// Clear the cached stats to force a refresh
// Usage: npx tsx scripts/clear-cache.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

async function clearCache() {
  try {
    // Sign in
    console.log('Signing in...');
    await signInAnonymously(auth);
    
    // Delete the cached daily stats
    console.log('Clearing cached daily stats...');
    const dailyStatsRef = doc(db, 'cachedStats', 'daily');
    await deleteDoc(dailyStatsRef);
    console.log('✅ Cached stats cleared!');
    
    console.log('\nNow refresh your app - it will recalculate with the correct count of 1169.');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

clearCache();