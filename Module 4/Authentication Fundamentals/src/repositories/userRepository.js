const prisma = require('../db/prisma');

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

async function create({ email, name, passwordHash }) {
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });
}

module.exports = {
  findByEmail,
  findById,
  create,
};