import express from "express";
import cors from "cors";
import { prisma } from "./db/prisma.js";

const app = express();

app.use(express.json());
app.use(cors());

const prismaConnect = async () => {
  try {
    await prisma.$connect();
    console.log("Conectado a la base de datos con Prisma");
  } catch (error) {
    console.error("Error al conectar a la base de datos con Prisma:", error);
  }
};

await prismaConnect();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server running" });
});

app.listen(3000, console.log("Server listening on port 3000"));
