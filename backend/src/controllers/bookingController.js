const bookingModel = require('../models/bookingModels');
const buildCrudController = require('./crudControllerFactory');

const crudController = buildCrudController(bookingModel, 'Booking');

module.exports = {
  ...crudController,
  create: async (req, res) => {
    try {
      const data = await bookingModel.createBooking(req.body);
      res.status(201).json({ message: 'Booking sukses dibuat dan slot terapis dikunci', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  finish: async (req, res) => {
    try {
      const data = await bookingModel.finishBooking(req.params.id);
      if (!data) return res.status(404).json({ error: 'Booking tidak ditemukan' });
      return res.status(200).json({ message: 'Booking selesai dan terapis tersedia kembali', data });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  getQueue: async (req, res) => {
    try {
      const queue = await bookingModel.getLiveQueue();
      res.status(200).json({ live_queue: queue });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAvailableSlot: async (req, res) => {
    try {
      const data = await bookingModel.getAvailableSlot(req.query.therapist_id, req.query.booking_time);
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  getNotifications: async (req, res) => {
    try {
      const notifications = await bookingModel.getUserNotifications(req.params.userId);
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getPreference: async (req, res) => {
    try {
      res.status(200).json(await bookingModel.getUserPreference(req.params.userId));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
