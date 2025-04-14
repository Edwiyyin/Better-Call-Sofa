const fs = require('fs');
const path = require('path');

// Define paths to data files
const productsPath = path.join(__dirname, '../data/products.json');
const cartPath = path.join(__dirname, '../data/cart.json');
const wishlistPath = path.join(__dirname, '../data/wishlist.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Read data from JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Object|Array} - Parsed JSON data
 */
function readJSONFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Return default empty data based on file type
      if (filePath.includes('products.json')) {
        return [];
      } else {
        return {};
      }
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    // Return default empty data based on file type
    return filePath.includes('products.json') ? [] : {};
  }
}

/**
 * Write data to JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {Object|Array} data - Data to write
 * @returns {boolean} - Success status
 */
function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
}

// Export database functions
module.exports = {
  // Products
  getProducts: () => readJSONFile(productsPath),
  saveProducts: (data) => writeJSONFile(productsPath, data),
  
  // Cart
  getCarts: () => readJSONFile(cartPath),
  saveCarts: (data) => writeJSONFile(cartPath, data),
  
  // Wishlist
  getWishlists: () => readJSONFile(wishlistPath),
  saveWishlists: (data) => writeJSONFile(wishlistPath, data),
  
  // Utility function to get a single product by ID
  getProductById: (id) => {
    const products = readJSONFile(productsPath);
    return products.find(product => product.id === id);
  },
  
  // Utility function to update product stock
  updateProductStock: (id, quantity) => {
    const products = readJSONFile(productsPath);
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) return null;
    
    products[productIndex].stock -= quantity;
    writeJSONFile(productsPath, products);
    return products[productIndex];
  }
};