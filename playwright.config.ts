import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: {
    baseURL: process.env.APP_URL ?? "http://localhost:3000",
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: process.env.APP_URL?.startsWith("https:")
      ? "node scripts/e2e-server.mjs"
      : "npm run dev -- --hostname 127.0.0.1",
    url: (process.env.APP_URL ?? "http://localhost:3000") + "/api/health",
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
