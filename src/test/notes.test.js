import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../db/prisma.js";
import { createAccessToken } from "../utils/jwt.js";

// Mock de prisma
vi.mock("../db/prisma.js", () => ({
  prisma: {
    note: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auth: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

describe("NOTES Endpoints", () => {
  let token;
  const userId = 1;
  const BASE_URL = "/api/v1/notes";

  beforeEach(async () => {
    vi.clearAllMocks();

    // Generamos token
    const tokenData = await createAccessToken({
      id: userId,
      username: "TestUser",
    });
    token = tokenData.token;

    // Mocks para auth
    if (prisma.auth)
      prisma.auth.findUnique.mockResolvedValue({ id: 1, userId: userId });
    if (prisma.user)
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        username: "TestUser",
      });
  });

  // Get all
  it(`GET ${BASE_URL} - Debería listar las notas del usuario`, async () => {
    prisma.note.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Post
  it(`POST ${BASE_URL} - Debería crear una nota`, async () => {
    prisma.note.create.mockResolvedValue({
      id: 1,
      title: "Test",
      content: "Content",
      ownerId: userId,
    });

    const response = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test", content: "Content" });

    expect(response.statusCode).toBeLessThan(300);
    expect(response.body).toHaveProperty("title", "Test");
  });

  // Get one
  it(`GET ${BASE_URL}/:id - Debería obtener una nota específica`, async () => {
    // findFirst se usa para validar que la nota existe y pertenece al usuario
    prisma.note.findFirst.mockResolvedValue({
      id: 1,
      title: "Mi Nota",
      content: "XYZ",
      ownerId: userId,
    });

    const response = await request(app)
      .get(`${BASE_URL}/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("title", "Mi Nota");
  });

  // Patch
  it(`PATCH ${BASE_URL}/:id - Debería actualizar una nota`, async () => {
    // Validamos la existencia
    prisma.note.findFirst.mockResolvedValue({ id: 1, ownerId: userId });

    // Ejecutamos el update
    prisma.note.update.mockResolvedValue({ id: 1, title: "Titulo Editado" });

    const response = await request(app)
      .patch(`${BASE_URL}/1`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Titulo Editado" });

    expect(response.statusCode).toBeLessThan(300);
    expect(response.body.title).toBe("Titulo Editado");
  });

  // PATCH
  it(`PATCH ${BASE_URL}/:id/archive - Debería alternar el archivado`, async () => {
    // Validamos la existencia
    prisma.note.findFirst.mockResolvedValue({
      id: 1,
      ownerId: userId,
      isArchived: false,
    });

    // Ejecutamos el update
    prisma.note.update.mockResolvedValue({ id: 1, isArchived: true });

    const response = await request(app)
      .patch(`${BASE_URL}/1/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBeLessThan(300);
    expect(response.body.isArchived).toBe(true);
  });

  // Delete
  it(`DELETE ${BASE_URL}/:id - Debería eliminar una nota`, async () => {
    // Validamos la existencia
    prisma.note.findFirst.mockResolvedValue({ id: 1, ownerId: userId });

    // Ejecutamos el  delete
    prisma.note.delete.mockResolvedValue({ id: 1 });

    const response = await request(app)
      .delete(`${BASE_URL}/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBeLessThan(300);
  });
});
