const User = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio');
const twilioClient = twilio(accountSid, authToken);

const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6 haneli doğrulama kodu
}
// JWT ve Refresh Token oluşturma fonksiyonu
const generateTokens = (user) => {
    const jwtToken = jwt.sign({ phone_number: user.phone_number }, process.env.JWT_SECRET, { expiresIn: '1h' }); // 1 saat geçerli
    const refreshToken = jwt.sign({ phone_number: user.phone_number }, process.env.REFRESH_SECRET, { expiresIn: '30d' }); // 1 ay geçerli

    return { jwtToken, refreshToken };
};
const sendSms = async (phoneNumber, verificationCode) => {
    try {
        await twilioClient.messages.create({
            body: `UYU Sleep Capsule doğrulama kodunuz: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log(`Doğrulama kodu başarıyla gönderildi: ${verificationCode} (Telefon: ${phoneNumber})`);
    } catch (error) {
        console.error('SMS gönderilemedi!', error);
        throw new Error('SMS gönderilemedi!');
    }
};

//Doğrulama kodu gönderme
const sendVerificationCode = async (req, res) => {
    const { phone_number } = req.body;

    try {
        let user = await User.findOne({ where: { phone_number } });
        if (!user) {
            user = await User.create({ phone_number });
        }

        // Şu anki zamanı al
        const now = new Date();
        const lastRequest = user.last_verification_request;

        // Eğer kullanıcı son 3 dakika içinde doğrulama kodu talep etmişse
        if (lastRequest && (now - lastRequest) < 180000) { // 180000 ms = 3 dakika
            return res.status(429).json({
                error: '3 dakika içinde birden fazla doğrulama kodu isteği yapılamaz.'
            });
        }

        const verificationCode = generateVerificationCode();
        user.verification_code = verificationCode;
        user.last_verification_request = now;
        await user.save();

        await sendSms(phone_number, verificationCode);

        res.status(200).json({ message: 'Doğrulama kodu başarıyla gönderildi.' });
    } catch (error) {
        res.status(500).json({ error: 'Doğrulama kodu gönderilemedi.', details: error.message });
    }
}
// Kayıt olmak için doğrulama kodu gönderme
const sendRegisterCode = async (req, res) => {
    const { phone_number } = req.body;

    try {
        let user = await User.findOne({ where: { phone_number } });
        if (user) {
            return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı.' });
        }

        const verificationCode = generateVerificationCode();
        user = await User.create({ phone_number, verification_code: verificationCode });

        await sendSms(phone_number, verificationCode);

        res.status(200).json({ message: 'Kayıt için doğrulama kodu başarıyla gönderildi.' });
    } catch (error) {
        res.status(500).json({ error: 'Doğrulama kodu gönderilemedi.' });
    }
};
//Doğrulama kodu kontrolü 
const verifyCode = async (req, res) => {
    const { phone_number, verification_code } = req.body;

    try {
        // Kullanıcıyı bul
        const user = await User.findOne({ where: { phone_number, verification_code } });

        if (!user) {
            return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
        }

        // Doğrulama kodunun süresini kontrol et (3 dakika)
        const now = new Date();
        const lastRequest = user.last_verification_request;

        if ((now - lastRequest) > 180000) { // 180000 ms = 3 dakika
            return res.status(400).json({ error: 'Doğrulama kodunun süresi dolmuş.' });
        }

        const { jwtToken, refreshToken } = generateTokens(user);

        // Doğrulama kodunu temizle (artık kullanılmaz)
        user.verification_code = null;
        await user.save();

        res.status(200).json({
            message: 'Giriş başarılı.',
            token: jwtToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        res.status(500).json({
            error: 'Giriş sırasında bir hata oluştu.',
            details: error.message
        });
    }
};

// Kullanıcı bilgilerini kaydetme (Kayıt için)
const saveUserDetails = async (req, res) => {
    const { phone_number, name, surname, birthdate, national_id_number } = req.body;

    try {
        let user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        user.name = name;
        user.surname = surname;
        user.birthdate = birthdate;
        user.national_id_number = national_id_number;
        await user.save();

        res.status(200).json({ message: 'Kullanıcı bilgileri başarıyla kaydedildi.', user });
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcı bilgileri kaydedilemedi.' });
    }
};

// Kullanıcıya ait bilgileri çekme
const getUserProfile = async (req, res) => {
    try {
        const phone_number = req.user.phone_number; // JWT'den gelen telefon numarasını alıyoruz

        // Kullanıcı bilgilerini veritabanından çekiyoruz
        const user = await User.findOne({ where: { phone_number } });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        // Kullanıcı bilgilerini döndürüyoruz
        res.status(200).json({
            message: 'Kullanıcı profili başarıyla getirildi.',
            user: {
                phone_number: user.phone_number,
                name: user.name,
                surname: user.surname,
                birthdate: user.birthdate,
                id_or_passport: user.id_or_passport
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Profil bilgileri getirilirken bir hata oluştu.' });
    }
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ error: 'Refresh token eksik.' });
    }

    try {
        // Refresh token'ı doğrula
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        // Yeni bir JWT token oluştur
        const newAccessToken = jwt.sign({ phone_number: decoded.phone_number }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(403).json({ error: 'Geçersiz refresh token.' });
    }
};


module.exports = { sendVerificationCode, verifyCode, saveUserDetails, sendRegisterCode, getUserProfile, refreshAccessToken };