const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// API routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/address', addressRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Furniture Boutique API is running...');
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;