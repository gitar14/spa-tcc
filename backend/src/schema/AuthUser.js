const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthUserSchema = sequelize.define('AuthUser', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('Receptionist', 'Customer'),
    defaultValue: 'Customer'
  }
}, { tableName: 'auth_users', timestamps: true });

module.exports = AuthUserSchema;
