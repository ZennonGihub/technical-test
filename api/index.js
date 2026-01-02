import app from "../src/app.js";
import "dotenv/config";
import { prisma } from "../src/db/prisma.js";

const prismaConnect = async () => {
  try {
    await prisma.$connect();
    console.log(" Conectado a la base de datos con Prisma");

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  } catch (error) {
    console.error(" Error al iniciar:", error);
  }
};

await prismaConnect();
