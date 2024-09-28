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

// Kullanıcı profilini getiren API
router.get('/users/profile', verifyToken, userController.getUserProfile);

// Refresh Token ile JWT yenileme API
router.post('/users/refresh-token', userController.refreshAccessToken);

module.exports = router;