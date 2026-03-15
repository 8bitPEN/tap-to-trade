import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { upsertUser } from "../db/queries";

const auth = new Hono();

auth.post("/api/auth/verify", authMiddleware, async (c) => {
  const privyUserId = c.get("privyUserId") as string;
  const privyUser = c.get("privyUser") as any;

  // Extract wallet address from request body
  const body = await c.req.json<{ walletAddress: string }>();
  if (!body.walletAddress) {
    return c.json({ error: "walletAddress is required" }, 400);
  }

  // Extract twitter info from Privy linked accounts
  let twitterHandle: string | null = null;
  let twitterAvatar: string | null = null;

  if (privyUser?.linkedAccounts) {
    const twitter = privyUser.linkedAccounts.find(
      (a: any) => a.type === "twitter_oauth"
    );
    if (twitter) {
      twitterHandle = twitter.username ?? twitter.name ?? null;
      twitterAvatar = twitter.profilePictureUrl ?? null;
    }
  }

  const user = await upsertUser(
    privyUserId,
    body.walletAddress,
    twitterHandle,
    twitterAvatar
  );

  return c.json({ user });
});

export default auth;
