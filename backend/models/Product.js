const db = require('./database');

class Product {
  constructor() {
    this.products = [];
    this.loadProducts();
  }

  loadProducts() {
    this.products = db.getProducts();
  }

  saveProducts() {
    db.saveProducts(this.products);
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  createProduct(productData) {
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, productData) {
    const index = this.products.findIndex(product => product.id === id);
    
    if (index === -1) return null;
    
    const updatedProduct = {
      ...this.products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    this.products[index] = updatedProduct;
    this.saveProducts();
    return updatedProduct;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(product => product.id === id);
    
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    this.saveProducts();
    return true;
  }

  updateStock(id, quantity) {
    const product = this.getProductById(id);
    
    if (!product) return null;
    
    if (product.stock < quantity) return { error: 'Not enough stock' };
    
    product.stock -= quantity;
    this.saveProducts();
    return product;
  }

  filterProducts(filters) {
    let filteredProducts = [...this.products];
    
    // Filter by name
    if (filters.name) {
      const nameRegex = new RegExp(filters.name, 'i');
      filteredProducts = filteredProducts.filter(product => nameRegex.test(product.name));
    }
    
    // Filter by category
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => product.category === filters.category);
    }
    
    // Filter by color
    if (filters.color) {
      filteredProducts = filteredProducts.filter(product => 
        product.colors.includes(filters.color)
      );
    }
    
    // Filter by size
    if (filters.size) {
      filteredProducts = filteredProducts.filter(product => 
        product.sizes.includes(filters.size)
      );
    }
    
    // Filter by material
    if (filters.material) {
      filteredProducts = filteredProducts.filter(product => product.material === filters.material);
    }
    
    // Filter by price range
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= parseFloat(filters.minPrice)
      );
    }
    
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= parseFloat(filters.maxPrice)
      );
    }
    
    // Filter by discount
    if (filters.hasDiscount) {
      filteredProducts = filteredProducts.filter(product => product.discount > 0);
    }
    
    return filteredProducts;
  }

  sortProducts(products, sortBy) {
    const productsToSort = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return productsToSort.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return productsToSort.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return productsToSort.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return productsToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return productsToSort;
    }
  }

  getSimilarProducts(id, limit = 4) {
    const product = this.getProductById(id);
    if (!product) return [];
    
    // Find products with same category and/or material
    let similarProducts = this.products.filter(p => 
      p.id !== id && (p.category === product.category || p.material === product.material)
    );
    
    // Sort by relevance (matching both category and material is more relevant)
    similarProducts.sort((a, b) => {
      const aMatches = (a.category === product.category ? 1 : 0) + (a.material === product.material ? 1 : 0);
      const bMatches = (b.category === product.category ? 1 : 0) + (b.material === product.material ? 1 : 0);
      return bMatches - aMatches;
    });
    
    // Return limited number of similar products
    return similarProducts.slice(0, limit);
  }
}

module.exports = new Product();