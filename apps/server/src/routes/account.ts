import { Hono } from "hono";
import { queryAccount } from "../services/bulk-api";

const account = new Hono();

account.post("/api/account", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid or missing JSON body" }, 400);
  }
  const result = await queryAccount(body);
  if (!result.ok) {
    return c.json({ error: result.message }, 502);
  }
  return c.json(result.data);
});

export default account;
