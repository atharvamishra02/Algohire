import { Queue } from 'bullmq';
import redis from './redis.js';

export const deliveryQueue = new Queue('deliveries', { connection: redis });
