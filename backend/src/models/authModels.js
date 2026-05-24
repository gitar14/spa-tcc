const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthUser } = require('../schema');

const authModel = {
  register: async (payload) => {
    const existingUser = await AuthUser.findOne({ where: { email: payload.email } });
    if (existingUser) {
      throw new Error('Email sudah terdaftar di Spa.');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await AuthUser.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || 'Customer'
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  },
  login: async ({ email, password }) => {
    const user = await AuthUser.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email atau password salah.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Email atau password salah.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'spa-secret',
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
};

module.exports = authModel;
