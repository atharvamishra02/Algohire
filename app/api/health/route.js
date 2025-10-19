import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
import redis from '../../../lib/redis.js';

export async function GET() {
  try {
  
    const r = await query('SELECT 1 as ok');
    const dbOk = r && r.rows && r.rows[0] && r.rows[0].ok === 1;
    
    let redisOk = false;
    try {
      const pong = await redis.ping();
      redisOk = pong === 'PONG';
    } catch (e) {
      console.error('redis ping failed', e && e.message);
    }

    return NextResponse.json({ db: !!dbOk, redis: !!redisOk });
  } catch (err) {
    console.error('health check error', err && err.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
