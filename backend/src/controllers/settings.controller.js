const prisma = require('../config/db');

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } }); // creates with defaults on first access
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings  (Admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    const { companyName, claimApprovalThreshold } = req.body;
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: { companyName, claimApprovalThreshold: Number(claimApprovalThreshold) },
      create: { id: 1, companyName, claimApprovalThreshold: Number(claimApprovalThreshold) },
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};