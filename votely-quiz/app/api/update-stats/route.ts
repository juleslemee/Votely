import { NextResponse } from 'next/server';
import { migrateToAggregatedStats, batchUpdateAllGridPercentages } from '@/lib/quiz';

export async function POST(request: Request) {
  try {
    const { action, secret } = await request.json();
    
    // Simple secret check - replace with your own secret
    if (secret !== process.env.STATS_UPDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (action === 'migrate') {
      // One-time migration
      const result = await migrateToAggregatedStats();
      return NextResponse.json({ success: true, result });
    } else if (action === 'update') {
      // Daily batch update
      const result = await batchUpdateAllGridPercentages();
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Stats update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}