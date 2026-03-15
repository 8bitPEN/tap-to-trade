import { test, expect } from "@playwright/test";

test("debug white screen", async ({ page }) => {
  const consoleMessages: string[] = [];
  const networkFailures: string[] = [];

  // Collect console errors and warnings
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  // Collect page errors (uncaught exceptions)
  page.on("pageerror", (err) => {
    consoleMessages.push(`[pageerror] ${err.message}`);
  });

  // Collect failed network requests
  page.on("requestfailed", (req) => {
    networkFailures.push(`FAILED: ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  page.on("response", (res) => {
    if (res.status() >= 400) {
      networkFailures.push(`HTTP ${res.status()}: ${res.request().method()} ${res.url()}`);
    }
  });

  // Navigate and wait for network to settle
  await page.goto("/", { waitUntil: "networkidle" });

  // Give the app extra time to render
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: "tests/debug-screenshot.png", fullPage: true });

  // Capture page HTML
  const html = await page.content();
  const bodyText = await page.locator("body").innerText().catch(() => "(empty)");

  // Print diagnostics
  console.log("\n=== CONSOLE ERRORS/WARNINGS ===");
  if (consoleMessages.length === 0) {
    console.log("(none)");
  } else {
    consoleMessages.forEach((m) => console.log(m));
  }

  console.log("\n=== NETWORK FAILURES ===");
  if (networkFailures.length === 0) {
    console.log("(none)");
  } else {
    networkFailures.forEach((m) => console.log(m));
  }

  console.log("\n=== PAGE BODY TEXT ===");
  console.log(bodyText || "(empty)");

  console.log("\n=== ROOT DIV innerHTML (first 2000 chars) ===");
  const rootHtml = await page.locator("#root").innerHTML().catch(() => "(no #root found)");
  console.log(rootHtml.slice(0, 2000));

  // Screenshot saved
  console.log("\n=== Screenshot saved to tests/debug-screenshot.png ===");
});
