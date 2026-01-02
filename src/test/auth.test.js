import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../db/prisma.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../utils/jwt.js";

// Mock de prisma
vi.mock("../db/prisma.js", () => ({
  prisma: {
    auth: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

//  Mock de bcryp

vi.mock("bcryptjs", () => {
  const mockFn = {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("hashed_password_123"),
  };
  return {
    default: mockFn,
    ...mockFn,
  };
});

describe("AUTH Endpoints", () => {
  let token;
  const userId = 1;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Generamos un token válido para las rutas protegidas
    const tokenData = await createAccessToken({
      id: userId,
      username: "TestUser",
    });
    token = tokenData.token;
  });

  // Register
  it("POST /api/v1/auth/register - Debería registrar un usuario nuevo", async () => {
    const newUser = {
      email: "test@example.com",
      password: "password123",
      username: "TestUser",
      phone: "123456",
    };

    prisma.auth.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(null);

    prisma.auth.create.mockResolvedValue({
      id: 1,
      email: newUser.email,
      phone: newUser.phone,
      passwordHash: "hashed",
      user: { id: 1, username: newUser.username },
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(newUser);

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(300);
    expect(response.body).toHaveProperty("token");
  });

  it("POST /api/v1/auth/register - Debería fallar si faltan datos", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: "SoloNombre" });
    expect(response.statusCode).toBe(400);
  });

  // Login
  it("POST /api/v1/auth/login - Debería loguear correctamente", async () => {
    //  Mock para encontrar al usuario
    prisma.auth.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      email: "test@example.com",
      passwordHash: "hash_real_en_db",
      user: { id: 1, username: "TestUser" },
    });

    // Mock para Bcrypt si es TRUE
    if (bcrypt.compare) bcrypt.compare.mockResolvedValue(true);
    if (bcrypt.default) bcrypt.default.compare.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(300);
    expect(response.body).toHaveProperty("token");
  });

  // UPDATE
  it("PATCH /api/v1/auth/update - Debería actualizar contraseña", async () => {
    // Mock para Passport JWT
    prisma.auth.findUnique.mockResolvedValue({
      id: 1,
      userId: userId,
      email: "test@example.com",
      user: { id: userId, username: "TestUser" },
    });

    // Mock del update final
    prisma.auth.update.mockResolvedValue({
      id: 1,
      userId: userId,
      passwordHash: "new_hashed_password",
      user: { id: userId, username: "TestUser" },
    });

    // Mock del hash
    if (bcrypt.hash) bcrypt.hash.mockResolvedValue("new_hash");

    const response = await request(app)
      .patch("/api/v1/auth/update")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "newPassword123" });

    expect(response.statusCode).toBeLessThan(300);
    expect(prisma.auth.update).toHaveBeenCalled();
  });

  // DELETE
  it("DELETE /api/v1/auth/remove - Debería eliminar el usuario", async () => {
    // Mock para Passport JWT y Servicio
    prisma.auth.findUnique.mockResolvedValue({
      id: 1,
      userId: userId,
      user: { id: userId, username: "TestUser" },
    });

    // Mock del delete
    prisma.auth.delete.mockResolvedValue({ id: 1 });

    const response = await request(app)
      .delete("/api/v1/auth/remove")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBeLessThan(300);
    expect(response.body.message).toMatch(/eliminado/);
    expect(prisma.auth.delete).toHaveBeenCalled();
  });
});
