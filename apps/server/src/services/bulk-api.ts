const BULK_API_URL =
  process.env.BULK_API_URL ||
  "https://exchange-api1.northstarlabs.xyz/api/v1";

interface BulkSuccess<T = unknown> {
  ok: true;
  data: T;
}
interface BulkError {
  ok: false;
  status: number;
  message: string;
}
export type BulkResult<T = unknown> = BulkSuccess<T> | BulkError;

async function bulkFetch<T = unknown>(
  path: string,
  payload: unknown,
): Promise<BulkResult<T>> {
  const res = await fetch(`${BULK_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(
      `[bulk-api] ${path} returned ${res.status}: ${text.slice(0, 200)}`,
    );
    return { ok: false, status: res.status, message: text.slice(0, 200) };
  }

  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    console.error(
      `[bulk-api] ${path} returned non-JSON: ${text.slice(0, 200)}`,
    );
    return {
      ok: false,
      status: res.status,
      message: "Upstream returned non-JSON response",
    };
  }
}

export async function proxyOrder(signedTx: unknown) {
  return bulkFetch("/order", signedTx);
}

export async function proxyFaucet(signedTx: unknown) {
  return bulkFetch("/faucet", signedTx);
}

export async function queryAccount(payload: unknown) {
  return bulkFetch("/account", payload);
}
