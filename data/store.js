const { hashPassword } = require('../utils/password');

// In-Memory User Account Store (dapat dihubungkan ke PostgreSQL/Prisma di tahap lanjutan)
const users = [];

// Akun Demo Awal
const defaultUserId = 'usr_admin_zenvy';
users.push({
  id: defaultUserId,
  username: 'zenvy_curator',
  email: 'zenvy@music.io',
  passwordHash: hashPassword('password123'),
  role: 'Kurator Musik',
  createdAt: new Date().toISOString()
});

module.exports = {
  users
};
