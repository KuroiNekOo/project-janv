import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const userFound = await db.user.findUnique({
  where: {
    email: 'toto',
  },
});

console.log(userFound);