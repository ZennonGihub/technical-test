import { prisma } from "../../db/prisma.js";
import boom from "@hapi/boom";

export class CollaborationNotes {
  constructor() {}

  // Metodo para agregar un colaborador
  async addCollaborator(ownerId, noteId, collaboratorEmail, permissionName) {
    // Buscamos la nota a la cual queremos agregar a nuestro colaborador
    const note = await prisma.note.findFirst({
      where: {
        // Se "parsean" los id's para no generar errores
        id: parseInt(noteId),
        ownerId: parseInt(ownerId),
      },
    });
    if (!note) throw boom.notFound("No se encontro la nota");

    // Buscamos a nuestro colaborador
    const authFound = await prisma.auth.findUnique({
      where: { email: collaboratorEmail },
      include: { user: true },
    });
    if (!authFound) throw boom.notFound("El usuario indicado no existe");
    // Guardamos su valor en una variable para generar menos "ruido"
    const userToInvite = authFound.user;
    // Verificamos que el id no se el mismo que el del propietario
    if (userToInvite.id === parseInt(ownerId)) {
      throw boom.badRequest("No puedes invitarte a ti mismo, ya eres el dueño");
    }

    // Buscamos el permiso por el nombre y lo guardamos
    const permission = await prisma.permissionLevel.findUnique({
      where: { name: permissionName },
    });

    if (!permission)
      throw boom.badRequest(
        "El nivel de permiso indicado no existe (Use VIEWER o EDITOR)"
      );

    // Verificamos si el colaborador ya esta conectado a esta nota
    const existingCollab = await prisma.noteCollaborator.findUnique({
      where: {
        noteId_userId: {
          noteId: parseInt(noteId),
          userId: parseInt(userToInvite.id),
        },
      },
    });

    if (existingCollab)
      throw boom.conflict("Este usuario ya es colaborador de esta nota");

    // Se crea la "colaboracion"
    const newCollab = await prisma.noteCollaborator.create({
      data: {
        noteId: parseInt(noteId),
        userId: parseInt(userToInvite.id),
        permissionLevelId: parseInt(permission.id),
      },
      include: {
        permissionLevel: true,
        user: true,
      },
    });

    return {
      message: "Colaborador agregado exitosamente",
      collaborator: newCollab.user.username,
      permission: newCollab.permissionLevel.name,
      noteId: newCollab.noteId,
    };
  }

  // Remover un colaborador
  async removeCollaborator(ownerId, noteId, collaboratorId) {
    // Verificamos si el usuario es realmente el dueño
    const note = await prisma.note.findFirst({
      where: { id: parseInt(noteId), ownerId: parseInt(ownerId) },
    });
    if (!note) throw boom.notFound("No tienes permisos");

    // Eliminamos la nota mediante la llave compuesta
    await prisma.noteCollaborator.delete({
      where: {
        noteId_userId: {
          noteId: parseInt(noteId),
          userId: parseInt(collaboratorId),
        },
      },
    });

    return { message: "Colaborador eliminado" };
  }

  // Buscar todos los colabores de una nota
  async getCollaborators(ownerId, noteId) {
    // Verificamos que el usuario se el dueño de la nota
    const note = await prisma.note.findFirst({
      where: { id: parseInt(noteId), ownerId: parseInt(ownerId) },
    });
    if (!note) throw boom.notFound("Nota no encontrada o sin permisos");

    // Traemos a todos los colaboradore con sus respectivos permisos
    const collaborators = await prisma.noteCollaborator.findMany({
      where: { noteId: parseInt(noteId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            auth: { select: { email: true } },
          },
        },
        permissionLevel: true,
      },
    });

    return collaborators;
  }

  // Modificar roles de colaboradores
  async updatePermission(ownerId, noteId, collaboratorId, newPermissionName) {
    // Validar que sea el dueño
    const note = await prisma.note.findFirst({
      where: { id: parseInt(noteId), ownerId: parseInt(ownerId) },
    });
    if (!note) throw boom.notFound("Nota no encontrada o sin permisos");

    // Buscamos el ID del nuevo permiso mediante su nombre
    const permission = await prisma.permissionLevel.findUnique({
      where: { name: newPermissionName },
    });
    if (!permission) throw boom.badRequest("Permiso inválido");

    // Actualizamos mediante la llave compuesta
    const updatedCollab = await prisma.noteCollaborator.update({
      where: {
        noteId_userId: {
          noteId: parseInt(noteId),
          userId: parseInt(collaboratorId),
        },
      },
      data: {
        permissionLevelId: permission.id,
      },
      include: { permissionLevel: true },
    });

    return updatedCollab;
  }
}
