const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// GET /api/setup/init?key=YOUR_SECRET
// One-time endpoint to seed demo accounts and fix roles on a fresh production database.
// Protected by a secret key so random visitors can't trigger it.
router.get('/init', async (req, res) => {
  try {
    if (req.query.key !== process.env.SETUP_SECRET) {
      return res.status(403).json({ message: 'Invalid or missing setup key' });
    }

    const password = await bcrypt.hash('Password123!', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin1@test.com' },
      update: { role: 'ADMIN' },
      create: { name: 'Admin User', email: 'admin1@test.com', password, role: 'ADMIN' },
    });

    const agent = await prisma.user.upsert({
      where: { email: 'agent1@test.com' },
      update: { role: 'AGENT' },
      create: { name: 'Agent User', email: 'agent1@test.com', password, role: 'AGENT' },
    });

    let customerUser = await prisma.user.findUnique({ where: { email: 'customer1@test.com' } });
    if (!customerUser) {
      customerUser = await prisma.user.create({
        data: {
          name: 'Demo Customer',
          email: 'customer1@test.com',
          password,
          role: 'CUSTOMER',
          customer: {
            create: {
              name: 'Demo Customer',
              email: 'customer1@test.com',
              phone: '9876543210',
              address: '123 Main Street',
            },
          },
        },
      });
    }

    res.json({
      message: 'Setup complete',
      accounts: {
        admin: { email: admin.email, role: admin.role },
        agent: { email: agent.email, role: agent.role },
        customer: { email: customerUser.email, role: customerUser.role },
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Setup failed', error: err.message });
  }
});

module.exports = router;