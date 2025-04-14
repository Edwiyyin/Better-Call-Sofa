const db = require('./database');
const Product = require('./Product');

class Cart {
  constructor() {
    this.carts = {};
    this.loadCarts();
  }

  loadCarts() {
    this.carts = db.getCarts();
  }

  saveCarts() {
    db.saveCarts(this.carts);
  }

  getCart(userId) {
    // If user doesn't have a cart yet, create an empty one
    if (!this.carts[userId]) {
      this.carts[userId] = {
        items: [],
        updatedAt: new Date().toISOString()
      };
      this.saveCarts();
    }
    
    return this.carts[userId];
  }

  addToCart(userId, productId, quantity = 1, color, size) {
    // Get user cart
    const cart = this.getCart(userId);
    
    // Check if product exists
    const product = Product.getProductById(productId);
    if (!product) {
      return { error: 'Product not found' };
    }
    
    // Check if product has enough stock
    if (product.stock < quantity) {
      return { error: 'Not enough stock' };
    }
    
    // Check if product with same options exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && item.color === color && item.size === size
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist yet
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        discount: product.discount,
        currency: product.currency,
        image: product.images[0],
        quantity,
        color,
        size
      });
    }
    
    // Update cart timestamp
    cart.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveCarts();
    
    return cart;
  }

  updateCartItem(userId, itemIndex, updates) {
    const cart = this.getCart(userId);
    
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return { error: 'Item not found in cart' };
    }
    
    // If quantity is being updated, check stock
    if (updates.quantity) {
      const product = Product.getProductById(cart.items[itemIndex].productId);
      if (!product) {
        return { error: 'Product no longer exists' };
      }
      
      if (product.stock < updates.quantity) {
        return { error: 'Not enough stock' };
      }
    }
    
    // Update item
    cart.items[itemIndex] = {
      ...cart.items[itemIndex],
      ...updates
    };
    
    // Update cart timestamp
    cart.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveCarts();
    
    return cart;
  }

  removeFromCart(userId, itemIndex) {
    const cart = this.getCart(userId);
    
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return { error: 'Item not found in cart' };
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Update cart timestamp
    cart.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveCarts();
    
    return cart;
  }

  clearCart(userId) {
    // Create empty cart for user
    this.carts[userId] = {
      items: [],
      updatedAt: new Date().toISOString()
    };
    
    // Save changes
    this.saveCarts();
    
    return this.carts[userId];
  }

  checkout(userId, shippingAddress) {
    const cart = this.getCart(userId);
    
    if (cart.items.length === 0) {
      return { error: 'Cart is empty' };
    }
    
    // Check stock for all items
    for (const item of cart.items) {
      const product = Product.getProductById(item.productId);
      
      if (!product) {
        return { error: `Product ${item.name} no longer exists` };
      }
      
      if (product.stock < item.quantity) {
        return { error: `Not enough stock for ${item.name}` };
      }
    }
    
    // Update stock for all items
    cart.items.forEach(item => {
      Product.updateStock(item.productId, item.quantity);
    });
    
    // Create order details
    const order = {
      orderId: `ORD-${Date.now()}`,
      items: cart.items,
      shippingAddress,
      totalAmount: this.calculateTotal(cart),
      createdAt: new Date().toISOString()
    };
    
    // Clear cart after successful checkout
    this.clearCart(userId);
    
    return order;
  }

  calculateTotal(cart) {
    return cart.items.reduce((total, item) => {
      // Calculate discounted price if applicable
      const discountedPrice = item.price * (1 - (item.discount / 100));
      return total + (discountedPrice * item.quantity);
    }, 0);
  }
}

module.exports = new Cart();