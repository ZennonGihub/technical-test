import express from "express";
import passport from "passport";
import { register, login, findOne, update, remove } from "./auth.controller.js";
import validatorHandler from "../../middlewares/validatorHandler.middleware.js";
import { registerSchema, loginSchema } from "../../schemas/auth.schema.js";

const router = express.Router();

router.post("/register", validatorHandler(registerSchema, "body"), register);

router.post(
  "/login",
  validatorHandler(loginSchema, "body"),
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
