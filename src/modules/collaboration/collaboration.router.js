import express from "express";
import passport from "../../utils/index.passport.js";
import {
  addCollaborator,
  getCollaborators,
  updatePermission,
  removeCollaborator,
} from "./collaboration.controller.js";
import validatorHandler from "../../middlewares/validatorHandler.middleware.js";
import {
  addCollaboratorSchema,
  updatePermissionSchema,
  getCollabSchema,
  updateCollabParamsSchema,
} from "../../schemas/collaboration.schema.js";

const router = express.Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get(
  "/notes/:noteId",
  validatorHandler(getCollabSchema, "params"),
  getCollaborators
);

router.post(
  "/notes/:noteId",
  validatorHandler(getCollabSchema, "params"),
  validatorHandler(addCollaboratorSchema, "body"),
  addCollaborator
);

router.patch(
  "/notes/:noteId/user/:userId",
  validatorHandler(updateCollabParamsSchema, "params"),
  validatorHandler(updatePermissionSchema, "body"),
  updatePermission
);

router.delete(
  "/notes/:noteId/user/:userId",
  validatorHandler(updateCollabParamsSchema, "params"),
  removeCollaborator
);

export default router;
