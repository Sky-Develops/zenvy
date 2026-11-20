const crypto = require('crypto');

/**
 * Hash password menggunakan crypto.scrypt bawaan Node.js (aman, tanpa dependensi eksternal)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifikasi password dengan hash yang tersimpan
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return crypto.timingSafeEqual(derivedKey, keyBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword
};
