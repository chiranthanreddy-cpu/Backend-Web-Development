const { PrismaClient } = require('@prisma/client');
const initialPosts = require('../src/data/postSeed');

const prisma = new PrismaClient();

async function main() {
  // 1. Ensure User 1 exists so foreign keys are satisfied
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Initial Author',
    },
  });

  // 2. Insert initial seed posts
  for (const post of initialPosts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        title: post.title,
        body: post.body,
        authorId: user.id,
      },
    });
  }

  // 3. Reset postgres autoincrement sequence so new inserts don't collide with IDs 1 and 2
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Post"', 'id'), coalesce(max(id), 1)) FROM "Post";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 1)) FROM "User";`
  );

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });