const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

class StorageService {
  async uploadFile(file, bucketName, folder) {
    const bucket = storage.bucket(bucketName);
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }
}

module.exports = new StorageService();
