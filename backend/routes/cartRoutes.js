const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item
router.put('/item/:itemIndex', cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:itemIndex', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

// Checkout
router.post('/checkout', cartController.checkout);

module.exports = router;
