const prisma = require('../config/db');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = entityType ? { entityType } : {};

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);

    const userIds = [...new Set(logs.map((l) => l.performedBy))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
    const enriched = logs.map((l) => ({ ...l, performedByName: userMap[l.performedBy] || 'Unknown' }));

    res.json({ data: enriched, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};