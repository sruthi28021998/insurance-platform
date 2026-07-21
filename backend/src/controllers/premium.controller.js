const prisma = require('../config/db');

// Flips any PENDING payment whose dueDate has passed to OVERDUE
async function syncOverduePayments() {
  await prisma.premiumPayment.updateMany({
    where: { dueDate: { lt: new Date() }, paymentStatus: 'PENDING' },
    data: { paymentStatus: 'OVERDUE' },
  });
}

// GET /api/premiums?policyId=&status=
exports.getPremiums = async (req, res, next) => {
  try {
    await syncOverduePayments();
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
        orderBy: { dueDate: 'asc' },
        include: { policy: { include: { customer: true } } },
      }),
      prisma.premiumPayment.count({ where }),
    ]);

    res.json({ data: payments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/premiums  (pay-now: creates an already-PAID record)
exports.recordPayment = async (req, res, next) => {
  try {
    const { policyId, amount } = req.body;
    const payment = await prisma.premiumPayment.create({
      data: {
        policyId: Number(policyId),
        amount: Number(amount),
        paymentStatus: 'PAID',
        dueDate: new Date(),
      },
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

// POST /api/premiums/schedule  (Admin/Agent schedules an upcoming due premium)
exports.scheduleDue = async (req, res, next) => {
  try {
    const { policyId, amount, dueDate } = req.body;
    const payment = await prisma.premiumPayment.create({
      data: {
        policyId: Number(policyId),
        amount: Number(amount),
        dueDate: new Date(dueDate),
        paymentStatus: 'PENDING',
      },
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/premiums/:id/pay  (mark a due/overdue payment as paid)
exports.payDue = async (req, res, next) => {
  try {
    const payment = await prisma.premiumPayment.update({
      where: { id: Number(req.params.id) },
      data: { paymentStatus: 'PAID', paymentDate: new Date() },
    });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

// GET /api/premiums/overdue
exports.getOverdue = async (req, res, next) => {
  try {
    await syncOverduePayments();
    const overdue = await prisma.premiumPayment.findMany({
      where: { paymentStatus: 'OVERDUE' },
      include: { policy: { include: { customer: true } } },
      orderBy: { dueDate: 'asc' },
    });
    res.json(overdue);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/premiums/:id/status
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