const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    storageBucket: process.env.CLOUD_STORAGE_BUCKET
  });
}

const firestore = admin.firestore();

module.exports = { admin, firestore };
