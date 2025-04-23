// Minimal products.js for debugging
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');
    
    // 1. Test if basic JavaScript is working
    const testElement = document.createElement('div');
    testElement.textContent = 'JavaScript is working!';
    testElement.style.color = 'red';
    testElement.style.fontSize = '24px';
    document.body.prepend(testElement);
    
    // 2. Test if products grid exists
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) {
      console.error('Error: .products-grid element not found');
      testElement.textContent += ' - ERROR: .products-grid missing';
      return;
    }
    
    // 3. Test loading products
    try {
      console.log('Trying to load products...');
      
      // Try multiple possible paths
      const possiblePaths = [
        '/backend/data/products.json',
        'products.json',
        './products.json',
        '../products.json',
        './data/products.json',
        './backend/data/products.json'
      ];
      
      let products = [];
      
      for (const path of possiblePaths) {
        try {
          console.log(`Trying path: ${path}`);
          const response = await fetch(path);
          if (!response.ok) continue;
          
          const text = await response.text();
          console.log('Raw response:', text.substring(0, 100) + '...');
          
          products = JSON.parse(text);
          console.log(`Successfully loaded ${products.length} products from ${path}`);
          break;
        } catch (e) {
          console.log(`Failed with path ${path}:`, e.message);
        }
      }
      
      if (products.length === 0) {
        // Fallback to test product if no products loaded
        console.log('Using fallback test product');
        products = [{
          id: "test-1",
          name: "Test Product",
          description: "Test description",
          price: 99.99,
          discount: 10,
          images: ["https://via.placeholder.com/300"],
          category: "test",
          colors: ["red"],
          sizes: ["M"],
          material: "test",
          roomType: "test"
        }];
      }
      
      // 4. Render products
      console.log('Rendering products...');
      productsGrid.innerHTML = products.map(product => `
        <div class="product-card" style="border: 2px solid red; padding: 10px; margin: 10px;">
          <h3>${product.name}</h3>
          <p>Price: $${product.price}</p>
          <img src="${product.images[0]}" width="200" alt="${product.name}">
        </div>
      `).join('');
      
      console.log('Render complete');
      
    } catch (error) {
      console.error('Critical error:', error);
      productsGrid.innerHTML = `
        <div style="color: red; border: 2px solid red; padding: 20px;">
          <h3>Error Loading Products</h3>
          <p>${error.message}</p>
          <p>Check console for details</p>
        </div>
      `;
    }
  });