const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', protect, admin, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);

module.exports = router;