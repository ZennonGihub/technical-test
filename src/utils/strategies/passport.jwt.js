import { Strategy, ExtractJwt } from "passport-jwt";
import { config } from "../../../config.js";
import { AuthService } from "../../modules/auth/auth.service.js";

const service = new AuthService();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
};

export const jwtStrategy = new Strategy(options, async (payload, done) => {
  try {
    const user = await service.findOne(payload.id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
