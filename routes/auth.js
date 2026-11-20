const express = require('express');
const router = express.Router();
const { users } = require('../data/store');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Pendaftaran pengguna baru ZENVY
 */
router.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || typeof username !== 'string' || usernameakun.trim().length < 3) {
    return res.status(400).json({
      status: 'error',
      message: 'Username minimal 3 karakter.'
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Format email tidak valid.'
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Kata sandi minimal 6 karakter.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({
      status: 'error',
      message: 'Email sudah terdaftar dalam sistem.'
    });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    username: username.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: 'Pengguna',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const token = signToken({ id: newUser.id, email: newUser.email, username: newUser.username });
  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role
  };

  return res.status(201).json({
    status: 'success',
    message: 'Registrasi berhasil.',
    token,
    user: safeUser
  });
});

/**
 * POST /api/auth/login
 * Masuk pengguna terdaftar ZENVY
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email dan kata sandi wajib diisi.'
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      status: 'error',
      message: 'Email atau kata sandi tidak sesuai.'
    });
  }

  const token = signToken({ id: user.id, email: user.email, username: user.username });
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  return res.status(200).json({
    status: 'success',
    message: 'Login berhasil.',
    token,
    user: safeUser
  });
});

/**
 * GET /api/auth/me
 * Mengambil informasi profil pengguna yang sedang login
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    status: 'success',
    ...req.user,
    user: req.user
  });
});

/**
 * POST /api/auth/logout
 * Keluar dari sistem
 */
router.post('/logout', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Logout berhasil.'
  });
});

module.exports = router;
