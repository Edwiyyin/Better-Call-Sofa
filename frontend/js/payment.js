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
    
    // Handle payment form submission
    document.getElementById('payment-form')?.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // In a real app, you would process payment here
      // For demo, we'll just save payment method and redirect
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
      localStorage.setItem('paymentMethod', paymentMethod);
      
      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
    });
    
    // Toggle payment forms based on selected method
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
      radio.addEventListener('change', function() {
        document.getElementById('credit-card-form').style.display = 
          this.value === 'credit-card' ? 'block' : 'none';
      });
    });
    
    // Initialize
    renderOrderSummary();
  });