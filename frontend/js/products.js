// DOM Elements
const productsGrid = document.querySelector('.products-grid');
const priceRange = document.querySelector('#price-range');
const minPriceInput = document.querySelector('#min-price');
const maxPriceInput = document.querySelector('#max-price');
const applyFiltersBtn = document.querySelector('.apply-filters-btn');
const sortSelect = document.querySelector('#sort-by');
const productsCount = document.getElementById('products-count');
const paginationContainer = document.querySelector('.pagination');
const prevPageBtn = document.querySelector('.prev-page');
const nextPageBtn = document.querySelector('.next-page');
const pageNumbers = document.querySelector('.page-numbers');

// State
let products = [];
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

// Helper function to render product cards
function renderProductCard(product) {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  
  let imagePath = '/api/placeholder/400/320';
  if (product.images && product.images.length > 0) {
    imagePath = product.images[0].replace('/public/images/', '/backend/public/images/')
      .replace(/(\w+)\s(\w+)/g, '$1-$2');
  }
  
  const isInWishlist = wishlist.includes(product.id);
  
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${imagePath}" alt="${product.name}" onerror="this.src='/api/placeholder/400/320'">
        ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn add-to-wishlist ${isInWishlist ? 'active' : ''}" data-id="${product.id}" title="Add to Favorites">
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
  
  if (activeCategory !== 'all') {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }
  
  filtered = filtered.filter(product => 
    product.price >= filters.priceRange.min && 
    product.price <= filters.priceRange.max
  );
  
  if (filters.rooms.length > 0 && !filters.rooms.includes('all')) {
    filtered = filtered.filter(product => 
      filters.rooms.some(room => 
        product.roomType.toLowerCase() === room.toLowerCase()
      )
    );
  }
  
  if (filters.materials.length > 0 && !filters.materials.includes('all')) {
    filtered = filtered.filter(product => 
      filters.materials.some(material => {
        const productMaterial = product.material ? product.material.toLowerCase() : '';
        return productMaterial.includes(material.toLowerCase());
      })
    );
  }
  
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
    default:
      filtered.sort((a, b) => (b.featured || 0) - (a.featured || 0));
  }
  
  return filtered;
}

// Update Pagination
function updatePagination() {
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  let pageNumbersHTML = '';
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbersHTML += `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
  } else {
    pageNumbersHTML += `<button class="${currentPage === 1 ? 'active' : ''}">1</button>`;
    
    if (currentPage > 3) {
      pageNumbersHTML += '<span>...</span>';
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbersHTML += `<button class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    if (currentPage < totalPages - 2) {
      pageNumbersHTML += '<span>...</span>';
    }
    
    pageNumbersHTML += `<button class="${currentPage === totalPages ? 'active' : ''}">${totalPages}</button>`;
  }
  
  pageNumbers.innerHTML = pageNumbersHTML;
  
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  
  document.querySelectorAll('.page-numbers button').forEach(button => {
    button.addEventListener('click', () => {
      currentPage = parseInt(button.textContent);
      renderProducts();
    });
  });
}

// Render Products
function renderProducts() {
  filteredProducts = filterProducts();
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);
  
  productsCount.textContent = filteredProducts.length;
  
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
    paginationContainer.style.display = 'none';
    return;
  }
  
  paginationContainer.style.display = 'flex';
  productsGrid.innerHTML = productsToShow.map(product => renderProductCard(product)).join('');
  
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.id;
    const product = products.find(p => p.id === productId);
    
    card.querySelector('.add-to-wishlist').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product);
    });
    card.querySelector('.quick-view').addEventListener('click', () => quickView(product));
  });
  
  updatePagination();
}

// Fetch Products
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    products = data;
    filteredProducts = [...products];
    updatePagination();
    renderProducts();
    productsCount.textContent = filteredProducts.length;
  } catch (error) {
    console.error('Error fetching products:', error);
    productsGrid.innerHTML = `<p class="error">Failed to load products: ${error.message}</p>`;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  
  // Event listeners for filters
  document.querySelectorAll('.filter-list input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const filterType = radio.name;
      const value = radio.value;
      
      if (filterType === 'category') {
        activeCategory = value.toLowerCase();
      } else if (filterType === 'roomType') {
        filters.rooms = value === 'all' ? [] : [value];
      } else if (filterType === 'material') {
        filters.materials = value === 'all' ? [] : [value];
      }
      
      currentPage = 1;
      renderProducts();
    });
  });

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

  sortSelect.addEventListener('change', () => {
    renderProducts();
  });

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
});

// Filter Products
function filterProducts() {
  let filtered = [...products];
  
  // Filter by category
  if (activeCategory !== 'all') {
    filtered = filtered.filter(product => 
      product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }
  
  // Filter by price range
  filtered = filtered.filter(product => 
    product.price >= filters.priceRange.min && 
    product.price <= filters.priceRange.max
  );
  
  // Filter by room type - updated this section
  if (filters.rooms.length > 0) {
    filtered = filtered.filter(product => {
      // Make sure product has roomType and it matches our filter
      return product.roomType && 
             filters.rooms.some(room => 
               product.roomType.toLowerCase().includes(room.toLowerCase())
             );
    });
  }
  
  // Filter by material
  if (filters.materials.length > 0 && !filters.materials.includes('all')) {
    filtered = filtered.filter(product => 
      filters.materials.some(material => {
        const productMaterial = product.material ? product.material.toLowerCase() : '';
        return productMaterial.includes(material.toLowerCase());
      })
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
      filtered.sort((a, b) => (b.featured || 0) - (a.featured || 0));
  }
  
  return filtered;
}

// Wishlist Functions
function toggleWishlist(product) {
  const index = wishlist.indexOf(product.id);
  
  if (index === -1) {
    // Add to wishlist
    wishlist.push(product.id);
    // Update button state
    const wishlistBtn = document.querySelector(`.add-to-wishlist[data-id="${product.id}"]`);
    if (wishlistBtn) {
      wishlistBtn.classList.add('active');
      wishlistBtn.querySelector('i').className = 'fas fa-heart';
    }
  } else {
    // Remove from wishlist
    wishlist.splice(index, 1);
    // Update button state
    const wishlistBtn = document.querySelector(`.add-to-wishlist[data-id="${product.id}"]`);
    if (wishlistBtn) {
      wishlistBtn.classList.remove('active');
      wishlistBtn.querySelector('i').className = 'far fa-heart';
    }
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const wishlistBadge = document.querySelector('.wishlist-btn .badge');
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
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
          <button class="add-to-wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i> Add to Wishlist
          </button>
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
      filters.rooms = value === 'all' ? [] : [value];
    } else if (filterType === 'material') {
      filters.materials = value === 'all' ? [] : [value];
    }
    
    // Reset to first page when filters change
    currentPage = 1;
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Products page loaded');
  fetchProducts();
});