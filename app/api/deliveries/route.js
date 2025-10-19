import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';

export async function GET() {
  try {
    const r = await query('SELECT d.*, s.target_url, e.event_type FROM deliveries d JOIN subscriptions s ON s.id = d.subscription_id JOIN events e ON e.id = d.event_id ORDER BY d.created_at DESC LIMIT 100');
    return NextResponse.json(r.rows);
  } catch (err) {
    console.error('deliveries GET error', err && err.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
