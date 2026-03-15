import { Hono } from "hono";
import { getLeaderboard } from "../db/queries";

const leaderboard = new Hono();

leaderboard.get("/api/leaderboard", async (c) => {
  const limit = Number(c.req.query("limit") || 50);
  const entries = await getLeaderboard(limit);
  return c.json({ entries });
});

export default leaderboard;
