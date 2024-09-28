const sequelize = require('../config/db');
const User = require('../models/user');
const Capsule = require('../models/capsule');
const Reservation = require('../models/reservation');
const CheckIn = require('../models/checkIn');
const Admin = require('../models/admin');

//model ilişkileri!

Reservation.belongsTo(User, { foreignKey: 'user_id' });
Reservation.belongsTo(Capsule, { foreignKey: 'capsule_id' })

CheckIn.belongsTo(User, { foreignKey: 'user_id' });
CheckIn.belongsTo(Capsule, { foreignKey: 'capsule_id' })

Capsule.belongsTo(Admin, { foreignKey: 'admin_id' });
Admin.hasMany(require('./capsule'), { foreignKey: 'admin_id' });

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Veritabanı senkronize edildi.')
    } catch (err) {
        console.error('Veritabanı senkronizasyon hatası!', err);
    }
}

module.exports = { User, Capsule, Reservation, CheckIn, Admin, syncDatabase }