const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/claim.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.getClaims);
router.get('/stats', authorize('ADMIN', 'AGENT'), ctrl.getClaimStats);
router.get('/:id', ctrl.getClaimById);

router.post('/', authorize('CUSTOMER', 'ADMIN', 'AGENT'), [
  body('policyId').isInt({ min: 1 }).withMessage('A valid policy ID is required'),
  body('claimAmount').isFloat({ gt: 0 }).withMessage('Claim amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('A reason is required'),
], validate, ctrl.createClaim);

router.patch('/:id/review', authorize('ADMIN', 'AGENT'), [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
], validate, ctrl.reviewClaim);

module.exports = router;