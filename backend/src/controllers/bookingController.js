const { Booking, User, Therapist, Service, Room } = require('../models');
const { updateTherapistStatus, addToQueue, removeFromQueue } = require('../services/firestoreService');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Therapist, attributes: ['id', 'name', 'specialization'] },
        { model: Service, attributes: ['id', 'name', 'duration_minutes', 'price'] },
        { model: Room, attributes: ['id', 'room_number', 'type'] }
      ],
      order: [['booking_time', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Create new booking with Firestore sync
exports.createBooking = async (req, res) => {
  try {
    const { user_id, therapist_id, service_id, room_id, booking_time } = req.body;

    // Validate required fields
    if (!user_id || !therapist_id || !service_id || !room_id || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create booking in PostgreSQL
    const booking = await Booking.create({
      user_id,
      therapist_id,
      service_id,
      room_id,
      booking_time,
      status: 'Confirmed'
    });

    // Get booking with relations
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Therapist, attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] },
        { model: Room, attributes: ['id', 'room_number'] }
      ]
    });

    // Update Firestore: set therapist as busy
    try {
      await updateTherapistStatus(therapist_id, 'busy');
      
      // Add to active queue in Firestore
      await addToQueue({
        booking_id: booking.id,
        therapist_id,
        therapist_name: bookingWithDetails.Therapist.name,
        user_name: bookingWithDetails.User.name,
        service_name: bookingWithDetails.Service.name,
        room_number: bookingWithDetails.Room.room_number,
        status: 'In Progress',
        created_at: new Date().toISOString()
      });

      console.log(`✅ Firestore updated: Therapist ${therapist_id} set to busy, added to queue`);
    } catch (firestoreError) {
      console.error('⚠️ Firestore sync failed (booking still created in PostgreSQL):', firestoreError);
      // Don't fail the whole request if Firestore fails
    }

    res.status(201).json(bookingWithDetails);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Finish booking with Firestore sync
exports.finishBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status in PostgreSQL
    await booking.update({ status: 'Done' });

    // Update Firestore: set therapist as available
    try {
      await updateTherapistStatus(booking.therapist_id, 'available');
      
      // Remove from queue
      await removeFromQueue(id);

      console.log(`✅ Firestore updated: Therapist ${booking.therapist_id} set to available, removed from queue`);
    } catch (firestoreError) {
      console.error('⚠️ Firestore sync failed:', firestoreError);
    }

    res.json({ message: 'Booking finished', booking });
  } catch (error) {
    console.error('Error finishing booking:', error);
    res.status(500).json({ error: 'Failed to finish booking' });
  }
};

// Get active queue from Firestore
exports.getQueue = async (req, res) => {
  try {
    const { getActiveQueue } = require('../services/firestoreService');
    const queue = await getActiveQueue();
    res.json({ live_queue: queue });
  } catch (error) {
    console.error('Error getting queue:', error);
    res.status(500).json({ error: 'Failed to get queue', live_queue: [] });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Therapist, attributes: ['id', 'name', 'specialization'] },
        { model: Service, attributes: ['id', 'name', 'duration_minutes', 'price'] },
        { model: Room, attributes: ['id', 'room_number', 'type'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.update(req.body);
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Remove from Firestore queue before deleting
    try {
      await removeFromQueue(id);
      await updateTherapistStatus(booking.therapist_id, 'available');
    } catch (firestoreError) {
      console.error('⚠️ Firestore cleanup failed:', firestoreError);
    }

    await booking.destroy();
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};