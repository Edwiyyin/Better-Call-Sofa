// DOM Elements
const productsGrid = document.querySelector('.products-grid');
const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
const priceRange = document.querySelector('#price-range');
const minPriceInput = document.querySelector('#min-price');
const maxPriceInput = document.querySelector('#max-price');
const applyFiltersBtn = document.querySelector('.apply-filters-btn');
const sortSelect = document.querySelector('#sort-by');
const cartModal = document.querySelector('#cart-modal');
const cartOverlay = document.querySelector('#modal-overlay');
const closeModalBtn = document.querySelector('#close-modal');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutBtn = document.querySelector('.checkout-btn');
const productsCount = document.getElementById('products-count');
const paginationContainer = document.querySelector('.pagination');
const prevPageBtn = document.querySelector('.prev-page');
const nextPageBtn = document.querySelector('.next-page');
const pageNumbers = document.querySelector('.page-numbers');
const categoryFilterButtons = document.querySelectorAll('.filter-option');

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
let itemsPerPage = 12;
let totalPages = 1;
let filteredProducts = [];
let activeCategory = 'all';
let filters = {
  categories: [],
  priceRange: {
    min: 0,
    max: 1000
  },
  rooms: [],
  materials: []
};

// Fetch Products
async function fetchProducts() {
  try {
    const response = await fetch('/backend/data/products.json');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    products = await response.json();
    filteredProducts = [...products];
    updatePagination();
    renderProducts();
    updateCartBadge();
  } catch (error) {
    console.error('Error fetching products:', error);
    productsGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
  }
}

// Render Product Card
function renderProductCard(product) {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  const fixedImagePath = product.images[0].replace('/public/images/', '/backend/public/images/');
  const isInWishlist = wishlist.includes(product.id);
  
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${fixedImagePath}" alt="${product.name}">
        ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn add-to-cart" title="Add to Cart">
            <i class="fas fa-shopping-cart"></i>
          </button>
          <button class="product-action-btn add-to-wishlist ${isInWishlist ? 'active' : ''}" title="Add to Favorites">
            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="product-action-btn quick-view" title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">
          <span class="current-price">$${discountedPrice.toFixed(2)}</span>
          ${product.discount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Filter Products
function filterProducts() {
  let filtered = [...products];
  
  // Filter by category
  if (activeCategory !== 'all') {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === activeCategory
    );
  }
  
  // Filter by price range
  filtered = filtered.filter(product => 
    product.price >= filters.priceRange.min && 
    product.price <= filters.priceRange.max
  );
  
  // Filter by room type
  if (filters.rooms.length > 0) {
    filtered = filtered.filter(product => 
      filters.rooms.some(room => 
        product.roomType.toLowerCase() === room.toLowerCase()
      )
    );
  }
  
  // Filter by material
  if (filters.materials.length > 0) {
    filtered = filtered.filter(product => 
      filters.materials.some(material => 
        product.material.toLowerCase() === material.toLowerCase()
      )
    );
  }
  
  // Sort products
  const sortBy = sortSelect.value;
  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default: // featured
      filtered.sort((a, b) => b.featured - a.featured);
  }
  
  return filtered;
}

// Update Pagination
function updatePagination() {
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Generate page numbers
  let pageNumbersHTML = '';
  
  if (totalPages <= 5) {
    // Show all pages if 5 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pageNumbersHTML += `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
  } else {
    // Always show first page
    pageNumbersHTML += `<button class="${currentPage === 1 ? 'active' : ''}">1</button>`;
    
    // Show ellipsis and pages around current page
    if (currentPage > 3) {
      pageNumbersHTML += '<span>...</span>';
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbersHTML += `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    if (currentPage < totalPages - 2) {
      pageNumbersHTML += '<span>...</span>';
    }
    
    // Always show last page
    pageNumbersHTML += `<button class="${currentPage === totalPages ? 'active' : ''}">${totalPages}</button>`;
  }
  
  pageNumbers.innerHTML = pageNumbersHTML;
  
  // Update prev/next buttons
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  
  // Add event listeners to page buttons
  document.querySelectorAll('.page-numbers button').forEach(button => {
    button.addEventListener('click', () => {
      currentPage = parseInt(button.textContent);
      renderProducts();
    });
  });
}

// Render Products
function renderProducts() {
  // Filter and sort products
  filteredProducts = filterProducts();
  
  // Calculate start and end indices for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);
  
  // Update products count
  productsCount.textContent = filteredProducts.length;
  
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
    paginationContainer.style.display = 'none';
    return;
  }
  
  // Show pagination if there are products
  paginationContainer.style.display = 'flex';
  
  // Render products for current page
  productsGrid.innerHTML = productsToShow.map(product => renderProductCard(product)).join('');
  
  // Add event listeners to product cards
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.id;
    const product = products.find(p => p.id === productId);
    
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
    card.querySelector('.add-to-wishlist').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product);
    });
    card.querySelector('.quick-view').addEventListener('click', () => quickView(product));
  });
  
  // Update pagination
  updatePagination();
}

// Cart Functions
function addToCart(product, quantity = 1) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: product.images[0].replace('/public/images/', '/backend/public/images/'),
      quantity: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  openCart();
}

function updateCart() {
  // Update cart badge
  updateCartBadge();
  
  // Update cart items
  cartItemsContainer.innerHTML = cart.length === 0 
    ? '<p class="empty-cart">Your cart is empty</p>'
    : cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1">
            <button class="quantity-btn increase">+</button>
          </div>
        </div>
        <button class="cart-item-remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  
  // Update cart total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
  
  // Add event listeners to cart items
  document.querySelectorAll('.cart-item').forEach(item => {
    const productId = item.dataset.id;
    
    item.querySelector('.decrease').addEventListener('click', () => {
      const cartItem = cart.find(i => i.id === productId);
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      }
    });
    
    item.querySelector('.increase').addEventListener('click', () => {
      const cartItem = cart.find(i => i.id === productId);
      cartItem.quantity += 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    });
    
    item.querySelector('.quantity-input').addEventListener('change', (e) => {
      const cartItem = cart.find(i => i.id === productId);
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        cartItem.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
      }
    });
    
    item.querySelector('.cart-item-remove').addEventListener('click', () => {
      cart = cart.filter(i => i.id !== productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    });
  });
}

function openCart() {
  cartModal.classList.add('active');
  cartOverlay.classList.add('active');
}

function closeCart() {
  cartModal.classList.remove('active');
  cartOverlay.classList.remove('active');
}

function updateCartBadge() {
  const cartBadge = document.querySelector('.cart-btn .badge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function quickView(product) {
  // Create modal elements
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'quick-view-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'quick-view-modal';
  modal.id = 'quick-view-modal';
  
  // Calculate discounted price
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  const isInWishlist = wishlist.includes(product.id);
  const fixedImagePath = product.images[0].replace('/public/images/', '/backend/public/images/');
  
  // Create modal content
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Quick View</div>
      <button class="close-modal" id="close-quick-view">&times;</button>
    </div>
    <div class="modal-body">
      <div class="quick-view-content">
        <div class="quick-view-image">
          <img src="${fixedImagePath}" alt="${product.name}">
        </div>
        <div class="quick-view-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-category">${product.category}</div>
          <div class="product-price">
            <span class="current-price">$${discountedPrice.toFixed(2)}</span>
            ${product.discount ? `<span class="original-price">$${product.price.toFixed(2)}</span>
            <span class="discount-badge">-${product.discount}%</span>` : ''}
          </div>
          <div class="product-description">
            <p>${product.description || 'No description available'}</p>
          </div>

          <div class="add-to-cart">
            <div class="quantity-selector">
              <button class="quantity-btn decrease">-</button>
              <input type="number" class="quantity-input" value="1" min="1" max="10">
              <button class="quantity-btn increase">+</button>
            </div>
            <button class="add-to-cart-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="add-to-wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
              <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
            </button>
          </div>
          <div class="view-details-link">
            <a href="product-detail.html?id=${product.id}">View Full Details</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the DOM
  document.body.appendChild(modalOverlay);
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modal.classList.add('open');
  }, 10);
  
  // Add event listeners
  const closeBtn = document.getElementById('close-quick-view');
  closeBtn.addEventListener('click', closeQuickView);
  
  modalOverlay.addEventListener('click', closeQuickView);
  
  // Quantity buttons
  const quantityInput = modal.querySelector('.quantity-input');
  const decreaseBtn = modal.querySelector('.decrease');
  const increaseBtn = modal.querySelector('.increase');
  
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
      quantityInput.value = currentValue + 1;
    }
  });
  
  // Add to cart button
  const addToCartBtn = modal.querySelector('.add-to-cart-btn');
  addToCartBtn.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value);
    addToCart(product, quantity);
    closeQuickView();
  });
  
  // Add to wishlist button
  const addToWishlistBtn = modal.querySelector('.add-to-wishlist-btn');
  addToWishlistBtn.addEventListener('click', () => {
    toggleWishlist(product);
    
    // Update button state
    addToWishlistBtn.classList.toggle('active');
    const icon = addToWishlistBtn.querySelector('i');
    icon.className = addToWishlistBtn.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
  });
}

function closeQuickView() {
  const modalOverlay = document.getElementById('quick-view-overlay');
  if (!modalOverlay) return; // Check if modal exists
  const modal = document.getElementById('quick-view-modal');
  
  modalOverlay.classList.remove('active');
  modal.classList.remove('open');
  
  // Remove modal from DOM after animation
  setTimeout(() => {
    if (modalOverlay && modalOverlay.parentNode) {
      document.body.removeChild(modalOverlay);
    }
    if (modal && modal.parentNode) {
      document.body.removeChild(modal);
    }
  }, 300);
}

// Event Listeners for filters
document.querySelectorAll('.filter-list input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const filterType = radio.name;
    const value = radio.value;
    
    if (filterType === 'category') {
      activeCategory = value.toLowerCase();
    } else if (filterType === 'roomType') {
      filters.rooms = [value];
    } else if (filterType === 'material') {
      filters.materials = [value];
    }
    
    renderProducts();
  });
});

// Category filter buttons
if (categoryFilterButtons) {
  categoryFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update active category
      activeCategory = button.textContent.toLowerCase();
      
      // Render products with new filter
      renderProducts();
    });
  });
}

priceRange.addEventListener('input', (e) => {
  const value = e.target.value;
  maxPriceInput.value = value;
  filters.priceRange.max = parseInt(value);
  renderProducts();
});

minPriceInput.addEventListener('change', (e) => {
  const value = parseInt(e.target.value);
  if (value >= 0 && value <= filters.priceRange.max) {
    filters.priceRange.min = value;
    renderProducts();
  }
});

maxPriceInput.addEventListener('change', (e) => {
  const value = parseInt(e.target.value);
  if (value >= filters.priceRange.min) {
    filters.priceRange.max = value;
    priceRange.value = value;
    renderProducts();
  }
});

applyFiltersBtn.addEventListener('click', () => {
  renderProducts();
});

sortSelect.addEventListener('change', () => {
  renderProducts();
});

// Pagination event listeners
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts();
  }
});

nextPageBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts();
  }
});

closeModalBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => {
  // Redirect to checkout page
  window.location.href = 'checkout.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});