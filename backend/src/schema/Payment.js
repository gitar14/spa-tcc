const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentSchema = sequelize.define('Payment', {
  booking_id: DataTypes.INTEGER,
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('Unpaid', 'Paid'),
    defaultValue: 'Unpaid'
  }
}, { tableName: 'payments', timestamps: false });

module.exports = PaymentSchema;
