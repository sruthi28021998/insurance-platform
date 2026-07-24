const cron = require('node-cron');
const prisma = require('../config/db');
const { sendDueEmail } = require('./email');

function startDueReminderJob() {
  // Runs every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 3);

    const dueSoon = await prisma.premiumPayment.findMany({
      where: { paymentStatus: { in: ['PENDING', 'OVERDUE'] }, dueDate: { lte: soon } },
      include: { policy: { include: { customer: true } } },
    });

    for (const payment of dueSoon) {
      await sendDueEmail(payment);
    }
    console.log(`Due-reminder job: processed ${dueSoon.length} payment(s)`);
  });
}

module.exports = startDueReminderJob;