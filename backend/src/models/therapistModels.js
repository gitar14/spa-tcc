const { Therapist } = require('../schema');
const buildCrudModel = require('./crudFactory');
const { firestore } = require('../config/firestore');

const baseModel = buildCrudModel(Therapist);

module.exports = {
  ...baseModel,
  setRealtimeStatus: async (id, status) => {
    await firestore.collection('therapist_status').doc(String(id)).set({
      status,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return { therapist_id: Number(id), status };
  },
  getRealtimeStatus: async (id) => {
    const doc = await firestore.collection('therapist_status').doc(String(id)).get();
    const status = doc.exists ? doc.data().status : null;
    return { therapist_id: Number(id), status: status || 'Available' };
  }
};
