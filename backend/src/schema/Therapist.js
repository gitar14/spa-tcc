const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TherapistSchema = sequelize.define('Therapist', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  specialization: { type: DataTypes.STRING(100), allowNull: false }
}, { tableName: 'therapists', timestamps: false });

module.exports = TherapistSchema;
