import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
import redis from '../../../lib/redis.js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const body = await req.json();
  const { name, target_url, events, secret } = body;
  if (!name || !target_url || !events || !secret) return NextResponse.json({ error: 'missing' }, { status: 400 });
  try {
    const id = uuidv4();
    await query('INSERT INTO subscriptions(id,name,target_url,events,secret) VALUES($1,$2,$3,$4,$5)', [id, name, target_url, events, secret]);
    await redis.set(`sub:${id}`, JSON.stringify({ id, name, target_url, events }));
    return NextResponse.json({ id, name, target_url, events, is_active: true });
  } catch (err) {
    console.error('subscriptions POST error', err && err.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const r = await query('SELECT id,name,target_url,events,is_active,created_at FROM subscriptions ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json(r.rows);
  } catch (err) {
    console.error('subscriptions GET error', err && err.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
