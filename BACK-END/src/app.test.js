import { describe, expect, it, vi } from "vitest";
import request from "supertest";

describe("createApp", () => {
  it("exposes /health", async () => {
    const { createApp } = await import("./app.js");
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, status: "up" });
  });

  it("mounts /api routes", async () => {
    vi.resetModules();
    // Minimal check: /api/db/ping exists (we mock db to avoid real MySQL)
    vi.doMock("./config/db.js", async () => {
      return {
        pool: { query: vi.fn(async () => [[]]) },
        testDatabaseConnection: vi.fn(async () => true),
        formatDbError: (e) => String(e?.message ?? e)
      };
    });

    const { createApp: createAppWithMock } = await import("./app.js");
    const app = createAppWithMock();
    const res = await request(app).get("/api/db/ping");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

