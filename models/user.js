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
    user_id: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true
    },
    last_verification_request: {
        type: DataTypes.DATE,  // Son doğrulama kodu talebi zamanı
        allowNull: true
    }
}, {
    timestamps: true,  // created_at ve updated_at otomatik eklenecek
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            // user_id'nin benzersizliğini garanti altına almak için tekrar kontrol ekleyebiliriz.
            let isUnique = false;
            while (!isUnique) {
                const userId = `UID-${crypto.randomBytes(5).toString('hex')}`;
                const existingUser = await User.findOne({ where: { user_id: userId } });
                if (!existingUser) {
                    user.user_id = userId;
                    isUnique = true;
                }
            }
        }
    }
});

module.exports = User;
