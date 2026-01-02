import boom from "@hapi/boom";
import { prisma } from "../../db/prisma.js";

export class NotesService {
  constructor() {}
  async createNote(data, userId) {
    if (!data.title || !data.content) throw boom.badData("Falta informacion");
    const note = await prisma.note.create({
      data: { ...data, ownerId: userId },
    });
    return note;
  }

  async findAll(userId, filters = {}) {
    const id = parseInt(userId);
    const { search, isArchived } = filters;

    // Construimos nuestra cláusula WHERE
    const whereClause = {
      AND: [
        // Corroboramos si es el dueño
        {
          OR: [{ ownerId: id }, { collaborators: { some: { userId: id } } }],
        },
      ],
    };

    // Filtro del archivo
    if (isArchived !== undefined) {
      whereClause.AND.push({
        isArchived: isArchived,
      });
    }

    // Buscamos en Title O en Content
    if (search) {
      whereClause.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        owner: { select: { username: true } },
        collaborators: {
          where: { userId: id },
          include: { permissionLevel: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return notes;
  }

  async toggleArchive(userId, noteId) {
    // Buscamos la nota
    const note = await this.findNote(userId, noteId);

    const updatedNote = await prisma.note.update({
      where: { id: parseInt(noteId) },
      data: {
        isArchived: !note.isArchived,
      },
    });

    return {
      id: updatedNote.id,
      title: updatedNote.title,
      isArchived: updatedNote.isArchived,
      message: updatedNote.isArchived ? "Nota archivada" : "Nota desarchivada",
    };
  }

  async findNote(userId, noteId) {
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(noteId),
        ownerId: userId,
      },
    });
    if (!note) throw boom.notFound("No se encontro la nota");
    return note;
  }

  async update(userId, noteId, changes) {
    await this.findNote(userId, noteId);
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(noteId) },
      data: changes,
    });

    return updatedNote;
  }

  async delete(userId, noteId) {
    const note = await this.findNote(userId, noteId);
    await prisma.note.delete({
      where: { id: parseInt(noteId) },
    });
    return {
      message: `La nota ${noteId} del usuario ${userId} fue eliminada con exito`,
    };
  }
}
