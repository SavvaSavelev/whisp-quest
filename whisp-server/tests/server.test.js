// Vitest + Supertest — тесты под MOCK_OPENAI=1
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

// Важно: включаем мок до импорта приложения
beforeAll(() => {
  process.env.MOCK_OPENAI = "1";
});

const importApp = async () => {
  const mod = await import("../server.js");
  return mod.app;
};

describe("API v1", () => {
  it("health returns ok and valid shape", async () => {
    const app = await importApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.cache_size).toBe("number");
    expect(typeof res.body.openai_configured).toBe("boolean");
  });

  it("analyze validates body and returns spirit (MOCK)", async () => {
    const app = await importApp();
    const res = await request(app)
      .post("/api/v1/analyze")
      .send({ text: "я устал но доволен результатом" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mood");
    expect(res.body).toHaveProperty("color");
    expect(res.body).toHaveProperty("rarity");
    expect(res.body).toHaveProperty("essence");
    expect(res.body).toHaveProperty("dialogue");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("analyze rejects empty text", async () => {
    const app = await importApp();
    const res = await request(app).post("/api/v1/analyze").send({ text: "" });
    expect(res.status).toBe(400);
  });

  it("chat stream exposes text/event-stream", async () => {
    const app = await importApp();
    const res = await request(app)
      .post("/api/v1/spirit-chat/stream")
      .send({ text: "ну привет", mood: "радостный" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
  });
});
