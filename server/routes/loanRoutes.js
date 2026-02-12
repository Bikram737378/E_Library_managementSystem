const express = require('express');
const {
  issueBook,
  returnBook,
  getLoans,
  getMyLoans,
} = require('../controllers/loanController');
const { protect, admin, student } = require('../middleware/auth');

const router = express.Router();

// Debug middleware to see all requests to /api/loans
router.use((req, res, next) => {
  console.log(`🔵 LOAN ROUTE HIT: ${req.method} ${req.originalUrl}`);
  next();
});

// PUBLIC TEST ROUTE - NO AUTH REQUIRED (for testing)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Loan routes are working!',
    timestamp: new Date().toISOString()
  });
});

// PROTECTED ROUTES - ALL REQUIRE AUTHENTICATION
router.use(protect);

// Admin routes
router.route('/')
  .get(admin, getLoans)
  .post(admin, issueBook);

router.put('/:id/return', admin, returnBook);

// Student route
router.get('/my-loans', student, getMyLoans);

module.exports = router;