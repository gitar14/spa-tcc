const { firestore } = require('../config/firestore');

class FirestoreService {
  async updateTherapistStatus(therapistId, status, bookingId = null) {
    const docRef = firestore.collection('therapist_status').doc(therapistId.toString());
    
    await docRef.set({
      therapist_id: therapistId,
      current_status: status,
      current_booking_id: bookingId,
      estimated_available: status === 'Busy' && bookingId ? 
        new Date(Date.now() + 90 * 60 * 1000) : null,
      updated_at: new Date()
    });
  }

  async getAvailableSlots(date, therapistId) {
    const docRef = firestore.collection('available_slots')
      .doc(`${date}_${therapistId}`);
    
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const cacheAge = Date.now() - data.updated_at.toMillis();
      if (cacheAge < 5 * 60 * 1000) {
        return data.slots;
      }
    }
    
    return null;
  }

  async setAvailableSlots(date, therapistId, slots) {
    const docRef = firestore.collection('available_slots')
      .doc(`${date}_${therapistId}`);
    
    await docRef.set({
      date,
      therapist_id: therapistId,
      slots,
      updated_at: new Date()
    });
  }

  async sendNotification(userId, type, message) {
    await firestore.collection('notifications').add({
      user_id: userId,
      type,
      message,
      read: false,
      created_at: new Date()
    });
  }

  async addToQueue(bookingId, customerName, therapistName, estimatedFinish) {
    await firestore.collection('active_queue').doc(bookingId.toString()).set({
      booking_id: bookingId,
      customer_name: customerName,
      therapist_name: therapistName,
      status: 'In_Progress',
      estimated_finish: estimatedFinish,
      created_at: new Date()
    });
  }

  async removeFromQueue(bookingId) {
    await firestore.collection('active_queue')
      .doc(bookingId.toString())
      .delete();
  }
}

module.exports = new FirestoreService();
