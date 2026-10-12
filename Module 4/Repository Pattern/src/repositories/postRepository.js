/**
 * Post Repository (Map-backed Store - Storage Swap Implementation)
 *
 * FUTURE PRISMA SWAP NOTES:
 * -------------------------------------------------------------
 * What will change:
 * - The internal `postsMap` and `nextId` counter will be removed.
 * - Methods will become async and call Prisma Client queries:
 *     - findAll()  -> await prisma.post.findMany()
 *     - findById() -> await prisma.post.findUnique({ where: { id: Number(id) } })
 *     - create()   -> await prisma.post.create({ data: fields })
 *     - update()   -> await prisma.post.update({ where: { id: Number(id) }, data: patch })
 *     - remove()   -> await prisma.post.delete({ where: { id: Number(id) } })
 *
 * What will remain unchanged:
 * - The interface contract: function names (findAll, findById, create, update, remove).
 * - Input signatures and return shapes (array, record/null, record, updated/null, boolean).
 * - The calling service layer (postService.js) requires zero changes.
 */

const postsMap = new Map([
  [1, { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 }],
  [2, { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 }],
]);

let nextId = 3;

function findAll() {
  return Array.from(postsMap.values()).map((post) => ({ ...post }));
}

function findById(id) {
  const post = postsMap.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const id = nextId++;
  const record = {
    id,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  postsMap.set(id, record);
  return { ...record };
}

function update(id, patch) {
  const numId = Number(id);
  const existing = postsMap.get(numId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...patch,
    id: numId,
  };
  postsMap.set(numId, updated);
  return { ...updated };
}

function remove(id) {
  const numId = Number(id);
  if (!postsMap.has(numId)) return false;
  return postsMap.delete(numId);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
