import IORedis from 'ioredis';

const redis = new IORedis();

redis.on('connect', () => {
  console.log('✅ Redis client connected successfully!');
});

redis.on('error', (err:any) => {
  console.error('❌ Redis client connection error:', err);
});

export default redis;