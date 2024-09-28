const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Capsule = sequelize.define('Capsule', {
    capsule_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.STRING(10),
        defaultValue: 'available' // or occupied
    },
    qr_code: {
        type: DataTypes.STRING(255),
        unique: true
    },
    qr_code_expires_at: {
        type: DataTypes.DATE, // QR kodun geçerlilik süresi
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(9, 6), //ENLEM
    },
    longitude: {
        type: DataTypes.DECIMAL(9, 6), //BOYLAM
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},
    {
        timestamps: false,
        tableName: 'capsules'
    }
);

module.exports = Capsule;