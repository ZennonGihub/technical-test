import auth from "../modules/auth/auth.router.js";
import user from "../modules/users/user.router.js";
import express from "express";

export function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/auth", auth);
  router.use("/users", user);
}
