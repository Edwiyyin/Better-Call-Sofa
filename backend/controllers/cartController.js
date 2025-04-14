const Cart = require('../models/Cart');

// Get user cart
exports.getCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const cart = Cart.getCart(userId);
    
    // Calculate total price
    const totalPrice = Cart.calculateTotal(cart);
    
    res.status(200).json({
      success: true,
      data: {
        ...cart,
        totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add item to cart
exports.addToCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { productId, quantity, color, size } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const result = Cart.addToCart(userId, productId, quantity, color, size);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    // Calculate total price
    const totalPrice = Cart.calculateTotal(result);
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        totalPrice
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update cart item
exports.updateCartItem = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { itemIndex } = req.params;
    const updates = req.body;
    
    const result = Cart.updateCartItem(userId, parseInt(itemIndex), updates);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    // Calculate total price
    const totalPrice = Cart.calculateTotal(result);
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        totalPrice
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { itemIndex } = req.params;
    
    const result = Cart.removeFromCart(userId, parseInt(itemIndex));
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    // Calculate total price
    const totalPrice = Cart.calculateTotal(result);
    
    res.status(200).json({
      success: true,
      data: {
        ...result,
        totalPrice
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Clear cart
exports.clearCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const result = Cart.clearCart(userId);
    
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

// Checkout cart
exports.checkout = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const { shippingAddress } = req.body;
    
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    const result = Cart.checkout(userId, shippingAddress);
    
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