const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Authentication API (/api/auth) - iqbal-auth', () => {
  const testUser = {
    username: 'tester_iqbal',
    email: `tester_${Date.now()}@zenvy.io`,
    password: 'password123'
  };

  let authToken = '';

  describe('POST /api/auth/register', () => {
    it('berhasil mendaftarkan pengguna baru dengan data valid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'success');
      assert.ok(res.body.token);
      assert.equal(res.body.user.username, testUser.username);
      assert.equal(res.body.user.email, testUser.email);
      assert.ok(!res.body.user.passwordHash, 'Password hash tidak boleh bocor ke client');
    });

    it('gagal mendaftar jika username terlalu pendek (< 3 karakter)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', email: 'test@zenvy.io', password: 'password123' });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });

    it('gagal mendaftar jika format email tidak valid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'bukan-email', password: 'password123' });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });

    it('gagal mendaftar jika password terlalu pendek (< 6 karakter)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'valid@zenvy.io', password: '123' });

      assert.equal(res.status, 400);
      assert.equal(res.body.status, 'error');
    });

    it('gagal mendaftar jika email sudah terdaftar sebelumnya (duplikasi)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      assert.equal(res.status, 409);
      assert.equal(res.body.status, 'error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('berhasil login dengan kredensial yang tepat', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.ok(res.body.token);
      authToken = res.body.token;
    });

    it('gagal login jika password salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongPassword' });

      assert.equal(res.status, 401);
      assert.equal(res.body.status, 'error');
    });

    it('gagal login jika email tidak terdaftar', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@zenvy.io', password: 'password123' });

      assert.equal(res.status, 401);
    });

    it('gagal login jika kolom email atau password kosong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      assert.equal(res.status, 400);
    });
  });

  describe('GET /api/auth/me (Protected Endpoint)', () => {
    it('berhasil mengambil data profil jika menyertakan token valid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.equal(res.body.user.email, testUser.email);
    });

    it('gagal (401) jika mengakses tanpa header Authorization', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      assert.equal(res.status, 401);
      assert.equal(res.body.status, 'error');
    });

    it('gagal (401) jika token palsu atau kedaluwarsa', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_palsu_random.abc.123');

      assert.equal(res.status, 401);
      assert.equal(res.body.status, 'error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('berhasil melakukan logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
    });
  });
});
