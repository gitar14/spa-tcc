const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./config/firestore');
require('./config/storage');
require('./schema');
require('dotenv').config();

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Backend Spa aktif di port ${PORT}`);
    });
  } catch (error) {
    console.error('Backend gagal aktif:', error.message);
    process.exit(1);
  }
};

startServer();
