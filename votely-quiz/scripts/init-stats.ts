// Run this script locally to initialize the aggregated stats
// Usage: npx tsx scripts/init-stats.ts

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { migrateToAggregatedStats, batchUpdateAllGridPercentages } from '../lib/quiz';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

async function initializeStats() {
  console.log('🚀 Initializing aggregated stats...\n');
  
  try {
    // First, sign in anonymously to get auth permissions
    console.log('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Signed in successfully, uid:', userCredential.user.uid);
    console.log('\n');
    // Step 1: Migrate existing data to aggregated stats
    console.log('Step 1: Migrating existing quiz responses...');
    const migrationResult = await migrateToAggregatedStats();
    console.log('✅ Migration complete:', migrationResult);
    console.log('\n');
    
    // Step 2: Calculate and cache all percentages
    console.log('Step 2: Calculating and caching all grid percentages...');
    const batchResult = await batchUpdateAllGridPercentages();
    console.log('✅ Batch update complete:', batchResult);
    console.log('\n');
    
    console.log('🎉 All stats initialized successfully!');
    console.log('Your app should now show the correct quiz count and percentages.');
    
  } catch (error) {
    console.error('❌ Error initializing stats:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the initialization
initializeStats();