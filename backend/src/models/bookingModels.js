const { Booking, User, Therapist, Service, Room } = require('../schema');
const buildCrudModel = require('./crudFactory');
const { firestore } = require('../config/firestore');

const baseModel = buildCrudModel(Booking);

const bookingModel = {
  ...baseModel,
  getAll: async () => Booking.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email', 'role'] },
      { model: Therapist, attributes: ['id', 'name', 'specialization'] },
      { model: Service, attributes: ['id', 'name', 'duration_minutes', 'price'] },
      { model: Room, attributes: ['id', 'room_number', 'type'] }
    ],
    order: [['booking_time', 'DESC']]
  }),
  createBooking: async (payload) => {
    const therapistId = payload.therapist_id;
    const serviceId = payload.service_id;
    const statusRef = firestore.collection('therapist_status').doc(String(therapistId));
    const slotRef = firestore.collection('booking_slots').doc(`${therapistId}_${payload.booking_time}`);

    const currentStatus = await statusRef.get();
    if (currentStatus.exists && currentStatus.data().status === 'Busy') {
      await firestore.collection('active_booking_queue').add({
          user_id: payload.user_id,
          therapist_id: therapistId,
          requested_at: new Date().toISOString(),
          reason: 'Terapis favorit sedang sibuk'
        });
      throw new Error('Terapis pilihan sedang melayani pelanggan lain. Pelanggan masuk antrean aktif.');
    }

    const newBooking = await Booking.create({
      ...payload,
      status: payload.status || 'Pending'
    });

    await statusRef.set({ status: 'Busy', updated_at: new Date().toISOString() }, { merge: true });
    await slotRef.set({ status: 'Reserved', booking_id: newBooking.id, updated_at: new Date().toISOString() });
    await firestore.collection('active_booking_queue').add({
      message: `Booking #${newBooking.id} - Terapis ${therapistId}`,
      created_at: new Date().toISOString()
    });
    await firestore.collection('notifications').add({
      user_id: Number(payload.user_id),
      message: `Booking #${newBooking.id} berhasil dibuat.`,
      created_at: new Date().toISOString()
    });
    if (serviceId) {
      await firestore.collection('user_preferences').doc(String(payload.user_id)).set({
        last_service_id: Number(serviceId),
        updated_at: new Date().toISOString()
      }, { merge: true });
    }

    return newBooking;
  },
  finishBooking: async (id) => {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    await booking.update({ status: 'Done' });
    await firestore.collection('therapist_status').doc(String(booking.therapist_id)).set({
      status: 'Available',
      updated_at: new Date().toISOString()
    }, { merge: true });
    await firestore.collection('notifications').add({
      user_id: Number(booking.user_id),
      message: `Booking #${id} selesai. Silakan beri rating.`,
      created_at: new Date().toISOString()
    });
    return booking;
  },
  getLiveQueue: async () => {
    const snapshot = await firestore.collection('active_booking_queue').orderBy('created_at', 'desc').limit(50).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  getAvailableSlot: async (therapistId, bookingTime) => {
    const slotDoc = await firestore.collection('booking_slots').doc(`${therapistId}_${bookingTime}`).get();
    const therapistDoc = await firestore.collection('therapist_status').doc(String(therapistId)).get();
    const slotStatus = slotDoc.exists ? slotDoc.data().status : null;
    const therapistStatus = therapistDoc.exists ? therapistDoc.data().status : null;
    return {
      therapist_id: Number(therapistId),
      booking_time: bookingTime,
      available: slotStatus !== 'Reserved' && therapistStatus !== 'Busy',
      therapist_status: therapistStatus || 'Available'
    };
  },
  getUserNotifications: async (userId) => {
    const snapshot = await firestore.collection('notifications')
      .where('user_id', '==', Number(userId))
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  getUserPreference: async (userId) => {
    const doc = await firestore.collection('user_preferences').doc(String(userId)).get();
    return {
      user_id: Number(userId),
      last_service_id: doc.exists ? doc.data().last_service_id : null
    };
  }
};

module.exports = bookingModel;
