const { Payment } = require('../schema');
const { uploadPaymentProof } = require('../services/storageService');

// Get user's bookings with payment status
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { Booking, User, Therapist, Service, Room } = require('../schema');
    
    const bookings = await Booking.findAll({
      where: { user_id: userId },
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Therapist, attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Room, attributes: ['id', 'room_number'] }
      ],
      order: [['booking_time', 'DESC']]
    });

    // Get payment info for each booking
    const bookingsWithPayment = await Promise.all(
      bookings.map(async (booking) => {
        const payment = await Payment.findOne({
          where: { booking_id: booking.id }
        });
        
        return {
          ...booking.toJSON(),
          payment_status: payment ? payment.status : 'unpaid',
          payment_proof_url: payment ? payment.payment_proof_url : null
        };
      })
    );

    res.json(bookingsWithPayment);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Upload payment proof
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloud Storage
    const fileUrl = await uploadPaymentProof(req.file, bookingId);

    // Create or update payment record
    const [payment, created] = await Payment.findOrCreate({
      where: { booking_id: bookingId },
      defaults: {
        booking_id: bookingId,
        amount: req.body.amount || 0,
        payment_method: 'transfer',
        status: 'pending',
        payment_proof_url: fileUrl
      }
    });

    if (!created) {
      await payment.update({
        payment_proof_url: fileUrl,
        status: 'pending'
      });
    }

    res.json({
      message: 'Payment proof uploaded successfully',
      payment_proof_url: fileUrl
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ error: 'Failed to upload payment proof' });
  }
};
