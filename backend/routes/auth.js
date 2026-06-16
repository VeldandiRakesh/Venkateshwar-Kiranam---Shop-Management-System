const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public endpoints
router.get('/setup-status', authController.getSetupStatus);
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected endpoints (require JWT token)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/profile/password', authMiddleware, authController.changePassword);

module.exports = router;
