CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  twitter_handle TEXT,
  twitter_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_faucet_at TIMESTAMPTZ
);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  size NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  close_price NUMERIC NOT NULL,
  pnl NUMERIC NOT NULL,
  close_reason TEXT NOT NULL CHECK (close_reason IN ('tp_hit', 'expired', 'manual')),
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_pnl ON trades(pnl DESC);
