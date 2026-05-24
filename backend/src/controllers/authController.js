const authModel = require('../models/authModels');

const authController = {
  register: async (req, res) => {
    try {
      const data = await authModel.register(req.body);
      res.status(201).json({ message: 'Registrasi member Spa berhasil', data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const data = await authModel.login(req.body);
      res.status(200).json({ message: 'Login berhasil', data });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
};

module.exports = authController;
