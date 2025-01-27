import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

await db.role.create({
  data: {
    name: "user",
  },
});

await db.role.create({
  data: {
    name: "writer",
  },
});

await db.role.create({
  data: {
    name: "admin",
  },
});

await db.user.create({
  data: {
    email: "test1@keyce.fr",
    salt: 'bf5a3bca30a7215eba32c8c3bff473cc',
    password: '6d57a0c92d8e34236a46edcf99f03bea186b2da425f779eb8353271f72c9c5ba',
    roleId: 3,
  }
});

await db.blog.create({
  data: {
    content: "lorem fwefwe wfeewf wefwefwe fwefwefwe",
    userId: 1,
  }
});

await db.blog.create({
  data: {
    content: "lorem frijwdicern uri3e0ife g0owri0e2fw",
    userId: 1,
  }
});

await db.blog.create({
  data: {
    content: "lorem djwdqf wefweg pllgrpg qqqwww",
    userId: 1,
  }
});