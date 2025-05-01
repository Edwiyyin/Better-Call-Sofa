const express = require('express');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
const routes = require('./routes');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/backend/public/images', express.static(path.join(__dirname, 'public/images')));

// Use routes
app.use('/', routes);

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