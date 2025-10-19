import 'dotenv/config';
import { query } from '../lib/db.js';
import redis from '../lib/redis.js';

async function check() {
  console.log('Checking DATABASE_URL...');
  try {
    const r = await query('SELECT 1 as ok');
    if (r && r.rows && r.rows[0] && r.rows[0].ok === 1) console.log('Postgres: OK');
    else console.log('Postgres: unexpected response', r && r.rows);
  } catch (err) {
    console.error('Postgres error:', err && err.message);
  }

  console.log('Checking REDIS_URL...');
  try {
    const pong = await redis.ping();
    if (pong === 'PONG') console.log('Redis: OK');
    else console.log('Redis: unexpected response', pong);
  } catch (err) {
    console.error('Redis error:', err && err.message);
  }

  process.exit(0);
}

check();
