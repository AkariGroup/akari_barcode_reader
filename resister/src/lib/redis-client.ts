// lib/redis-client.ts
import IORedis from 'ioredis';

const redis = new IORedis();

// ▼▼▼ 以下のデバッグ用コードを追加 ▼▼▼
redis.on('connect', () => {
  console.log('✅ Redis client connected successfully!');
});

redis.on('error', (err:any) => {
  console.error('❌ Redis client connection error:', err);
});
// ▲▲▲ ここまで追加 ▲▲▲

export default redis;