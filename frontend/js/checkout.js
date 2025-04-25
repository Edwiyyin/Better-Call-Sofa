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
    document.getElementById('use-current-location')?.addEventListener('click', function() {
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
    
    // Render order summary
    function renderOrderSummary() {
      const summaryItems = document.getElementById('summary-items');
      const subtotalElement = document.getElementById('subtotal');
      const totalElement = document.getElementById('summary-total');
      
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
      document.getElementById('delivery-fee').textContent = `$${deliveryFee.toFixed(2)}`;
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    // Proceed to payment button
    document.getElementById('proceed-to-payment')?.addEventListener('click', function() {
      const form = document.getElementById('address-form');
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
    
    // Initialize
    initMap();
    renderOrderSummary();
  });