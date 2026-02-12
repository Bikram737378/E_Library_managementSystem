const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, admin, getAuditLogs);

module.exports = router;