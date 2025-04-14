const express = require('express');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

// Get wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/item/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

// Update item priority
router.patch('/item/:productId/priority', wishlistController.updateItemPriority);

// Sort wishlist
router.get('/sort', wishlistController.sortWishlist);

module.exports = router;
