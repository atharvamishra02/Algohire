-- simple schema for events, subscriptions, deliveries, and idempotency
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  source text,
  created_at timestamptz DEFAULT now(),
  dedup_key text
);

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  status text NOT NULL,
  attempts int DEFAULT 0,
  last_error text,
  response_code int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- index for quick lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_events ON subscriptions USING GIN (events);
CREATE INDEX IF NOT EXISTS idx_events_dedup ON events(dedup_key);
