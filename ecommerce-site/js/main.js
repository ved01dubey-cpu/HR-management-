/* Core Logic for BharatStore */

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    setupSearch();
});

/**
 * Creates a product card element
 * @param {Object} product - Product data object
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
        <div class="product-img-wrapper">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-img">
            </a>
            <button class="wishlist-btn"><i data-lucide="heart"></i></button>
        </div>
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <a href="product.html?id=${product.id}">
                <h3 class="product-name">${product.name}</h3>
            </a>
            <div class="product-rating">
                ${generateRatingStars(product.rating)}
                <span class="rating-text">(${product.rating})</span>
            </div>
            <div class="product-footer">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                    <i data-lucide="shopping-cart"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

/**
 * Generates rating stars based on score
 */
function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i data-lucide="star" style="fill: currentColor; width: 14px; height: 14px;"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i data-lucide="star-half" style="fill: currentColor; width: 14px; height: 14px;"></i>';
        } else {
            stars += '<i data-lucide="star" style="width: 14px; height: 14px;"></i>';
        }
    }
    return stars;
}

/**
 * Adds product to cart
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

/**
 * Saves cart to local storage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Updates cart icon badge
 */
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (!countElement) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalCount;

    // Add pop effect
    countElement.classList.add('pop');
    setTimeout(() => countElement.classList.remove('pop'), 300);
}

/**
 * Shows toast notification
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
}

// Utility to get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
