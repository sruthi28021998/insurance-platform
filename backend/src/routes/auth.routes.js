const express = require('express');
const router = express.Router();
const { register, login, me, createEmployee } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/employees', authenticate, authorize('ADMIN'), createEmployee);

module.exports = router;