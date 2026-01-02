import express from "express";
import passport from "../../utils/index.passport.js";
import {
  findAll,
  create,
  remove,
  update,
  findOne,
  toggleArchive,
} from "./note.controller.js";
import validatorHandler from "../../middlewares/validatorHandler.middleware.js";
import {
  createNoteSchema,
  updateNoteSchema,
  getNoteSchema,
  queryNoteSchema,
} from "../../schemas/note.schema.js";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.post("/", validatorHandler(createNoteSchema, "body"), create);

router.get("/", validatorHandler(queryNoteSchema, "query"), findAll);

router.patch(
  "/:id/archive",
  validatorHandler(getNoteSchema, "params"),
  toggleArchive
);

router.get("/:id", validatorHandler(getNoteSchema, "params"), findOne);

router.patch(
  "/:id",
  validatorHandler(getNoteSchema, "params"),
  validatorHandler(updateNoteSchema, "body"),
  update
);

router.delete("/:id", validatorHandler(getNoteSchema, "params"), remove);

export default router;
