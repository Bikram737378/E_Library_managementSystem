const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

const getAuditLogs = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const count = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .populate('performedBy', 'name email role')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ timestamp: -1 });

  res.json({
    success: true,
    data: logs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

module.exports = {
  getAuditLogs,
};