"use client";

import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [subs, setSubs] = useState([]);
  const [del, setDel] = useState([]);

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(r => r.ok ? r.json() : [])
      .then(setSubs)
      .catch(() => setSubs([]));
    fetch('/api/deliveries')
      .then(r => r.ok ? r.json() : [])
      .then(setDel)
      .catch(() => setDel([]));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Webhook Dashboard (Skeleton)</h1>
      <section>
        <h2>Subscriptions</h2>
        <ul>
          {subs.map(s => (
            <li key={s.id}>{s.name} — {s.target_url} — events: {s.events?.join(',')}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Deliveries</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Event</th><th>Target</th><th>Status</th><th>Attempts</th></tr></thead>
          <tbody>
            {del.map(d => (
              <tr key={d.id}>
                <td>{d.event_type}</td>
                <td>{d.target_url}</td>
                <td>{d.status}</td>
                <td>{d.attempts}</td>
                <td>
                  {d.status === 'failed' && (
                    <button onClick={async () => {
                      await fetch('/api/deliveries/retry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliveryId: d.id }) });
                      // refresh deliveries
                      const r = await fetch('/api/deliveries');
                      if (r.ok) setDel(await r.json());
                    }}>Retry</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}