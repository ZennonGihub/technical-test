import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export async function createAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, config.secret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, config.secret, {
    expiresIn: "1d",
  });

  return { token, refreshToken };
}

export async function refreshToken(token) {
  const verify = jwt.verify(token, config.secret);
  const payload = {
    id: decoded.id,
    username: decoded.username,
  };
  const newToken = jwt.sign(payload, config.secret, {
    expiresIn: "15m",
  });

  return { newToken };
}
