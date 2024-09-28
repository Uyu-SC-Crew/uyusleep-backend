const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const crypto = require('crypto');

const User = sequelize.define('User', {
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    passport_id: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    verification_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    surname: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    national_id_number: {
        type: DataTypes.STRING(11),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    user_id: {
        type: DataTypes.STRING(12), // 12 karakterli bir benzersiz ID
        allowNull: false,
        unique: true
    }
},
    {
        timestamps: false,
        tableName: 'users',
        hooks: {
            beforeCreate: (user) => {
                user.user_id = `UID-${crypto.randomBytes(5).toString('hex')}`; // 12 karakterlik bir user_id üretiyoruz
            }
        }
    });

module.exports = User;
