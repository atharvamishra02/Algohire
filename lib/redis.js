import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(url, { enableOfflineQueue: true });

redis.on('connect', () => console.log('Redis connecting', url));
redis.on('ready', () => console.log('Redis ready'));
redis.on('error', (err) => console.error('Redis error', err && err.message));
redis.on('close', () => console.log('Redis closed'));

export default redis;
