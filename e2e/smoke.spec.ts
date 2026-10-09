import { test, expect } from "@playwright/test";
test("health and login page respond", async ({ request }) => {
  expect((await request.get("/api/health")).status()).toBe(200);
  expect(await (await request.get("/login")).text()).toContain(
    "Acesso Capricho Imports",
  );
});
test("anonymous APIs are protected", async ({ request }) => {
  for (const path of ["/api/auth/me", "/api/records/products"])
    expect((await request.get(path)).status()).toBe(401);
});
test("cross-origin login rejected", async ({ request }) => {
  expect(
    (
      await request.post("/api/auth/login", {
        headers: { Origin: "https://unauthorized.example" },
        data: { email: "test@example.com", password: "invalid" },
      })
    ).status(),
  ).toBe(403);
});
test("malformed and oversized JSON rejected", async ({ request }) => {
  const headers = {
    Origin: process.env.APP_URL ?? "http://localhost:3000",
    "Content-Type": "application/json",
  };
  expect(
    (
      await request.post("/api/auth/login", { headers, data: "{invalid" })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/auth/login", {
        headers,
        data: "x".repeat(33000),
      })
    ).status(),
  ).toBe(413);
});
