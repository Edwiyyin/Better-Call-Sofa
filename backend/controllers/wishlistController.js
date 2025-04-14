const Wishlist = require('../models/Wishlist');

// Get user wishlist
exports.getWishlist = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const wishlist = Wishlist.getWishlist(userId);
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add item to wishlist
exports.addToWishlist = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const result = Wishlist.addToWishlist(userId, productId);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { productId } = req.params;
    
    const result = Wishlist.removeFromWishlist(userId, productId);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Clear wishlist
exports.clearWishlist = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const result = Wishlist.clearWishlist(userId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update item priority
exports.updateItemPriority = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { productId } = req.params;
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required'
      });
    }
    
    const result = Wishlist.updateItemPriority(userId, productId, parseInt(priority));
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Sort wishlist
exports.sortWishlist = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { sortBy } = req.query;
    
    const result = Wishlist.sortWishlist(userId, sortBy);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};