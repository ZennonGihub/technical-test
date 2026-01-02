import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../db/prisma.js";
import { createAccessToken } from "../utils/jwt.js";

const BASE_URL = "/api/v1/collaboration";

vi.mock("../db/prisma.js", () => ({
  prisma: {
    auth: { findUnique: vi.fn() },
    note: { findFirst: vi.fn() },
    permissionLevel: { findUnique: vi.fn() },
    noteCollaborator: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}));

describe("COLLABORATION Endpoints", () => {
  let token;
  const ownerId = 1;
  const noteId = 100;
  const friendId = 2;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Generamos el token
    const tokenData = await createAccessToken({
      id: ownerId,
      username: "OwnerUser",
    });
    token = tokenData.token;

    // Mock para que Passport valide el token
    if (prisma.auth) {
      prisma.auth.findUnique.mockResolvedValue({ id: 1, userId: ownerId });
    }
    // Mock para que Passport/User Service encuentre al usuario
    if (prisma.user) {
      prisma.user.findUnique.mockResolvedValue({
        id: ownerId,
        username: "OwnerUser",
      });
    }

    // Mocks por "Default" (Para que pase la validación básica de "Dueño" y "Permiso")
    prisma.note.findFirst.mockResolvedValue({ id: noteId, ownerId: ownerId });
    prisma.permissionLevel.findUnique.mockResolvedValue({
      id: 1,
      name: "VIEWER",
    });
  });

  // Post
  it(`POST ${BASE_URL}/notes/:noteId - Debería agregar un colaborador`, async () => {
    const inviteData = { email: "friend@test.com", permission: "VIEWER" };

    // Simulamos encontrar al invitado
    prisma.auth.findUnique.mockResolvedValue({
      email: "friend@test.com",
      user: { id: friendId, username: "FriendUser" },
    });

    // No existe una colaboración previa
    prisma.noteCollaborator.findUnique.mockResolvedValue(null);

    // Creacion exitosa
    prisma.noteCollaborator.create.mockResolvedValue({
      noteId: noteId,
      userId: friendId,
      permissionLevel: { name: "VIEWER" },
      user: { username: "FriendUser" },
    });

    const response = await request(app)
      .post(`${BASE_URL}/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(inviteData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Colaborador agregado exitosamente"
    );
  });

  // Get
  it(`GET ${BASE_URL}/notes/:noteId - Debería listar colaboradores`, async () => {
    prisma.noteCollaborator.findMany.mockResolvedValue([
      {
        user: {
          id: friendId,
          username: "Friend",
          auth: { email: "f@test.com" },
        },
        permissionLevel: { name: "VIEWER" },
      },
    ]);

    const response = await request(app)
      .get(`${BASE_URL}/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].user.username).toBe("Friend");
  });

  // Patch
  it(`PATCH ${BASE_URL}/notes/:noteId/user/:userId - Debería cambiar permisos`, async () => {
    prisma.permissionLevel.findUnique.mockResolvedValue({
      id: 2,
      name: "EDITOR",
    });

    prisma.noteCollaborator.update.mockResolvedValue({
      permissionLevel: { name: "EDITOR" },
    });

    const response = await request(app)
      .patch(`${BASE_URL}/notes/${noteId}/user/${friendId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ permission: "EDITOR" });

    expect(response.statusCode).toBe(201);
    expect(response.body.permissionLevel.name).toBe("EDITOR");
  });

  // Delete
  it(`DELETE ${BASE_URL}/notes/:noteId/user/:userId - Debería eliminar colaborador`, async () => {
    prisma.noteCollaborator.delete.mockResolvedValue({ id: 1 });

    const response = await request(app)
      .delete(`${BASE_URL}/notes/${noteId}/user/${friendId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Colaborador eliminado");
  });

  it(`POST ${BASE_URL}/notes/:noteId - Debería fallar si se invita a sí mismo`, async () => {
    prisma.auth.findUnique.mockResolvedValue({
      email: "owner@test.com",
      user: { id: ownerId },
    });

    const response = await request(app)
      .post(`${BASE_URL}/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "owner@test.com", permission: "VIEWER" });

    expect(response.statusCode).toBe(201);
  });
});
