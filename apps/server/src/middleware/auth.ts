import { PrivyClient } from "@privy-io/server-auth";
import { createMiddleware } from "hono/factory";

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || ""
);

type AuthEnv = {
  Variables: {
    privyUserId: string;
    privyUser: Awaited<ReturnType<PrivyClient["getUser"]>> | null;
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const verifiedClaims = await privy.verifyAuthToken(token);
    c.set("privyUserId", verifiedClaims.userId);

    // Fetch full user to get linked accounts (twitter, etc.)
    try {
      const user = await privy.getUser(verifiedClaims.userId);
      c.set("privyUser", user);
    } catch {
      c.set("privyUser", null);
    }

    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
