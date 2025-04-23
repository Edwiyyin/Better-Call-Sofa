// DOM Elements
const productGrid = document.getElementById('product-grid');
const filterOptions = document.querySelectorAll('.filter-option');
const searchInput = document.querySelector('.search-filter input');
const searchButton = document.querySelector('.search-filter button');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const cartItems = document.getElementById('cart-items');
const userBtn = document.querySelector('.user-btn');
const wishlistBtn = document.querySelector('.wishlist-btn');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
// We'll use the wishlist from state.js instead of redefining it here
// let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Fetch products from the JSON file
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Render a single product card
function renderProductCard(product) {
  const discountPrice = product.discount > 0 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : null;
  
  // Use the global wishlist from state.js
  const isInWishlist = wishlist.includes(product.id);
  
  return `
    <div class="product-card" data-category="${product.category}">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}">
        ${product.discount > 0 ? `<span class="product-discount">-${product.discount}%</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn add-to-cart" data-id="${product.id}">
            <i class="fas fa-shopping-cart"></i>
          </button>
          <button class="product-action-btn add-to-wishlist ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="product-action-btn quick-view" data-id="${product.id}">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">
          <span class="current-price">$${discountPrice || product.price}</span>
          ${discountPrice ? `<span class="original-price">$${product.price}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Render all products
async function renderProducts(filter = 'all', searchTerm = '') {
  const products = await fetchProducts();
  
  // Filter products based on category and search term
  let filteredProducts = products;
  
  if (filter !== 'all') {
    filteredProducts = products.filter(product => 
      product.category.toLowerCase() === filter.toLowerCase()
    );
  }
  
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Render the filtered products
  if (productGrid) {
    productGrid.innerHTML = filteredProducts.map(product => renderProductCard(product)).join('');
    
    // Add event listeners to the newly created elements
    addProductEventListeners();
  }
}

// Add event listeners to product buttons
function addProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      addToCart(productId);
    });
  });
  
  // Add to wishlist buttons
  document.querySelectorAll('.add-to-wishlist').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = e.currentTarget.getAttribute('data-id');
      toggleWishlist(productId);
    });
  });
  
  // Quick view buttons
  document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      quickView(productId);
    });
  });
}

// Add product to cart
async function addToCart(productId) {
  const products = await fetchProducts();
  const product = products.find(p => p.id === productId);
  
  if (product) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.discount > 0 
          ? product.price * (1 - product.discount / 100) 
          : product.price,
        image: product.images[0],
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCartItems();
  }
}

// Quick view product
async function quickView(productId) {
  const products = await fetchProducts();
  const product = products.find(p => p.id === productId);
  
  if (product) {
    // This would typically show a modal with product details
    console.log(`Quick view for product: ${product.name}`);
  }
}

// Update cart badge
function updateCartBadge() {
  const cartBadge = document.querySelector('.cart-btn .badge');
  if (cartBadge) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Render cart items
function renderCartItems() {
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease" data-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <button class="quantity-btn increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
  
  // Add event listeners to cart item buttons
  addCartItemEventListeners();
}

// Add event listeners to cart item buttons
function addCartItemEventListeners() {
  // Decrease quantity buttons
  document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      updateCartItemQuantity(productId, -1);
    });
  });
  
  // Increase quantity buttons
  document.querySelectorAll('.quantity-btn.increase').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      updateCartItemQuantity(productId, 1);
    });
  });
  
  // Remove item buttons
  document.querySelectorAll('.cart-item-remove').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      removeFromCart(productId);
    });
  });
  
  // Quantity input change
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = e.currentTarget.getAttribute('data-id');
      const newQuantity = parseInt(e.currentTarget.value);
      
      if (newQuantity > 0) {
        const item = cart.find(item => item.id === productId);
        if (item) {
          item.quantity = newQuantity;
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartBadge();
        }
      }
    });
  });
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      renderCartItems();
    }
  }
}

// Remove item from cart
function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
  
  // Close cart if empty
  if (cart.length === 0) {
    closeCart();
  }
}


// Initialize the page
function init() {
  // Render products
  renderProducts();
  
  // Update cart badge
  updateCartBadge();
  
  // Filter options
  if (filterOptions) {
    filterOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove active class from all options
        filterOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        option.classList.add('active');
        
        // Get the filter value
        const filter = option.textContent.toLowerCase();
        
        // Render filtered products
        renderProducts(filter, searchInput ? searchInput.value : '');
      });
    });
  }
  
  // Search functionality
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value;
      const activeFilter = document.querySelector('.filter-option.active').textContent.toLowerCase();
      renderProducts(activeFilter, searchTerm);
    });
  }
  
  // Cart modal
  if (cartBtn && cartModal && modalOverlay) {
    cartBtn.addEventListener('click', () => {
      cartModal.classList.add('active');
      modalOverlay.classList.add('active');
      renderCartItems();
    });
  
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        cartModal.classList.remove('active');
        modalOverlay.classList.remove('active');
      });
    }
  
    modalOverlay.addEventListener('click', () => {
      cartModal.classList.remove('active');
      modalOverlay.classList.remove('active');
    });
  }
  
  // User button - redirect to login page
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
  
  // NOTE: We're NOT adding a click handler to wishlistBtn here to allow state.js to handle it
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);