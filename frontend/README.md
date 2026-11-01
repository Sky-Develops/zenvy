# ZENVY — Frontend Web Application
> **Find Your Frequency**  
> Developed by **Rizki** (Frontend Developer) — Branch `rizky-frontend`

ZENVY adalah platform eksplorasi musik dan manajemen playlist modern berbasis React dengan YouTube IFrame Player API.

---

## 🎧 Fitur Utama Frontend

1. **Autentikasi (Login & Register)**
   - Validasi form interaktif (client-side & server response).
   - Penanganan error state, loading state, dan penyimpanan JWT token.
   - Fallback authentication flow untuk pengujian lokal mandiri.

2. **Homepage & Music Search**
   - Discovery hero banner bertema Dark Charcoal & Electric Violet.
   - Kolom pencarian musik terintegrasi ke backend REST API (YouTube Data API v3).
   - Filter tag frekuensi cepat (Lofi Beats, Synthwave, Deep Focus, Cyberpunk, dll).
   - Loading indicator, empty state, dan kartu musik interaktif.

3. **Music Detail & YouTube Player**
   - Integrasi resmi **YouTube IFrame Player API** (tanpa ekstraksi MP3 / download ilegal).
   - Pemutar persisten (Bottom Bar Player) yang memungkinkan pengguna mendengarkan sambil menjelajah.
   - Expandable video mode, play/pause controls, dan penanganan video restricted/error.

4. **Favorites Management**
   - Menyimpan musik favorit ke backend.
   - Quick Play All, filter/pencarian di dalam daftar favorit, dan hapus dari favorit.

5. **Playlists Management**
   - Membuat playlist kustom (nama & deskripsi).
   - Menambahkan lagu dari kartu musik atau halaman detail musik.
   - Mengelola dan menghapus lagu dari playlist.

---

## 🛠️ Persyaratan Lingkungan

- **Node.js**: `v18+` atau `v20+` (LTS direkomendasikan)
- **npm**: `v9+` atau `v10+`

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Masuk ke direktori frontend**:
   ```bash
   cd frontend
   ```

2. **Salin file environment variable**:
   ```bash
   cp .env.example .env
   ```
   Atau di Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Instal dependensi**:
   ```bash
   npm install
   ```

4. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Build untuk production**:
   ```bash
   npm run build
   ```

6. **Jalankan Automated Tests**:
   ```bash
   npm test
   ```

---

## 📡 Dokumen Kontrak REST API Backend

Frontend berkomunikasi dengan backend melalui REST API pada `VITE_API_BASE_URL` (default: `http://localhost:5000/api`).

| Modul | Method | Endpoint | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Mendaftarkan user `{ username, email, password }` |
| **Auth** | `POST` | `/auth/login` | Login user `{ email, password }` $\rightarrow$ `{ token, user }` |
| **Auth** | `GET` | `/auth/me` | Memeriksa sesi profil (`Bearer <token>`) |
| **Music** | `GET` | `/music/search?q={query}` | Mengambil daftar video YouTube via YouTube Data API v3 |
| **Music** | `GET` | `/music/:id` | Mengambil detail metadata video |
| **Favorites** | `GET` | `/favorites` | Mendapatkan daftar lagu favorit user |
| **Favorites** | `POST` | `/favorites` | Menambahkan lagu favorit `{ videoId, title, channelTitle, thumbnailUrl }` |
| **Favorites** | `DELETE`| `/favorites/:id` | Menghapus lagu dari favorit |
| **Playlists** | `GET` | `/playlists` | Mendapatkan daftar playlist pribadi user |
| **Playlists** | `POST` | `/playlists` | Membuat playlist baru `{ name, description }` |
| **Playlists** | `GET` | `/playlists/:id` | Detail playlist beserta daftar lagu di dalamnya |
| **Playlists** | `POST` | `/playlists/:id/tracks` | Menambahkan lagu ke playlist |
| **Playlists** | `DELETE`| `/playlists/:id/tracks/:trackId` | Menghapus lagu dari playlist |

> *Catatan: Jika backend belum aktif, frontend secara otomatis mengaktifkan mode adapter (curated mock data & local storage cache) sehingga antarmuka tetap 100% responsif dan dapat diuji.*

---

## 🧪 Struktur Pengujian Otomatis

Pengujian unit dan komponen berada di direktori `src/test/`:
- `src/test/Navbar.test.jsx`: Pengujian rendering menu, link navigasi, dan interaksi auth.
- `src/test/SearchBar.test.jsx`: Pengujian input form, trigger pencarian, dan quick tag.
- `src/test/MusicCard.test.jsx`: Pengujian kartu musik, tombol play, dan toggle favorit.

