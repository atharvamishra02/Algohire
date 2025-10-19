 AlgoHire Webhook Relay (Simple Overview)

 How does it work?

- You register webhook endpoints (subscriptions) for events you care about (like user.created).
- When an event happens, you POST it to the API.
- The app finds all matching subscriptions and queues a delivery job for each.
- A background worker picks up jobs and sends webhooks to the right URLs.
- If a delivery fails, it retries up to 5 times.
- You can see all activity and retry failures from the dashboard.

 What libraries & tech are used?

- Next.js (React) — for the frontend, API routes, and dashboard
- Node.js — runs the worker and backend logic
- PostgreSQL — stores events, subscriptions, and delivery logs
- Redis — powers the job queue
- BullMQ — manages background jobs and retries
- axios — sends HTTP requests to webhook URLs
- uuid — generates unique IDs
- Tailwind CSS — for styling
- HMAC (crypto) — signs webhooks for security

 How to use it?

1. Install dependencies: `npm install`
2. Set up your `.env` and database (see `.env.example` and `db/init.sql`)
3. Start the app: `npm run dev`
4. Start the worker: `node worker.js`
5. Open [http://localhost:3001/dashboard](http://localhost:3001/dashboard) to see everything in action!

---

That’s it! This app makes sure your webhooks get delivered, retried, and tracked—so you never miss an important event.
