const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { userFavorites } = require('../data/store');

/**
 * GET /api/favorites
 * Mengambil daftar musik favorit unik milik pengguna yang sedang login
 */
router.get('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const list = userFavorites[userId] || [];
  return res.status(200).json({
    status: 'success',
    items: list
  });
});

/**
 * POST /api/favorites
 * Menambahkan musik ke daftar favorit unik milik pengguna yang sedang login
 */
router.post('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const music = req.body;

  if (!music || (!music.id && !music.videoId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Data musik tidak valid.'
    });
  }

  if (!userFavorites[userId]) {
    userFavorites[userId] = [];
  }

  const trackId = music.videoId || music.id;
  const exists = userFavorites[userId].some(item => (item.videoId || item.id) === trackId);
  if (!exists) {
    userFavorites[userId].unshift(music);
  }

  return res.status(201).json({
    status: 'success',
    message: 'Berhasil ditambahkan ke favorit.',
    music
  });
});

/**
 * DELETE /api/favorites/:id
 * Menghapus musik dari daftar favorit unik milik pengguna yang sedang login
 */
router.delete('/:id', requireAuth, (req, res) => {
  const userId = req.user.id;
  const musicId = req.params.id;

  if (userFavorites[userId]) {
    userFavorites[userId] = userFavorites[userId].filter(
      item => item.id !== musicId && item.videoId !== musicId
    );
  }

  return res.status(200).json({
    status: 'success',
    message: 'Berhasil dihapus dari favorit.',
    removedId: musicId
  });
});

module.exports = router;
