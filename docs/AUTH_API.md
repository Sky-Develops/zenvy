# Dokumentasi Backend Authentication API — ZENVY
**Penanggung Jawab:** Iqbal (`iqbal-auth`)  
**Fokus Tugas:** Backend Authentication (Register, Login, Me, Logout, Proteksi Endpoint, dan Pengujian Otomatis)

---

## 1. Variabel Konfigurasi (`.env`)
Salin file `.env.example` menjadi `.env` sebelum menjalankan server:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

---

## 2. Daftar Endpoint Autentikasi

### A. Registrasi Pengguna Baru
* **Endpoint:** `POST /api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "username": "iqbal_dev",
    "email": "iqbal@zenvy.io",
    "password": "password123"
  }
  ```
* **Validasi Input:**
  * `username`: Minimal 3 karakter.
  * `email`: Format email standar (`name@domain.ext`).
  * `password`: Minimal 6 karakter.
* **Response Sukses (`201 Created`):**
  ```json
  {
    "status": "success",
    "message": "Registrasi berhasil.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1730554800000_abc12",
      "username": "iqbal_dev",
      "email": "iqbal@zenvy.io",
      "role": "Pengguna"
    }
  }
  ```
* **Response Error:**
  * `400 Bad Request`: Input tidak memenuhi kriteria validasi.
  * `409 Conflict`: Email sudah terdaftar.

---

### B. Login Pengguna
* **Endpoint:** `POST /api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "iqbal@zenvy.io",
    "password": "password123"
  }
  ```
* **Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "Login berhasil.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1730554800000_abc12",
      "username": "iqbal_dev",
      "email": "iqbal@zenvy.io",
      "role": "Pengguna"
    }
  }
  ```
* **Response Error:**
  * `400 Bad Request`: Kolom email atau password kosong.
  * `401 Unauthorized`: Email tidak terdaftar atau password salah.

---

### C. Profil Pengguna yang Sedang Login (Protected)
* **Endpoint:** `GET /api/auth/me`
* **Headers:** 
  * `Authorization: Bearer <TOKEN_JWT>`
* **Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "user": {
      "id": "usr_1730554800000_abc12",
      "username": "iqbal_dev",
      "email": "iqbal@zenvy.io",
      "role": "Pengguna"
    }
  }
  ```
* **Response Error:**
  * `401 Unauthorized`: Header Authorization tidak disertakan, format token salah, atau token kedaluwarsa.

---

### D. Logout Pengguna
* **Endpoint:** `POST /api/auth/logout`
* **Response Sukses (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "Logout berhasil."
  }
  ```

---

## 3. Menjalankan Pengujian Otomatis (Testing)
Untuk menjalankan seluruh skenario pengujian unit & integrasi autentikasi:
```bash
npm test
```
