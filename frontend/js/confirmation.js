// confirmation.js
document.addEventListener('DOMContentLoaded', function() {
  // Load order details from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress')) || {};
  const paymentMethod = localStorage.getItem('paymentMethod') || 'credit-card';
  
  // Generate random order number
  document.getElementById('order-number').textContent = 'BCS-' + Math.floor(Math.random() * 10000);
  
  // Clear cart after successful order
  localStorage.removeItem('cart');
  localStorage.removeItem('deliveryAddress');
  localStorage.removeItem('paymentMethod');
  
  // Update cart badge
  document.querySelector('.cart-btn .badge').textContent = '0';
  
  // Render order details
  function renderOrderDetails() {
    // Delivery address
    const addressElement = document.getElementById('delivery-address-details');
    if (deliveryAddress) {
      addressElement.innerHTML = `
        <p>${deliveryAddress.fullName || ''}</p>
        <p>${deliveryAddress.address || ''}</p>
        <p>${deliveryAddress.city || ''}, ${deliveryAddress.postalCode || ''}</p>
        <p>${deliveryAddress.country || ''}</p>
        <p>Phone: ${deliveryAddress.phone || ''}</p>
      `;
    }
    
    // Payment method
    const paymentElement = document.getElementById('payment-method-details');
    paymentElement.textContent = paymentMethod === 'credit-card' ? 'Credit Card' : 'PayPal';
    
    // Order summary
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('summary-total');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + deliveryFee;
    
    // Render items
    summaryItems.innerHTML = cart.map(item => `
      <div class="summary-item">
        <div class="summary-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-price">$${(item.price).toFixed(2)}</div>
          <div class="summary-item-quantity">Qty: ${item.quantity}</div>
        </div>
      </div>
    `).join('');
    
    // Update totals
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `$${deliveryFee.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
  
  // Initialize
  renderOrderDetails();
});