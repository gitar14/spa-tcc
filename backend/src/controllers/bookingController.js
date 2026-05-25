const { Booking, User, Therapist, Service, Room } = require('../schema');
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

// Create booking with name & phone (auto-create user)
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, therapist_id, service_id, room_id, booking_time } = req.body;

    console.log('📥 CREATE BOOKING:', { name, phone, therapist_id, service_id, room_id, booking_time });

    if (!name || !phone || !therapist_id || !service_id || !room_id || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create user by phone
    let user = await User.findOne({ where: { phone } });
    
    if (!user) {
      user = await User.create({
        name,
        email: `${phone}@customer.spa`,
        phone,
        role: 'Customer',
        password: 'customer123'
      });
      console.log(`✅ NEW USER: ${user.id}`);
    } else {
      console.log(`✅ EXISTING USER: ${user.id}`);
    }

    // Create booking
    const booking = await Booking.create({
      user_id: user.id,
      therapist_id,
      service_id,
      room_id,
      booking_time: new Date(booking_time),
      status: 'Pending'
    });

    console.log(`✅ BOOKING: ${booking.id}`);

    const result = await Booking.findByPk(booking.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'phone'] },
        { model: Therapist, attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Room, attributes: ['id', 'room_number'] }
      ]
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('❌ ERROR:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

// Get today's bookings
exports.getTodayBookings = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const Op = Sequelize.Op;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.findAll({
      where: {
        booking_time: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Therapist, attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name', 'duration_minutes', 'price'] },
        { model: Room, attributes: ['id', 'room_number', 'type'] }
      ],
      order: [['booking_time', 'ASC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch today bookings' });
  }
};

// Start booking
exports.startBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [User, Therapist, Service, Room]
    });

    if (!booking || booking.status !== 'Pending') {
      return res.status(400).json({ error: 'Invalid booking' });
    }

    await booking.update({ status: 'In_Progress' });
    await updateTherapistStatus(booking.therapist_id, 'busy');
    await addToQueue({
      booking_id: booking.id,
      therapist_name: booking.Therapist.name,
      user_name: booking.User.name,
      service_name: booking.Service.name,
      room_number: booking.Room.room_number,
      status: 'In_Progress'
    });

    res.json({ message: 'Booking started', booking });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to start booking' });
  }
};

// Finish booking
exports.finishBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.update({ status: 'Done' });
    await updateTherapistStatus(booking.therapist_id, 'available');
    await removeFromQueue(booking.id);

    res.json({ message: 'Booking finished', booking });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to finish booking' });
  }
};

// Get queue
exports.getQueue = async (req, res) => {
  try {
    const { getActiveQueue } = require('../services/firestoreService');
    const queue = await getActiveQueue();
    res.json({ live_queue: queue });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
};
