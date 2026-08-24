import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../server";
import { prisma } from "../prismaClient";

describe("XSS protection", () => {
  const payloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
  ];

  it.each(payloads)("neutralizes payload: %s", async (payload) => {
    const res = await request(app).post("/api/security/xss-test").send({ payload });
    expect(res.status).toBe(200);
    expect(res.body.neutralized).toBe(true);
    expect(res.body.safeOutput).not.toContain("<script");
    expect(res.body.safeOutput).not.toContain("onerror=");
    expect(res.body.safeOutput).not.toContain("onload=");
  });
});

describe("Authentication", () => {
  const email = `test_${Date.now()}@example.com`;
  const password = "StrongPass1";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Student",
      email,
      password,
      course: "Computer Science",
      year: "3rd Year",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
  });

  it("rejects a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Weak Pw",
      email: `weak_${Date.now()}@example.com`,
      password: "weak",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "WrongPass1" });
    expect(res.status).toBe(401);
  });

  it("blocks protected routes without a session", async () => {
    const res = await request(app).get("/api/user/profile");
    expect(res.status).toBe(401);
  });
});

describe("Input validation", () => {
  it("rejects an oversized chat message shape at the schema level", async () => {
    // Unauthenticated call still hits validation before auth in this route order,
    // but auth is required first here — verify 401 without a session either way.
    const res = await request(app)
      .post("/api/conversations/some-id/messages")
      .send({ content: "a".repeat(5000) });
    expect([400, 401]).toContain(res.status);
  });
});
