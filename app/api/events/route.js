import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
import { deliveryQueue } from '../../../lib/queue.js';
import { v4 as uuidv4 } from 'uuid';



export async function POST(req) {
  const body = await req.json();
  const { event_type, payload, dedup_key } = body;
  if (!event_type || !payload) return NextResponse.json({ error: 'missing' }, { status: 400 });

  try {
    if (dedup_key) {
      const exists = await query('SELECT id FROM events WHERE dedup_key=$1 LIMIT 1', [dedup_key]);
      if (exists.rowCount > 0) return NextResponse.json({ status: 'duplicate', id: exists.rows[0].id });
    }
    const eid = uuidv4();
    await query('INSERT INTO events(id,event_type,payload,dedup_key) VALUES($1,$2,$3::jsonb,$4)', [eid, event_type, JSON.stringify(payload), dedup_key || null]);

    const subsRes = await query("SELECT id, target_url, secret FROM subscriptions WHERE is_active = true AND $1 = ANY(events)", [event_type]);
    let deliveriesQueued = 0;
    for (const sub of subsRes.rows) {
      const did = uuidv4();
      await query('INSERT INTO deliveries(id,event_id,subscription_id,status,attempts) VALUES($1,$2,$3,$4,$5)', [did, eid, sub.id, 'queued', 0]);
      try {
        await deliveryQueue.add('deliver', { deliveryId: did, eventId: eid, subscriptionId: sub.id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
        deliveriesQueued++;
      } catch (queueErr) {
        console.error('Queue add error:', queueErr);
      
      }
    }

    return NextResponse.json({ id: eid, deliveriesQueued });
  } catch (err) {
    console.error('events POST error', err);
    return NextResponse.json({ error: 'internal', message: err.message }, { status: 500 });
  }
}
