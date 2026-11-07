import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

describe("Auth API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/auth/register", () => {
    const validUser = {
      name: "Test User",
      email: "test@example.com",
      password: "Test@123",
      phone: "1234567890",
    };

    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.role).toBe("candidate");
      expect(res.body.data.token).toBeDefined();
      // Password should not be returned
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should reject duplicate email", async () => {
      // Register first user
      await request(app).post("/api/auth/register").send(validUser);

      // Try to register again with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing required fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    const testUser = {
      name: "Login Test",
      email: "login@example.com",
      password: "Login@123",
      phone: "1234567890",
    };

    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it("should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "Test@123" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken;

    beforeEach(async () => {
      // Register and get token
      const res = await request(app).post("/api/auth/register").send({
        name: "Auth Test",
        email: "me@example.com",
        password: "Auth@123",
        phone: "1234567890",
      });
      authToken = res.body.data.token;
    });

    it("should return current user with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("me@example.com");
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken123");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    let authToken;

    beforeEach(async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Logout Test",
        email: "logout@example.com",
        password: "Logout@123",
        phone: "1234567890",
      });
      authToken = res.body.data.token;
    });

    it("should logout and blacklist token", async () => {
      // Logout
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`);

      expect(logoutRes.status).toBe(200);

      // Try to use the same token - should fail
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(meRes.status).toBe(401);
    });
  });
});
