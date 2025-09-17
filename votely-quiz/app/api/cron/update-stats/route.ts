import { NextResponse } from 'next/server';
import { batchUpdateAllGridPercentages } from '@/lib/quiz';
import { debugLog, debugError } from '@/lib/debug-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Vercel Cron jobs send a special header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    debugLog('Starting scheduled stats update...');
    const result = await batchUpdateAllGridPercentages();
    
    debugLog('Scheduled stats update completed:', result);
    return NextResponse.json({ 
      success: true, 
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    debugError('Cron stats update error:', error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}