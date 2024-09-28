const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        logging: false
    }
);

sequelize.authenticate()
    .then(() => console.log('Veritabanı bağlantısı başarılı.'))
    .catch((error) => console.error('Veritabanı bağlantısı başarısız.', error));

module.exports = sequelize;