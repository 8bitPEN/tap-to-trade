import { useGameStore } from "../store/gameStore";
import type { WSMessage } from "@tap-to-trade/shared";

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30_000;

function getWsUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;

  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

function handleMessage(event: MessageEvent) {
  try {
    const msg: WSMessage = JSON.parse(event.data);

    switch (msg.type) {
      case "ticker":
        useGameStore.getState().onPriceTick(msg.price, msg.timestamp);
        break;
      case "order_update":
        // Handled by game loop / position tracking
        break;
      case "trade_close":
        // Handled by game loop
        break;
    }
  } catch (err) {
    console.error("[ws] failed to parse message:", err);
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) return;

  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
  reconnectAttempts++;
  console.log(`[ws] reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectWs();
  }, delay);
}

export function connectWs() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const url = getWsUrl();
  console.log("[ws] connecting to", url);

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[ws] connected");
    reconnectAttempts = 0;
    useGameStore.getState().setConnected(true);
  };

  ws.onmessage = handleMessage;

  ws.onclose = () => {
    console.log("[ws] disconnected");
    useGameStore.getState().setConnected(false);
    ws = null;
    scheduleReconnect();
  };

  ws.onerror = (err) => {
    console.error("[ws] error:", err);
    ws?.close();
  };
}

export function disconnectWs() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  reconnectAttempts = 0;

  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }

  useGameStore.getState().setConnected(false);
}
