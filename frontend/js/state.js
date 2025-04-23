// DOM Elements
const headerWishlistBtn = document.querySelector('.nav-actions .wishlist-btn');
const wishlistBadge = document.querySelector('.wishlist-btn .badge');
const cartBtn = document.getElementById('cart-btn');
const userBtn = document.getElementById('user-btn');

// State
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Event Listeners
headerWishlistBtn.addEventListener('click', () => {
  // Get the base URL (everything up to the last /)
  const currentUrl = window.location.href;
  const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
  window.location.href = baseUrl + 'wishlist.html';
});

cartBtn.addEventListener('click', () => {
  // Check if we're on the products page with the openCart function
  if (typeof openCart === 'function') {
    // We're on products page, use its existing openCart function
    openCart();
  } else {
    // We're on another page, redirect to products page
    window.location.href = 'products.html';
  }
});

// User button - redirect to login page
userBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

// Wishlist Functions
function toggleWishlist(product) {
  const index = wishlist.indexOf(product.id);
  if (index === -1) {
    wishlist.push(product.id);
  } else {
    wishlist.splice(index, 1);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderProducts();
}

function updateWishlistBadge() {
  wishlistBadge.textContent = wishlist.length;
  wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistBadge();
});