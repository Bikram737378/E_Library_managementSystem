const express = require('express');
const {
  getDashboardStats,
  getStudentStats,
} = require('../controllers/analyticsController');
const { protect, admin, student } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/student', protect, student, getStudentStats);

module.exports = router;