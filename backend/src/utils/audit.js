const prisma = require('../config/db');

async function logAudit({ entityType, entityId, action, performedBy, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        performedBy,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = logAudit;