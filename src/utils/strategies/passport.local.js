import bcrypt from "bcryptjs";
import { AuthService } from "../../modules/auth/auth.service.js";
import { Strategy } from "passport-local";

const service = new AuthService();

export const localStrategy = new Strategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const user = await service.findUserByEmail(email);
      if (!user)
        return done(null, false, { message: "Credenciales incorrectas" });
      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch)
        return done(null, false, { message: "Credenciales incorrectas" });

      delete user.passwordHash;

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);
