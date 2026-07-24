const prisma = require('../config/db');
const { sendDueEmail } = require('../utils/email');

async function syncOverduePayments() {
  await prisma.premiumPayment.updateMany({
    where: { dueDate: { lt: new Date() }, paymentStatus: 'PENDING' },
    data: { paymentStatus: 'OVERDUE' },
  });
}

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

exports.sendMockSms = async (req, res, next) => {
  try {
    const payment = await prisma.premiumPayment.findUnique({
      where: { id: Number(req.params.id) },
      include: { policy: { include: { customer: true } } },
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const phone = payment.policy.customer.phone || 'N/A';
    const message = `Reminder: Premium of Rs.${payment.amount} for policy ${payment.policy.policyNumber} is due on ${new Date(payment.dueDate).toDateString()}.`;
    const log = await prisma.smsLog.create({
      data: { policyId: payment.policyId, phone, message, status: 'SENT' },
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

exports.sendEmailReminder = async (req, res, next) => {
  try {
    const payment = await prisma.premiumPayment.findUnique({
      where: { id: Number(req.params.id) },
      include: { policy: { include: { customer: true } } },
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const result = await sendDueEmail(payment);
    res.json(result);
  } catch (err) {
    next(err);
  }
};