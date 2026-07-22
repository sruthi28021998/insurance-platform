const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/settings.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));

router.get('/', ctrl.getSettings);
router.put('/', [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('claimApprovalThreshold').isFloat({ min: 0 }).withMessage('Threshold must be a positive number'),
], validate, ctrl.updateSettings);

module.exports = router;