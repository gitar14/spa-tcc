require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./config/firestore');
require('./config/storage');
require('./schema');

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const startServer = async () => {
  try {
    console.log("STEP 1");

    await sequelize.authenticate();
    console.log("AUTH SUCCESS");

    console.log("STEP 2");

    await sequelize.sync();
    console.log("SYNC SUCCESS");

    // sequelize.sync() tidak menambahkan index baru ke tabel yang sudah ada,
    // jadi index unik untuk mencegah double-booking dibuat manual di sini.
    // IF NOT EXISTS membuat ini aman dijalankan berulang kali setiap server start.
    try {
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_active_therapist_booking
        ON bookings (therapist_id, booking_time)
        WHERE status IN ('Pending', 'In_Progress')
      `);
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_active_room_booking
        ON bookings (room_id, booking_time)
        WHERE status IN ('Pending', 'In_Progress')
      `);
      console.log("✅ Double-booking unique indexes ready");
    } catch (indexError) {
      // Kalau gagal, kemungkinan besar karena SUDAH ADA data duplikat di tabel
      // bookings saat ini (booking bentrok yang lama, sebelum fix ini dipasang).
      // Index unik tidak bisa dibuat selama data yang melanggar constraint masih ada.
      console.error("⚠️ GAGAL membuat unique index anti double-booking:", indexError.message);
      console.error("⚠️ Kemungkinan ada data booking bentrok (duplikat) yang harus dibersihkan dulu.");
      console.error("⚠️ Jalankan query ini untuk menemukan duplikatnya:");
      console.error(`
        SELECT therapist_id, booking_time, COUNT(*), array_agg(id) AS booking_ids
        FROM bookings
        WHERE status IN ('Pending', 'In_Progress')
        GROUP BY therapist_id, booking_time
        HAVING COUNT(*) > 1;
      `);
      // Server tetap dijalankan meski index gagal dibuat, supaya tidak downtime.
      // Tapi proteksi anti double-booking di level DB BELUM aktif sampai ini di-fix.
    }

    console.log("STEP 3");

    app.listen(PORT, () => {
      console.log(`Backend Spa aktif di port ${PORT}`);
    });
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();
