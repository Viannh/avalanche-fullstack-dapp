# Panduan Deployment (Deployment Guide)

Dokumen ini menjelaskan cara men-deploy Aplikasi Avalanche Fullstack (Frontend & Backend).

## Persiapan File dan Git

Sebelum men-deploy, pastikan Anda **TIDAK** meng-upload file-file sensitif atau file hasil build lokal ke GitHub. Hosting provider akan melakukan build sendiri.

### File yang DILARANG di-upload (Harus di-ignore)
Pastikan file/folder berikut masuk ke dalam `.gitignore`:

**Backend (`docs/day-5/dapps/backend/.gitignore`):**
```text
/node_modules
/dist
.env
```

**Frontend (`docs/day-5/dapps/frontend/my-app/.gitignore`):**
```text
/node_modules
/.next
/out
/build
.env.local
.env
```

### File yang WAJIB ada di GitHub
- `package.json` (Untuk Backend dan Frontend)
- `package-lock.json`
- Source code (`src/` folder untuk backend, `app/` folder untuk frontend)
- `tsconfig.json`

---

## 1. Backend Deployment (Railway)

Kita menggunakan Railway untuk men-deploy NestJS Backend.

1.  **Push Code**: Push kode Anda ke GitHub.
2.  **Buat Project**: Login ke [Railway dashboard](https://railway.app/), klik "New Project" -> "Deploy from GitHub repo".
3.  **Pilih Repo**: Pilih repository GitHub Anda.
4.  **Konfigurasi Directory**:
    *   Railway akan mendeteksi file project.
    *   Karena project kita ada di dalam subfolder, klik **Settings** pada service yang baru dibuat.
    *   Cari bagian **Root Directory** dan ubah menjadi: `docs/day-5/dapps/backend`
5.  **Environment Variables**:
    *   Buka tab **Variables**.
    *   Masukkan variable berikut (sesuai isi `.env` lokal Anda):
        *   `PORT`: `3000`
        *   `CONTRACT_ADDRESS`: `0x6203c6a2873ed450d852971f6c6c5e02125ef46e`
        *   `RPC_URL`: `https://api.avax-test.network/ext/bc/C/rpc`
6.  **Build & Start**:
    *   Railway biasanya otomatis mendeteksi. Jika tidak:
    *   Build Command: `npm install && npm run build`
    *   Start Command: `npm run start:prod`
7.  **Dapatkan URL**:
    *   Buka tab **Settings** -> **Networking**.
    *   Klik "Generate Domain".
    *   Copy URL public yang muncul (contoh: `https://backend-production.up.railway.app`).

---

## 2. Frontend Deployment (Vercel)

Kita menggunakan Vercel untuk men-deploy Next.js Frontend.

1.  **Import Project**: Login ke [Vercel](https://vercel.com/), klik "Add New..." -> "Project".
2.  **Pilih Repo**: Import repository GitHub yang sama.
3.  **Konfigurasi Directory**:
    *   Pada bagian **Root Directory**, klik "Edit".
    *   Pilih folder: `docs/day-5/dapps/frontend/my-app`.
4.  **Environment Variables**:
    *   Buka bagian **Environment Variables**.
    *   Masukkan variable berikut:
        *   `NEXT_PUBLIC_CONTRACT_ADDRESS`: `0x6203c6a2873ed450d852971f6c6c5e02125ef46e`
        *   `NEXT_PUBLIC_BACKEND_URL`: **Paste URL Backend Railway** dari langkah sebelumnya (Hapus tanda slash `/` di akhir, contoh: `https://backend-production.up.railway.app`).
5.  **Deploy**: Klik tombol **Deploy**.

---

## 3. Verifikasi Akhir

Setelah keduanya aktif:
1.  Buka URL Frontend dari Vercel.
2.  Tunggu beberapa saat, pastikan bagian **Backend Data** memunculkan angka (tidak loading terus-menerus).
    *   Jika muncul data, artinya Frontend sukses "ngobrol" dengan Backend.
3.  Coba **Connect Wallet** dan lakukan transaki **Update Value**.
4.  Setelah transaksi sukses, pastikan angka di Backend Data juga ikut berubah.

### Troubleshooting
- **CORS Error**: Jika di console browser ada error merah "CORS policy", pastikan di backend `main.ts` sudah ada `app.enableCors()`.
- **Backend Error**: Cek logs di Railway jika backend tidak berjalan (Application Logs).
