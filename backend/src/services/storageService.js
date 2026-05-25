const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'd-30-488909'
});

const bucketPaymentProofs = storage.bucket(
  process.env.BUCKET_PAYMENT_PROOFS || 'spa-tcc-payment-proofs-d30'
);

// Upload payment proof
const uploadPaymentProof = async (file, bookingId) => {
  try {
    const timestamp = Date.now();
    const filename = `payment_${bookingId}_${timestamp}${path.extname(file.originalname)}`;
    
    const blob = bucketPaymentProofs.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          bookingId: bookingId.toString(),
          uploadedAt: new Date().toISOString()
        }
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        // Make file publicly accessible
        await blob.makePublic();
        
        const publicUrl = `https://storage.googleapis.com/${bucketPaymentProofs.name}/${filename}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error in uploadPaymentProof:', error);
    throw error;
  }
};

module.exports = {
  uploadPaymentProof
};
