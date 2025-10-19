import { Queue } from 'bullmq';
import redis from './redis.js';

// Reuse the centralized ioredis instance from lib/redis.js so all parts of
// the app share the same connection and error handlers.
export const deliveryQueue = new Queue('deliveries', { connection: redis });
