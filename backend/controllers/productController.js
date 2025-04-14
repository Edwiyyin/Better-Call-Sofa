const Product = require('../models/Product');
const { paginate } = require('../utils/apiFeatures');

// Get all products with filtering, sorting and pagination
exports.getAllProducts = (req, res) => {
  try {
    // Parse query parameters
    const filters = {
      name: req.query.name,
      category: req.query.category,
      color: req.query.color,
      size: req.query.size,
      material: req.query.material,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      hasDiscount: req.query.hasDiscount === 'true'
    };

    const sortBy = req.query.sortBy || 'newest';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Filter products
    let filteredProducts = Product.filterProducts(filters);
    
    // Sort products
    const sortedProducts = Product.sortProducts(filteredProducts, sortBy);
    
    // Paginate results
    const paginatedResults = paginate(sortedProducts, page, limit);
    
    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      pagination: paginatedResults.pagination,
      data: paginatedResults.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = (req, res) => {
  try {
    const product = Product.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new product
exports.createProduct = (req, res) => {
  try {
    const newProduct = Product.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a product
exports.updateProduct = (req, res) => {
  try {
    const updatedProduct = Product.updateProduct(req.params.id, req.body);
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a product
exports.deleteProduct = (req, res) => {
  try {
    const result = Product.deleteProduct(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product stock
exports.updateStock = (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }
    
    const result = Product.updateStock(req.params.id, parseInt(quantity));
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
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

// Get similar products
exports.getSimilarProducts = (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    const similarProducts = Product.getSimilarProducts(id, limit);
    
    res.status(200).json({
      success: true,
      count: similarProducts.length,
      data: similarProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
