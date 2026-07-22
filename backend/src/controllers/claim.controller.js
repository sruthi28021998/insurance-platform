const prisma = require('../config/db');

exports.getClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status } : {};

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      where.policy = { customerId: own ? own.id : -1 };
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { submissionDate: 'desc' },
        include: { policy: { include: { customer: true } }, documents: true },
      }),
      prisma.claim.count({ where }),
    ]);

    res.json({ data: claims, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getClaimById = async (req, res, next) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: Number(req.params.id) },
      include: { policy: { include: { customer: true } }, documents: true },
    });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    next(err);
  }
};

exports.createClaim = async (req, res, next) => {
  try {
    const { policyId, claimAmount, reason } = req.body;

    const policy = await prisma.policy.findUnique({ where: { id: Number(policyId) } });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!own || own.id !== policy.customerId) {
        return res.status(403).json({ message: 'You can only submit claims on your own policies' });
      }
    }

    const claim = await prisma.claim.create({
      data: { policyId: Number(policyId), claimAmount: Number(claimAmount), reason },
    });
    res.status(201).json(claim);
  } catch (err) {
    next(err);
  }
};

exports.reviewClaim = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const claim = await prisma.claim.update({
      where: { id: Number(req.params.id) },
      data: { status, reviewNotes, reviewedBy: req.user.id },
    });
    res.json(claim);
  } catch (err) {
    next(err);
  }
};

exports.getClaimStats = async (req, res, next) => {
  try {
    const grouped = await prisma.claim.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { claimAmount: true },
    });
    res.json(grouped);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/claims/:id/assign  (Admin only)  body: { agentId }
exports.assignClaim = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const claim = await prisma.claim.update({
      where: { id: Number(req.params.id) },
      data: { assignedAgentId: Number(agentId) },
    });
    res.json(claim);
  } catch (err) {
    next(err);
  }
};