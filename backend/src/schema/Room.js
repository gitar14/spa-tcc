const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomSchema = sequelize.define('Room', {
  room_number: { type: DataTypes.STRING(10), allowNull: false },
  type: { type: DataTypes.STRING(20), allowNull: false }
}, { tableName: 'rooms', timestamps: false });

module.exports = RoomSchema;
