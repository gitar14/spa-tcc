const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RatingSchema = sequelize.define('Rating', {
  booking_id: DataTypes.INTEGER,
  score: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  review: DataTypes.TEXT
}, { tableName: 'ratings', timestamps: false });

module.exports = RatingSchema;
