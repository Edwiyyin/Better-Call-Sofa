// DOM Elements
const wishlistGrid = document.getElementById('wishlist-grid');
const emptyWishlist = document.getElementById('empty-wishlist');
const productsCount = document.getElementById('products-count');
const sortBy = document.getElementById('sort-by');
const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
const priceRange = document.getElementById('price-range');
const minPrice = document.getElementById('min-price');
const maxPrice = document.getElementById('max-price');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartBadge = document.querySelector('.cart-btn .badge');
const wishlistBadge = document.querySelector('.wishlist-btn .badge');
const headerWishlistBtn = document.querySelector('.nav-actions .wishlist-btn');

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let filters = {
  categories: [],
  priceRange: { min: 0, max: 1500 },
  rooms: [],
  materials: []
};

// Initialize
async function init() {
  try {
    const response = await fetch('/backend/data/products.json');
    products = await response.json();
    
    // Filter products to only show wishlist items
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    
    // Update UI
    updateWishlistBadge();
    updateCartBadge();
    renderWishlist(wishlistProducts);
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing favorites:', error);
  }
}

// Event Listeners
function setupEventListeners() {
  // Sort
  sortBy.addEventListener('change', () => {
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    renderWishlist(wishlistProducts);
  });
  
  // Filters - now apply automatically when changed
  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const type = checkbox.name;
      const value = checkbox.value;
      
      if (checkbox.checked) {
        filters[type].push(value);
      } else {
        filters[type] = filters[type].filter(item => item !== value);
      }
      
      // Apply filters immediately
      const wishlistProducts = products.filter(product => wishlist.includes(product.id));
      renderWishlist(wishlistProducts);
    });
  });
  
  // Price Range - now apply automatically when changed
  priceRange.addEventListener('input', (e) => {
    const value = e.target.value;
    maxPrice.value = value;
    filters.priceRange.max = parseInt(value);
    
    // Apply filters immediately
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    renderWishlist(wishlistProducts);
  });
  
  minPrice.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= filters.priceRange.max) {
      filters.priceRange.min = value;
      
      // Apply filters immediately
      const wishlistProducts = products.filter(product => wishlist.includes(product.id));
      renderWishlist(wishlistProducts);
    }
  });
  
  maxPrice.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (value >= filters.priceRange.min) {
      filters.priceRange.max = value;
      priceRange.value = value;
      
      // Apply filters immediately
      const wishlistProducts = products.filter(product => wishlist.includes(product.id));
      renderWishlist(wishlistProducts);
    }
  });
  
  // Cart Modal
  cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
    modalOverlay.classList.add('active');
    renderCart();
  });
  
  closeModal.addEventListener('click', () => {
    cartModal.classList.remove('active');
    modalOverlay.classList.remove('active');
  });
  
  modalOverlay.addEventListener('click', () => {
    cartModal.classList.remove('active');
    modalOverlay.classList.remove('active');
  });
  
  // Header wishlist button
  headerWishlistBtn.addEventListener('click', () => {
    window.location.href = 'wishlist.html';
  });
}

// Render Functions
function renderWishlist(productsToRender) {
  // Apply filters
  let filteredProducts = filterProducts(productsToRender);
  
  // Apply sorting
  filteredProducts = sortProducts(filteredProducts);
  
  // Update count
  productsCount.textContent = filteredProducts.length;
  
  // Show/hide empty state
  if (filteredProducts.length === 0) {
    wishlistGrid.style.display = 'none';
    emptyWishlist.style.display = 'block';
    return;
  }
  
  wishlistGrid.style.display = 'grid';
  emptyWishlist.style.display = 'none';
  
  // Render products
  wishlistGrid.innerHTML = filteredProducts.map(product => {
    const fixedImagePath = product.images[0].replace('/public/images/', '/backend/public/images/');
    return `
      <div class="product-card">
        <div class="product-image">
          <img src="${fixedImagePath}" alt="${product.name}">
          <button class="wishlist-btn active" data-id="${product.id}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners to buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      toggleWishlist(id);
    });
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    });
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    cartTotal.textContent = '$0.00';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    const fixedImagePath = product.images[0].replace('/public/images/', '/backend/public/images/');
    return `
      <div class="cart-item">
        <img src="${fixedImagePath}" alt="${product.name}">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <div class="cart-item-price">$${product.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" data-id="${product.id}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn plus" data-id="${product.id}">+</button>
        </div>
        <button class="remove-item-btn" data-id="${product.id}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');
  
  // Update total
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product.price * item.quantity);
  }, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
  
  // Add event listeners
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const isPlus = e.currentTarget.classList.contains('plus');
      updateCartItemQuantity(id, isPlus);
    });
  });
  
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });
}

// Helper Functions
function filterProducts(productsToFilter) {
  return productsToFilter.filter(product => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Price range filter
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }
    
    // Room type filter
    if (filters.rooms.length > 0 && !filters.rooms.some(room => product.rooms.includes(room))) {
      return false;
    }
    
    // Material filter
    if (filters.materials.length > 0 && !filters.materials.some(material => product.materials.includes(material))) {
      return false;
    }
    
    return true;
  });
}

function sortProducts(productsToSort) {
  const sortValue = sortBy.value;
  
  switch (sortValue) {
    case 'price-low':
      return productsToSort.sort((a, b) => a.price - b.price);
    case 'price-high':
      return productsToSort.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return productsToSort.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return productsToSort;
  }
}

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  
  if (index === -1) {
    wishlist.push(productId);
  } else {
    wishlist.splice(index, 1);
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
  
  // Re-render wishlist
  const wishlistProducts = products.filter(product => wishlist.includes(product.id));
  renderWishlist(wishlistProducts);
}

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  
  // Show cart modal
  cartModal.classList.add('active');
  modalOverlay.classList.add('active');
  renderCart();
}

function updateCartItemQuantity(productId, increase) {
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (increase) {
      item.quantity += 1;
    } else {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
      }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
}

function updateWishlistBadge() {
  wishlistBadge.textContent = wishlist.length;
  
  // Update header wishlist button icon
  if (headerWishlistBtn) {
    const icon = headerWishlistBtn.querySelector('i');
    if (wishlist.length > 0) {
      icon.className = 'fas fa-heart';
    } else {
      icon.className = 'far fa-heart';
    }
  }
}

// Initialize the page
init(); 