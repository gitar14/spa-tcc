const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const BookingSchema = sequelize.define('Booking', {
  user_id: DataTypes.INTEGER,
  therapist_id: DataTypes.INTEGER,
  service_id: DataTypes.INTEGER,
  room_id: DataTypes.INTEGER,
  booking_time: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('Pending', 'In_Progress', 'Done'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'bookings',
  timestamps: false,
  indexes: [
    // Partial unique index: mencegah 1 terapis punya 2 booking aktif di jam yang sama,
    // berlaku di level database sehingga aman dari race condition (tidak bisa dibobol
    // walau dua request datang persis bersamaan). Booking dengan status 'Done' tidak
    // dihitung karena slotnya sudah selesai/bebas lagi.
    {
      unique: true,
      fields: ['therapist_id', 'booking_time'],
      where: { status: { [Op.in]: ['Pending', 'In_Progress'] } },
      name: 'unique_active_therapist_booking'
    },
    {
      unique: true,
      fields: ['room_id', 'booking_time'],
      where: { status: { [Op.in]: ['Pending', 'In_Progress'] } },
      name: 'unique_active_room_booking'
    }
  ]
});

module.exports = BookingSchema;
