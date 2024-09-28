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


        const verificationCode = generateVerificationCode();
        user.verification_code = verificationCode;
        await user.save();

        await sendSms(phone_number, verificationCode);

        res.status(200).json({ message: 'Doğrulama kodu başarıyla gönderildi.' });
    } catch (error) {
        res.status(500).json({ error: 'Doğrulama kodu gönderilemedi.' });
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
        const user = await User.findOne({ where: { phone_number, verification_code } });
        if (!user) {
            return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
        }

        // Doğrulama başarılı, JWT oluşturuluyor
        const token = jwt.sign({ phone_number: user.phone_number }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.verification_code = null;
        await user.save();

        res.status(200).json({ message: 'Giriş başarılı.', user });
    } catch (error) {
        res.status(500).json({ error: 'Giriş sırasında bir hata oluştu.' });
    }
}

// Kullanıcı bilgilerini kaydetme (Kayıt için)
const saveUserDetails = async (req, res) => {
    const { phone_number, name, surname, birthdate, id_or_passport } = req.body;

    try {
        let user = await User.findOne({ where: { phone_number } });
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        user.name = name;
        user.surname = surname;
        user.birthdate = birthdate;
        user.id_or_passport = id_or_passport;
        await user.save();

        res.status(200).json({ message: 'Kullanıcı bilgileri başarıyla kaydedildi.', user });
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcı bilgileri kaydedilemedi.' });
    }
};

module.exports = { sendVerificationCode, verifyCode, saveUserDetails, sendRegisterCode };