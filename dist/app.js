document.addEventListener("DOMContentLoaded", () => {
    const heroSlide = document.getElementById("heroSlide");
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    const productsCarousel = document.getElementById("productsCarousel");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const sellLink = document.getElementById("sell-link");
    const loginLink = document.getElementById("login-link");
    const userMenu = document.getElementById("user-menu");
    const userNameElement = document.getElementById("user-name");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    let currentSlide = 0;
    let products = []; // Aquí se almacenarán los productos

    // Actualiza el estado de autenticación en la interfaz
    function updateAuthState() {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        const userName = localStorage.getItem("userName");
        const isAdmin = userName === "Maikel10"; // Asumimos que "Maikel10" es el administrador

        if (isAuthenticated) {
            sellLink.style.display = "block";
            loginLink.style.display = "none";
            userMenu.style.display = "block";
            userNameElement.textContent = `Hola, ${userName}`;
        } else {
            sellLink.style.display = "none";
            loginLink.style.display = "block";
            userMenu.style.display = "none";
        }

        return { isAuthenticated, isAdmin };
    }

    // Mostrar/ocultar el menú desplegable de usuario
    userMenu.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Función para cambiar las diapositivas del carrusel
    function showSlide(index) {
        const slides = heroSlide.children;
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }
        heroSlide.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    prevButton.addEventListener("click", () => {
        showSlide(currentSlide - 1);
    });

    nextButton.addEventListener("click", () => {
        showSlide(currentSlide + 1);
    });

    // Función para mostrar los productos
    function displayProducts(filteredProducts) {
        productsCarousel.innerHTML = "";
        if (filteredProducts.length === 0) {
            productsCarousel.innerHTML = "<p>No hay productos destacados en este momento.</p>";
            return;
        }

        const { isAuthenticated, isAdmin } = updateAuthState();

        filteredProducts.forEach((product, index) => {
            const productItem = document.createElement("div");
            productItem.classList.add("product-item");

            const productImage = product.image || 'default-image.jpg';

            productItem.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    <img src="${productImage}" alt="${product.name}" class="product-img">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-price">$${product.price}</p>
                        <p class="product-seller">Vendido por: ${product.sellerName || 'Desconocido'}</p>
                        <p class="product-description">${product.description}</p>
                        ${product.freeShipping ? '<p class="shipping">Envío Gratis</p>' : ''}
                    </div>
                </a>
                ${isAdmin && isAuthenticated ? `
                    <button class="delete-button" data-index="${index}">Eliminar</button>
                    <button class="edit-button" data-index="${index}">Modificar</button>` : ''}
            `;
            productsCarousel.appendChild(productItem);
        });

        // Agregar eventos a los botones de eliminar y modificar
        const deleteButtons = document.querySelectorAll('.delete-button');
        const editButtons = document.querySelectorAll('.edit-button');

        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productIndex = event.target.dataset.index;
                deleteProduct(productIndex);
            });
        });

        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productIndex = event.target.dataset.index;
                editProduct(productIndex);
            });
        });
    }

    function deleteProduct(index) {
        if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            products.splice(index, 1);
            localStorage.setItem("publishedProducts", JSON.stringify(products));
            displayProducts(products);
        }
    }

    function editProduct(index) {
        const product = products[index];
        const newName = prompt('Nuevo nombre del producto', product.name);
        const newPrice = prompt('Nuevo precio del producto', product.price);
        const newDescription = prompt('Nueva descripción del producto', product.description);

        if (!newName || !newPrice || !newDescription) {
            alert("Todos los campos deben estar completos.");
            return;
        }

        products[index] = { ...product, name: newName, price: newPrice, description: newDescription };
        localStorage.setItem("publishedProducts", JSON.stringify(products));
        displayProducts(products);
    }

    function loadProducts() {
        const storedProducts = JSON.parse(localStorage.getItem("publishedProducts"));
        products = Array.isArray(storedProducts) ? storedProducts : [];
        displayProducts(products);
    }

    loadProducts();

    searchButton.addEventListener("click", () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm === "") {
            alert("Por favor, ingresa un término de búsqueda.");
            return;
        }
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        displayProducts(filteredProducts);
    });

    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('https://tutti-tienda-l9p1v97i6-shadow27s-projects.vercel.app/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userName", username);
                alert(data.message);
                updateAuthState();
                loadProducts();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});
