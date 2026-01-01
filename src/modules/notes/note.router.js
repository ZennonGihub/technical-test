import { findAll, create, remove, update, findOne } from "./note.controller.js";
import express from "express";
import passport from "../../utils/index.passport.js";

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.post("/", create);

router.get("/", findAll);

router.get("/:id", findOne);

router.patch("/:id", update);

router.delete("/:id", remove);

export default router;
