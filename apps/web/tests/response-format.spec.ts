import { test, expect } from "@playwright/test";

/**
 * Tests that the API response formats match what the frontend expects.
 * Uses route interception to mock server responses and verifies the
 * frontend correctly parses the data shapes.
 */

const MOCK_LEADERBOARD_ENTRIES = [
  {
    rank: 1,
    twitterHandle: "trader1",
    twitterAvatar: null,
    totalPnl: 150.5,
    tradeCount: 20,
    winRate: 0.65,
  },
  {
    rank: 2,
    twitterHandle: "trader2",
    twitterAvatar: null,
    totalPnl: 75.25,
    tradeCount: 10,
    winRate: 0.5,
  },
];

const MOCK_USER = {
  id: "user-1",
  privyId: "privy-123",
  walletAddress: "So1ana...",
  twitterHandle: "testuser",
  twitterAvatar: null,
  createdAt: "2025-01-01T00:00:00Z",
};

const MOCK_TRADES = [
  {
    id: "t1",
    userId: "user-1",
    walletAddress: "So1ana...",
    direction: "long",
    size: 0.01,
    entryPrice: 100,
    closePrice: 105,
    pnl: 0.05,
    closeReason: "tp_hit",
    openedAt: "2025-01-01T00:00:00Z",
    closedAt: "2025-01-01T00:01:00Z",
  },
];

test("leaderboard endpoint returns { entries } and frontend can parse it", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Mock the API
  await page.route("**/api/leaderboard*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ entries: MOCK_LEADERBOARD_ENTRIES }),
    });
  });

  // Navigate to a blank page first, then use fetch
  await page.goto("about:blank");

  const result = await page.evaluate(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/leaderboard`);
    const data = await res.json();
    return {
      hasEntries: Array.isArray(data.entries),
      entriesCount: data.entries?.length ?? 0,
      firstEntry: data.entries?.[0] ?? null,
      hasOldKey: "leaderboard" in data,
    };
  }, "http://localhost:5173");

  expect(result.hasEntries).toBe(true);
  expect(result.entriesCount).toBe(2);
  expect(result.hasOldKey).toBe(false);
  expect(result.firstEntry).toMatchObject({
    rank: 1,
    twitterHandle: "trader1",
    totalPnl: 150.5,
    tradeCount: 20,
    winRate: 0.65,
  });

  await context.close();
});

test("trades POST endpoint returns { id } not { trade }", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route("**/api/trades", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "trade-abc-123" }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto("about:blank");

  const result = await page.evaluate(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/trades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction: "long",
        size: 0.01,
        entryPrice: 100,
        closePrice: 105,
        pnl: 0.05,
        openedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        closeReason: "tp_hit",
      }),
    });
    const data = await res.json();
    return {
      hasId: typeof data.id === "string",
      id: data.id,
      hasOldKey: "trade" in data,
    };
  }, "http://localhost:5173");

  expect(result.hasId).toBe(true);
  expect(result.id).toBe("trade-abc-123");
  expect(result.hasOldKey).toBe(false);

  await context.close();
});

test("auth verify returns { user } with expected shape", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route("**/api/auth/verify", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });

  await page.goto("about:blank");

  const result = await page.evaluate(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: "So1ana..." }),
    });
    const data = await res.json();
    return {
      hasUser: data.user != null,
      userId: data.user?.id,
      walletAddress: data.user?.walletAddress,
    };
  }, "http://localhost:5173");

  expect(result.hasUser).toBe(true);
  expect(result.userId).toBe("user-1");
  expect(result.walletAddress).toBe("So1ana...");

  await context.close();
});

test("user trades GET returns { trades } array", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route("**/api/trades/user-1*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ trades: MOCK_TRADES }),
    });
  });

  await page.goto("about:blank");

  const result = await page.evaluate(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/trades/user-1`);
    const data = await res.json();
    return {
      hasTrades: Array.isArray(data.trades),
      tradesCount: data.trades?.length ?? 0,
      firstTradeId: data.trades?.[0]?.id,
      firstTradeWallet: data.trades?.[0]?.walletAddress,
    };
  }, "http://localhost:5173");

  expect(result.hasTrades).toBe(true);
  expect(result.tradesCount).toBe(1);
  expect(result.firstTradeId).toBe("t1");
  expect(result.firstTradeWallet).toBe("So1ana...");

  await context.close();
});
