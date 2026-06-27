const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// Public endpoints
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.get('/categories', productController.getCategories);

// Protected admin CRUD endpoints
router.post('/products', authenticateToken, productController.createProduct);
router.put('/products/:id', authenticateToken, productController.updateProduct);
router.delete('/products/:id', authenticateToken, productController.deleteProduct);

router.post('/categories', authenticateToken, productController.createCategory);
router.put('/categories/:id', authenticateToken, productController.updateCategory);
router.delete('/categories/:id', authenticateToken, productController.deleteCategory);

module.exports = router;
