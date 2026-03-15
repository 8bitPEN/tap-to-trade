const BASE_URL = import.meta.env.VITE_SERVER_URL || "";

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

export async function verifyAuth(token: string, walletAddress: string) {
  setAuthToken(token);
  return request<{ user: unknown }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export async function submitOrder(signedTx: unknown) {
  return request<{ orderId: string }>("/api/order", {
    method: "POST",
    body: JSON.stringify(signedTx),
  });
}

export async function requestFaucet(signedTx: unknown) {
  return request<{ success: boolean }>("/api/faucet", {
    method: "POST",
    body: JSON.stringify(signedTx),
  });
}

export async function queryAccount(payload: unknown) {
  return request<{ balance: number; equity: number; positions: unknown[] }>("/api/account", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recordTrade(trade: unknown) {
  return request<{ id: string }>("/api/trades", {
    method: "POST",
    body: JSON.stringify(trade),
  });
}

export async function getLeaderboard() {
  return request<{ entries: import("@tap-to-trade/shared").LeaderboardEntry[] }>(
    "/api/leaderboard",
  );
}

export async function getUserTrades(userId: string) {
  return request<{ trades: import("@tap-to-trade/shared").Trade[] }>(`/api/trades/${userId}`);
}
