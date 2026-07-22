require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

 const admin = await prisma.user.upsert({
  where: { email: 'admin1@test.com' },
  update: {},
  create: { name: 'Admin User', email: 'admin1@test.com', password, role: 'ADMIN' },
});

const agent = await prisma.user.upsert({
  where: { email: 'agent1@test.com' },
  update: {},
  create: { name: 'Agent User', email: 'agent1@test.com', password, role: 'AGENT' },
});

const customerUser = await prisma.user.upsert({
  where: { email: 'customer1@test.com' },
  update: {},
  create: {
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