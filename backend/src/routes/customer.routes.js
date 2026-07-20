const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customer.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'AGENT'), ctrl.getCustomers);
router.post('/', authorize('ADMIN', 'AGENT'), ctrl.createCustomer);
router.get('/:id', ctrl.getCustomerById);
router.put('/:id', authorize('ADMIN', 'AGENT'), ctrl.updateCustomer);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteCustomer);

module.exports = router;