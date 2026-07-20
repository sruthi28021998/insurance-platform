const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/document.controller');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', ctrl.getDocuments);
router.post('/upload', upload.single('file'), ctrl.uploadDocument);
router.get('/:id/download', ctrl.downloadDocument);
router.delete('/:id', ctrl.deleteDocument);

module.exports = router;