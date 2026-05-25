const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'd-30-488909'
});

// Collection references
const therapistStatusCollection = firestore.collection('therapist_status');
const activeQueueCollection = firestore.collection('active_queue');

// Update therapist status
async function updateTherapistStatus(therapistId, status) {
  try {
    await therapistStatusCollection.doc(String(therapistId)).set({
      therapist_id: therapistId,
      status: status,
      updated_at: Firestore.Timestamp.now()
    }, { merge: true });
    
    console.log(`Firestore: Therapist ${therapistId} status updated to ${status}`);
  } catch (error) {
    console.error('Firestore updateTherapistStatus error:', error);
    throw error;
  }
}

// Add booking to active queue
async function addToQueue(queueItem) {
  try {
    const docRef = activeQueueCollection.doc(String(queueItem.booking_id));
    await docRef.set({
      ...queueItem,
      created_at: Firestore.Timestamp.now()
    });
    
    console.log(`Firestore: Added booking ${queueItem.booking_id} to queue`);
  } catch (error) {
    console.error('Firestore addToQueue error:', error);
    throw error;
  }
}

// Remove booking from active queue
async function removeFromQueue(bookingId) {
  try {
    await activeQueueCollection.doc(String(bookingId)).delete();
    console.log(`Firestore: Removed booking ${bookingId} from queue`);
  } catch (error) {
    console.error('Firestore removeFromQueue error:', error);
    throw error;
  }
}

// Get active queue
async function getActiveQueue() {
  try {
    const snapshot = await activeQueueCollection.orderBy('created_at', 'desc').get();
    
    if (snapshot.empty) {
      return [];
    }

    const queue = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      queue.push({
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate().toISOString()
      });
    });

    return queue;
  } catch (error) {
    console.error('Firestore getActiveQueue error:', error);
    return [];
  }
}

// Get therapist status
async function getTherapistStatus(therapistId) {
  try {
    const doc = await therapistStatusCollection.doc(String(therapistId)).get();
    
    if (!doc.exists) {
      return { status: 'available' };
    }

    return doc.data();
  } catch (error) {
    console.error('Firestore getTherapistStatus error:', error);
    return { status: 'available' };
  }
}

module.exports = {
  updateTherapistStatus,
  addToQueue,
  removeFromQueue,
  getActiveQueue,
  getTherapistStatus
};