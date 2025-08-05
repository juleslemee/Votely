import { NextResponse } from 'next/server';
import { batchUpdateAllGridPercentages } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Vercel Cron jobs send a special header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting scheduled stats update...');
    const result = await batchUpdateAllGridPercentages();
    
    console.log('Scheduled stats update completed:', result);
    return NextResponse.json({ 
      success: true, 
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron stats update error:', error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}