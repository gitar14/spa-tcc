const User = require('./User');
const Therapist = require('./Therapist');
const Service = require('./Service');
const Room = require('./Room');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Rating = require('./Rating');
const AuthUser = require('./AuthUser');

User.hasMany(Booking, { foreignKey: 'user_id' });
Therapist.hasMany(Booking, { foreignKey: 'therapist_id' });
Service.hasMany(Booking, { foreignKey: 'service_id' });
Room.hasMany(Booking, { foreignKey: 'room_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Therapist, { foreignKey: 'therapist_id' });
Booking.belongsTo(Service, { foreignKey: 'service_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });
Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Booking.hasOne(Rating, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });
Rating.belongsTo(Booking, { foreignKey: 'booking_id' });

module.exports = { User, Therapist, Service, Room, Booking, Payment, Rating, AuthUser };
