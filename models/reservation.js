const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
    check_in: {
        type: DataTypes.DATE,
        allowNull: false
    },
    check_out: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
},
    {
        timestamps: false,
        tableName: 'reservations'
    });

module.exports = Reservation;