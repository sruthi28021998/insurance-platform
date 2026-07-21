const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/customer.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'AGENT'), ctrl.getCustomers);

router.post('/', authorize('ADMIN', 'AGENT'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
], validate, ctrl.createCustomer);

router.get('/:id', ctrl.getCustomerById);
router.put('/:id', authorize('ADMIN', 'AGENT'), ctrl.updateCustomer);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteCustomer);

module.exports = router;