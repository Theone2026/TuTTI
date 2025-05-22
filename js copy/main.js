const API_URL = 'http:/tutti:3000';

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
    }
}

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
    }
}

function changeImage(src) {
    document.getElementById("mainImage").src = src;
}
