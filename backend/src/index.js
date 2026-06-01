require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./config/firestore');
require('./config/storage');
require('./schema');

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const startServer = async () => {
  try {
    console.log("STEP 1");

    await sequelize.authenticate();
    console.log("AUTH SUCCESS");

    console.log("STEP 2");

    await sequelize.sync();
    console.log("SYNC SUCCESS");

    console.log("STEP 3");

    app.listen(PORT, () => {
      console.log(`Backend Spa aktif di port ${PORT}`);
    });
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();
