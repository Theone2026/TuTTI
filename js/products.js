import { formatCurrency } from './main.js';

// Función para cargar productos por categoría
export async function loadProductsByCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const products = await response.json();
        renderProductsGrid(products);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('products-container').innerHTML = 
            '<p class="error-message">Error al cargar los productos. Por favor, intente nuevamente.</p>';
    }
}

// Función para renderizar productos en grid
function renderProductsGrid(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.images[0] || '/img/default-product.jpg'}" alt="${product.name}">
                ${product.discount ? `<span class="product-badge">-${product.discount}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatCurrency(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="location.href='/producto.html?id=${product._id}'">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-primary add-to-cart" data-id="${product._id}">
                        <i class="fas fa-shopping-cart"></i> Carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a los botones
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Función para cargar detalles de un producto
export async function loadProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!response.ok) throw new Error('Error al cargar producto');
        
        const product = await response.json();
        renderProductDetails(product);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('product-details').innerHTML = 
            '<p class="error-message">Error al cargar el producto. Por favor, intente nuevamente.</p>';
    }
}

// Función para renderizar detalles del producto
function renderProductDetails(product) {
    const container = document.getElementById('product-details');
    if (!container) return;

    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <img src="${product.images[0] || '/img/default-product.jpg'}" alt="${product.name}">
            </div>
            <div class="thumbnails">
                ${product.images.map((img, index) => `
                    <img src="${img}" alt="Miniatura ${index + 1}" onclick="changeMainImage('${img}')">
                `).join('')}
            </div>
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="product-meta">
                <span class="sku">SKU: ${product.sku || 'N/A'}</span>
                <span class="availability">Disponibilidad: ${product.stock > 0 ? 'En stock' : 'Agotado'}</span>
            </div>
            <div class="product-price">
                <span class="current">${formatCurrency(product.price)}</span>
                ${product.originalPrice ? `<span class="original">${formatCurrency(product.originalPrice)}</span>` : ''}
            </div>
            <div class="product-rating">
                ${generateStarRating(product.rating || 0)}
                <a href="#reviews" class="review-link">(${product.reviewsCount || 0} reseñas)</a>
            </div>
            <div class="product-description">
                <p>${product.description || 'Descripción no disponible.'}</p>
            </div>
            <div class="product-actions">
                <div class="quantity">
                    <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                    <input type="number" value="1" min="1" max="${product.stock}">
                    <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
                </div>
                <button class="btn btn-primary add-to-cart" data-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> Añadir al carrito
                </button>
                <button class="btn btn-outline add-to-wishlist" data-id="${product._id}">
                    <i class="fas fa-heart"></i> Lista de deseos
                </button>
            </div>
            <div class="product-meta-footer">
                <span><i class="fas fa-tag"></i> Categoría: ${product.category || 'N/A'}</span>
                <span><i class="fas fa-share-alt"></i> Compartir:</span>
                <div class="social-share">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        </div>
    `;

    // Event listeners para cantidad
    document.querySelector('.qty-btn.minus').addEventListener('click', () => {
        const input = document.querySelector('.quantity input');
        if (input.value > 1) input.value--;
    });

    document.querySelector('.qty-btn.plus').addEventListener('click', () => {
        const input = document.querySelector('.quantity input');
        if (input.value < product.stock) input.value++;
    });

    // Event listeners para botones
    document.querySelector('.add-to-cart').addEventListener('click', addToCart);
    document.querySelector('.add-to-wishlist').addEventListener('click', addToWishlist);
}

// Función para cambiar imagen principal
function changeMainImage(src) {
    document.querySelector('.main-image img').src = src;
}

// Función para añadir a lista de deseos
async function addToWishlist(e) {
    const productId = e.target.dataset.id;
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('Por favor inicie sesión para añadir productos a su lista de deseos');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) throw new Error('Error al añadir a lista de deseos');

        showNotification('Producto añadido a tu lista de deseos');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al añadir a lista de deseos', 'error');
    }
}
