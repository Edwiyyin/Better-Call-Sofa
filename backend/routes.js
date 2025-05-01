// routes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// API endpoint to get all products
router.get('/api/products', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
    const products = JSON.parse(productsData);
    res.json(products);
  } catch (error) {
    console.error('Error reading products data:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// API endpoint to get wishlist items
router.get('/api/wishlist', (req, res) => {
  try {
    // In a real application, you would get the user's wishlist from the database
    // For this example, we'll return a sample response
    const productsData = fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8');
    const products = JSON.parse(productsData);
    
    // Get the first 3 products as sample wishlist items
    const wishlistItems = products.slice(0, 3);
    
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// HTML page routes
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/home.html'));
});

router.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/home.html'));
});

router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/login.html'));
});

router.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/register.html'));
});

router.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/products.html'));
});

router.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/product-detail.html'));
});

router.get('/wishlist.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/wishlist.html'));
});

router.get('/checkout.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/checkout.html'));
});

router.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/payment.html'));
});

router.get('/confirmation.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/confirmation.html'));
});

module.exports = router;