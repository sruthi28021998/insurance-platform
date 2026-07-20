const prisma = require('../config/db');

async function syncExpiredPolicies() {
  await prisma.policy.updateMany({
    where: { endDate: { lt: new Date() }, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  });
}

exports.getPolicies = async (req, res, next) => {
  try {
    await syncExpiredPolicies();
    const { status, customerId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId: Number(customerId) } : {}),
    };

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      where.customerId = own ? own.id : -1;
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.policy.count({ where }),
    ]);

    res.json({ data: policies, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getPolicyById = async (req, res, next) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, claims: true, premiumPayments: true },
    });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    next(err);
  }
};

exports.createPolicy = async (req, res, next) => {
  try {
    const { customerId, policyType, policyNumber, premiumAmount, startDate, endDate } = req.body;

    const policy = await prisma.policy.create({
      data: {
        customerId: Number(customerId),
        policyType,
        policyNumber,
        premiumAmount: Number(premiumAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(policy);
  } catch (err) {
    next(err);
  }
};

exports.updatePolicy = async (req, res, next) => {
  try {
    const { policyType, premiumAmount, startDate, endDate, status } = req.body;
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: {
        policyType,
        premiumAmount: premiumAmount ? Number(premiumAmount) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
      },
    });
    res.json(policy);
  } catch (err) {
    next(err);
  }
};

exports.cancelPolicy = async (req, res, next) => {
  try {
    const policy = await prisma.policy.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CANCELLED' },
    });
    res.json(policy);
  } catch (err) {
    next(err);
  }
};

exports.getExpiringPolicies = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    const policies = await prisma.policy.findMany({
      where: { status: 'ACTIVE', endDate: { gte: now, lte: future } },
      include: { customer: true },
      orderBy: { endDate: 'asc' },
    });
    res.json(policies);
  } catch (err) {
    next(err);
  }
};