import { Hono } from "hono";
import { proxyFaucet } from "../services/bulk-api";

const faucet = new Hono();

faucet.post("/api/faucet", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid or missing JSON body" }, 400);
  }
  const result = await proxyFaucet(body);
  if (!result.ok) {
    return c.json({ error: result.message }, 502);
  }
  return c.json(result.data);
});

export default faucet;
