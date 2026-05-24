# Spa Project

Spa Project memakai struktur monorepo sederhana untuk aplikasi Sistem pemesanan jam perawatan kecantikan dengan pilihan terapis.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite + Tailwind CSS
- Mobile: Flutter
- Database SQL: PostgreSQL
- Realtime/Log: Firestore
- Upload file: Cloud Storage
- Deploy: Cloud Run, App Engine, Cloud Build

## Struktur

- `backend/`: REST API dan integrasi database.
- `frontend/`: UI donatur dan pengurus.
- `mobile/`: aplikasi mobile Flutter yang terhubung ke backend API.
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

6. Jalankan mobile:

```bash
cd mobile
flutter pub get
flutter run
```

Untuk Android emulator, mobile memakai `http://10.0.2.2:8080/api`. Saat backend sudah deploy ke Cloud Run, jalankan mobile dengan:

```bash
flutter run --dart-define=API_BASE_URL=https://URL-BACKEND-CLOUD-RUN/api
```

## Catatan

Skema Firestore digunakan untuk data realtime kebutuhan, notifikasi, bukti foto, dan timeline transparansi. Upload file disimpan di Cloud Storage, sementara data transaksi utama tetap berada di PostgreSQL.
