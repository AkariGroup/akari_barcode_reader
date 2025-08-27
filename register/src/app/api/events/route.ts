import redis from '@/lib/redis-client';

export const dynamic = 'force-dynamic';

function iteratorToStream(iterator: AsyncIterator<string>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

// ポーリングを行う非同期ジェネレーター
async function* eventPoller(): AsyncGenerator<string> {
  console.log("🟢 Polling API started. Waiting for barcode...");
  try {
    while (true) {
      // Redisから 'latest_barcode' の値を取得
      const barcode = await redis.get('latest_barcode');

      if (barcode) {
        console.log(`🔔 Found barcode in Redis: ${barcode}`);
        // 見つけたら、そのデータをブラウザに送信
        yield `data: ${JSON.stringify({ barcode })}\n\n`;
        // 同じバーコードを再度送らないように、キーを削除する
        await redis.del('latest_barcode');
      }

      // 0.5秒待機してから再度チェック
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } finally {
    console.log("🔴 Polling API stopped.");
  }
}

export async function GET() {
  const iterator = eventPoller();
  const stream = iteratorToStream(iterator);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}