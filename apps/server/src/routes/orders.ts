import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { proxyOrder } from "../services/bulk-api";

const orders = new Hono();

orders.post("/api/order", authMiddleware, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid or missing JSON body" }, 400);
  }
  const result = await proxyOrder(body);
  if (!result.ok) {
    return c.json({ error: result.message }, 502);
  }
  return c.json(result.data);
});

export default orders;
