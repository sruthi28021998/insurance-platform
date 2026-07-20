const prisma = require('../config/db');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      activePolicies,
      expiredPolicies,
      cancelledPolicies,
      totalCustomers,
      claimsByStatus,
      premiumSum,
      policiesByType,
    ] = await Promise.all([
      prisma.policy.count({ where: { status: 'ACTIVE' } }),
      prisma.policy.count({ where: { status: 'EXPIRED' } }),
      prisma.policy.count({ where: { status: 'CANCELLED' } }),
      prisma.customer.count(),
      prisma.claim.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.premiumPayment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.policy.groupBy({ by: ['policyType'], _count: { policyType: true } }),
    ]);

    res.json({
      policies: { active: activePolicies, expired: expiredPolicies, cancelled: cancelledPolicies },
      totalCustomers,
      claimsByStatus,
      totalPremiumCollected: premiumSum._sum.amount || 0,
      policiesByType,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerGrowth = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const buckets = {};
    customers.forEach((c) => {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    res.json(Object.entries(buckets).map(([month, count]) => ({ month, count })));
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const [payments, claims] = await Promise.all([
      prisma.premiumPayment.findMany({ where: { paymentStatus: 'PAID' } }),
      prisma.claim.findMany(),
    ]);

    const monthly = {};
    payments.forEach((p) => {
      const key = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = monthly[key] || { month: key, premiumCollected: 0, claimsFiled: 0 };
      monthly[key].premiumCollected += p.amount;
    });
    claims.forEach((c) => {
      const key = `${c.submissionDate.getFullYear()}-${String(c.submissionDate.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = monthly[key] || { month: key, premiumCollected: 0, claimsFiled: 0 };
      monthly[key].claimsFiled += 1;
    });

    res.json(Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)));
  } catch (err) {
    next(err);
  }
};