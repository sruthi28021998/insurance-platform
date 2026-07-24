const prisma = require('../config/db');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

exports.getDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = (startDate && endDate)
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {};

    const [
      activePolicies,
      expiredPolicies,
      cancelledPolicies,
      totalCustomers,
      claimsByStatus,
      premiumSum,
      policiesByType,
    ] = await Promise.all([
      prisma.policy.count({ where: { status: 'ACTIVE', ...dateFilter } }),
      prisma.policy.count({ where: { status: 'EXPIRED', ...dateFilter } }),
      prisma.policy.count({ where: { status: 'CANCELLED', ...dateFilter } }),
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
    const { policyType } = req.query;
    const [payments, claims] = await Promise.all([
      prisma.premiumPayment.findMany({
        where: { paymentStatus: 'PAID', ...(policyType ? { policy: { policyType } } : {}) },
        include: { policy: true },
      }),
      prisma.claim.findMany({
        where: policyType ? { policy: { policyType } } : {},
        include: { policy: true },
      }),
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

exports.exportDashboardPdf = async (req, res, next) => {
  try {
    const [activePolicies, expiredPolicies, cancelledPolicies, totalCustomers, premiumSum] = await Promise.all([
      prisma.policy.count({ where: { status: 'ACTIVE' } }),
      prisma.policy.count({ where: { status: 'EXPIRED' } }),
      prisma.policy.count({ where: { status: 'CANCELLED' } }),
      prisma.customer.count(),
      prisma.premiumPayment.aggregate({ _sum: { amount: true }, where: { paymentStatus: 'PAID' } }),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=business-report.pdf');
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(20).text('Business Summary Report', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(12);
    doc.text(`Active Policies: ${activePolicies}`);
    doc.text(`Expired Policies: ${expiredPolicies}`);
    doc.text(`Cancelled Policies: ${cancelledPolicies}`);
    doc.text(`Total Customers: ${totalCustomers}`);
    doc.text(`Total Premium Collected: Rs. ${(premiumSum._sum.amount || 0).toLocaleString()}`);
    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.end();
  } catch (err) {
    next(err);
  }
};

exports.exportDashboardExcel = async (req, res, next) => {
  try {
    const [policies, claims, payments] = await Promise.all([
      prisma.policy.findMany({ include: { customer: true } }),
      prisma.claim.findMany({ include: { policy: true } }),
      prisma.premiumPayment.findMany({ include: { policy: true } }),
    ]);

    const policySheet = XLSX.utils.json_to_sheet(policies.map((p) => ({
      PolicyNumber: p.policyNumber,
      Type: p.policyType,
      Customer: p.customer?.name,
      Premium: p.premiumAmount,
      Status: p.status,
      StartDate: p.startDate,
      EndDate: p.endDate,
    })));
    const claimSheet = XLSX.utils.json_to_sheet(claims.map((c) => ({
      ClaimId: c.id,
      Policy: c.policy?.policyNumber,
      Amount: c.claimAmount,
      Status: c.status,
      Reason: c.reason,
    })));
    const paymentSheet = XLSX.utils.json_to_sheet(payments.map((p) => ({
      Policy: p.policy?.policyNumber,
      Amount: p.amount,
      DueDate: p.dueDate,
      Status: p.paymentStatus,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, policySheet, 'Policies');
    XLSX.utils.book_append_sheet(workbook, claimSheet, 'Claims');
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Premiums');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=business-report.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};