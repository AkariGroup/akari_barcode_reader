import { NextResponse } from 'next/server';
import redis from '@/lib/redis-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('id');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode not provided' }, { status: 400 });
  }

  try {
    // 'publish'の代わりに'set'を使い、10秒で消えるように設定(EX 10)
    await redis.set('latest_barcode', barcode, 'EX', 10);
    console.log(`✅ Barcode set to Redis! value: ${barcode}`);
  } catch (err) {
    console.error('❌ Failed to set to Redis:', err);
    return NextResponse.json(
      { error: 'Failed to set message to Redis' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, received: barcode });
}