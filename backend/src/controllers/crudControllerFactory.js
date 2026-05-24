const buildCrudController = (model, label) => ({
  getAll: async (req, res) => {
    try {
      res.status(200).json(await model.getAll());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const data = await model.getById(req.params.id);
      if (!data) return res.status(404).json({ error: `${label} tidak ditemukan` });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const data = await model.create(req.body);
      res.status(201).json({ message: `${label} berhasil dibuat`, data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const data = await model.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: `${label} tidak ditemukan` });
      return res.status(200).json({ message: `${label} berhasil diperbarui`, data });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  remove: async (req, res) => {
    try {
      const data = await model.remove(req.params.id);
      if (!data) return res.status(404).json({ error: `${label} tidak ditemukan` });
      return res.status(200).json({ message: `${label} berhasil dihapus` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

module.exports = buildCrudController;
