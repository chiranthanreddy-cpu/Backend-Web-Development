const prisma = require('../db/prisma');

async function findAll() {
  return prisma.post.findMany({
    orderBy: { id: 'asc' },
  });
}

async function findById(id) {
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });
  return post || null;
}

async function create(fields) {
  return prisma.post.create({
    data: {
      title: fields.title,
      body: fields.body || '',
      authorId: Number(fields.authorId),
    },
  });
}

async function update(id, patch) {
  const numericId = Number(id);
  const existing = await findById(numericId);
  if (!existing) return null;

  return prisma.post.update({
    where: { id: numericId },
    data: {
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.body !== undefined && { body: patch.body }),
      ...(patch.authorId !== undefined && { authorId: Number(patch.authorId) }),
    },
  });
}

async function remove(id) {
  const numericId = Number(id);
  const existing = await findById(numericId);
  if (!existing) return false;

  await prisma.post.delete({
    where: { id: numericId },
  });
  return true;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};