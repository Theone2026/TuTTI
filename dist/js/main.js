<<<<<<< HEAD
const API_URL = 'http://localhost:3000';

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Oops, we haven't got JSON!");
        }
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/recent-products`);
        if (!response.ok) {
            throw new Error("Error al cargar los productos");
        }
        const products = await response.json();
        return products.filter(product => product.status !== 'archived' && product.status !== 'out_of_stock');
    } catch (error) {
        console.error("Error:", error);
        return [];
=======
// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // MODAL DE LOGIN
    const loginModal = document.getElementById('loginModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const openModalBtnFooter = document.getElementById('openModalBtnFooter'); // Nuevo botón en el footer
    const closeModalBtn = loginModal.querySelector('.close-modal');
    const modalLoginForm = document.getElementById('modalLoginForm');
    const modalLoginMessage = document.getElementById('modalLoginMessage');

    // Función para abrir el modal
    function openLoginModal() {
        loginModal.classList.remove('hidden');
        // Forzar reflow para que la transición CSS funcione
        void loginModal.offsetWidth; 
        loginModal.classList.add('open');
        document.body.classList.add('overflow-hidden'); // Evita scroll en el body
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
    }

<<<<<<< HEAD
function formatPrice(price, currency = "USD") {
    const numericPrice = parseFloat(price);
    const currencySymbol = currency === "USD" ? "US$" : "$";
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numericPrice);
    return `${currencySymbol} ${formattedPrice}`;
}

function displayProducts(products) {
    const productsContainer = document.getElementById("recent-products");
    productsContainer.innerHTML = "";

    const filteredProducts = products.filter(product => 
        !/EJEMPLO/i.test(product.name) && product.stock > 0
    );

    if (filteredProducts.length > 0) {
        filteredProducts.forEach((product) => {
            const formattedPrice = formatPrice(product.price, product.currency || 'USD');

            const productImage = product.images && product.images.length > 0 
                ? product.images[0] 
                : '/img/default-product.jpg';
            const productCard = `
                <div class="product-card bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full">
                    <a href="producto.html?id=${product._id}" class="block h-48 overflow-hidden">
                        <img src="${productImage}" alt="${product.name}" class="w-full h-full object-cover object-center" onerror="this.src='/img/default-product.jpg'">
                    </a>
                    <div class="p-4 flex-grow">
                        <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                        <p class="text-gray-600 mb-2">${product.description.substring(0, 100)}...</p>
                        <p class="text-xl font-bold text-primary">${formattedPrice}</p>
                    </div>
                    <div class="p-4 bg-gray-50">
                        <button onclick="addToCart('${product._id}')" class="w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += productCard;
        });
    } else {
        productsContainer.innerHTML = "<p class='text-gray-600'>No hay productos para mostrar.</p>";
    }
}

function calculateDeliveryTime() {
    const now = new Date();
    const deadline = new Date(now.getTime() + 10 * 60 * 60 * 1000);
    const hoursLeft = deadline.getHours();
    const minutesLeft = deadline.getMinutes();

    return `Llega gratis el jueves. Comprando dentro de las próximas ${hoursLeft} h ${minutesLeft} min`;
}

async function loadOfertasDelDia() {
    try {
        const response = await fetch(`${API_URL}/api/ofertas-del-dia`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.log("Raw response for ofertas del día:", text);
            throw new Error("La respuesta del servidor no es JSON válido");
        }
        const ofertas = await response.json();
        const ofertasContainer = document.getElementById("ofertas-del-dia");
        if (!ofertasContainer) {
            console.error("Element with ID 'ofertas-del-dia' not found");
            return;
        }
        ofertasContainer.innerHTML = "";
        ofertas.slice(0, 3).forEach(oferta => {
            ofertasContainer.innerHTML += `
                <div class="flex items-center space-x-2">
                    <img src="${oferta.image}" alt="${oferta.name}" class="w-12 h-12 object-cover rounded">
                    <div>
                        <p class="text-sm font-semibold">${oferta.name}</p>
                        <p class="text-xs text-red-600">${formatPrice(oferta.price, oferta.currency)}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar ofertas del día:", error);
        const ofertasContainer = document.getElementById("ofertas-del-dia");
        if (ofertasContainer) {
            ofertasContainer.innerHTML = "<p>No se pudieron cargar las ofertas del día.</p>";
        }
    }
}

async function loadNuevosIngresos() {
    try {
        const response = await fetch(`${API_URL}/api/nuevos-ingresos`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.log("Raw response for nuevos ingresos:", text);
            throw new Error("La respuesta del servidor no es JSON válido");
        }
        const nuevosIngresos = await response.json();
        const nuevosIngresosContainer = document.getElementById("nuevos-ingresos");
        if (!nuevosIngresosContainer) {
            console.error("Element with ID 'nuevos-ingresos' not found");
            return;
        }
        nuevosIngresosContainer.innerHTML = "";
        nuevosIngresos.slice(0, 3).forEach(producto => {
            nuevosIngresosContainer.innerHTML += `
                <div class="flex items-center space-x-2">
                    <img src="${producto.image}" alt="${producto.name}" class="w-12 h-12 object-cover rounded">
                    <div>
                        <p class="text-sm font-semibold">${producto.name}</p>
                        <p class="text-xs text-gray-600">${formatPrice(producto.price, producto.currency)}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar nuevos ingresos:", error);
        const nuevosIngresosContainer = document.getElementById("nuevos-ingresos");
        if (nuevosIngresosContainer) {
            nuevosIngresosContainer.innerHTML = "<p>No se pudieron cargar los nuevos ingresos.</p>";
        }
    }
}

function filterProductsByCategory(products, category) {
    return products.filter((product) => product.category === category);
}

function filterProductsBySearch(products, searchText) {
    return products.filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
    );
}

async function addToCart(productId) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            throw new Error("Error al agregar el producto al carrito");
        }

        const data = await response.json();
        alert("Producto agregado al carrito");
        console.log("Producto agregado:", data);
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al agregar el producto al carrito");
    }
}

async function checkUserSession() {
    const token = localStorage.getItem('authToken');
    const userDisplayElement = document.getElementById('userDisplay');
    const accountLinkElement = document.getElementById('accountLink');
    const sessionButtonContainer = document.getElementById('sessionButtonContainer');

    if (!token) {
        updateUIForLoggedOutUser(userDisplayElement, accountLinkElement, sessionButtonContainer);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const userData = await response.json();
        updateUIForLoggedInUser(userData, userDisplayElement, accountLinkElement, sessionButtonContainer);
    } catch (error) {
        console.error('Error:', error);
        updateUIForLoggedOutUser(userDisplayElement, accountLinkElement, sessionButtonContainer);
        localStorage.removeItem('authToken');
    }
}

function updateUIForLoggedInUser(userData, userDisplayElement, accountLinkElement, sessionButtonContainer) {
    let userName = localStorage.getItem('userName') || userData.fullName || userData.email.split('@')[0] || 'Usuario';
    userName = userName.replace(/@.*$/, '');
    const greeting = `¡Hola, ${userName}!`;

    if (userDisplayElement) userDisplayElement.textContent = greeting;
    if (accountLinkElement) {
        accountLinkElement.innerHTML = `<i class="fas fa-user mr-1"></i><span>${greeting}</span>`;
        accountLinkElement.href = "/dashboard.html";
    }
    if (sessionButtonContainer) {
        sessionButtonContainer.innerHTML = `
            <a href="/cerrar_sesion.html" class="text-sm text-gray-600 hover:text-gray-800">Cerrar Sesión</a>
        `;
        const logoutButton = sessionButtonContainer.querySelector('a[href="/cerrar_sesion.html"]');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }
}

function updateUIForLoggedOutUser(userDisplayElement, accountLinkElement, sessionButtonContainer) {
    if (userDisplayElement) userDisplayElement.textContent = "";
    if (accountLinkElement) {
        accountLinkElement.innerHTML = '<i class="fas fa-user mr-1"></i><span>Iniciar Sesión</span>';
        accountLinkElement.href = "/login.html";
    }
    if (sessionButtonContainer) {
        sessionButtonContainer.innerHTML = '';
    }
}

function loadHeroBanner(recentProducts) {
    try {
        const carousel = document.querySelector('.carousel');
        if (carousel && recentProducts.length > 0) {
            carousel.innerHTML = "";
            carousel.classList.add('relative', 'w-full', 'h-64', 'md:h-80', 'lg:h-96', 'overflow-hidden', 'rounded-lg', 'shadow-md');

            recentProducts.slice(0, 3).forEach((product, index) => {
                const slide = document.createElement('div');
                slide.classList.add('absolute', 'inset-0', 'w-full', 'h-full', 'transition-opacity', 'duration-500');
                slide.style.opacity = index === 0 ? '1' : '0';

                const imgContainer = document.createElement('div');
                imgContainer.classList.add('relative', 'w-full', 'h-full');
                const img = document.createElement('img');
                img.src = product.images[0] || '/img/default-product.jpg';
                img.alt = product.name;
                img.classList.add('w-full', 'h-full', 'object-contain');

                const textOverlay = document.createElement('div');
                textOverlay.classList.add('absolute', 'bottom-0', 'left-0', 'right-0', 'bg-black', 'bg-opacity-50', 'text-white', 'p-4');
                textOverlay.innerHTML = `
                    <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                    <p class="text-2xl font-bold">${formatPrice(product.price, product.currency)}</p>
                `;

                imgContainer.appendChild(img);
                imgContainer.appendChild(textOverlay);
                slide.appendChild(imgContainer);
                carousel.appendChild(slide);
            });

            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&#10094;';
            prevButton.classList.add('absolute', 'top-1/2', 'left-4', 'transform', '-translate-y-1/2', 'bg-white', 'bg-opacity-50', 'rounded-full', 'p-2', 'text-gray-800', 'hover:bg-opacity-75', 'text-2xl', 'z-10');

            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&#10095;';
            nextButton.classList.add('absolute', 'top-1/2', 'right-4', 'transform', '-translate-y-1/2', 'bg-white', 'bg-opacity-50', 'rounded-full', 'p-2', 'text-gray-800', 'hover:bg-opacity-75', 'text-2xl', 'z-10');

            carousel.appendChild(prevButton);
            carousel.appendChild(nextButton);

            let currentSlide = 0;
            const slides = carousel.querySelectorAll('div[class^="absolute"]');

            const showSlide = (index) => {
                slides[currentSlide].style.opacity = '0';
                slides[index].style.opacity = '1';
                currentSlide = index;
            };

            prevButton.addEventListener('click', () => {
                let index = currentSlide - 1;
                if (index < 0) index = slides.length - 1;
                showSlide(index);
            });

            nextButton.addEventListener('click', () => {
                let index = currentSlide + 1;
                if (index >= slides.length) index = 0;
                showSlide(index);
            });

            setInterval(() => {
                let index = currentSlide + 1;
                if (index >= slides.length) index = 0;
                showSlide(index);
            }, 5000);
        }

        const ofertasDelDia = document.querySelector('.ofertas-del-dia');
        const nuevosIngresos = document.querySelector('.nuevos-ingresos');
        if (ofertasDelDia && nuevosIngresos && recentProducts.length > 1) {
            ofertasDelDia.innerHTML = `
                <h3 class="text-sm font-semibold mb-2">Ofertas del Día</h3>
                <div class="bg-white p-2 rounded-lg shadow-sm">
                    <div class="w-full h-32 overflow-hidden">
                        <img src="${recentProducts[0].images[0] || '/img/default-product.jpg'}" alt="${recentProducts[0].name}" class="w-full h-full object-contain">
                    </div>
                    <p class="text-sm font-semibold mt-2 truncate">${recentProducts[0].name}</p>
                    <p class="text-base text-red-600 font-bold">${formatPrice(recentProducts[0].price, recentProducts[0].currency)}</p>
                </div>
            `;

            nuevosIngresos.innerHTML = `
                <h3 class="text-sm font-semibold mb-2">Nuevos Ingresos</h3>
                <div class="bg-white p-2 rounded-lg shadow-sm">
                    <div class="w-full h-32 overflow-hidden">
                        <img src="${recentProducts[1].images[0] || '/img/default-product.jpg'}" alt="${recentProducts[1].name}" class="w-full h-full object-contain">
                    </div>
                    <p class="text-sm font-semibold mt-2 truncate">${recentProducts[1].name}</p>
                    <p class="text-base text-gray-600">${formatPrice(recentProducts[1].price, recentProducts[1].currency)}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar el Hero Banner:', error);
    }
}

import { setupNotificationPanel, loadNotifications, handleNewNotification } from './notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupNotificationPanel();
    await loadNotifications();

    // Configurar WebSocket para notificaciones en tiempo real
    const userId = localStorage.getItem('userId');
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
        if (userId) {
            ws.send(JSON.stringify({ type: "joinRoom", userId: userId }));
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
            console.log("Nueva notificación:", data.notification);
            handleNewNotification(data.notification);
        }
    };

    // Aquí puedes agregar más código para manejar otras funcionalidades de la página principal
});

// Asegúrate de que handleNotificationClick esté disponible globalmente
window.handleNotificationClick = handleNotificationClick;
document.addEventListener("DOMContentLoaded", async () => {
    const products = await loadProducts();
    loadHeroBanner(products);
    displayProducts(products);
    checkUserSession();
    loadOfertasDelDia();
    loadNuevosIngresos();

    const categoryButtons = document.querySelectorAll("[data-category]");
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            const filteredProducts = filterProductsByCategory(products, category);
            displayProducts(filteredProducts);
        });
    });

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", () => {
        const searchText = searchInput.value.trim();
        const filteredProducts = filterProductsBySearch(products, searchText);
        displayProducts(filteredProducts);
    });

    searchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            const searchText = searchInput.value.trim();
            const filteredProducts = filterProductsBySearch(products, searchText);
            displayProducts(filteredProducts);
        }
    });
});
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
}

function loadTopBar() {
    const topBar = document.querySelector('header');
    if (!topBar) return;

    const isLoggedIn = isUserLoggedIn();
    const currentUser = getCurrentUser();

    topBar.innerHTML = `
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="w-40">
                    <a href="index.html">
                        <img src="/img/logo.png" alt="Tutti Market Logo" class="w-full">
                    </a>
                </div>
                <div class="flex-1 mx-8 max-w-md"> <!-- Añadido max-w-md para limitar el ancho -->
                    <div class="relative">
                        <input type="text" id="searchInput"
                               placeholder="¿Qué estás buscando?"
                               class="w-full px-3 py-1 border border-gray-300 rounded-full focus:outline-none focus:border-primary text-sm"> <!-- Reducido padding y tamaño de texto -->
                        <button type="button" id="searchButton" aria-label="Buscar" class="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <i class="fas fa-search text-gray-400 text-sm"></i> <!-- Reducido tamaño del icono -->
                        </button>
                    </div>
                </div>
                <!-- ... resto del código ... -->
            </div>
        </div>
    `;

    // ... resto de la función ...
}

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProductDetails() {
    const productId = getProductIdFromURL();
    if (!productId) {
        alert("Producto no encontrado.");
        window.location.href = "/";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/product/${productId}`);
        if (!response.ok) {
            throw new Error("Error al cargar el producto.");
        }

        const product = await response.json();

        document.getElementById("productName").textContent = product.name;
        document.getElementById("productPrice").textContent = formatPrice(product.price, product.currency);
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("sellerInfo").innerHTML = `Publicado por: <strong>${product.userId?.fullName || "Vendedor desconocido"}</strong>`;

        const mainImage = document.getElementById("mainImage");
        mainImage.src = product.images.length > 0 ? product.images[0] : "placeholder.jpg";
        mainImage.alt = product.name;

        const thumbnailsContainer = document.getElementById("thumbnails");
        thumbnailsContainer.innerHTML = ""; 
        product.images.forEach((imgSrc, index) => {
            const thumbnail = document.createElement("img");
            thumbnail.src = imgSrc;
            thumbnail.classList.add("img-thumbnail");
            thumbnail.onclick = () => changeImage(imgSrc);
            thumbnailsContainer.appendChild(thumbnail);
        });

        const deliveryInfo = document.querySelector(".delivery-time");
        const stockInfo = document.querySelector(".stock-info");
        const quantityInfo = document.querySelector(".quantity-info");

        deliveryInfo.textContent = `Llega gratis el jueves. Comprando dentro de las próximas 23 h 50 min`;
        stockInfo.textContent = `Stock disponible: ${product.stock || 0}`;
        quantityInfo.textContent = `Cantidad: 1 unidad (+${product.stock || 0} disponibles)`;

        const specsList = document.getElementById("productSpecs");
        specsList.innerHTML = "";
        if (product.specifications) {
            product.specifications.forEach(spec => {
                const listItem = document.createElement("li");
                listItem.textContent = spec;
                specsList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al cargar el producto.");
=======
    // Función para cerrar el modal
    function closeLoginModal() {
        loginModal.classList.remove('open');
        loginModal.classList.add('hidden'); // Ocultar completamente después de la transición
        document.body.classList.remove('overflow-hidden'); // Permite scroll en el body
        modalLoginMessage.classList.add('hidden'); // Oculta mensajes al cerrar
        modalLoginForm.reset(); // Limpia el formulario al cerrar
    }

    // Event listeners para abrir el modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openLoginModal);
    }
    if (openModalBtnFooter) { // Si existe el botón en el footer
        openModalBtnFooter.addEventListener('click', openLoginModal);
    }

    // Event listener para cerrar el modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeLoginModal);
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    // Manejo del formulario de Login (Simulación)
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('modalEmail').value;
            const password = document.getElementById('modalPassword').value;

            // Simulación de una llamada API
            console.log('Intentando iniciar sesión con:', { email, password });
            modalLoginMessage.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700'); // Limpia clases anteriores

            try {
                // Asumiendo que tu backend de login está en /api/login
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    modalLoginMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
                    modalLoginMessage.classList.remove('hidden');
                    modalLoginMessage.classList.add('bg-green-100', 'text-green-700');
                    // Guarda el token si lo recibes y redirige
                    if (data.token) {
                        localStorage.setItem('jwtToken', data.token);
                    }
                    setTimeout(() => {
                        closeLoginModal();
                        // Aquí puedes redirigir al usuario, por ejemplo, a un dashboard o al inicio
                        // window.location.href = '/dashboard.html';
                    }, 1500);
                } else {
                    modalLoginMessage.textContent = data.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
                    modalLoginMessage.classList.remove('hidden');
                    modalLoginMessage.classList.add('bg-red-100', 'text-red-700');
                }
            } catch (error) {
                console.error('Error de red o servidor:', error);
                modalLoginMessage.textContent = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
                modalLoginMessage.classList.remove('hidden');
                modalLoginMessage.classList.add('bg-red-100', 'text-red-700');
            }
        });
    }

    // MINI CARRITO
    const miniCart = document.getElementById('miniCart');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalSpan = document.getElementById('cartTotal');
    const cartCountSpan = document.querySelector('.cart-count');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');


    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Función para actualizar el contador del carrito en el header
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartCountSpan.classList.remove('hidden');
        } else {
            cartCountSpan.classList.add('hidden');
        }
    }

    // Función para renderizar los items del carrito
    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            proceedToCheckoutBtn.disabled = true;
            proceedToCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            emptyCartMessage.style.display = 'none';
            proceedToCheckoutBtn.disabled = false;
            proceedToCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item-professional', 'flex', 'items-center', 'py-4', 'border-b', 'border-gray-200');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image-professional w-20 h-20 object-contain rounded-lg border border-gray-200 p-1 flex-shrink-0">
                    <div class="cart-item-details-professional flex-grow ml-4">
                        <h4 class="cart-item-name-professional font-semibold text-gray-800">${item.name}</h4>
                        <p class="cart-item-price-professional text-sm text-gray-600">S/. ${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity-controls-professional flex items-center border border-gray-300 rounded-md mt-2 h-8">
                            <button class="quantity-btn w-8 h-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg rounded-l-md" data-id="${item.id}" data-action="decrease">-</button>
                            <input type="number" class="item-quantity-input w-10 text-center text-gray-800 text-sm border-none focus:ring-0" value="${item.quantity}" min="1" readonly>
                            <button class="quantity-btn w-8 h-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg rounded-r-md" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <span class="cart-item-total-professional font-bold text-gray-900 ml-4 flex-shrink-0">S/. ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item-btn-professional ml-4 text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartTotalSpan.textContent = `S/. ${total.toFixed(2)}`;
        updateCartCount();
        localStorage.setItem('cart', JSON.stringify(cart)); // Guardar carrito en localStorage
    }

    // Función para agregar un producto al carrito
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCartItems();
        // Mostrar un mensaje de confirmación flotante
        showToastMessage(`${product.name} añadido al carrito`);
    }

    // Función para eliminar un producto del carrito
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        renderCartItems();
        showToastMessage('Producto eliminado del carrito', 'error');
    }

    // Función para actualizar la cantidad de un producto en el carrito
    function updateQuantity(id, action) {
        const item = cart.find(item => item.id === id);
        if (item) {
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    removeFromCart(id); // Eliminar si la cantidad llega a 0
                    return;
                }
            }
            renderCartItems();
        }
    }

    // Event listener para botones de cantidad y eliminar en el mini carrito
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;
            updateQuantity(id, action);
        } else if (e.target.closest('.remove-item-btn-professional')) {
            const id = e.target.closest('.remove-item-btn-professional').dataset.id;
            removeFromCart(id);
        }
    });

    // Event listeners para abrir/cerrar el mini carrito
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            miniCart.classList.add('open-cart');
            document.body.classList.add('overflow-hidden');
            renderCartItems(); // Renderiza el carrito al abrirlo
        });
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            miniCart.classList.remove('open-cart');
            document.body.classList.remove('overflow-hidden');
        });
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
    }

<<<<<<< HEAD
function changeImage(src) {
    document.getElementById("mainImage").src = src;
}
=======
    // Cerrar mini carrito al hacer clic fuera del contenido
    if (miniCart) {
        miniCart.addEventListener('click', (e) => {
            if (e.target === miniCart) {
                miniCart.classList.remove('open-cart');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }

    // Botones de acción del carrito
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', () => {
            alert('Procediendo al pago...');
            // Aquí se redirigiría a la página de checkout
            window.location.href = '/checkout.html';
        });
    }
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            miniCart.classList.remove('open-cart');
            document.body.classList.remove('overflow-hidden');
        });
    }

    // FUNCIONALIDAD PARA CARGAR PRODUCTOS DINÁMICAMENTE
    async function fetchProducts(url, containerId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = ''; // Limpiar mensaje de "cargando"
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card', 'bg-white', 'rounded-xl', 'shadow-md', 'overflow-hidden', 'transform', 'transition-all', 'duration-200', 'hover:shadow-lg', 'hover:-translate-y-1', 'flex', 'flex-col', 'h-full');
                    productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-contain p-4 border-b border-gray-200">
                        <div class="p-5 flex flex-col flex-grow">
                            <h3 class="font-semibold text-lg text-gray-900 mb-2">${product.name}</h3>
                            <p class="text-gray-600 text-sm flex-grow">${product.description}</p>
                            <div class="flex justify-between items-center mt-4">
                                <span class="text-2xl font-bold text-blue-600">S/. ${product.price.toFixed(2)}</span>
                                <button class="add-to-cart-btn bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors duration-200"
                                    data-id="${product._id}"
                                    data-name="${product.name}"
                                    data-price="${product.price}"
                                    data-image="${product.image}">
                                    <i class="fas fa-cart-plus mr-2"></i> Añadir
                                </button>
                            </div>
                        </div>
                    `;
                    container.appendChild(productCard);
                });

                // Añadir event listeners a los botones "Añadir"
                container.querySelectorAll('.add-to-cart-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const product = {
                            id: e.currentTarget.dataset.id,
                            name: e.currentTarget.dataset.name,
                            price: parseFloat(e.currentTarget.dataset.price),
                            image: e.currentTarget.dataset.image
                        };
                        addToCart(product);
                    });
                });

            }
        } catch (error) {
            console.error(`Error al cargar productos para ${containerId}:`, error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `<p class="text-center text-red-500 col-span-full">Error al cargar los productos. Por favor, inténtalo más tarde.</p>`;
            }
        }
    }

    // Cargar productos al inicio
    fetchProducts('/api/recent-products.json', 'featured-products');
    // Si tienes otra API para ofertas:
    fetchProducts('/api/daily-deals.json', 'daily-deals'); // Asume que tienes un daily-deals.json o endpoint

    // TOAST MESSAGES (mensajes flotantes)
    function showToastMessage(message, type = 'success', duration = 3000) {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.classList.add('toast-container', 'fixed', 'bottom-4', 'right-4', 'z-[9999]', 'space-y-2');
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.classList.add('toast', 'p-3', 'rounded-lg', 'shadow-lg', 'text-white', 'text-sm', 'font-semibold', 'flex', 'items-center', 'gap-2', 'opacity-0', 'transition-opacity', 'duration-300', 'transform', 'translate-y-full');

        if (type === 'success') {
            toast.classList.add('bg-green-600');
            toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        } else if (type === 'error') {
            toast.classList.add('bg-red-600');
            toast.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
        } else {
            toast.classList.add('bg-gray-800');
            toast.innerHTML = `${message}`;
        }

        toastContainer.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-full');
            toast.classList.add('opacity-100', 'translate-y-0');
        }, 10);

        // Animar salida y remover
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-full');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }

    // Inicialización del Swiper
    const swiper = new Swiper(".mySwiper", {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        effect: 'fade', // Efecto de transición
        fadeEffect: {
            crossFade: true
        }
    });

    // Manejar animaciones del hero section cuando el slide cambia
    swiper.on('slideChangeTransitionStart', function () {
        const currentSlide = swiper.slides[swiper.activeIndex];
        // Quitar animaciones a todos los elementos
        currentSlide.querySelectorAll('.animate-fade-in-up').forEach(el => {
            el.classList.remove('animate-fade-in-up', 'delay-200', 'delay-400');
            el.style.opacity = '0'; // Asegurar que estén ocultos
            el.style.animation = 'none'; // Detener animación
        });
    });

    swiper.on('slideChangeTransitionEnd', function () {
        const currentSlide = swiper.slides[swiper.activeIndex];
        // Añadir animaciones a los elementos del slide actual
        currentSlide.querySelectorAll('.animate-fade-in-up').forEach(el => {
            el.style.animation = ''; // Resetear la propiedad de animación
            el.classList.add('animate-fade-in-up');
            if (el.classList.contains('delay-200')) {
                el.classList.add('delay-200');
            }
            if (el.classList.contains('delay-400')) {
                el.classList.add('delay-400');
            }
        });
    });

    // Asegurarse de que el primer slide tenga las animaciones al cargar
    const initialSlide = swiper.slides[swiper.activeIndex];
    initialSlide.querySelectorAll('.animate-fade-in-up').forEach(el => {
        el.style.animation = '';
        el.classList.add('animate-fade-in-up');
        if (el.classList.contains('delay-200')) {
            el.classList.add('delay-200');
        }
        if (el.classList.contains('delay-400')) {
            el.classList.add('delay-400');
        }
    });

    // Inicializar el conteo del carrito al cargar la página
    updateCartCount();
});
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
