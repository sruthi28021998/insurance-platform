const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/report.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/customer-growth', ctrl.getCustomerGrowth);
router.get('/monthly', ctrl.getMonthlyReport);

module.exports = router;