// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.querySelector('.close-cart-modal');
    const cartModal = document.querySelector('.cart-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartBadge = document.querySelector('.cart-btn .badge');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart badge
    function updateCartBadge() {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Open cart modal
    cartBtn.addEventListener('click', () => {
      cartModal.classList.add('open');
      modalOverlay.classList.add('open');
      renderCartItems();
    });
    
    // Close cart modal
    closeCartBtn.addEventListener('click', () => {
      cartModal.classList.remove('open');
      modalOverlay.classList.remove('open');
    });
    
    modalOverlay.addEventListener('click', () => {
      cartModal.classList.remove('open');
      modalOverlay.classList.remove('open');
    });
    
    // Render cart items
    function renderCartItems() {
      if (cart.length === 0) {
        if (emptyCartMessage) {
          emptyCartMessage.style.display = 'block';
        }
        cartItems.innerHTML = `
          <div class="empty-cart-message">
            <i class="fas fa-shopping-cart"></i>
            <p>Your cart is empty</p>
            <a href="products.html" class="btn">Continue Shopping</a>
          </div>
        `;
      } else {
        if (emptyCartMessage) {
          emptyCartMessage.style.display = 'none';
        }
        
        cartItems.innerHTML = cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-name">${item.name}</h4>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn decrease">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                <button class="quantity-btn increase">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('');
        
        // Add event listeners to quantity buttons and remove buttons
        document.querySelectorAll('.cart-item .decrease').forEach(btn => {
          btn.addEventListener('click', decreaseQuantity);
        });
        
        document.querySelectorAll('.cart-item .increase').forEach(btn => {
          btn.addEventListener('click', increaseQuantity);
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
          btn.addEventListener('click', removeCartItem);
        });
      }
      
      // Update cart total
      updateCartTotal();
    }
    
    // Update cart total
    function updateCartTotal() {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
      }
    }
    
    // Decrease quantity
    function decreaseQuantity(e) {
      const cartItem = e.target.closest('.cart-item');
      const id = cartItem.dataset.id;
      const itemIndex = cart.findIndex(item => item.id === id);
      
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity--;
        cartItem.querySelector('.quantity-input').value = cart[itemIndex].quantity;
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartTotal();
      updateCartBadge();
    }
    
    // Increase quantity
    function increaseQuantity(e) {
      const cartItem = e.target.closest('.cart-item');
      const id = cartItem.dataset.id;
      const itemIndex = cart.findIndex(item => item.id === id);
      
      if (cart[itemIndex].quantity < 10) {
        cart[itemIndex].quantity++;
        cartItem.querySelector('.quantity-input').value = cart[itemIndex].quantity;
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartTotal();
      updateCartBadge();
    }
    
    // Remove cart item
    function removeCartItem(e) {
      const id = e.target.closest('.cart-item-remove').dataset.id;
      cart = cart.filter(item => item.id !== id);
      
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCartItems();
      updateCartBadge();
    }
    
    // Initialize cart
    updateCartBadge();
  });

  
// Checkout functionality
document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    // Save cart to localStorage before proceeding
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
  });