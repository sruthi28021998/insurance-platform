const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/claim.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', ctrl.getClaims);
router.get('/stats', authorize('ADMIN', 'AGENT'), ctrl.getClaimStats);
router.get('/:id', ctrl.getClaimById);
router.post('/', authorize('CUSTOMER', 'ADMIN', 'AGENT'), ctrl.createClaim);
router.patch('/:id/review', authorize('ADMIN', 'AGENT'), ctrl.reviewClaim);

module.exports = router;