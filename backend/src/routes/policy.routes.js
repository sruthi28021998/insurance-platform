const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/policy.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.getPolicies);
router.get('/expiring', authorize('ADMIN', 'AGENT'), ctrl.getExpiringPolicies);
router.get('/:id', ctrl.getPolicyById);

router.post('/', authorize('ADMIN', 'AGENT'), [
  body('customerId').isInt({ min: 1 }).withMessage('A valid customer ID is required'),
  body('policyType').trim().notEmpty().withMessage('Policy type is required'),
  body('policyNumber').trim().notEmpty().withMessage('Policy number is required'),
  body('premiumAmount').isFloat({ gt: 0 }).withMessage('Premium amount must be greater than 0'),
  body('startDate').isISO8601().withMessage('A valid start date is required'),
  body('endDate').isISO8601().withMessage('A valid end date is required')
    .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
    .withMessage('End date must be after start date'),
], validate, ctrl.createPolicy);

router.put('/:id', authorize('ADMIN', 'AGENT'), ctrl.updatePolicy);
router.patch('/:id/cancel', authorize('ADMIN', 'AGENT'), ctrl.cancelPolicy);

module.exports = router;