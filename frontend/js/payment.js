// payment.js
document.addEventListener('DOMContentLoaded', function() {
  // Load cart and delivery address from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const deliveryAddress = JSON.parse(localStorage.getItem('deliveryAddress')) || {};
  
  // Render order summary
  function renderOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('summary-total');
    
    if (cart.length === 0) {
      window.location.href = 'products.html'; // Redirect if cart is empty
      return;
    }
    
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
          <div class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="summary-item-quantity">Qty: ${item.quantity}</div>
        </div>
      </div>
    `).join('');
    
    // Update totals
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `$${deliveryFee.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
  
  // Handle the Complete Order button click
  const completeOrderBtn = document.querySelector('.proceed-to-payment');
  if (completeOrderBtn) {
    completeOrderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
      
      // Validate based on payment method
      if (paymentMethod === 'credit-card') {
        const cardNumber = document.getElementById('card-number');
        const expiryDate = document.getElementById('expiry-date');
        const cvv = document.getElementById('cvv');
        const cardName = document.getElementById('card-name');
        
        if (!cardNumber.value || !expiryDate.value || !cvv.value || !cardName.value) {
          alert("Please fill all required credit card fields");
          return;
        }
      } else if (paymentMethod === 'paypal') {
        const paypalEmail = document.getElementById('paypal-email');
        
        if (!paypalEmail.value) {
          alert("Please enter your PayPal email");
          return;
        }
      }
      
      // Save payment method
      localStorage.setItem('paymentMethod', paymentMethod);
      
      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
    });
  }
  
  // Remove form submit event and use button click instead
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent default form submission
    });
  }
  
  // Toggle payment forms based on selected method
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
      // Hide all payment method forms first
      document.getElementById('credit-card-form').style.display = 'none';
      document.getElementById('paypal-form').style.display = 'none';
      
      // Show the selected payment method form
      if (this.value === 'credit-card') {
        document.getElementById('credit-card-form').style.display = 'block';
      } else if (this.value === 'paypal') {
        document.getElementById('paypal-form').style.display = 'block';
      }
    });
  });
  
  // Initialize
  renderOrderSummary();
});