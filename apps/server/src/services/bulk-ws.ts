import WebSocket from "ws";
import type { ServerWebSocket } from "bun";
import type { PriceTick } from "@tap-to-trade/shared";
import { SYMBOL } from "@tap-to-trade/shared";

const BULK_WS_URL = "wss://exchange-wss1.northstarlabs.xyz";
const PING_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 30_000;

const clients = new Set<ServerWebSocket<unknown>>();

let bulkWs: WebSocket | null = null;
let reconnectAttempt = 0;
let pingTimer: ReturnType<typeof setInterval> | null = null;

function getBackoffMs(): number {
  const ms = Math.min(1000 * 2 ** reconnectAttempt, MAX_BACKOFF_MS);
  return ms;
}

function broadcast(data: string) {
  for (const client of clients) {
    try {
      client.send(data);
    } catch {
      clients.delete(client);
    }
  }
}

function connect() {
  if (bulkWs) {
    try {
      bulkWs.close();
    } catch {
      // ignore
    }
  }

  bulkWs = new WebSocket(BULK_WS_URL);

  bulkWs.on("open", () => {
    console.log("[bulk-ws] connected to", BULK_WS_URL);
    reconnectAttempt = 0;

    bulkWs!.send(
      JSON.stringify({
        type: "subscribe",
        channel: "ticker",
        symbol: SYMBOL,
      })
    );

    // Start keepalive ping
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (bulkWs && bulkWs.readyState === WebSocket.OPEN) {
        bulkWs.ping();
      }
    }, PING_INTERVAL_MS);
  });

  bulkWs.on("message", (raw: WebSocket.Data) => {
    try {
      const data = JSON.parse(raw.toString());

      // Forward ticker messages to browser clients
      if (data.type === "ticker" || data.channel === "ticker") {
        const tick: PriceTick = {
          type: "ticker",
          symbol: data.symbol ?? SYMBOL,
          price: Number(data.price ?? data.last ?? data.markPrice ?? 0),
          timestamp: data.timestamp ?? Date.now(),
        };
        broadcast(JSON.stringify(tick));
      }
    } catch {
      // ignore unparseable messages
    }
  });

  bulkWs.on("pong", () => {
    // keepalive acknowledged
  });

  bulkWs.on("close", () => {
    console.log("[bulk-ws] disconnected");
    scheduleReconnect();
  });

  bulkWs.on("error", (err: Error) => {
    console.error("[bulk-ws] error:", err.message);
    // close handler will trigger reconnect
  });
}

function scheduleReconnect() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }

  const backoff = getBackoffMs();
  reconnectAttempt++;
  console.log(`[bulk-ws] reconnecting in ${backoff}ms (attempt ${reconnectAttempt})`);
  setTimeout(connect, backoff);
}

export function addClient(ws: ServerWebSocket<unknown>) {
  clients.add(ws);
}

export function removeClient(ws: ServerWebSocket<unknown>) {
  clients.delete(ws);
}

export function startBulkWs() {
  connect();
}
