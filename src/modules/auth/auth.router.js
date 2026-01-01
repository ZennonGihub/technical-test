import { register, login, findOne, update, remove } from "./auth.controller.js";
import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/register", register);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login
);
router.get("/profile", findOne);
router.patch(
  "/update",
  passport.authenticate("jwt", { session: false }),
  update
);
router.delete(
  "/remove",
  passport.authenticate("jwt", { session: false }),
  remove
);

export default router;
