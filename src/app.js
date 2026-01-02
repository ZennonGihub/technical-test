import express from "express";
import cors from "cors";
import passport from "./utils/index.passport.js";
import { routerApi } from "./router/index.js";
import {
  logErrors,
  boomErrorHandler,
  errorHandler,
  ormErrorHandler,
} from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running" });
});

routerApi(app);

app.use(logErrors);
app.use(boomErrorHandler);
app.use(ormErrorHandler);
app.use(errorHandler);

export default app;
