import sql from "./index";
import type { Trade, User, LeaderboardEntry } from "@tap-to-trade/shared";

export async function upsertUser(
  privyId: string,
  walletAddress: string,
  twitterHandle?: string | null,
  twitterAvatar?: string | null
): Promise<User> {
  const [user] = await sql`
    INSERT INTO users (privy_id, wallet_address, twitter_handle, twitter_avatar)
    VALUES (${privyId}, ${walletAddress}, ${twitterHandle ?? null}, ${twitterAvatar ?? null})
    ON CONFLICT (privy_id) DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      twitter_handle = COALESCE(EXCLUDED.twitter_handle, users.twitter_handle),
      twitter_avatar = COALESCE(EXCLUDED.twitter_avatar, users.twitter_avatar)
    RETURNING
      id,
      privy_id AS "privyId",
      wallet_address AS "walletAddress",
      twitter_handle AS "twitterHandle",
      twitter_avatar AS "twitterAvatar",
      created_at AS "createdAt"
  `;
  return user as unknown as User;
}

export async function getUser(privyId: string): Promise<User | null> {
  const [user] = await sql`
    SELECT
      id,
      privy_id AS "privyId",
      wallet_address AS "walletAddress",
      twitter_handle AS "twitterHandle",
      twitter_avatar AS "twitterAvatar",
      created_at AS "createdAt"
    FROM users
    WHERE privy_id = ${privyId}
  `;
  return (user as unknown as User) ?? null;
}

export async function recordTrade(
  userId: string,
  trade: {
    walletAddress: string;
    direction: string;
    size: number;
    entryPrice: number;
    closePrice: number;
    pnl: number;
    closeReason: string;
    openedAt: string;
  }
): Promise<Trade> {
  const [row] = await sql`
    INSERT INTO trades (
      user_id, wallet_address, direction, size,
      entry_price, close_price, pnl, close_reason, opened_at
    ) VALUES (
      ${userId}, ${trade.walletAddress}, ${trade.direction}, ${trade.size},
      ${trade.entryPrice}, ${trade.closePrice}, ${trade.pnl},
      ${trade.closeReason}, ${trade.openedAt}
    )
    RETURNING
      id,
      user_id AS "userId",
      wallet_address AS "walletAddress",
      direction,
      size,
      entry_price AS "entryPrice",
      close_price AS "closePrice",
      pnl,
      close_reason AS "closeReason",
      opened_at AS "openedAt",
      closed_at AS "closedAt"
  `;
  return row as unknown as Trade;
}

export async function getUserTrades(
  userId: string,
  limit = 50
): Promise<Trade[]> {
  const rows = await sql`
    SELECT
      id,
      user_id AS "userId",
      wallet_address AS "walletAddress",
      direction,
      size,
      entry_price AS "entryPrice",
      close_price AS "closePrice",
      pnl,
      close_reason AS "closeReason",
      opened_at AS "openedAt",
      closed_at AS "closedAt"
    FROM trades
    WHERE user_id = ${userId}
    ORDER BY closed_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Trade[];
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const rows = await sql`
    SELECT
      u.twitter_handle AS "twitterHandle",
      u.twitter_avatar AS "twitterAvatar",
      SUM(t.pnl) AS "totalPnl",
      COUNT(*)::int AS "tradeCount",
      COUNT(*) FILTER (WHERE t.pnl > 0)::FLOAT / NULLIF(COUNT(*), 0) AS "winRate"
    FROM trades t
    JOIN users u ON t.user_id = u.id
    GROUP BY u.id, u.twitter_handle, u.twitter_avatar
    ORDER BY "totalPnl" DESC
    LIMIT ${limit}
  `;

  return rows.map((row, idx) => ({
    rank: idx + 1,
    twitterHandle: row.twitterHandle as string | null,
    twitterAvatar: row.twitterAvatar as string | null,
    totalPnl: Number(row.totalPnl),
    tradeCount: Number(row.tradeCount),
    winRate: Number(row.winRate ?? 0),
  }));
}
