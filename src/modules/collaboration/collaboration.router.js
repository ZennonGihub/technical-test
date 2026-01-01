import passport from "../../utils/index.passport.js";
import {
  addCollaborator,
  getCollaborators,
  updatePermission,
  removeCollaborator,
} from "./collaboration.controller.js";
import express from "express";

const router = express.Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get("/notes/:noteId", getCollaborators);
router.post("/notes/:noteId", addCollaborator);
router.patch("/notes/:noteId/user/:collaboratorId", updatePermission);
router.delete("/notes/:noteId/user/:collaboratorId", removeCollaborator);

export default router;
