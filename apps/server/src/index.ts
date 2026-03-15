import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBunWebSocket } from "hono/bun";

import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import faucetRoutes from "./routes/faucet";
import accountRoutes from "./routes/account";
import tradeRoutes from "./routes/trades";
import leaderboardRoutes from "./routes/leaderboard";

import { addClient, removeClient, startBulkWs } from "./services/bulk-ws";

// ---- Hono + Bun WebSocket setup ----
const { upgradeWebSocket, websocket } = createBunWebSocket();

const app = new Hono();

// ---- Middleware ----
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// ---- Global error handler ----
app.onError((err, c) => {
  console.error("[server] unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// ---- Health check ----
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

// ---- Route groups ----
app.route("/", authRoutes);
app.route("/", orderRoutes);
app.route("/", faucetRoutes);
app.route("/", accountRoutes);
app.route("/", tradeRoutes);
app.route("/", leaderboardRoutes);

// ---- WebSocket endpoint ----
app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      console.log("[ws] client connected");
      addClient(ws.raw as any);
    },
    onClose(_event, ws) {
      console.log("[ws] client disconnected");
      removeClient(ws.raw as any);
    },
    onMessage(event, _ws) {
      // Clients can send messages if needed in the future
      // For now we just ignore client-to-server messages
    },
  }))
);

// ---- Start Bulk.trade upstream WS ----
startBulkWs();

// ---- Serve ----
const port = Number(process.env.PORT) || 3001;

export default {
  port,
  fetch: app.fetch,
  websocket,
};
