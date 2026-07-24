const nodemailer = require('nodemailer');
const prisma = require('../config/db');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendDueEmail(payment) {
  const subject = `Premium due reminder - ${payment.policy.policyNumber}`;
  const text = `Dear ${payment.policy.customer.name},\n\nYour premium of Rs. ${payment.amount} for policy ${payment.policy.policyNumber} is due on ${new Date(payment.dueDate).toDateString()}.\n\nPlease pay at your earliest convenience.`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: payment.policy.customer.email,
      subject,
      text,
    });
    await prisma.emailLog.create({
      data: { policyId: payment.policyId, toEmail: payment.policy.customer.email, subject, status: 'SENT' },
    });
    return { status: 'SENT' };
  } catch (err) {
    await prisma.emailLog.create({
      data: { policyId: payment.policyId, toEmail: payment.policy.customer.email, subject, status: 'FAILED' },
    });
    console.error('Email send failed:', err.message);
    return { status: 'FAILED', error: err.message };
  }
}

module.exports = { sendDueEmail };