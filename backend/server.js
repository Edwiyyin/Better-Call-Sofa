const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Serve the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/templates/home.html'));
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
