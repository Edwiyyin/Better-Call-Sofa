const db = require('./database');
const Product = require('./Product');

class Wishlist {
  constructor() {
    this.wishlists = {};
    this.loadWishlists();
  }

  loadWishlists() {
    this.wishlists = db.getWishlists();
  }

  saveWishlists() {
    db.saveWishlists(this.wishlists);
  }

  getWishlist(userId) {
    // If user doesn't have a wishlist yet, create an empty one
    if (!this.wishlists[userId]) {
      this.wishlists[userId] = {
        items: [],
        updatedAt: new Date().toISOString()
      };
      this.saveWishlists();
    }
    
    return this.wishlists[userId];
  }

  addToWishlist(userId, productId) {
    // Get user wishlist
    const wishlist = this.getWishlist(userId);
    
    // Check if product exists
    const product = Product.getProductById(productId);
    if (!product) {
      return { error: 'Product not found' };
    }
    
    // Check if product already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      return { error: 'Product already in wishlist' };
    }
    
    // Add new item
    wishlist.items.push({
      productId,
      name: product.name,
      price: product.price,
      discount: product.discount,
      currency: product.currency,
      image: product.images[0],
      priority: wishlist.items.length + 1, // Set priority based on order added
      addedAt: new Date().toISOString()
    });
    
    // Update wishlist timestamp
    wishlist.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveWishlists();
    
    return wishlist;
  }

  removeFromWishlist(userId, productId) {
    const wishlist = this.getWishlist(userId);
    
    // Find item index
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return { error: 'Product not found in wishlist' };
    }
    
    // Remove item
    wishlist.items.splice(itemIndex, 1);
    
    // Reorder priorities
    wishlist.items = wishlist.items.map((item, index) => ({
      ...item,
      priority: index + 1
    }));
    
    // Update wishlist timestamp
    wishlist.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveWishlists();
    
    return wishlist;
  }

  clearWishlist(userId) {
    // Create empty wishlist for user
    this.wishlists[userId] = {
      items: [],
      updatedAt: new Date().toISOString()
    };
    
    // Save changes
    this.saveWishlists();
    
    return this.wishlists[userId];
  }

  updateItemPriority(userId, productId, newPriority) {
    const wishlist = this.getWishlist(userId);
    
    // Find item index
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return { error: 'Product not found in wishlist' };
    }
    
    // Validate new priority
    const maxPriority = wishlist.items.length;
    if (newPriority < 1 || newPriority > maxPriority) {
      return { error: `Priority must be between 1 and ${maxPriority}` };
    }
    
    const oldPriority = wishlist.items[itemIndex].priority;
    
    // Update priorities of all affected items
    wishlist.items.forEach(item => {
      if (oldPriority < newPriority && item.priority > oldPriority && item.priority <= newPriority) {
        item.priority--;
      } else if (oldPriority > newPriority && item.priority >= newPriority && item.priority < oldPriority) {
        item.priority++;
      }
    });
    
    // Set new priority for the target item
    wishlist.items[itemIndex].priority = newPriority;
    
    // Sort items by priority
    wishlist.items.sort((a, b) => a.priority - b.priority);
    
    // Update wishlist timestamp
    wishlist.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveWishlists();
    
    return wishlist;
  }

  sortWishlist(userId, sortBy) {
    const wishlist = this.getWishlist(userId);
    
    switch (sortBy) {
      case 'price-asc':
        wishlist.items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        wishlist.items.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        wishlist.items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        wishlist.items.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        wishlist.items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        break;
      case 'oldest':
        wishlist.items.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
        break;
      case 'priority':
      default:
        wishlist.items.sort((a, b) => a.priority - b.priority);
    }
    
    // Update priorities based on new sort order
    wishlist.items = wishlist.items.map((item, index) => ({
      ...item,
      priority: index + 1
    }));
    
    // Update wishlist timestamp
    wishlist.updatedAt = new Date().toISOString();
    
    // Save changes
    this.saveWishlists();
    
    return wishlist;
  }
}

module.exports = new Wishlist();