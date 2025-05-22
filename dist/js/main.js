// frontend/src/main.js

// --- Funciones de Autenticación y Utilidades (existentes en tu main.js) ---
const API_URL = 'http://localhost:3000'; // Ya existente

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            // Si no es JSON, intentar leer como texto para depuración
            const textResponse = await response.text();
            console.error("Respuesta no JSON:", textResponse);
            throw new Error("Oops, the server did not return valid JSON!");
        }
        return await response.json();
    } catch (error) {
        console.error("Error en fetchData:", error);
        throw error; // Propagar el error para que las funciones que llaman puedan manejarlo
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
        console.error("Error en loadProducts:", error);
        return [];
    }
}

function formatPrice(price, currency = "USD") {
    const numericPrice = parseFloat(price);
    const currencySymbol = currency === "USD" ? "US$" : "$";
    // Asegúrate de que el locale sea el adecuado para el formato decimal y el símbolo de la moneda
    const formattedPrice = new Intl.NumberFormat('es-ES', { // Cambiado a 'es-ES' para el formato de miles y decimales
        style: 'decimal',
        minimumFractionDigits: 2, // Asegura 2 decimales
        maximumFractionDigits: 2
    }).format(numericPrice);
    return `${currencySymbol} ${formattedPrice}`;
}

function displayProducts(products) {
    const productsContainer = document.getElementById("recent-products");
    if (!productsContainer) {
        console.warn("Contenedor de productos recientes no encontrado.");
        return;
    }
    productsContainer.innerHTML = "";

    const filteredProducts = products.filter(product =>
        !/EJEMPLO/i.test(product.name) && product.stock > 0
    );

    if (filteredProducts.length > 0) {
        filteredProducts.forEach((product) => {
            // Verificar si el producto tiene propiedades necesarias antes de renderizar
            if (!product.name || !product.description || !product.price) {
                console.warn("Producto incompleto, saltando:", product);
                return;
            }

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
                        <button class="add-to-cart-btn w-full bg-primary text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors" data-product-id="${product._id}">
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
    // Suma 10 horas y 0 minutos (en milisegundos)
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
            // Intenta leer el texto crudo para depuración si no es OK
            const text = await response.text();
            console.error("Raw response for ofertas del día (not OK):", text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Raw response for ofertas del día (not JSON):", text);
            throw new Error("La respuesta del servidor para ofertas del día no es JSON válido");
        }
        const ofertas = await response.json();
        const ofertasContainer = document.getElementById("ofertas-del-dia");
        if (!ofertasContainer) {
            console.warn("Element with ID 'ofertas-del-dia' not found, cannot display offers.");
            return;
        }
        ofertasContainer.innerHTML = "";
        if (ofertas.length > 0) {
            ofertas.slice(0, 3).forEach(oferta => {
                if (!oferta.image || !oferta.name || !oferta.price) {
                    console.warn("Oferta incompleta, saltando:", oferta);
                    return;
                }
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
        } else {
            ofertasContainer.innerHTML = "<p>No hay ofertas del día disponibles.</p>";
        }
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
            // Intenta leer el texto crudo para depuración si no es OK
            const text = await response.text();
            console.error("Raw response for nuevos ingresos (not OK):", text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Raw response for nuevos ingresos (not JSON):", text);
            throw new Error("La respuesta del servidor para nuevos ingresos no es JSON válido");
        }
        const nuevosIngresos = await response.json();
        const nuevosIngresosContainer = document.getElementById("nuevos-ingresos");
        if (!nuevosIngresosContainer) {
            console.warn("Element with ID 'nuevos-ingresos' not found, cannot display new arrivals.");
            return;
        }
        nuevosIngresosContainer.innerHTML = "";
        if (nuevosIngresos.length > 0) {
            nuevosIngresos.slice(0, 3).forEach(producto => {
                if (!producto.image || !producto.name || !producto.price) {
                    console.warn("Nuevo ingreso incompleto, saltando:", producto);
                    return;
                }
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
        } else {
            nuevosIngresosContainer.innerHTML = "<p>No hay nuevos ingresos disponibles.</p>";
        }
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

// --- Lógica del Mini-Carrito (NUEVA INTEGRACIÓN) ---
let cart = []; // Array para almacenar los ítems del carrito en el frontend

// --- Elementos del DOM del Mini-Carrito (Asegúrate de que estos IDs existan en tu HTML) ---
const cartIcon = document.getElementById('cartIcon');
const cartItemCountSpan = document.getElementById('cartItemCount');
const miniCartDropdown = document.getElementById('miniCartDropdown');
const miniCartItemsContainer = document.getElementById('miniCartItems');
const miniCartTotalSpan = document.getElementById('miniCartTotal');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const checkoutButton = document.getElementById('checkoutButton');

// Cargar el carrito del usuario desde el backend
async function loadCart() {
    const token = localStorage.getItem('authToken'); // Usa 'authToken' como en tu código
    if (!token) {
        cart = []; // Si no hay token, el usuario no está logueado, carrito vacío
        if (cartItemCountSpan) cartItemCountSpan.textContent = '0';
        updateMiniCartUI(); // Llama a esto para asegurar que el mini-carrito se renderiza vacío
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart`, { // Usa API_URL
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            cart = await response.json();
            updateMiniCartUI();
        } else {
            console.error('Error al cargar el carrito:', response.statusText);
            cart = []; // Limpiar carrito local en caso de error
            updateMiniCartUI();
        }
    } catch (error) {
        console.error('Error de conexión al cargar el carrito:', error);
        cart = []; // Limpiar carrito local en caso de error
        updateMiniCartUI();
    }
}

// Actualizar la interfaz de usuario del mini-carrito
function updateMiniCartUI() {
    if (miniCartItemsContainer) miniCartItemsContainer.innerHTML = ''; // Limpiar ítems existentes
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
    } else {
        if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
        cart.forEach(item => {
            const product = item.productId; // El producto populado desde el backend
            if (!product) return; // Salta si el producto es nulo (ej. fue eliminado del catálogo)

            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'items-center', 'justify-between', 'py-2', 'border-b', 'border-gray-100');
            itemElement.innerHTML = `
                <div class="flex items-center">
                    <img src="${product.images && product.images.length > 0 ? product.images[0] : '/img/default-product.jpg'}" alt="${product.name}" class="w-12 h-12 object-cover rounded-md mr-3">
                    <div>
                        <p class="font-semibold text-sm">${product.name}</p>
                        <p class="text-gray-600 text-xs">${item.quantity} x ${product.currency}${product.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <button data-product-id="${product._id}" data-action="decrement" class="quantity-btn px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300">-</button>
                    <span class="px-2 text-sm">${item.quantity}</span>
                    <button data-product-id="${product._id}" data-action="increment" class="quantity-btn px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300">+</button>
                    <button data-product-id="${product._id}" data-action="remove" class="ml-3 text-red-500 hover:text-red-700 text-sm">X</button>
                </div>
            `;
            if (miniCartItemsContainer) miniCartItemsContainer.appendChild(itemElement);
        });
    }

    if (cartItemCountSpan) cartItemCountSpan.textContent = itemCount;
    // Asegúrate de que la moneda sea consistente o la tomas del primer producto, o un valor por defecto.
    if (miniCartTotalSpan) miniCartTotalSpan.textContent = `${cart.length > 0 && cart[0].productId ? cart[0].productId.currency : '€'}${total.toFixed(2)}`;

    // Añadir event listeners a los botones de cantidad/eliminar
    if (miniCartItemsContainer) {
        miniCartItemsContainer.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        miniCartItemsContainer.querySelectorAll('button[data-action="remove"]').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }
}

// *** MODIFICACIÓN DE TU FUNCIÓN addToCart EXISTENTE ***
// EXPUESTA GLOBALMENTE para que los onclick inline funcionen
async function addToCart(productId) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión para agregar productos al carrito.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log(data.message);
            // Actualizar el carrito localmente con el ítem completo devuelto por el backend
            const existingItemIndex = cart.findIndex(item => item.productId && item.productId._id === data.cartItem.productId._id);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity = data.cartItem.quantity;
            } else {
                cart.push(data.cartItem);
            }
            updateMiniCartUI(); // Actualiza la UI del mini-carrito
            alert(data.message);
        } else {
            console.error('Error al agregar al carrito:', data.message);
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al agregar al carrito (conexión):", error);
        alert("Hubo un error al agregar el producto al carrito.");
    }
}

// Manejar cambio de cantidad o eliminación desde el mini-carrito
async function handleQuantityChange(event) {
    const productId = event.target.dataset.productId;
    const action = event.target.dataset.action;
    const token = localStorage.getItem('authToken');

    const currentItem = cart.find(item => item.productId && item.productId._id === productId);
    if (!currentItem) return;

    let newQuantity = currentItem.quantity;
    if (action === 'increment') {
        newQuantity += 1;
    } else if (action === 'decrement') {
        newQuantity -= 1;
    }

    // Si la cantidad llega a 0, eliminar el ítem
    if (newQuantity <= 0) {
        handleRemoveItem({ target: { dataset: { productId: productId } } });
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart/update-quantity/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            currentItem.quantity = newQuantity; // Actualiza la cantidad localmente
            updateMiniCartUI();
        } else {
            console.error('Error al actualizar cantidad:', data.message);
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error de conexión al actualizar cantidad:', error);
        alert('Hubo un error de conexión al actualizar la cantidad.');
    }
}

async function handleRemoveItem(event) {
    const productId = event.target.dataset.productId;
    const token = localStorage.getItem('authToken');

    if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            cart = cart.filter(item => item.productId && item.productId._id !== productId); // Eliminar del carrito local
            updateMiniCartUI();
        } else {
            console.error('Error al eliminar del carrito:', data.message);
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error de conexión al eliminar del carrito:', error);
        alert('Hubo un error de conexión al eliminar el producto del carrito.');
    }
}

// --- Lógica de Sesión de Usuario (existente) ---
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
}

function loadTopBar() {
    const topBar = document.querySelector('header');
    if (!topBar) return;

    // Aquí deberías tener una función isUserLoggedIn() y getCurrentUser() si las usas.
    // Asumo que tu checkUserSession() ya se encarga de esto.

    topBar.innerHTML = `
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="w-40">
                    <a href="index.html">
                        <img src="/img/logo.png" alt="Tutti Market Logo" class="w-full">
                    </a>
                </div>
                <div class="flex-1 mx-8 max-w-md">
                    <div class="relative">
                        <input type="text" id="searchInput"
                               placeholder="¿Qué estás buscando?"
                               class="w-full px-3 py-1 border border-gray-300 rounded-full focus:outline-none focus:border-primary text-sm">
                        <button type="button" id="searchButton" aria-label="Buscar" class="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </button>
                    </div>
                </div>
                </div>
        </div>
    `;

    // No incluyo el resto de tu loadTopBar ya que parece generar HTML directamente.
    // Si tu mini-carrito está dentro de esta función, debe ser integrado aquí.
    // Lo ideal es que el mini-carrito esté en tu index.html y no sea parte de una función que re-renderiza el header.
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

        // Verificaciones para evitar errores de 'null'
        const productName = document.getElementById("productName");
        const productPrice = document.getElementById("productPrice");
        const productDescription = document.getElementById("productDescription");
        const sellerInfo = document.getElementById("sellerInfo");
        const mainImage = document.getElementById("mainImage");
        const thumbnailsContainer = document.getElementById("thumbnails");
        const deliveryInfo = document.querySelector(".delivery-time");
        const stockInfo = document.querySelector(".stock-info");
        const quantityInfo = document.querySelector(".quantity-info");
        const specsList = document.getElementById("productSpecs");

        if (productName) productName.textContent = product.name;
        if (productPrice) productPrice.textContent = formatPrice(product.price, product.currency);
        if (productDescription) productDescription.textContent = product.description;
        if (sellerInfo) sellerInfo.innerHTML = `Publicado por: <strong>${product.userId?.fullName || "Vendedor desconocido"}</strong>`;

        if (mainImage) {
            mainImage.src = product.images.length > 0 ? product.images[0] : "placeholder.jpg";
            mainImage.alt = product.name;
        }

        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = "";
            product.images.forEach((imgSrc, index) => {
                const thumbnail = document.createElement("img");
                thumbnail.src = imgSrc;
                thumbnail.classList.add("img-thumbnail");
                thumbnail.onclick = () => changeImage(imgSrc);
                thumbnailsContainer.appendChild(thumbnail);
            });
        }

        if (deliveryInfo) deliveryInfo.textContent = `Llega gratis el jueves. Comprando dentro de las próximas 23 h 50 min`;
        if (stockInfo) stockInfo.textContent = `Stock disponible: ${product.stock || 0}`;
        if (quantityInfo) quantityInfo.textContent = `Cantidad: 1 unidad (+${product.stock || 0} disponibles)`;

        if (specsList) {
            specsList.innerHTML = "";
            if (product.specifications) {
                product.specifications.forEach(spec => {
                    const listItem = document.createElement("li");
                    listItem.textContent = spec;
                    specsList.appendChild(listItem);
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar detalles del producto:", error);
        alert("Hubo un error al cargar el producto.");
    }
}

function changeImage(src) {
    const mainImage = document.getElementById("mainImage");
    if (mainImage) mainImage.src = src;
}

// import { setupNotificationPanel, loadNotifications, handleNewNotification } from './notifications.js'; // Mantén esta línea si usas notifications.js

document.addEventListener('DOMContentLoaded', async () => {
    // Estas líneas son de tu `main.js` original
    // if (typeof setupNotificationPanel === 'function') setupNotificationPanel(); // Si usas notifications.js
    // if (typeof loadNotifications === 'function') await loadNotifications(); // Si usas notifications.js

    // Configurar WebSocket para notificaciones en tiempo real
    // const userId = localStorage.getItem('userId');
    // const ws = new WebSocket("ws://localhost:3000"); // Asegúrate de que tu backend tenga un servidor WebSocket en este puerto

    // ws.onopen = () => {
    //     if (userId) {
    //         ws.send(JSON.stringify({ type: "joinRoom", userId: userId }));
    //     }
    // };

    // ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     if (data.type === "notification") {
    //         console.log("Nueva notificación:", data.notification);
    //         if (typeof handleNewNotification === 'function') handleNewNotification(data.notification);
    //     }
    // };

    // Cargar el carrito cuando la página se carga (NUEVO)
    await loadCart(); // Es mejor usar await aquí para asegurar que el carrito se carga antes de que el usuario interactúe

    // Toggle del mini-carrito al hacer clic en el icono (NUEVO)
    if (cartIcon && miniCartDropdown) {
        cartIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que el clic se propague al documento
            miniCartDropdown.classList.toggle('hidden');
        });

        // Ocultar el mini-carrito si se hace clic fuera de él
        document.addEventListener('click', (event) => {
            // Asegúrate de que el evento.target no sea el icono del carrito ni esté dentro del mini-carrito
            if (miniCartDropdown && !miniCartDropdown.contains(event.target) && cartIcon && !cartIcon.contains(event.target)) {
                miniCartDropdown.classList.add('hidden');
            }
        });
    }

    // Manejar el botón de checkout (NUEVO)
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
                return;
            }
            window.location.href = '/checkout.html';
        });
    }


    const products = await loadProducts();
    // Solo carga el Hero Banner si los elementos existen
    if (document.querySelector('.carousel')) {
        loadHeroBanner(products);
    }
    displayProducts(products);
    checkUserSession();
    await loadOfertasDelDia(); // Asegura que se espera la carga de ofertas
    await loadNuevosIngresos(); // Asegura que se espera la carga de nuevos ingresos

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
    if (searchButton && searchInput) {
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
    }


    // --- Lógica de Login/Registro/Perfil (existente) ---
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    // const loginBtn = document.getElementById('loginBtn'); // No usado, se quita
    // const registerBtn = document.getElementById('registerBtn'); // No usado, se quita
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', data.token); // Usar 'authToken'
                    if (loginMessage) {
                        loginMessage.textContent = 'Inicio de sesión exitoso.';
                        loginMessage.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                        loginMessage.classList.add('bg-green-100', 'text-green-700');
                    }
                    alert('Inicio de sesión exitoso!');
                    window.location.href = '/dashboard.html'; // O la ruta a tu página principal/perfil
                } else {
                    if (loginMessage) {
                        loginMessage.textContent = data.message || 'Credenciales inválidas.';
                        loginMessage.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                        loginMessage.classList.add('bg-red-100', 'text-red-700');
                    }
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                if (loginMessage) {
                    loginMessage.textContent = 'Hubo un error de conexión al iniciar sesión.';
                    loginMessage.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                    loginMessage.classList.add('bg-red-100', 'text-red-700');
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;

            if (password !== confirmPassword) {
                if (registerMessage) {
                    registerMessage.textContent = 'Las contraseñas no coinciden.';
                    registerMessage.classList.remove('hidden');
                    registerMessage.classList.add('bg-red-100', 'text-red-700');
                }
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (registerMessage) {
                        registerMessage.textContent = 'Registro exitoso. ¡Ahora puedes iniciar sesión!';
                        registerMessage.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                        registerMessage.classList.add('bg-green-100', 'text-green-700');
                    }
                    alert('Registro exitoso!');
                    window.location.href = '/login.html';
                } else {
                    if (registerMessage) {
                        registerMessage.textContent = data.message || 'Error al registrar usuario.';
                        registerMessage.classList.remove('hidden');
                        registerMessage.classList.add('bg-red-100', 'text-red-700');
                    }
                }
            } catch (error) {
                console.error('Error al registrar:', error);
                if (registerMessage) {
                    registerMessage.textContent = 'Hubo un error de conexión al registrar tu cuenta.';
                    registerMessage.classList.remove('hidden');
                    registerMessage.classList.add('bg-red-100', 'text-red-700');
                }
            }
        });
    }

    const addressInput = document.getElementById('address');
    const editAddressButton = document.getElementById('editAddressButton');

    if (addressInput && editAddressButton) {
        const savedAddress = localStorage.getItem('address');
        if (savedAddress) {
            addressInput.value = savedAddress;
        }

        editAddressButton.addEventListener('click', function() {
            const newAddress = prompt("Introduce tu nueva dirección:");
            if (newAddress) {
                addressInput.value = newAddress;
                localStorage.setItem('address', newAddress);
                alert('Dirección guardada.');
            } else {
                alert('Por favor, introduce una dirección válida.');
            }
        });
    }

    // --- Lógica para agregar al carrito desde las páginas de productos (EXISTENTE, PERO CRÍTICO) ---
    // Esta parte se asegura de que todos los botones con la clase 'add-to-cart-btn' llamen a la función addToCart.
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            if (productId) {
                addToCart(productId); // Llama a la función global addToCart
            } else {
                console.error('El botón "Agregar al Carrito" no tiene un data-product-id.');
            }
        });
    });
});

// EXPONER addToCart GLOBALMENTE para que los onclick inline FUNCIONEN
window.addToCart = addToCart;

// Puedes exportar otras funciones si las necesitas en otros módulos de tu frontend
// export { loadCart, updateMiniCartUI, addToCart };