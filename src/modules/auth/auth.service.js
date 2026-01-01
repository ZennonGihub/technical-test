import boom from "@hapi/boom";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma.js";
import { createAccessToken } from "../../utils/jwt.js";

export class AuthService {
  constructor() {}

  async register(body) {
    const { email, phone, password, username } = body;
    if (!email || !password || !username)
      throw boom.badData("Falta informacion");
    const emailFound = await prisma.auth.findUnique({
      where: { email: email },
    });
    if (emailFound) throw boom.conflict("El correo ya esta registrado");
    const passwordHash = await bcrypt.hash(password, 10);

    const usernameFound = await prisma.user.findUnique({
      where: { username: username },
    });

    if (usernameFound)
      throw boom.conflict("El nombre de usuario ya esta registrado");

    const newUser = await prisma.auth.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        phone: phone,
        user: {
          create: {
            username: username,
          },
        },
      },
      include: { user: true },
    });

    const { refreshToken, token } = await createAccessToken({
      id: newUser.user.id,
    });

    const userObject = {
      id: newUser.user.id,
      username: newUser.user.username,
      email: newUser.email,
      phone: newUser.phone,
    };
    return { userObject, refreshToken, token };
  }

  async login(user) {
    const { email, password } = user;
    const auth = await prisma.auth.findUnique({
      where: { email: email },
      include: {
        user: true,
      },
    });
    if (!auth) throw boom.unauthorized("Credenciales invalidas");
    const isMatch = await bcrypt.compare(password, auth.passwordHash);
    if (!isMatch) throw boom.unauthorized("Credenciales invalidas");
    const { refreshToken, token } = await createAccessToken({
      id: auth.user.id,
      username: auth.user.username,
    });
    return { refreshToken, token };
  }

  async findOne(userId) {
    const user = await prisma.auth.findUnique({
      where: { userId: userId },
      include: { user: true },
    });
    if (!user) throw boom.notFound("Usuario no encontrado");
    return user;
  }

  // Metodo solamente para passport
  async findUserByEmail(email) {
    const user = await prisma.auth.findUnique({
      where: { email: email },
      include: { user: true },
    });
    if (!user) return null;
    return user;
  }

  async update(userId, changes) {
    await this.findOne(userId);
    if (changes.password) {
      changes.passwordHash = await bcrypt.hash(changes.password, 10);
      delete changes.password;
    }

    if (changes.username) {
      const newUsername = changes.username;
      delete changes.username;

      changes.user = {
        update: {
          username: newUsername,
        },
      };
    }

    const updatedAuth = await prisma.auth.update({
      where: { userId: userId },
      data: changes,
      include: { user: true },
    });
    return updatedAuth;
  }

  async delete(userId) {
    await this.findOne(userId);
    await prisma.auth.delete({
      where: { userId: userId },
    });

    return { message: `User con id ${userId} fue eliminado` };
  }
}
