const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { customerId, claimId } = req.body;

    const document = await prisma.document.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        customerId: customerId ? Number(customerId) : null,
        claimId: claimId ? Number(claimId) : null,
      },
    });
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { customerId, claimId } = req.query;
    const documents = await prisma.document.findMany({
      where: {
        ...(customerId ? { customerId: Number(customerId) } : {}),
        ...(claimId ? { claimId: Number(claimId) } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json(documents);
  } catch (err) {
    next(err);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const filePath = path.join(__dirname, '..', 'uploads', doc.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

    res.download(filePath, doc.fileName);
  } catch (err) {
    next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const filePath = path.join(__dirname, '..', 'uploads', doc.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.document.delete({ where: { id: doc.id } });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};