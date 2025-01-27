import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

await db.role.create({
  data: {
    name: "User",
  },
});

await db.role.create({
  data: {
    name: "Write",
  },
});

await db.role.create({
  data: {
    name: "Administrateur",
  },
});