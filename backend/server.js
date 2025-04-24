const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend/public/images', express.static(path.join(__dirname, 'public/images')));

// API endpoint to get all products
app.get('/api/products', (req, res) => {
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
app.get('/api/wishlist', (req, res) => {
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

// Serve HTML pages

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/home.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/home.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/register.html'));
});

app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/products.html'));
});

app.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/product-detail.html'));
});

app.get('/wishlist.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/wishlist.html'));
});

app.get('/checkout.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/checkout.html'));
});

app.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/payment.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});