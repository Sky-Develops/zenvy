const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Music Search API (/api/music/search)', () => {
  it('mengembalikan array kosong jika query kosong', async () => {
    const res = await request(app).get('/api/music/search?q=');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });

  it('mengembalikan array pencarian untuk query valid', async function() {
    this.timeout(10000);
    const res = await request(app).get('/api/music/search?q=lofi');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});
