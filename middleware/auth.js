const { verifyToken } = require('../utils/jwt');
const { users } = require('../data/store');

/**
 * Middleware untuk memproteksi endpoint yang membutuhkan otorisasi (Bearer Token)
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid atau telah kedaluwarsa.'
    });
  }

  const user = users.find(u => u.id === decoded.id);
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Pengguna tidak ditemukan dalam sistem.'
    });
  }

  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  next();
}

module.exports = {
  requireAuth
};
