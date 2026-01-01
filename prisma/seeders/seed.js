import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const permissionLevels = ["VIEWER", "EDITOR"];

  for (const permissionName of permissionLevels) {
    const permission = await prisma.permissionLevel.upsert({
      where: { name: permissionName },
      update: {},
      create: {
        name: permissionName,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
