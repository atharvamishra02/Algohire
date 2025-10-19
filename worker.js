import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { query } from './lib/db.js';
import axios from 'axios';
import { signPayload } from './lib/utils.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

async function processDelivery(job) {
  const { deliveryId, eventId, subscriptionId } = job.data;
  const ev = await query('SELECT * FROM events WHERE id=$1', [eventId]);
  const sub = await query('SELECT * FROM subscriptions WHERE id=$1', [subscriptionId]);
  if (ev.rowCount === 0 || sub.rowCount === 0) throw new Error('missing');
  const event = ev.rows[0];
  const subscription = sub.rows[0];
  const signature = signPayload(subscription.secret, event.payload);
  try {
    const resp = await axios.post(subscription.target_url, event.payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Algohire-Signature': signature,
        'X-Algohire-Event': event.event_type,
        'X-Algohire-Event-Id': event.id,
      },
      timeout: 10000,
    });
    await query('UPDATE deliveries SET status=$1, attempts=$2, response_code=$3, updated_at=now() WHERE id=$4', [
      'delivered', job.attemptsMade, resp.status, deliveryId,
    ]);
  } catch (err) {
    const msg = err?.message || String(err);
    await query('UPDATE deliveries SET status=$1, attempts=$2, last_error=$3, updated_at=now() WHERE id=$4', [
      'failed', job.attemptsMade, msg, deliveryId,
    ]);
    throw err;
  }
}

const worker = new Worker('deliveries', async job => processDelivery(job), { connection });

worker.on('failed', (job, err) => {
  console.error('Job failed', job.id, err?.message);
});

console.log('Worker started');
