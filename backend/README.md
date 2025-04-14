# Furniture Boutique E-commerce Backend

A Node.js backend for a furniture-themed e-commerce website, built with Express.js.

## Features

- Product catalog with filtering, sorting, and pagination
- Shopping cart functionality with checkout processing
- Wishlist management with priority and custom sorting options
- Product discount handling
- Similar product recommendations
- Address management with geocoding
- Data persistence using JSON files
- Inventory management for product stock

## Technical Stack

- Node.js
- Express.js
- Node-geocoder for address validation
- JSON file-based data storage

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   
For development with automatic restarts:
```
npm run dev
```

## API Endpoints

### Products

- `GET /api/products` - Get all products with pagination, filtering, and sorting
- `GET /api/products/:id` - Get a single product by ID
- `GET /api/products/:id/similar` - Get products similar to a specific product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products by keyword

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add product to cart
- `PUT /api/cart/update/:itemIndex` - Update cart item (quantity, color, size)
- `DELETE /api/cart/item/:itemIndex` - Remove item from cart
- `DELETE /api/cart` - Clear the entire cart
- `POST /api/cart/checkout` - Process checkout and create order

### Wishlist

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add product to wishlist
- `DELETE /api/wishlist/item/:productId` - Remove item from wishlist
- `DELETE /api/wishlist` - Clear the entire wishlist
- `PATCH /api/wishlist/item/:productId/priority` - Update item priority in wishlist
- `GET /api/wishlist/sort` - Sort wishlist by different criteria

### Address Management

- `GET /api/addresses` - Get all addresses for user
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:addressId` - Update existing address
- `DELETE /api/addresses/:addressId` - Delete address
- `PATCH /api/addresses/:addressId/set-default` - Set address as default

## Data Structure

The application uses JSON files for data persistence:

- `data/products.json` - Product catalog with details including:
  - Basic info (name, description, price, discount)
  - Inventory data (stock)
  - Categorization (category, roomType)
  - Variants (colors, sizes)
  - Materials and other attributes
- `data/cart.json` - Shopping cart data
- `data/wishlist.json` - Wishlist data
- `data/addresses.json` - User addresses

## User Identification

For simplicity, this backend identifies users through a `user-id` header. In a production environment, this would be replaced with proper authentication.

Example:
```
headers: {
  'user-id': 'user123'
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

Response format:
```json
{
  "success": true/false,
  "data": {}, // Response data (when success is true)
  "message": "" // Error message (when success is false)
}
```

## Future Enhancements

- Authentication and user management
- Order processing
- Payment integration
- Product reviews and ratings
- Inventory management
- Admin dashboard