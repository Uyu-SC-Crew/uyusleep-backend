const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const checkIn = sequelize.define('CheckIn', {
    check_in: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    check_out: {
        type: DataTypes.DATE,
        allowNull: true
    },
},
    {
        timestamps: false,
        tableName: 'check_ins'
    });

module.exports = checkIn;