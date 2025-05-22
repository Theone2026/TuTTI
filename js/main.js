// Función para cargar productos recientes y mostrarlos en el Hero Banner y la sección de productos recientes
async function loadRecentProducts() {
    try {
        // Obtener los productos recientes
        const recentResponse = await fetch("/api/recent-products");
        if (!recentResponse.ok) {
            throw new Error("Error al cargar los productos recientes");
        }
        const recentProducts = await recentResponse.json();

        // Obtener las ofertas
        const offersResponse = await fetch("/api/offers");
        if (!offersResponse.ok) {
            throw new Error("Error al cargar las ofertas");
        }
        const offers = await offersResponse.json();

        // Mostrar los productos en el Hero Banner
        loadHeroBanner(recentProducts, offers);

        // Mostrar los productos en la sección de productos recientes
        const productsContainer = document.getElementById("recent-products");
        if (recentProducts.length > 0) {
            productsContainer.innerHTML = ""; // Limpiar el contenedor

            recentProducts.forEach((product) => {
                const productCard = `
                    <div class="product-card bg-white rounded-lg overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <span class="text-sm text-gray-500">${product.category}</span>
                            <h3 class="font-semibold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-2">${product.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-xl font-bold">$${product.price}</span>
                                <button class="primary-button" onclick="addToCart('${product._id}')">
                                    <i class="fas fa-shopping-cart mr-2"></i>Agregar
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">Publicado por: ${product.userId?.fullName || "Anónimo"}</p>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += productCard;
            });
        } else {
            productsContainer.innerHTML = "<p class='text-gray-600'>No hay productos recientes.</p>";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("recent-products").innerHTML =
            "<p class='text-red-500'>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>";
    }
}

function loadHeroBanner(recentProducts) {
    try {
        // Mostrar los productos en el carrusel
        const carousel = document.querySelector('.carousel');
        carousel.innerHTML = ""; // Limpiar el carrusel antes de agregar nuevas imágenes

        recentProducts.slice(0, 3).forEach((product, index) => { // Muestra solo los 3 primeros productos
            const img = document.createElement('img');
            img.src = product.images[0]; // Usa la primera imagen del producto
            img.alt = product.name;
            img.classList.add('w-full', 'h-auto');
            if (index !== 0) img.classList.add('hidden'); // Solo la primera imagen es visible
            carousel.appendChild(img);
        });

        // Inicializar el carrusel
        initializeCarousel();

        // Mostrar las ofertas del día (usando los productos recientes)
        const ofertasDelDia = document.getElementById('ofertas-del-dia');
        ofertasDelDia.innerHTML = ""; // Limpiar el contenedor
        recentProducts.slice(0, 1).forEach(product => { // Muestra solo 1 producto
            const offerDiv = document.createElement('div');
            offerDiv.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}" class="w-full h-auto rounded-lg">
                <p class="text-sm text-gray-600 mt-2">${product.name} - ${formatPrice(product.price, product.currency)}</p>
            `;
            ofertasDelDia.appendChild(offerDiv);
        });

        // Mostrar los nuevos ingresos (usando los productos recientes)
        const nuevosIngresos = document.getElementById('nuevos-ingresos');
        nuevosIngresos.innerHTML = ""; // Limpiar el contenedor
        recentProducts.slice(1, 2).forEach(product => { // Muestra el segundo producto reciente
            const productDiv = document.createElement('div');
            productDiv.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}" class="w-full h-auto rounded-lg">
                <p class="text-sm text-gray-600 mt-2">${product.name} - ${formatPrice(product.price, product.currency)}</p>
            `;
            nuevosIngresos.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error al cargar el Hero Banner:', error);
    }
}

// Función para inicializar el carrusel
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    const images = carousel.querySelectorAll('img');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    let currentIndex = 0;

    // Función para mostrar la imagen actual
    function showImage(index) {
        images.forEach((img, i) => {
            img.classList.toggle('hidden', i !== index);
        });
    }

    // Evento para la flecha "Anterior"
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    });

    // Evento para la flecha "Siguiente"
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    });

    // Iniciar el carrusel automáticamente
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }, 5000); // Cambia de imagen cada 5 segundos
}

// Función para verificar la sesión del usuario
function checkUserSession() {
    const isLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn')) || false;
    const userAccountLink = document.querySelector('#accountLink');
    const logoutButton = document.getElementById('logoutButton');

    if (isLoggedIn) {
        const userName = localStorage.getItem('userName') || 'Mi Perfil';
        if (userAccountLink) {
            userAccountLink.innerHTML = `
                <i class="fas fa-user mr-2"></i>
                ${userName}
            `;
            userAccountLink.href = "#";
            userAccountLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "/perfil.html";
            });
        }
        if (logoutButton) {
            logoutButton.classList.remove('hidden');
        }
    } else {
        if (userAccountLink) {
            userAccountLink.innerHTML = `
                <i class="fas fa-user mr-2"></i>
                Iniciar Sesión
            `;
            userAccountLink.href = "#";
            userAccountLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "/login.html";
            });
        }
        if (logoutButton) {
            logoutButton.classList.add('hidden');
        }
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    window.location.href = "/index.html"; // Redirigir al inicio después de cerrar sesión
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadRecentProducts(); // Cargar productos recientes y Hero Banner
    checkUserSession();   // Verificar la sesión del usuario
});


// Función para cargar productos recientes
async function loadRecentProducts() {
    try {
        // Obtener productos recientes desde la API
        const response = await fetch("https://tu-tti.vercel.app/api/recent-products");
        if (!response.ok) {
            throw new Error("Error al cargar los productos");
        }
        const products = await response.json();

        const recentProductsContainer = document.getElementById("recent-products");
        recentProductsContainer.innerHTML = ""; // Limpiar el contenedor

        // Mostrar cada producto
        products.forEach((product) => {
            const productCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="relative h-48">
                        <img src="${product.images[0] || 'img/default-product.jpg'}" alt="${product.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold">${product.name}</h3>
                        <p class="text-gray-600">${product.description}</p>
                        <p class="text-primary font-bold mt-2">$${product.price}</p>
                        <button class="primary-button w-full mt-4">Ver Detalles</button>
                    </div>
                </div>
            `;
            recentProductsContainer.insertAdjacentHTML("beforeend", productCard);
        });
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al cargar los productos. Inténtalo de nuevo.");
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    window.location.href = '/index.html'; // Redirigir al inicio después de cerrar sesión
}

// Cargar productos al iniciar la página
document.addEventListener("DOMContentLoaded", function () {
    loadRecentProducts();
});