const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const verifyToken = require('../middlewares/auth');


// Doğrulama kodu gönderen API (Giriş için)
router.post('/users/send-verification', userController.sendVerificationCode);

// Kayıt için doğrulama kodu gönderen API
router.post('/users/send-register-code', userController.sendRegisterCode);

// Doğrulama kodunu kontrol eden API
router.post('/users/verify', userController.verifyCode);

// Kullanıcı bilgilerini kaydeden API 
router.post('/users/save-details', verifyToken, userController.saveUserDetails);

module.exports = router;