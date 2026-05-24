const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceSchema = sequelize.define('Service', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'services', timestamps: false });

module.exports = ServiceSchema;
