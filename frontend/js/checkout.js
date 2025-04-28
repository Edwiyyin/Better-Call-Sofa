document.addEventListener('DOMContentLoaded', function() {
  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Initialize map
  let map;
  let marker;
  
  function initMap() {
    // Default to Paris coordinates
    const defaultCoords = [48.8566, 2.3522];
    
    map = L.map('map').setView(defaultCoords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
      updateMarker(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          map.setView(userCoords, 15);
          updateMarker(userCoords);
          reverseGeocode(userCoords[0], userCoords[1]);
        },
        function(error) {
          console.error("Geolocation error:", error);
          // Use default coordinates if geolocation fails
          updateMarker(defaultCoords);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      updateMarker(defaultCoords);
    }
  }
  
  function updateMarker(coords) {
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker(coords).addTo(map);
  }
  
  // Reverse geocoding to get address from coordinates
  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data.address) {
        document.getElementById('address').value = data.address.road || '';
        document.getElementById('city').value = data.address.city || data.address.town || '';
        document.getElementById('postal-code').value = data.address.postcode || '';
        document.getElementById('country').value = data.address.country_code.toUpperCase() || '';
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  }
  
  // Use current location button
  const useCurrentLocationBtn = document.getElementById('use-current-location');
  if (useCurrentLocationBtn) {
    useCurrentLocationBtn.addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            const userCoords = [position.coords.latitude, position.coords.longitude];
            map.setView(userCoords, 15);
            updateMarker(userCoords);
            reverseGeocode(userCoords[0], userCoords[1]);
          },
          function(error) {
            alert("Unable to get your location. Please enable location services.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    });
  }
  
  // Render order summary
  function renderOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('summary-total');
    
    if (!summaryItems || !subtotalElement || !totalElement) {
      console.error("Required elements for order summary not found");
      return;
    }
    
    if (cart.length === 0) {
      summaryItems.innerHTML = '<p>Your cart is empty</p>';
      subtotalElement.textContent = '$0.00';
      totalElement.textContent = '$0.00';
      return;
    }
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 100 ? 0 : 9.99; // Free delivery for orders over $100
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
    
    const deliveryFeeElement = document.getElementById('delivery-fee');
    if (deliveryFeeElement) {
      deliveryFeeElement.textContent = `$${deliveryFee.toFixed(2)}`;
    }
    
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
  
  // Add validation for Full Name and Phone Number fields
  function setupInputValidation() {
    // Add error message containers
    const fullNameField = document.getElementById('full-name');
    const fullNameError = document.createElement('div');
    fullNameError.id = 'full-name-error';
    fullNameError.style.color = '#ff0000';
    fullNameError.style.fontSize = '12px';
    fullNameError.style.marginTop = '5px';
    fullNameError.style.display = 'none';
    fullNameError.textContent = 'LETTERS ONLY FOR NAME';
    fullNameField.parentNode.appendChild(fullNameError);
    
    const phoneField = document.getElementById('phone');
    const phoneError = document.createElement('div');
    phoneError.id = 'phone-error';
    phoneError.style.color = '#ff0000';
    phoneError.style.fontSize = '12px';
    phoneError.style.marginTop = '5px';
    phoneError.style.display = 'none';
    phoneError.textContent = 'NUMBERS ONLY FOR PHONE';
    phoneField.parentNode.appendChild(phoneError);
    
    // Full Name: Letters only validation
    fullNameField.addEventListener('keydown', function(e) {
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
          e.key === '-' || // Hyphen for names like Mary-Jane
          e.key === '\'' || // Apostrophe for names like O'Neil
          e.key === '.' || // Period for abbreviated names
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true) ||
          // Allow letters
          (/^[a-zA-Z]$/.test(e.key))
      ) {
        fullNameError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-letter keys
        fullNameError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Remove non-allowed characters from full name when pasted
    fullNameField.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s\-\'\.]/g, '');
      if (/[^a-zA-Z\s\-\'\.]/g.test(this.value)) {
        fullNameError.style.display = 'block';
      } else {
        fullNameError.style.display = 'none';
      }
    });
    
    // Phone Number: Numbers and formatting characters only
    phoneField.addEventListener('keydown', function(e) {
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
          e.key === '+' || // For international numbers
          e.key === '-' || // For formatting
          e.key === '(' || // For formatting
          e.key === ')' || // For formatting
          e.key === ' ' || // For spacing
          // Allow number keys
          (e.key >= '0' && e.key <= '9') ||
          // Allow numpad number keys
          (e.key >= 'Numpad0' && e.key <= 'Numpad9') ||
          // Allow Ctrl combinations
          (e.ctrlKey === true || e.metaKey === true)
      ) {
        phoneError.style.display = 'none';
        return true; // Let the event continue
      } else {
        // Block non-allowed keys
        phoneError.style.display = 'block';
        e.preventDefault();
        return false;
      }
    });
    
    // Remove any invalid characters from phone when pasted
    phoneField.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9\+\-\(\)\s]/g, '');
      if (/[^0-9\+\-\(\)\s]/g.test(this.value)) {
        phoneError.style.display = 'block';
      } else {
        phoneError.style.display = 'none';
      }
    });
  }
  
  // Proceed to payment button
  const proceedToPaymentBtn = document.getElementById('proceed-to-payment');
  if (proceedToPaymentBtn) {
    proceedToPaymentBtn.addEventListener('click', function() {
      const form = document.getElementById('address-form');
      if (!form) {
        console.error("Address form not found");
        return;
      }
      
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Save delivery address
      const deliveryAddress = {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postal-code').value,
        country: document.getElementById('country').value,
        instructions: document.getElementById('delivery-instructions').value
      };
      
      localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
      
      // Redirect to payment page
      window.location.href = 'payment.html';
    });
  }
  
  // Initialize if map exists
  const mapElement = document.getElementById('map');
  if (mapElement) {
    initMap();
  }
  
  renderOrderSummary();
  
  // Setup input validation for name and phone
  setupInputValidation();
});