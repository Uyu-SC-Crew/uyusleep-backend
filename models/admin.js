const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Admin = sequelize.define('Admin', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'basic' //basic, moderator or admin
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},
    {
        timestamps: false,
        tableName: 'admins'
    });

module.exports = Admin;