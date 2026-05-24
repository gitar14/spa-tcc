const buildCrudController = require('./crudControllerFactory');
const therapistModel = require('../models/therapistModels');

const crudController = buildCrudController(therapistModel, 'Terapis');

module.exports = {
  ...crudController,
  getStatus: async (req, res) => {
    try {
      res.status(200).json(await therapistModel.getRealtimeStatus(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  setStatus: async (req, res) => {
    try {
      const data = await therapistModel.setRealtimeStatus(req.params.id, req.body.status || 'Available');
      res.status(200).json({ message: 'Status realtime terapis diperbarui', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};
