// Run this script locally to initialize the aggregated stats
// Usage: npx tsx scripts/init-stats.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { migrateToAggregatedStats, batchUpdateAllGridPercentages } from '../lib/quiz';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { debugLog, debugError } from '../lib/debug-logger';

async function initializeStats() {
  debugLog('🚀 Initializing aggregated stats...\n');
  
  try {
    // First, sign in anonymously to get auth permissions
    debugLog('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    debugLog('✅ Signed in successfully, uid:', userCredential.user.uid);
    debugLog('\n');
    // Step 1: Migrate existing data to aggregated stats
    debugLog('Step 1: Migrating existing quiz responses...');
    const migrationResult = await migrateToAggregatedStats();
    debugLog('✅ Migration complete:', migrationResult);
    debugLog('\n');
    
    // Step 2: Calculate and cache all percentages
    debugLog('Step 2: Calculating and caching all grid percentages...');
    const batchResult = await batchUpdateAllGridPercentages();
    debugLog('✅ Batch update complete:', batchResult);
    debugLog('\n');
    
    debugLog('🎉 All stats initialized successfully!');
    debugLog('Your app should now show the correct quiz count and percentages.');
    
  } catch (error) {
    debugError('❌ Error initializing stats:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the initialization
initializeStats();