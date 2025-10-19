import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { deliveryQueue } from '../../../../lib/queue.js';

export async function POST(req) {
  const { deliveryId } = await req.json();
  if (!deliveryId) return NextResponse.json({ error: 'missing' }, { status: 400 });
  try {
    const d = await query('SELECT * FROM deliveries WHERE id=$1', [deliveryId]);
    if (d.rowCount === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const delivery = d.rows[0];
    
    await query('UPDATE deliveries SET status=$1, attempts=$2, last_error=$3, updated_at=now() WHERE id=$4', ['queued', 0, null, deliveryId]);
    await deliveryQueue.add('deliver', { deliveryId: deliveryId, eventId: delivery.event_id, subscriptionId: delivery.subscription_id }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('retry delivery error', err && err.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
