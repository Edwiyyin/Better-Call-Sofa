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
const headerWishlistBtn = document.querySelector('.nav-actions .wishlist-btn');
const wishlistBadge = document.querySelector('.wishlist-btn .badge');

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

// Helper function to fix image paths
function fixImagePath(path) {
    if (!path) return '';
    
    // Use a default image if path is empty
    if (path.trim() === '') {
        return '../images/product-placeholder.jpg';
    }
    
    // If path is already absolute or starts with backend, return it
    if (path.startsWith('http') || path.startsWith('/backend')) {
        return path;
    }
    
    // If path starts with /public/images, replace with /backend/public/images
    if (path.startsWith('/public/images/')) {
        return path.replace('/public/images/', '/backend/public/images/');
    }
    
    // If path starts with /images, add ../
    if (path.startsWith('/images/')) {
        return '..' + path;
    }
    
    // Otherwise, assume it's a relative path and add backend
    return '/backend' + path;
}

// Fetch Product Data
async function fetchProductData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        // Debug
        console.log("Fetching product with ID:", productId);
        
        const response = await fetch('/api/products');

        allProducts = await response.json();
        
        // Debug
        console.log("All products:", allProducts);
        
        currentProduct = allProducts.find(product => product.id === productId);
        
        if (!currentProduct) {
            throw new Error('Product not found');
        }
        
        // Debug
        console.log("Current product:", currentProduct);
        console.log("Current product images:", currentProduct.images);
        
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
        // Show error message
        const productDetailSection = document.querySelector('.product-detail');
        if (productDetailSection) {
            productDetailSection.innerHTML = `
                <div class="container">
                    <div class="error-message">
                        <h2>Error Loading Product</h2>
                        <p>${error.message}</p>
                        <a href="products.html" class="btn">Return to Products</a>
                    </div>
                </div>
            `;
        }
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
    
    const imagePath = fixImagePath(currentProduct.images[currentImageIndex]);
    console.log("Updating main image to:", imagePath);
    mainImage.src = imagePath;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// Render Product Details
function renderProductDetails() {
    console.log("Rendering product details for:", currentProduct.name);
    
    // Update breadcrumb
    document.querySelector('.breadcrumb .active').textContent = currentProduct.name;
    
    // Update main image with fixed path
    if (currentProduct.images && currentProduct.images.length > 0) {
        const imagePath = fixImagePath(currentProduct.images[0]);
        console.log("Setting main image to:", imagePath);
        mainImage.src = imagePath;
        mainImage.alt = currentProduct.name;
    } else {
        console.warn("No images available for product:", currentProduct.name);
        mainImage.src = '../images/product-placeholder.jpg';
        mainImage.alt = "Product image not available";
    }
    
    // Update thumbnails
    const thumbnailContainer = document.getElementById('thumbnail-images');
    if (thumbnailContainer) {
        if (currentProduct.images && currentProduct.images.length > 0) {
            thumbnailContainer.innerHTML = currentProduct.images.map((image, index) => {
                const imagePath = fixImagePath(image);
                return `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <img src="${imagePath}" alt="${currentProduct.name} - View ${index + 1}">
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
        } else {
            thumbnailContainer.innerHTML = `
                <div class="thumbnail active">
                    <img src="../images/product-placeholder.jpg" alt="Product image not available">
                </div>
            `;
        }
    }
    
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
    
    // Update wishlist button state
    updateWishlistButtonState();
}

// Update Wishlist Button State
function updateWishlistButtonState() {
    if (!currentProduct) return;
    
    const isInWishlist = wishlist.includes(currentProduct.id);
    addToWishlistBtn.classList.toggle('active', isInWishlist);
    
    const icon = addToWishlistBtn.querySelector('i');
    if (isInWishlist) {
        icon.className = 'fas fa-heart';
    } else {
        icon.className = 'far fa-heart';
    }
}

// Render Color Options
function renderColorOptions() {
    const colorContainer = document.querySelector('.color-options');
    if (!colorContainer || !currentProduct.colors) return;
    
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
    
    // Set first option as active
    const firstColorOption = document.querySelector('.color-option');
    if (firstColorOption) {
        firstColorOption.classList.add('active');
    }
}

// Update Product Images based on color
function updateProductImages(selectedColor) {
    // Clear existing thumbnails
    const thumbnailContainer = document.getElementById('thumbnail-images');
    if (!thumbnailContainer) return;
    
    thumbnailContainer.innerHTML = '';
    
    // Filter images for the selected color
    const colorImages = currentProduct.images.filter(image => 
        image.toLowerCase().includes(selectedColor.toLowerCase())
    );
    
    // If no color-specific images found, use all images
    const imagesToShow = colorImages.length > 0 ? colorImages : currentProduct.images;
    
    // Update main image
    if (imagesToShow.length > 0) {
        const mainImagePath = fixImagePath(imagesToShow[0]);
        console.log("Updating color-specific main image to:", mainImagePath);
        mainImage.src = mainImagePath;
        mainImage.alt = `${currentProduct.name} - ${selectedColor}`;
    }
    
    // Add thumbnails
    imagesToShow.forEach((image, index) => {
        const imagePath = fixImagePath(image);
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${imagePath}" alt="${currentProduct.name} - ${selectedColor} - View ${index + 1}">`;
        thumbnail.addEventListener('click', () => {
            const clickedImagePath = fixImagePath(image);
            mainImage.src = clickedImagePath;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
        thumbnailContainer.appendChild(thumbnail);
    });
}

// Render Size Options
function renderSizeOptions() {
    const sizeContainer = document.querySelector('.size-options');
    if (!sizeContainer || !currentProduct.sizes) return;
    
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
    
    // Set first option as active
    const firstSizeOption = document.querySelector('.size-option');
    if (firstSizeOption) {
        firstSizeOption.classList.add('active');
    }
}

// Render Material Options
function renderMaterialOptions() {
    const materialContainer = document.querySelector('.material-options');
    if (!materialContainer) return;
    
    materialContainer.innerHTML = currentProduct.material ? `
        <div class="material-option active" data-material="${currentProduct.material}">${currentProduct.material}</div>
    ` : '';
}

// Render Specifications
function renderSpecifications() {
    const specsTable = document.querySelector('.specifications-table');
    if (!specsTable) return;
    
    specsTable.innerHTML = `
        <tr>
            <th>Category</th>
            <td>${currentProduct.category || 'N/A'}</td>
        </tr>
        <tr>
            <th>Material</th>
            <td>${currentProduct.material || 'N/A'}</td>
        </tr>
        <tr>
            <th>Room Type</th>
            <td>${currentProduct.roomType || 'N/A'}</td>
        </tr>
        <tr>
            <th>Stock</th>
            <td>${currentProduct.stock || 0} units</td>
        </tr>
    `;
}

// Render Reviews
function renderReviews() {
    // This is a placeholder for reviews since they're not in the product data
    const reviewsList = document.querySelector('.reviews-list');
    if (!reviewsList) return;
    
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
    if (!relatedProductsGrid) {
        console.warn("Products grid not found in related products container");
        return;
    }
    
    relatedProductsGrid.innerHTML = relatedProducts.map(product => {
        const imagePath = product.images && product.images.length > 0 ? 
            fixImagePath(product.images[0]) : 
            '../images/product-placeholder.jpg';
            
        const isInWishlist = wishlist.includes(product.id);
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${imagePath}" alt="${product.name}">
                    ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
                    <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                        <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">$${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}</span>
                        ${product.discount ? `<span class="original-price">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = btn.getAttribute('data-id');
            toggleWishlist(productId);
            
            // Update button state
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            icon.className = btn.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
        });
    });
    
    // Add click event to product cards
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const productId = relatedProducts[index].id;
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
    
    const imagePath = currentProduct.images && currentProduct.images.length > 0 ? 
        fixImagePath(currentProduct.images[0]) : 
        '../images/product-placeholder.jpg';
    
    const cartItem = {
        id: productId,
        name: currentProduct.name,
        price: currentProduct.price,
        image: imagePath,
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
    } else {
        wishlist.splice(index, 1);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    
    // Update wishlist button state if it's the current product
    if (productId === currentProduct.id) {
        updateWishlistButtonState();
    }
}

// Update Cart Badge
function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-btn .badge');
    if (!cartBadge) return;
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Update Wishlist Badge
function updateWishlistBadge() {
    if (!wishlistBadge) return;
    
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
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="products.html" class="btn">Continue Shopping</a>
            </div>
        `;
        
        if (cartTotal) {
            cartTotal.textContent = `Total: $0.00`;
        }
        
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }
        
        return;
    }
    
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
    if (cartTotal) {
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
    
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
    
    // Header wishlist button
    headerWishlistBtn.addEventListener('click', () => {
        window.location.href = 'wishlist.html';
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        // Implement checkout functionality
        alert('Proceeding to checkout...');
    });
}); 