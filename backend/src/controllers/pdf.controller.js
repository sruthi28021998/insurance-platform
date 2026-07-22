const PDFDocument = require('pdfkit');
const prisma = require('../config/db');

// GET /api/policies/:id/certificate  -> streams a PDF policy certificate
exports.generatePolicyCertificate = async (req, res, next) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true },
    });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    if (req.user.role === 'CUSTOMER') {
      const own = await prisma.customer.findUnique({ where: { userId: req.user.id } });
      if (!own || own.id !== policy.customerId) {
        return res.status(403).json({ message: 'You can only download your own policy certificate' });
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${policy.policyNumber}-certificate.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Insurance Policy Certificate', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12);
    doc.text(`Policy Number: ${policy.policyNumber}`);
    doc.text(`Policy Type: ${policy.policyType}`);
    doc.text(`Status: ${policy.status}`);
    doc.moveDown();

    doc.text(`Policyholder: ${policy.customer.name}`);
    doc.text(`Email: ${policy.customer.email}`);
    if (policy.customer.phone) doc.text(`Phone: ${policy.customer.phone}`);
    if (policy.customer.address) doc.text(`Address: ${policy.customer.address}`);
    doc.moveDown();

    doc.text(`Premium Amount: Rs. ${policy.premiumAmount.toLocaleString()}`);
    doc.text(`Start Date: ${new Date(policy.startDate).toLocaleDateString()}`);
    doc.text(`End Date: ${new Date(policy.endDate).toLocaleDateString()}`);
    doc.moveDown(2);

    doc.fontSize(10).fillColor('gray').text(
      `Generated on ${new Date().toLocaleDateString()} - This is a system-generated certificate.`,
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    next(err);
  }
};