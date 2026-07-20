const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/policy.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', ctrl.getPolicies);
router.get('/expiring', authorize('ADMIN', 'AGENT'), ctrl.getExpiringPolicies);
router.get('/:id', ctrl.getPolicyById);
router.post('/', authorize('ADMIN', 'AGENT'), ctrl.createPolicy);
router.put('/:id', authorize('ADMIN', 'AGENT'), ctrl.updatePolicy);
router.patch('/:id/cancel', authorize('ADMIN', 'AGENT'), ctrl.cancelPolicy);

module.exports = router;