import sharp from "sharp";
import { test, expect, request as createRequest } from "@playwright/test";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
const database = process.env.DATABASE_URL;
test.describe("PostgreSQL authenticated workflows", () => {
  test.skip(!database, "Dedicated PostgreSQL not available");
  const suffix = randomBytes(8).toString("hex");
  const password = randomBytes(24).toString("base64");
  const emails: Record<string, string> = {};
  let pool: Pool;
  let productId: string;
  let assetId: string;
  const records: string[] = [];
  test.beforeAll(async () => {
    pool = new Pool({ connectionString: database });
    for (const role of ["admin", "editor", "reviewer", "viewer"]) {
      emails[role] = `${role}-${suffix}@example.invalid`;
      await pool.query(
        "INSERT INTO studio_users(email,display_name,role,password_hash) VALUES($1,$2,$3,$4)",
        [emails[role], role, role, await hash(password, 12)],
      );
    }
  });
  test.afterAll(async () => {
    if (!pool) return;
    await pool.query(
      "DELETE FROM studio_reviews WHERE record_id=ANY($1::uuid[])",
      [records],
    );
    await pool.query(
      "DELETE FROM studio_audit_log WHERE actor_user_id IN (SELECT id FROM studio_users WHERE email=ANY($1))",
      [Object.values(emails)],
    );
    await pool.query(
      "DELETE FROM studio_records WHERE created_by IN (SELECT id FROM studio_users WHERE email=ANY($1))",
      [Object.values(emails)],
    );
    await pool.query("DELETE FROM studio_users WHERE email=ANY($1)", [
      Object.values(emails),
    ]);
    await pool.end();
  });
  test.afterEach(async ({ page }, info) => {
    if (info.status !== info.expectedStatus)
      console.log("Browser state:", await page.locator("body").innerText());
  });
  async function login(role: string) {
    const context = await createRequest.newContext({
      baseURL: process.env.APP_URL ?? "http://localhost:3000",
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        Origin: process.env.APP_URL ?? "http://localhost:3000",
      },
    });
    const response = await context.post("/api/auth/login", {
      data: { email: emails[role], password },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["set-cookie"]).toContain("HttpOnly");
    if (process.env.APP_URL?.startsWith("https:"))
      expect(response.headers()["set-cookie"]).toContain("Secure");
    return context;
  }
  test("product uniqueness, real-photo linkage and independent QA", async () => {
    const editor = await login("editor");
    const body = {
      title: "Synthetic test product",
      data: {
        sku: "TEST-" + suffix,
        brand: "Test",
        description: "Synthetic test fixture",
        supplierCode: "",
        applications: "",
        applicationsVerified: false,
      },
    };
    let result = await editor.post("/api/records/products", { data: body });
    expect(result.status()).toBe(201);
    productId = (await result.json()).id;
    records.push(productId);
    const initial = (await editor.get("/api/records/products")).json();
    const row = (await initial).find((r: { id: string }) => r.id === productId);
    const updated = await editor.patch("/api/records/products", {
      data: {
        ...body,
        id: productId,
        updatedAt: row.updated_at,
        title: "Updated synthetic product",
      },
    });
    expect(updated.status()).toBe(200);
    expect(
      (
        await editor.patch("/api/records/products", {
          data: { ...body, id: productId, updatedAt: row.updated_at },
        })
      ).status(),
    ).toBe(409);
    expect(
      (await editor.post("/api/records/products", { data: body })).status(),
    ).toBe(409);
    result = await editor.post("/api/records/assets", {
      data: {
        title: "Synthetic photo reference",
        data: {
          productId,
          url: "https://example.invalid/test.jpg",
          source: "Test fixture",
          rightsConfirmed: true,
          realPhoto: true,
        },
      },
    });
    expect(result.status()).toBe(201);
    assetId = (await result.json()).id;
    records.push(assetId);
    expect(
      (
        await editor.post("/api/reviews", {
          data: {
            recordId: productId,
            decision: "approved",
            checklist: {},
            notes: "Test",
          },
        })
      ).status(),
    ).toBe(403);
    const viewer = await login("viewer");
    expect((await viewer.get("/api/records/products")).status()).toBe(200);
    expect(
      (await viewer.post("/api/records/products", { data: body })).status(),
    ).toBe(403);
    const admin = await login("admin");
    const own = await admin.post("/api/records/products", {
      data: { ...body, data: { ...body.data, sku: "SELF-" + suffix } },
    });
    const ownId = (await own.json()).id;
    records.push(ownId);
    expect(
      (
        await admin.post("/api/reviews", {
          data: {
            recordId: ownId,
            decision: "approved",
            checklist: {
              fidelity: true,
              portuguese: true,
              brand: true,
              rights: true,
              dimensions: true,
            },
            notes: "Self review forbidden",
          },
        })
      ).status(),
    ).toBe(403);
    await admin.dispose();
    const samples = {
      pieces: {
        productId,
        assetId,
        channel: "Mercado Livre",
        width: 1200,
        height: 1200,
        copy: "",
      },
      descriptions: {
        productId,
        channel: "Site",
        content: "Synthetic verified content",
      },
      campaigns: {
        objective: "Synthetic test campaign",
        channel: "Site",
        startDate: "2026-10-09",
        endDate: "2026-10-10",
      },
      videos: { productId, assetId, script: "Synthetic script" },
    };
    for (const [kind, data] of Object.entries(samples)) {
      const response = await editor.post("/api/records/" + kind, {
        data: { title: "Synthetic " + kind, data },
      });
      expect(response.status()).toBe(201);
      records.push((await response.json()).id);
    }
    expect(
      (
        await editor.post("/api/records/pieces", {
          data: {
            title: "Wrong photo",
            data: { ...samples.pieces, productId: ownId },
          },
        })
      ).status(),
    ).toBe(400);
    const png = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: { r: 198, g: 32, b: 43 },
      },
    })
      .png()
      .toBuffer();
    const upload = await editor.post("/api/assets/upload", {
      multipart: {
        productId,
        source: "Synthetic pixel fixture",
        rightsConfirmed: "true",
        realPhoto: "true",
        file: { name: "fixture.png", mimeType: "image/png", buffer: png },
      },
    });
    expect(upload.status()).toBe(201);
    const uploaded = (await upload.json()).id;
    records.push(uploaded);
    expect((await viewer.get("/api/assets/" + uploaded)).status()).toBe(200);
    const anonymous = await createRequest.newContext({
      baseURL: process.env.APP_URL ?? "http://localhost:3000",
      ignoreHTTPSErrors: true,
    });
    expect((await anonymous.get("/api/assets/" + uploaded)).status()).toBe(401);
    await anonymous.dispose();
    const uploadedPiece = await editor.post("/api/records/pieces", {
      data: {
        title: "PNG export fixture",
        data: { ...samples.pieces, assetId: uploaded },
      },
    });
    expect(uploadedPiece.status()).toBe(201);
    const exportId = (await uploadedPiece.json()).id;
    records.push(exportId);
    const reviewer = await login("reviewer");
    expect(
      (
        await reviewer.post("/api/reviews", {
          data: {
            recordId: productId,
            decision: "approved",
            checklist: {},
            notes: "Incomplete",
          },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await reviewer.post("/api/reviews", {
          data: {
            recordId: productId,
            decision: "approved",
            checklist: {
              fidelity: true,
              portuguese: true,
              brand: true,
              rights: true,
              dimensions: true,
            },
            notes: "Synthetic fixture verified",
          },
        })
      ).status(),
    ).toBe(200);
    const fullChecklist = {
      fidelity: true,
      portuguese: true,
      brand: true,
      rights: true,
      dimensions: true,
    };
    expect(
      (
        await reviewer.post("/api/reviews", {
          data: {
            recordId: exportId,
            decision: "approved",
            checklist: fullChecklist,
            notes: "Dependencies not approved",
          },
        })
      ).status(),
    ).toBe(409);
    for (const recordId of [uploaded, exportId])
      expect(
        (
          await reviewer.post("/api/reviews", {
            data: {
              recordId,
              decision: "approved",
              checklist: fullChecklist,
              notes: "Synthetic fixture validation",
            },
          })
        ).status(),
      ).toBe(200);
    expect((await reviewer.get("/api/records/products")).status()).toBe(200);
    await editor.post("/api/auth/logout");
    expect((await editor.get("/api/auth/me")).status()).toBe(401);
    await editor.dispose();
    await viewer.dispose();
    await reviewer.dispose();
  });
  test("UI login and module navigation", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(emails.viewer);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Produtos e SKUs", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Biblioteca de imagens", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Biblioteca de imagens", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL(/login/);
    await page.getByLabel("E-mail").fill(emails.editor);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByRole("heading", { name: "Produtos e SKUs", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Peças para marketplaces", exact: true })
      .click();
    const article = page
      .locator("article")
      .filter({ has: page.getByText("PNG export fixture", { exact: true }) });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      article
        .getByRole("button", { name: "Exportar fotografia PNG aprovada" })
        .click(),
    ]);
    const filepath = await download.path();
    expect(filepath).toBeTruthy();
    const meta = await sharp(filepath!).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(1200);
    const pixels = await sharp(filepath!).raw().toBuffer();
    expect([...pixels.subarray(0, 3)]).toEqual([255, 255, 255]);
    expect(errors).toEqual([]);
  });
});
