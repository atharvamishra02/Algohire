# AlgoHire Webhook Event Relay System

Hey there! 👋 Welcome to the AlgoHire Webhook Event Relay System. This is a robust, production-ready solution for managing webhook deliveries with automatic retries, monitoring, and real-time tracking.

## What Does This Do?

Think of this as a reliable middleman for webhooks. When something important happens in your system (like a new user signs up or an order is placed), this service makes sure all your other services get notified - even if they're temporarily down. No more lost notifications!

## Architecture Overview

### The Big Picture

We've built this system with three main components that work together:

**1. Next.js Application (Frontend + Backend)**
- Serves the beautiful landing page and admin dashboard
- Provides REST API endpoints for managing subscriptions and events
- Handles incoming events and matches them with subscribers
- Built with Next.js 15 App Router for modern, fast performance

**2. Background Worker**
- Runs independently as a separate Node.js process
- Picks up delivery jobs from the queue and sends webhooks
- Implements smart retry logic with exponential backoff
- Signs each webhook with HMAC for security

**3. Data Layer**
- **PostgreSQL**: Stores subscriptions, events, and delivery history
- **Redis**: Powers the job queue and caches subscription data for speed

### How Data Flows

```
1. Someone sends an event → POST /api/events
2. System checks which subscriptions match this event type
3. Creates delivery records in database
4. Adds jobs to Redis queue (via BullMQ)
5. Worker picks up jobs and sends webhooks to target URLs
6. Records success/failure and retries if needed
7. Dashboard shows everything in real-time
```

### Why This Design?

- **Reliability**: If a webhook fails, we retry automatically (up to 5 times)
- **Speed**: Events are queued immediately and processed in the background
- **Scalability**: Can run multiple workers to handle high traffic
- **Observability**: Every delivery attempt is logged and visible in the dashboard
- **Security**: HMAC signatures prove webhooks are authentic

## Libraries & Tech Stack

Here's what we're using and why:

### Core Framework
- **Next.js 15.5.6** - Modern React framework with built-in API routes, server components, and excellent developer experience

### Database & Caching
- **PostgreSQL 18** - Rock-solid relational database for storing events, subscriptions, and deliveries
- **pg (node-postgres)** - Official PostgreSQL client for Node.js
- **Redis 7** - Lightning-fast in-memory data store for job queuing and caching
- **ioredis** - Feature-rich Redis client with excellent TypeScript support

### Background Jobs
- **BullMQ** - Modern, Redis-based job queue with retry logic, rate limiting, and priority support
  - We chose BullMQ over alternatives because it's actively maintained and has great documentation

### HTTP & Utilities
- **axios** - Reliable HTTP client for sending webhooks with timeout and error handling
- **uuid** - Generates unique IDs for events, subscriptions, and deliveries
- **crypto (built-in)** - Used for HMAC-SHA256 signature generation

### Styling
- **Tailwind CSS** - Utility-first CSS framework for beautiful, responsive UI
- **PostCSS** - CSS processing for Tailwind

### Development Tools
- **ESLint** - Code linting to catch bugs early
- **PowerShell scripts** - Database initialization helpers

## Getting Started

### Prerequisites

Since Docker isn't available on your system, we're running everything natively:

- Node.js (v18 or higher)
- PostgreSQL 18 (installed and running on port 5432)
- Redis 7 (installed and running on port 6379)

### Installation Steps

1. **Clone and Install Dependencies**
```powershell
cd C:\Users\mishr\Desktop\Algohire\my-app
npm install
```

2. **Set Up Environment Variables**

Create a `.env` file with your configuration:
```env
DATABASE_URL=postgres://postgres:root@127.0.0.1:5432/postgres
REDIS_URL=redis://127.0.0.1:6379
BACKEND_URL=http://localhost:3001
HMAC_SECRET=dev-secret-key-change-in-production
```

3. **Initialize the Database**

Run the SQL schema to create tables:
```powershell
$env:PGPASSWORD = "root"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d postgres -f db\init.sql
```

4. **Start the Services**

Open two terminal windows:

**Terminal 1 - Next.js App:**
```powershell
npm run dev
```

**Terminal 2 - Background Worker:**
```powershell
node worker.js
```

5. **Visit the Application**

- Homepage: http://localhost:3001
- Dashboard: http://localhost:3001/dashboard
- Health Check: http://localhost:3001/api/health

### Testing with Dummy Data

We've included a test script to verify everything works:

```powershell
node test-app.js
```

This will:
- Create a test subscription
- Send a test event
- Show delivery status
- Display everything on the dashboard

## API Endpoints

### Create a Subscription
```http
POST /api/subscriptions
Content-Type: application/json

{
  "name": "My Service",
  "target_url": "https://myapp.com/webhooks",
  "events": ["user.created", "order.completed"],
  "secret": "your-secret-key"
}
```

### Send an Event
```http
POST /api/events
Content-Type: application/json

{
  "event_type": "user.created",
  "payload": {
    "userId": 123,
    "email": "user@example.com"
  }
}
```

### Get Deliveries
```http
GET /api/deliveries
```

### Retry a Failed Delivery
```http
POST /api/deliveries/retry
Content-Type: application/json

{
  "deliveryId": "uuid-here"
}
```

## Project Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── subscriptions/        # Manage webhook subscriptions
│   │   ├── events/               # Receive and process events
│   │   ├── deliveries/           # View and retry deliveries
│   │   └── health/               # Health check endpoint
│   ├── dashboard/                # Admin dashboard page
│   ├── layout.jsx                # Root layout with metadata
│   ├── page.jsx                  # Beautiful landing page
│   └── globals.css               # Global styles
├── lib/                          # Shared utilities
│   ├── db.js                     # PostgreSQL connection pool
│   ├── redis.js                  # Centralized Redis client
│   ├── queue.js                  # BullMQ delivery queue
│   └── utils.js                  # HMAC signing utility
├── db/
│   └── init.sql                  # Database schema
├── worker.js                     # Background job processor
├── test-app.js                   # End-to-end test script
├── .env                          # Environment configuration
└── package.json                  # Dependencies and scripts
```

## Security Features

### HMAC Signatures
Every webhook we send includes an `x-signature` header with an HMAC-SHA256 hash. Recipients can verify the webhook is authentic:

```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### Best Practices Implemented
- Secrets stored in environment variables
- Database queries use parameterized statements (prevents SQL injection)
- Input validation on all API endpoints
- Error handling with graceful degradation

## Monitoring & Observability

### Dashboard Features
- **Real-time Subscription List**: See all registered webhooks
- **Delivery History**: Track every webhook sent with timestamps
- **Status Indicators**: Visual feedback for queued/delivered/failed
- **Manual Retry**: One-click retry for failed deliveries
- **Attempt Counter**: Shows how many times we've tried each delivery

### Health Checks
Visit `/api/health` to check system status:
```json
{
  "db": true,
  "redis": true
}
```

## Future Enhancements

Here's what we'd love to add next:

### Phase 1 - Core Improvements
- [ ] **Webhook Authentication Options**: Support for API keys, OAuth tokens, and custom headers
- [ ] **Event Filtering**: Let subscribers filter events by payload content (e.g., only send orders > $100)
- [ ] **Delivery History Details**: Show full request/response bodies for debugging
- [ ] **Batch Operations**: Send multiple events in a single request

### Phase 2 - Advanced Features
- [ ] **Rate Limiting**: Prevent overwhelming subscriber endpoints
- [ ] **Custom Retry Strategies**: Let subscribers configure retry behavior per subscription
- [ ] **Webhook Templates**: Transform event payload before delivery
- [ ] **Real-time Dashboard Updates**: Use WebSockets for live delivery tracking
- [ ] **Delivery Analytics**: Graphs showing success rates, latency, popular events

### Phase 3 - Enterprise Ready
- [ ] **Multi-tenancy**: Support multiple organizations with isolated data
- [ ] **Role-based Access Control**: Admin, developer, viewer roles
- [ ] **Audit Logs**: Track who created/modified subscriptions
- [ ] **SLA Monitoring**: Alert when delivery success rate drops
- [ ] **Horizontal Scaling**: Run multiple workers with distributed locking

### Developer Experience
- [ ] **SDK Libraries**: JavaScript, Python, Go clients for easy integration
- [ ] **CLI Tool**: Command-line interface for managing subscriptions
- [ ] **Webhook Testing Tool**: Built-in request inspector like webhook.site
- [ ] **OpenAPI/Swagger Docs**: Interactive API documentation
- [ ] **Event Replay**: Resend old events to new subscribers

### Performance Optimizations
- [ ] **Connection Pooling**: Reuse HTTP connections for better throughput
- [ ] **Delivery Batching**: Group multiple deliveries to same endpoint
- [ ] **Smart Backoff**: Adjust retry delays based on error type
- [ ] **Redis Clustering**: Scale queue across multiple Redis instances
- [ ] **Database Partitioning**: Archive old deliveries for better query performance

### Reliability Enhancements
- [ ] **Circuit Breaker**: Stop trying endpoints that are consistently down
- [ ] **Dead Letter Queue**: Special handling for permanently failed deliveries
- [ ] **Graceful Shutdown**: Finish in-flight deliveries before stopping worker
- [ ] **Health Check Pings**: Verify subscriber endpoints are alive before sending
- [ ] **Idempotency Keys**: Prevent duplicate deliveries more robustly

## Troubleshooting

### Redis Connection Failed
Make sure Redis is running:
```powershell
redis-cli ping
# Should return: PONG
```

### Database Errors
Check PostgreSQL is accepting connections:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "SELECT 1"
```

### Worker Not Processing Jobs
- Ensure `worker.js` is running in a separate terminal
- Check Redis connection in worker logs
- Verify BullMQ queue name matches between API and worker

### Port Already in Use
Next.js will automatically use port 3001 if 3000 is taken. Check the terminal output for the actual port.

## Contributing

This project is part of AlgoHire's technical assessment. Feel free to explore, experiment, and extend it!

## License

MIT License - Built with ❤️ for AlgoHire

---

**Questions?** Check the dashboard at http://localhost:3001/dashboard to see your webhook deliveries in action!
