require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: { name: 'Admin User', email: '[email protected]', password, role: 'ADMIN' },
  });

  const agent = await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: { name: 'Agent User', email: '[email protected]', password, role: 'AGENT' },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: '[email protected]' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: '[email protected]',
      password,
      role: 'CUSTOMER',
      customer: {
        create: {
          name: 'Demo Customer',
          email: '[email protected]',
          phone: '9876543210',
          address: '123 Main Street',
        },
      },
    },
    include: { customer: true },
  });

  console.log('Seeded users (all passwords: Password123!):');
  console.log({ admin: admin.email, agent: agent.email, customer: customerUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());