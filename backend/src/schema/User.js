const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSchema = sequelize.define('User', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  role: {
    type: DataTypes.ENUM('Receptionist', 'Customer'),
    defaultValue: 'Customer'
  }
}, { tableName: 'users', timestamps: false });

module.exports = UserSchema;
