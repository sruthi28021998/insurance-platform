const prisma = require('../config/db');

exports.getCustomers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { policies: true },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ data: customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        policies: { include: { claims: true, premiumPayments: true } },
        documents: true,
      },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!own || own.id !== customer.id) {
        return res.status(403).json({ message: 'You can only view your own profile' });
      }
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, address, dob } = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, address, dob: dob ? new Date(dob) : undefined },
    });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, dob } = req.body;
    const customer = await prisma.customer.create({
      data: { name, email, phone, address, dob: dob ? new Date(dob) : null, userId: req.body.userId },
    });
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};