const buildCrudModel = (Schema) => ({
  getAll: async () => Schema.findAll(),
  getById: async (id) => Schema.findByPk(id),
  create: async (payload) => Schema.create(payload),
  update: async (id, payload) => {
    const record = await Schema.findByPk(id);
    if (!record) return null;
    return record.update(payload);
  },
  remove: async (id) => {
    const record = await Schema.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return record;
  }
});

module.exports = buildCrudModel;
