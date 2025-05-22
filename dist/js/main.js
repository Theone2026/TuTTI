<<<<<<< HEAD
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
    }

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
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
            }
        });
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
<<<<<<< HEAD
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
=======
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
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
            }
        });
    }

<<<<<<< HEAD
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
=======
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
    }

    // Cerrar mini carrito al hacer clic fuera del contenido
    if (miniCart) {
        miniCart.addEventListener('click', (e) => {
            if (e.target === miniCart) {
                miniCart.classList.remove('open-cart');
                document.body.classList.remove('overflow-hidden');
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
            }
        });
    }

<<<<<<< HEAD
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
=======
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
