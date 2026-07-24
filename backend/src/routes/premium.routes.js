const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/premium.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.getPremiums);
router.get('/overdue', authorize('ADMIN', 'AGENT'), ctrl.getOverdue);

router.post('/', [
  body('policyId').isInt({ min: 1 }).withMessage('Valid policy ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
], validate, ctrl.recordPayment);

router.post('/schedule', authorize('ADMIN', 'AGENT'), [
  body('policyId').isInt({ min: 1 }).withMessage('Valid policy ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
], validate, ctrl.scheduleDue);

router.patch('/:id/pay', ctrl.payDue);
router.patch('/:id/status', authorize('ADMIN', 'AGENT'), ctrl.updateStatus);
router.post('/:id/send-sms', authorize('ADMIN', 'AGENT'), ctrl.sendMockSms);
router.post('/:id/send-email', authorize('ADMIN', 'AGENT'), ctrl.sendEmailReminder);

module.exports = router;