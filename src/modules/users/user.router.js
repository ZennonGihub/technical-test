import { getAll } from "./user.controller.js";
import express from "express";

const router = express.Router();

router.get("/lista", getAll);

export default router;
