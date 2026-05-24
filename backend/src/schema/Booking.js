const { DataTypes } = require('sequelize');
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
}, { tableName: 'bookings', timestamps: false });

module.exports = BookingSchema;
