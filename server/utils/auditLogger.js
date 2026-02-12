const AuditLog = require('../models/AuditLog');

const logAudit = async (action, performedBy, details) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = logAudit;