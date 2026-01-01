import boom from "@hapi/boom";
import { prisma } from "../../db/prisma.js";

export class UserService {
  constructor() {}

  async getAll() {
    const users = await prisma.user.findMany();
    if (!users) throw boom.notFound("No se encontraron usuarios");
    return users;
  }
  async getOne(id) {
    const user = await prisma.user.findFirst(id);
    if (!user) throw boom.notFound("Usuario no encontrado");
    return user;
  }
}
