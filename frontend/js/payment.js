// payment.js with fixed input validation
document.addEventListener('DOMContentLoaded', function() {
  // Load cart and delivery address from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
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
  
  // STEP 1: Add error message containers directly to the HTML
  function addErrorMessages() {
    // Card number error message
    const cardNumberField = document.getElementById('card-number');
    const cardNumberError = document.createElement('div');
    cardNumberError.id = 'card-number-error';
    cardNumberError.style.color = '#ff0000';
    cardNumberError.style.fontSize = '12px';
    cardNumberError.style.marginTop = '5px';
    cardNumberError.style.display = 'none';
    cardNumberError.textContent = 'NUMBERS ONLY FOR CARD NUMBER';
    cardNumberField.parentNode.appendChild(cardNumberError);
    
    // Expiry date error message
    const expiryDateField = document.getElementById('expiry-date');
    const expiryDateError = document.createElement('div');
    expiryDateError.id = 'expiry-date-error';
    expiryDateError.style.color = '#ff0000';
    expiryDateError.style.fontSize = '12px';
    expiryDateError.style.marginTop = '5px';
    expiryDateError.style.display = 'none';
    expiryDateError.textContent = 'NUMBERS ONLY FOR EXPIRY DATE';
    expiryDateField.parentNode.appendChild(expiryDateError);
    
    // CVV error message
    const cvvField = document.getElementById('cvv');
    const cvvError = document.createElement('div');
    cvvError.id = 'cvv-error';
    cvvError.style.color = '#ff0000';
    cvvError.style.fontSize = '12px';
    cvvError.style.marginTop = '5px';
    cvvError.style.display = 'none';
    cvvError.textContent = 'NUMBERS ONLY FOR CVV';
    cvvField.parentNode.appendChild(cvvError);
    
    // Card name error message
    const cardNameField = document.getElementById('card-name');
    const cardNameError = document.createElement('div');
    cardNameError.id = 'card-name-error';
    cardNameError.style.color = '#ff0000';
    cardNameError.style.fontSize = '12px';
    cardNameError.style.marginTop = '5px';
    cardNameError.style.display = 'none';
    cardNameError.textContent = 'LETTERS ONLY FOR NAME';
    cardNameField.parentNode.appendChild(cardNameError);
  }
  
  // STEP 2: Set up improved input validation
  function setupInputValidation() {
    // Card number: Numbers only
    const cardNumberField = document.getElementById('card-number');
    const cardNumberError = document.getElementById('card-number-error');
    
    cardNumberField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, navigation, and numbers
      if (
          // Allow control keys
          e.key === 'Backspace' || 
          e.key === 'Delete' || 
          e.key === 'Tab' || 
          e.key === 'Escape' || 
          e.key === 'Enter' ||
          e.key === 'ArrowLeft' || 
          e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || 
          e.key === 'ArrowDown' ||
          e.key === 'Home' || 
          e.key === 'End' ||
          // Allow number keys
          (e.key >= '0' && e.key <= '9') ||
          // Allow numpad number keys
          (e.key >= 'Numpad0' && e.key <= 'Numpad9') ||
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true)
      ) {
        cardNumberError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-number keys
        cardNumberError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Format card number with spaces
    cardNumberField.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      this.value = formattedValue;
      
      // Hide error if all is good
      if (!/[^0-9\s]/.test(this.value)) {
        cardNumberError.style.display = 'none';
      }
    });
    
    // Expiry date: Numbers only
    const expiryDateField = document.getElementById('expiry-date');
    const expiryDateError = document.getElementById('expiry-date-error');
    
    expiryDateField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, navigation, and numbers
      if (
          // Allow control keys
          e.key === 'Backspace' || 
          e.key === 'Delete' || 
          e.key === 'Tab' || 
          e.key === 'Escape' || 
          e.key === 'Enter' ||
          e.key === 'ArrowLeft' || 
          e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || 
          e.key === 'ArrowDown' ||
          e.key === 'Home' || 
          e.key === 'End' ||
          // Allow number keys
          (e.key >= '0' && e.key <= '9') ||
          // Allow numpad number keys
          (e.key >= 'Numpad0' && e.key <= 'Numpad9') ||
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true)
      ) {
        expiryDateError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-number keys
        expiryDateError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Format expiry date as MM/YY
    expiryDateField.addEventListener('input', function() {
      let value = this.value.replace(/\D/g, '');
      
      if (value.length > 2) {
        this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
      } else {
        this.value = value;
      }
      
      // Hide error if all is good
      if (!/[^0-9\/]/.test(this.value)) {
        expiryDateError.style.display = 'none';
      }
    });
    
    // CVV: Numbers only
    const cvvField = document.getElementById('cvv');
    const cvvError = document.getElementById('cvv-error');
    
    cvvField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, navigation, and numbers
      if (
          // Allow control keys
          e.key === 'Backspace' || 
          e.key === 'Delete' || 
          e.key === 'Tab' || 
          e.key === 'Escape' || 
          e.key === 'Enter' ||
          e.key === 'ArrowLeft' || 
          e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || 
          e.key === 'ArrowDown' ||
          e.key === 'Home' || 
          e.key === 'End' ||
          // Allow number keys
          (e.key >= '0' && e.key <= '9') ||
          // Allow numpad number keys
          (e.key >= 'Numpad0' && e.key <= 'Numpad9') ||
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true)
      ) {
        cvvError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-number keys
        cvvError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Clear any non-numbers that might have been pasted
    cvvField.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
      
      // Hide error if all is good
      if (!/\D/.test(this.value)) {
        cvvError.style.display = 'none';
      }
    });
    
    // Card name: Letters only
    const cardNameField = document.getElementById('card-name');
    const cardNameError = document.getElementById('card-name-error');
    
    cardNameField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, navigation, space, and letters
      if (
          // Allow control keys
          e.key === 'Backspace' || 
          e.key === 'Delete' || 
          e.key === 'Tab' || 
          e.key === 'Escape' || 
          e.key === 'Enter' ||
          e.key === 'ArrowLeft' || 
          e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || 
          e.key === 'ArrowDown' ||
          e.key === 'Home' || 
          e.key === 'End' ||
          e.key === ' ' || // Space
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true) ||
          // Allow letters
          (/^[a-zA-Z]$/.test(e.key))
      ) {
        cardNameError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-letter keys
        cardNameError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Remove any non-letters that might have been pasted
    cardNameField.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
      if (/[^a-zA-Z\s]/.test(this.value)) {
        cardNameError.style.display = 'block';
      } else {
        cardNameError.style.display = 'none';
      }
    });
    
    // Set input maxlengths
    cardNumberField.setAttribute('maxlength', '19'); // 16 digits + 3 spaces
    expiryDateField.setAttribute('maxlength', '5');  // MM/YY
    cvvField.setAttribute('maxlength', '3');        // 3 digits for CVV
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
  addErrorMessages();
  setupInputValidation();
});