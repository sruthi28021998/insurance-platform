const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/premium.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', ctrl.getPremiums);
router.get('/overdue', authorize('ADMIN', 'AGENT'), ctrl.getOverdue);
router.post('/', ctrl.recordPayment);
router.patch('/:id/status', authorize('ADMIN', 'AGENT'), ctrl.updateStatus);

module.exports = router;