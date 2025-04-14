const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Get all products with filtering and sorting options
router.get('/', productController.getAllProducts);

// Get a single product
router.get('/:id', productController.getProductById);

// Get similar products
router.get('/:id/similar', productController.getSimilarProducts);

// Create a new product
router.post('/', productController.createProduct);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

// Update product stock
router.patch('/:id/stock', productController.updateStock);

module.exports = router;
