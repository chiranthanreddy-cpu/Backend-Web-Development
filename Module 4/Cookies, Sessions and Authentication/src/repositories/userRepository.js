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

module.exports = {
  findByEmail,
  findById,
};