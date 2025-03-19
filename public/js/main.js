// Función para cargar productos
async function loadProducts() {
    try {
        const response = await fetch("/api/recent-products");
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

// Función para formatear el precio
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

// Función para mostrar productos
function displayProducts(products) {
    const productsContainer = document.getElementById("recent-products");
    productsContainer.innerHTML = "";

    if (products.length > 0) {
        products.forEach((product) => {
            // Formatear el precio actual y el precio anterior
            const formattedPrice = formatPrice(product.price, product.currency || 'USD');
            const formattedOldPrice = product.oldPrice ? formatPrice(product.oldPrice, product.currency || 'USD') : null;

            // Calcular el tiempo restante para la entrega
            const deliveryTime = calculateDeliveryTime();

            // Corregir stock disponible y cantidad
            const availableStock = product.stock || 0;
            const additionalStock = availableStock > 1 ? `(+${availableStock - 1} disponibles)` : '';

            // Crear tarjeta del producto
            const productCard = `
                <div class="product-card bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full">
                    <a href="producto.html?id=${product._id}">
                        <img src="${product.images[0] || 'img/default-product.jpg'}" alt="${product.name}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <span class="text-sm text-gray-500">${product.category}</span>
                            <h3 class="font-semibold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-2">${product.description}</p>
                        </div>
                        <div>
                            <!-- Precio anterior tachado (si existe) -->
                            ${formattedOldPrice ? `
                                <div class="text-sm text-gray-400 line-through">
                                    ${formattedOldPrice}
                                </div>
                            ` : ''}
                            <!-- Precio actual -->
                            <div class="text-xl font-bold text-blue-600">
                                ${formattedPrice}
                            </div>
                            <!-- Información adicional -->
                            <p class="text-sm text-gray-500 mt-2">${deliveryTime}</p>
                            <p class="text-sm text-gray-500">Stock disponible: ${availableStock}</p>
                            <p class="text-sm text-gray-500">Cantidad: 1 unidad ${additionalStock}</p>
                            <p class="text-sm text-gray-500 mt-2">Publicado por: ${product.userId?.fullName || "Anónimo"}</p>
                            <!-- Botón "Agregar al carrito" -->
                            <button class="w-full bg-blue-600 text-white py-2 mt-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="addToCart('${product._id}')">
                                <i class="fas fa-shopping-cart mr-2"></i>Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += productCard;
        });
    } else {
        productsContainer.innerHTML = "<p class='text-gray-600'>No hay productos para mostrar.</p>";
    }
}

// Función para calcular el tiempo restante para la entrega
function calculateDeliveryTime() {
    const now = new Date();
    const deadline = new Date(now.getTime() + 10 * 60 * 60 * 1000); // 10 horas más
    const hoursLeft = deadline.getHours();
    const minutesLeft = deadline.getMinutes();

    return `Llega gratis el jueves. Comprando dentro de las próximas ${hoursLeft} h ${minutesLeft} min`;
}

// Función para filtrar productos por categoría
function filterProductsByCategory(products, category) {
    return products.filter((product) => product.category === category);
}

// Función para filtrar productos por búsqueda
function filterProductsBySearch(products, searchText) {
    return products.filter((product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
    );
}

// Función para agregar un producto al carrito
async function addToCart(productId) {
    const token = localStorage.getItem("authToken");

    // Verificar si el usuario está autenticado
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
async function logout() {
    const token = localStorage.getItem("authToken");

    try {
        // Llamar a la ruta de logout en el backend
        const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al cerrar sesión");
        }

        // Eliminar el token y otros datos del localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");

        // Redirigir al usuario a la página de login
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.");
    }
}

// Cargar y mostrar productos al iniciar la página
document.addEventListener("DOMContentLoaded", async () => {
    const products = await loadProducts();
    displayProducts(products);

    // Evento para los botones de categoría
    const categoryButtons = document.querySelectorAll("[data-category]");
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            const filteredProducts = filterProductsByCategory(products, category);
            displayProducts(filteredProducts);
        });
    });

    // Evento para la barra de búsqueda
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", () => {
        const searchText = searchInput.value.trim();
        const filteredProducts = filterProductsBySearch(products, searchText);
        displayProducts(filteredProducts);
    });

    // Evento para la tecla "Enter" en la barra de búsqueda
    searchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            const searchText = searchInput.value.trim();
            const filteredProducts = filterProductsBySearch(products, searchText);
            displayProducts(filteredProducts);
        }
    });

    // Verificar la sesión del usuario al cargar la página
    checkUserSession();
});

// Obtener ID del producto desde la URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Cargar detalles del producto
async function loadProductDetails() {
    const productId = getProductIdFromURL();
    if (!productId) {
        alert("Producto no encontrado.");
        window.location.href = "/";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/product/${productId}`);
        if (!response.ok) {
            throw new Error("Error al cargar el producto.");
        }

        const product = await response.json();

        // Actualizar el contenido en la página
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productPrice").textContent = formatPrice(product.price, product.currency);
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("sellerInfo").innerHTML = `Publicado por: <strong>${product.userId?.fullName || "Vendedor desconocido"}</strong>`;

        // Mostrar la imagen principal
        const mainImage = document.getElementById("mainImage");
        mainImage.src = product.images.length > 0 ? product.images[0] : "placeholder.jpg";
        mainImage.alt = product.name;

        // Generar miniaturas de imágenes
        const thumbnailsContainer = document.getElementById("thumbnails");
        thumbnailsContainer.innerHTML = ""; 
        product.images.forEach((imgSrc, index) => {
            const thumbnail = document.createElement("img");
            thumbnail.src = imgSrc;
            thumbnail.classList.add("img-thumbnail");
            thumbnail.onclick = () => changeImage(imgSrc);
            thumbnailsContainer.appendChild(thumbnail);
        });

        // Mostrar detalles de stock y entrega
        const deliveryInfo = document.querySelector(".delivery-time");
        const stockInfo = document.querySelector(".stock-info");
        const quantityInfo = document.querySelector(".quantity-info");

        deliveryInfo.textContent = `Llega gratis el jueves. Comprando dentro de las próximas 23 h 50 min`;
        stockInfo.textContent = `Stock disponible: ${product.stock || 0}`;
        quantityInfo.textContent = `Cantidad: 1 unidad (+${product.stock || 0} disponibles)`;

        // Especificaciones del producto
        const specsList = document.getElementById("productSpecs");
        specsList.innerHTML = ""; // Limpiar antes de agregar nuevos elementos
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

// Cambiar la imagen principal al hacer clic en una miniatura
function changeImage(src) {
    document.getElementById("mainImage").src = src;
}