import auth from "../modules/auth/auth.router.js";
import user from "../modules/users/user.router.js";
import note from "../modules/notes/note.router.js";
import collaboration from "../modules/collaboration/collaboration.router.js";

import express from "express";

export function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/auth", auth);
  router.use("/notes", note);
  router.use("/collaboration", collaboration);
  router.use("/users", user);
}
