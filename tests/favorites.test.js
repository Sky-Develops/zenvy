const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Favorites API (/api/favorites) - iqbal-auth', () => {
  let userTokenA = '';
  let userTokenB = '';
  const testTrack = {
    id: 'track_123',
    videoId: 'wPb_miODtDI',
    title: 'Test Lo-Fi Song',
    artist: 'Chill Artist',
    channelTitle: 'Lo-Fi Records'
  };

  before(async () => {
    // Daftarkan User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user_fav_a',
        email: `fav_a_${Date.now()}@zenvy.io`,
        password: 'password123'
      });
    userTokenA = resA.body.token;

    // Daftarkan User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user_fav_b',
        email: `fav_b_${Date.now()}@zenvy.io`,
        password: 'password123'
      });
    userTokenB = resB.body.token;
  });

  describe('GET /api/favorites', () => {
    it('gagal (401) jika diakses tanpa autentikasi', async () => {
      const res = await request(app).get('/api/favorites');
      assert.equal(res.status, 401);
    });

    it('berhasil mengembalikan array favorit kosong untuk pengguna baru', async () => {
      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${userTokenA}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.ok(Array.isArray(res.body.items));
      assert.equal(res.body.items.length, 0);
    });
  });

  describe('POST /api/favorites', () => {
    it('gagal (401) jika menambah favorit tanpa token autentikasi', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .send(testTrack);
      assert.equal(res.status, 401);
    });

    it('gagal (400) jika data musik tidak memiliki id atau videoId', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send({ title: 'Invalid Song' });
      assert.equal(res.status, 400);
    });

    it('berhasil menambahkan musik ke daftar favorit user A', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${userTokenA}`)
        .send(testTrack);

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.music.id, testTrack.id);
    });

    it('isolasi data: favorit User A tidak muncul pada User B', async () => {
      const resB = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${userTokenB}`);

      assert.equal(resB.status, 200);
      assert.equal(resB.body.items.length, 0, 'Favorit User A tidak boleh bocor ke User B');
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    it('gagal (401) jika menghapus favorit tanpa token autentikasi', async () => {
      const res = await request(app).delete(`/api/favorites/${testTrack.id}`);
      assert.equal(res.status, 401);
    });

    it('berhasil menghapus musik dari favorit User A', async () => {
      const res = await request(app)
        .delete(`/api/favorites/${testTrack.id}`)
        .set('Authorization', `Bearer ${userTokenA}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');

      // Pastikan sudah terhapus
      const checkRes = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${userTokenA}`);
      assert.equal(checkRes.body.items.length, 0);
    });
  });
});
