const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/customer/register', customerController.register);
router.post('/customer/login', customerController.login);

// Secure routes
router.get('/customer/orders', authenticateToken, customerController.getOrders);

module.exports = router;
