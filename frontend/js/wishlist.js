const wishlistGrid = document.getElementById('wishlist-grid');
const wishlistCount = document.getElementById('wishlist-count');
const clearWishlistBtn = document.getElementById('clear-wishlist-btn');
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.querySelector('.checkout-btn');

// State
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Fetch products from the backend
async function fetchProducts() {
  try {
    // First try the API endpoint
    let response;
    try {
      response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('API fetch failed');
      }
    } catch (apiError) {
      // Fallback to direct file access if API fails
      console.warn('API fetch failed, trying direct file access', apiError);
      response = await fetch('/backend/data/products.json');
      if (!response.ok) {
        throw new Error('Failed to fetch products from any source');
      }
    }
    
    products = await response.json();
    renderWishlist();
    updateWishlistBadge();
  } catch (error) {
    console.error('Error fetching products:', error);
    wishlistGrid.innerHTML = '<p class="error">Failed to load wishlist items. Please try again later.</p>';
  }
}

// Render wishlist items
function renderWishlist() {
  if (wishlist.length === 0) {
    wishlistGrid.innerHTML = `
      <div class="empty-wishlist">
        <i class="far fa-heart"></i>
        <h3>Your wishlist is empty</h3>
        <p>Browse our products and add items to your wishlist</p>
        <a href="products.html" class="btn">Browse Products</a>
      </div>
    `;
    wishlistCount.textContent = '0';
    clearWishlistBtn.style.display = 'none';
    return;
  }

  clearWishlistBtn.style.display = 'flex';
  wishlistCount.textContent = wishlist.length;

  const wishlistItems = products.filter(product => wishlist.includes(product.id));
  
  if (wishlistItems.length === 0) {
    wishlistGrid.innerHTML = `
      <div class="empty-wishlist">
        <i class="far fa-heart"></i>
        <h3>No products found in your wishlist</h3>
        <p>There may be an issue loading the products</p>
        <a href="products.html" class="btn">Browse Products</a>
      </div>
    `;
    return;
  }
  
  wishlistGrid.innerHTML = wishlistItems.map(product => {
    const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    // Fix the image path - make it more flexible
    const imagePath = product.images[0].includes('/backend/') 
      ? product.images[0] 
      : product.images[0].replace('/public/images/', '/backend/public/images/');

    return `
      <div class="wishlist-item" data-id="${product.id}">
        <div class="remove-wishlist-item" title="Remove from wishlist">
          <i class="fas fa-times"></i>
        </div>
        <div class="wishlist-item-image">
          <img src="${imagePath}" alt="${product.name}">
        </div>
        <div class="wishlist-item-info">
          <h3 class="wishlist-item-name">${product.name}</h3>
          <div class="wishlist-item-price">
            <span class="wishlist-item-current-price">$${discountedPrice.toFixed(2)}</span>
            ${product.discount ? `<span class="wishlist-item-original-price">$${product.price.toFixed(2)}</span>` : ''}
          </div>
          <div class="wishlist-item-actions">
            <button class="add-to-cart-btn">Add to Cart</button>
            <button class="remove-from-wishlist-btn">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners to wishlist items
  document.querySelectorAll('.wishlist-item').forEach(item => {
    const productId = item.dataset.id;
    const product = products.find(p => p.id === productId);

    item.querySelector('.add-to-cart-btn').addEventListener('click', () => {
      addToCart(product);
    });

    const removeButtons = [
      item.querySelector('.remove-from-wishlist-btn'),
      item.querySelector('.remove-wishlist-item')
    ];
    
    removeButtons.forEach(button => {
      button.addEventListener('click', () => {
        removeFromWishlist(product);
      });
    });
  });
}

// Add to cart function
function addToCart(product, quantity = 1) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Fix the image path
    const imagePath = product.images[0].includes('/backend/') 
      ? product.images[0] 
      : product.images[0].replace('/public/images/', '/backend/public/images/');
      
    cart.push({
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: imagePath,
      quantity: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  openCart();
}

// Remove from wishlist function
function removeFromWishlist(product) {
  wishlist = wishlist.filter(id => id !== product.id);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishlist();
  updateWishlistBadge();
}

// Clear wishlist function
function clearWishlist() {
  wishlist = [];
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishlist();
  updateWishlistBadge();
}

// Update wishlist badge
function updateWishlistBadge() {
  const wishlistBadge = document.querySelector('.wishlist-btn .badge');
  if (wishlistBadge) {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  
    // Update header wishlist button icon
    const headerWishlistBtn = document.querySelector('.nav-actions .wishlist-btn');
    if (headerWishlistBtn) {
      const icon = headerWishlistBtn.querySelector('i');
      if (wishlist.length > 0) {
        icon.className = 'fas fa-heart';
      } else {
        icon.className = 'far fa-heart';
      }
    }
  }
}

// Update cart functions
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
  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Event Listeners
clearWishlistBtn?.addEventListener('click', clearWishlist);
closeModalBtn?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

checkoutBtn?.addEventListener('click', () => {
  window.location.href = 'checkout.html';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  updateCart();
});