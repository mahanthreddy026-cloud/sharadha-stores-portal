const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Publicly accessible endpoints
router.post('/orders', orderController.createBulkOrder);
router.get('/orders/:id', orderController.getBulkOrderById); // Tracking accepts Request ID (e.g. SRD-2026...)
router.post('/orders/:id/payment', orderController.addPayment);

// Protected administrative endpoints
router.get('/orders', authenticateToken, orderController.getBulkOrders);
router.post('/orders/:id/quote', authenticateToken, orderController.generateQuote);
router.put('/orders/:id/status', authenticateToken, orderController.updateOrderStatus);
router.put('/orders/:id/dispatch', authenticateToken, orderController.updateDispatch);
router.delete('/orders/:id', authenticateToken, orderController.deleteOrder);

module.exports = router;
