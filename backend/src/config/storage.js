const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT
});

const bucketName = process.env.CLOUD_STORAGE_BUCKET || '';
const bucket = bucketName ? storage.bucket(bucketName) : null;

module.exports = { storage, bucket };
