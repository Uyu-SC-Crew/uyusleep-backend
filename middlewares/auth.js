const jwt = require('jsonwebtoken');

// JWT doğrulama middleware'i
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Erişim reddedildi. Token eksik.' });
    }

    const bearerToken = token.split(' ')[1]; // Bearer token varsa alıyoruz

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Geçersiz token.' });
        }

        // Token doğrulandı, kullanıcı bilgileri req.user'a ekleniyor
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;

