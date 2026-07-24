const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/audit.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate, authorize('ADMIN'));
router.get('/', ctrl.getAuditLogs);

module.exports = router;