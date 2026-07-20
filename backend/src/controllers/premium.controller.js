const prisma = require('../config/db');

exports.getPremiums = async (req, res, next) => {
  try {
    const { policyId, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...(policyId ? { policyId: Number(policyId) } : {}),
      ...(status ? { paymentStatus: status } : {}),
    };

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      where.policy = { customerId: own ? own.id : -1 };
    }

    const [payments, total] = await Promise.all([
      prisma.premiumPayment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { paymentDate: 'desc' },
        include: { policy: { include: { customer: true } } },
      }),
      prisma.premiumPayment.count({ where }),
    ]);

    res.json({ data: payments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { policyId, amount } = req.body;
    const payment = await prisma.premiumPayment.create({
      data: { policyId: Number(policyId), amount: Number(amount), paymentStatus: 'PAID' },
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.getOverdue = async (req, res, next) => {
  try {
    const overdue = await prisma.premiumPayment.findMany({
      where: { paymentStatus: 'OVERDUE' },
      include: { policy: { include: { customer: true } } },
    });
    res.json(overdue);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const payment = await prisma.premiumPayment.update({
      where: { id: Number(req.params.id) },
      data: { paymentStatus: req.body.paymentStatus },
    });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};