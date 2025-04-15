// DOM Elements
const mainImage = document.querySelector('.main-image img');
const thumbnails = document.querySelectorAll('.thumbnail');
const colorOptions = document.querySelectorAll('.color-option');
const sizeOptions = document.querySelectorAll('.size-option');
const materialOptions = document.querySelectorAll('.material-option');
const quantityInput = document.querySelector('.quantity-input');
const addToCartBtn = document.querySelector('.add-to-cart-btn');
const addToWishlistBtn = document.querySelector('.add-to-wishlist-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const cartModal = document.querySelector('.modal');
const cartOverlay = document.querySelector('.modal-overlay');
const closeModalBtn = document.querySelector('.close-modal');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const checkoutBtn = document.querySelector('.checkout-btn');
const productGallery = document.querySelector('.product-gallery');
const mainImageContainer = document.querySelector('.main-image');

// State
let currentProduct = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let allProducts = [];
let relatedProducts = [];
let currentPage = 1;
let productsPerPage = 4;
let filteredProducts = [];
let currentImageIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// Fetch Product Data
async function fetchProductData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        const response = await fetch('/backend/data/products.json');
        allProducts = await response.json();
        
        currentProduct = allProducts.find(product => product.id === productId);
        
        if (!currentProduct) {
            throw new Error('Product not found');
        }
        
        // Get related products (same category or material)
        relatedProducts = allProducts.filter(product => 
            product.id !== currentProduct.id && 
            (product.category === currentProduct.category || 
             product.material === currentProduct.material)
        );
        
        // Initialize filtered products with all related products
        filteredProducts = [...relatedProducts];
        
        renderProductDetails();
        updateCartBadge();
        updateWishlistBadge();
        renderRelatedProducts();
        
        // Initialize swipe functionality
        initSwipeFunctionality();
    } catch (error) {
        console.error('Error fetching product data:', error);
        // Handle error (show error message to user)
    }
}

// Initialize Swipe Functionality
function initSwipeFunctionality() {
    if (!mainImageContainer || !currentProduct) return;
    
    // Add touch event listeners for swipe
    mainImageContainer.addEventListener('touchstart', handleTouchStart);
    mainImageContainer.addEventListener('touchmove', handleTouchMove);
    mainImageContainer.addEventListener('touchend', handleTouchEnd);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);
    
    // Add navigation arrows
    addNavigationArrows();
}

// Handle Touch Start
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}

// Handle Touch Move
function handleTouchMove(e) {
    touchEndX = e.touches[0].clientX;
}

// Handle Touch End
function handleTouchEnd() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - show previous image
            showPreviousImage();
        } else {
            // Swipe left - show next image
            showNextImage();
        }
    }
}

// Handle Keyboard Navigation
function handleKeyNavigation(e) {
    if (e.key === 'ArrowLeft') {
        showPreviousImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
}

// Add Navigation Arrows
function addNavigationArrows() {
    const prevArrow = document.createElement('button');
    prevArrow.className = 'gallery-nav prev-arrow';
    prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevArrow.addEventListener('click', showPreviousImage);
    
    const nextArrow = document.createElement('button');
    nextArrow.className = 'gallery-nav next-arrow';
    nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextArrow.addEventListener('click', showNextImage);
    
    mainImageContainer.appendChild(prevArrow);
    mainImageContainer.appendChild(nextArrow);
}

// Show Previous Image
function showPreviousImage() {
    if (!currentProduct || !currentProduct.images.length) return;
    
    currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
    updateMainImage();
}

// Show Next Image
function showNextImage() {
    if (!currentProduct || !currentProduct.images.length) return;
    
    currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
    updateMainImage();
}

// Update Main Image
function updateMainImage() {
    if (!currentProduct || !currentProduct.images.length) return;
    
    const fixedMainImagePath = currentProduct.images[currentImageIndex].replace('/public/images/', '/backend/public/images/');
    mainImage.src = fixedMainImagePath;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// Render Product Details
function renderProductDetails() {
    // Update breadcrumb
    document.querySelector('.breadcrumb .active').textContent = currentProduct.name;
    
    // Update main image
    const fixedMainImagePath = currentProduct.images[0].replace('/public/images/', '/backend/public/images/');
    mainImage.src = fixedMainImagePath;
    mainImage.alt = currentProduct.name;
    
    // Update thumbnails
    const thumbnailContainer = document.getElementById('thumbnail-images');
    thumbnailContainer.innerHTML = currentProduct.images.map((image, index) => {
        const fixedImagePath = image.replace('/public/images/', '/backend/public/images/');
        return `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${fixedImagePath}" alt="${currentProduct.name} - View ${index + 1}">
            </div>
        `;
    }).join('');
    
    // Add click event listeners to thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            currentImageIndex = index;
            updateMainImage();
        });
    });
    
    // Update product info
    document.querySelector('.product-name').textContent = currentProduct.name;
    document.querySelector('.product-category').textContent = currentProduct.category;
    document.querySelector('.product-sku span').textContent = currentProduct.id;
    
    // Update price
    const priceContainer = document.querySelector('.product-price');
    const discountedPrice = currentProduct.discount ? 
        currentProduct.price * (1 - currentProduct.discount / 100) : 
        currentProduct.price;
    
    priceContainer.innerHTML = `
        <span class="current-price">$${discountedPrice.toFixed(2)}</span>
        ${currentProduct.discount ? `
            <span class="original-price">$${currentProduct.price.toFixed(2)}</span>
            <span class="discount-badge">-${currentProduct.discount}%</span>
        ` : ''}
    `;
    
    // Update description
    document.querySelector('.product-description').textContent = currentProduct.description;
    
    // Update options
    renderColorOptions();
    renderSizeOptions();
    renderMaterialOptions();
    
    // Update specifications
    renderSpecifications();
    
    // Update reviews
    renderReviews();
}

// Render Color Options
function renderColorOptions() {
    const colorContainer = document.querySelector('.color-options');
    colorContainer.innerHTML = currentProduct.colors.map(color => `
        <div class="color-option" data-color="${color}">
            <span class="color-swatch" style="background-color: ${color}"></span>
            <span class="color-name">${color}</span>
        </div>
    `).join('');
    
    // Add click event listeners
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update images based on selected color
            const selectedColor = option.dataset.color;
            updateProductImages(selectedColor);
        });
    });
}

// Update Product Images based on color
function updateProductImages(selectedColor) {
    // Clear existing thumbnails
    const thumbnailContainer = document.getElementById('thumbnail-images');
    thumbnailContainer.innerHTML = '';
    
    // Filter images for the selected color
    const colorImages = currentProduct.images.filter(image => 
        image.toLowerCase().includes(selectedColor.toLowerCase())
    );
    
    // If no color-specific images found, use all images
    const imagesToShow = colorImages.length > 0 ? colorImages : currentProduct.images;
    
    // Update main image
    const fixedMainImagePath = imagesToShow[0].replace('/public/images/', '/backend/public/images/');
    mainImage.src = fixedMainImagePath;
    mainImage.alt = `${currentProduct.name} - ${selectedColor}`;
    
    // Add thumbnails
    imagesToShow.forEach((image, index) => {
        const fixedImagePath = image.replace('/public/images/', '/backend/public/images/');
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${fixedImagePath}" alt="${currentProduct.name} - ${selectedColor} - View ${index + 1}">`;
        thumbnail.addEventListener('click', () => {
            const fixedMainImagePath = image.replace('/public/images/', '/backend/public/images/');
            mainImage.src = fixedMainImagePath;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
        thumbnailContainer.appendChild(thumbnail);
    });
}

// Render Size Options
function renderSizeOptions() {
    const sizeContainer = document.querySelector('.size-options');
    sizeContainer.innerHTML = currentProduct.sizes.map(size => `
        <div class="size-option" data-size="${size}">${size}</div>
    `).join('');
    
    // Add click event listeners
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// Render Material Options
function renderMaterialOptions() {
    const materialContainer = document.querySelector('.material-options');
    materialContainer.innerHTML = currentProduct.material ? `
        <div class="material-option" data-material="${currentProduct.material}">${currentProduct.material}</div>
    ` : '';
    
    // Add click event listeners
    document.querySelectorAll('.material-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.material-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

// Render Specifications
function renderSpecifications() {
    const specsTable = document.querySelector('.specifications-table');
    specsTable.innerHTML = `
        <tr>
            <th>Category</th>
            <td>${currentProduct.category}</td>
        </tr>
        <tr>
            <th>Material</th>
            <td>${currentProduct.material}</td>
        </tr>
        <tr>
            <th>Room Type</th>
            <td>${currentProduct.roomType}</td>
        </tr>
        <tr>
            <th>Stock</th>
            <td>${currentProduct.stock} units</td>
        </tr>
    `;
}

// Render Reviews
function renderReviews() {
    // This is a placeholder for reviews since they're not in the product data
    const reviewsList = document.querySelector('.reviews-list');
    reviewsList.innerHTML = `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">John Doe</span>
                <span class="review-date">May 15, 2023</span>
            </div>
            <div class="review-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <p class="review-text">This is an amazing product! I'm very satisfied with my purchase.</p>
        </div>
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">Jane Smith</span>
                <span class="review-date">April 28, 2023</span>
            </div>
            <div class="review-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="far fa-star"></i>
            </div>
            <p class="review-text">Great quality and fast delivery. Would recommend to friends.</p>
        </div>
    `;
}

// Filter Related Products
function filterRelatedProducts(category = null, priceRange = null) {
    if (!category && !priceRange) {
        filteredProducts = [...relatedProducts];
    } else {
        filteredProducts = relatedProducts.filter(product => {
            let matches = true;
            
            if (category && product.category !== category) {
                matches = false;
            }
            
            if (priceRange) {
                const [min, max] = priceRange;
                const price = product.discount ? 
                    product.price * (1 - product.discount / 100) : 
                    product.price;
                
                if (price < min || price > max) {
                    matches = false;
                }
            }
            
            return matches;
        });
    }
    
    currentPage = 1;
    renderRelatedProducts();
}

// Render Related Products with Pagination
function renderRelatedProducts() {
    const relatedProductsContainer = document.getElementById('related-products');
    if (!relatedProductsContainer) return;
    
    const relatedProducts = filteredProducts.slice(0, 4);
    
    if (relatedProducts.length === 0) {
        relatedProductsContainer.style.display = 'none';
        return;
    }
    
    relatedProductsContainer.style.display = 'block';
    const relatedProductsGrid = relatedProductsContainer.querySelector('.products-grid');
    
    relatedProductsGrid.innerHTML = relatedProducts.map(product => {
        const fixedImagePath = product.images[0].replace('/public/images/', '/backend/public/images/');
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${fixedImagePath}" alt="${product.name}">
                    ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">$${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                        ${product.discount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to quick view buttons
    const quickViewButtons = relatedProductsContainer.querySelectorAll('.quick-view-btn');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            window.location.href = `/product-detail.html?id=${productId}`;
        });
    });
}

// Add to Cart
function addToCart(productId = currentProduct.id) {
    const selectedColor = document.querySelector('.color-option.active')?.dataset.color;
    const selectedSize = document.querySelector('.size-option.active')?.dataset.size;
    const selectedMaterial = document.querySelector('.material-option.active')?.dataset.material;
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!selectedColor || !selectedSize || !selectedMaterial) {
        alert('Please select all options before adding to cart');
        return;
    }
    
    const fixedImagePath = currentProduct.images[0].replace('/public/images/', '/backend/public/images/');
    
    const cartItem = {
        id: productId,
        name: currentProduct.name,
        price: currentProduct.price,
        image: fixedImagePath,
        color: selectedColor,
        size: selectedSize,
        material: selectedMaterial,
        quantity: quantity
    };
    
    const existingItemIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.size === cartItem.size && 
        item.material === cartItem.material
    );
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showCartModal();
}

// Toggle Wishlist
function toggleWishlist(productId = currentProduct.id) {
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        addToWishlistBtn.classList.add('active');
    } else {
        wishlist.splice(index, 1);
        addToWishlistBtn.classList.remove('active');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
}

// Update Cart Badge
function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-btn .badge');
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Update Wishlist Badge
function updateWishlistBadge() {
    const wishlistBadge = document.querySelector('.wishlist-btn .badge');
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
}

// Show Cart Modal
function showCartModal() {
    renderCartItems();
    cartModal.classList.add('open');
    cartOverlay.classList.add('open');
}

// Hide Cart Modal
function hideCartModal() {
    cartModal.classList.remove('open');
    cartOverlay.classList.remove('open');
}

// Render Cart Items
function renderCartItems() {
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-options">
                    ${item.color} | ${item.size} | ${item.material}
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Update cart total
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    
    // Add event listeners for cart items
    addCartItemEventListeners();
}

// Add Cart Item Event Listeners
function addCartItemEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const isIncrease = e.currentTarget.classList.contains('increase');
            updateCartItemQuantity(id, isIncrease);
        });
    });
    
    // Quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.currentTarget.dataset.id;
            const quantity = parseInt(e.currentTarget.value);
            updateCartItemQuantity(id, null, quantity);
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            removeCartItem(id);
        });
    });
}

// Update Cart Item Quantity
function updateCartItemQuantity(id, isIncrease, newQuantity = null) {
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        if (newQuantity !== null) {
            cart[itemIndex].quantity = Math.max(1, newQuantity);
        } else {
            cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity + (isIncrease ? 1 : -1));
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartBadge();
    }
}

// Remove Cart Item
function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartBadge();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProductData();
    
    // Tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.querySelector(`#${target}-tab`).classList.add('active');
        });
    });
    
    // Add to cart button
    addToCartBtn.addEventListener('click', () => addToCart());
    
    // Add to wishlist button
    addToWishlistBtn.addEventListener('click', () => toggleWishlist());
    
    // Cart modal
    closeModalBtn.addEventListener('click', hideCartModal);
    cartOverlay.addEventListener('click', hideCartModal);
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        // Implement checkout functionality
        alert('Proceeding to checkout...');
    });
}); 