import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../db/prisma.js";
import { createAccessToken } from "../utils/jwt.js";

const BASE_URL = "/api/v1/users";

vi.mock("../db/prisma.js", () => ({
  prisma: {
    auth: { findUnique: vi.fn() },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("USERS Endpoints", () => {
  let token;
  const myUserId = 1;

  beforeEach(async () => {
    vi.clearAllMocks();

    const tokenData = await createAccessToken({
      id: myUserId,
      username: "AdminUser",
    });
    token = tokenData.token;

    if (prisma.auth) {
      prisma.auth.findUnique.mockResolvedValue({ id: 1, userId: myUserId });
    }

    prisma.user.findUnique.mockResolvedValue({
      id: myUserId,
      username: "AdminUser",
    });
  });

  // Get all
  it(`GET ${BASE_URL}/lista - Debería retornar la lista de usuarios`, async () => {
    const mockUsers = [
      { id: 1, username: "UserA" },
      { id: 2, username: "UserB" },
    ];

    prisma.user.findMany.mockResolvedValue(mockUsers);

    const response = await request(app)
      .get(`${BASE_URL}/lista`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].username).toBe("UserA");
    expect(prisma.user.findMany).toHaveBeenCalled();
  });

  it(`GET ${BASE_URL}/lista - Debería retornar 404 si findMany falla (retorna null)`, async () => {
    prisma.user.findMany.mockResolvedValue(null);

    const response = await request(app)
      .get(`${BASE_URL}/lista`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("No se encontraron usuarios");
  });
});
