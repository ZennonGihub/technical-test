import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export async function createAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
  };

  console.log(process.env.JWT_SECRET);

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return { token, refreshToken };
}

export async function refreshToken(token) {
  const verify = jwt.verify(token, process.env.JWT_SECRET);
  const payload = {
    id: decoded.id,
    username: decoded.username,
  };
  const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  return { newToken };
}
