import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { recordTrade, getUserTrades } from "../db/queries";

const trades = new Hono();

trades.post("/api/trades", authMiddleware, async (c) => {
  const privyUserId = c.get("privyUserId") as string;

  // We need the internal user ID — look it up via the privy user
  const { getUser } = await import("../db/queries");
  const user = await getUser(privyUserId);
  if (!user) {
    return c.json({ error: "User not found. Call /api/auth/verify first." }, 404);
  }

  const body = await c.req.json();
  const trade = await recordTrade(user.id, {
    walletAddress: user.walletAddress,
    direction: body.direction,
    size: body.size,
    entryPrice: body.entryPrice,
    closePrice: body.closePrice,
    pnl: body.pnl,
    closeReason: body.closeReason,
    openedAt: body.openedAt,
  });

  return c.json({ id: trade.id });
});

trades.get("/api/trades/:userId", async (c) => {
  const userId = c.req.param("userId");
  const limit = Number(c.req.query("limit") || 50);
  const userTrades = await getUserTrades(userId, limit);
  return c.json({ trades: userTrades });
});

export default trades;
