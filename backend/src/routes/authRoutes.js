const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Auth işlemleri için daha katı rate limit (Brute-force koruması)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // IP başına max 10 başarısız/başarılı auth isteği
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin."
    }
  }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Profil İşlemleri
router.get('/me', requireAuth, authController.getMe);
router.patch('/me', requireAuth, authController.updateMe);

// Admin yetkisi gerektiren işlemler
router.get('/users', requireAuth, requireAdmin, authController.listUsers);
router.delete('/users/:id', requireAuth, requireAdmin, authController.removeUser);

module.exports = router;
