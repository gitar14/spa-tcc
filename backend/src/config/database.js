const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'spa_db',
  process.env.DB_USER || 'spa_user',
  process.env.DB_PASSWORD || 'SpaSecure2024!',
  {
    host: process.env.DB_HOST || '136.111.178.140',
    port: process.env.DB_PORT || 5432,  // ← POSTGRESQL PORT!
    dialect: 'postgres',  // ← POSTGRESQL!
    logging: false
  }
);

module.exports = sequelize;
