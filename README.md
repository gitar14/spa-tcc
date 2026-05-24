# Spa Project

Spa Project memakai struktur monorepo sederhana untuk aplikasi donasi dan pengelolaan transparansi.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite + Tailwind CSS
- Database SQL: PostgreSQL
- Realtime/Log: Firestore
- Upload file: Cloud Storage
- Deploy: Cloud Run, App Engine, Cloud Build

## Struktur

- `backend/`: REST API dan integrasi database.
- `frontend/`: UI donatur dan pengurus.
- `database/schema.sql`: skema PostgreSQL.
- `cloudbuild.yaml`: contoh pipeline CI/CD.

## Menjalankan Lokal

1. Isi file `.env.example` di `backend` dan `frontend`, lalu salin menjadi `.env`.
2. Jalankan PostgreSQL dan import `database/schema.sql`.
3. Siapkan kredensial Google Cloud untuk Firestore dan Cloud Storage.
4. Jalankan backend:

```bash
cd backend
npm install
npm run dev
```

5. Jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

## Catatan

Skema Firestore digunakan untuk data realtime kebutuhan, notifikasi, bukti foto, dan timeline transparansi. Upload file disimpan di Cloud Storage, sementara data transaksi utama tetap berada di PostgreSQL.
