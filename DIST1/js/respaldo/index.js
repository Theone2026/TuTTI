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

    // Inicialización de las variables
    let currentSlide = 0;
    let products = []; // Aquí se almacenarán los productos

    // Recuperar el estado de autenticación desde localStorage
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userName = localStorage.getItem("userName");
    const isAdmin = userName === "Maikel10"; // Asumimos que "Maikel10" es el administrador

    if (isAuthenticated) {
        sellLink.style.display = "block";
        loginLink.style.display = "none";
        userMenu.style.display = "block";

        // Eliminar el dominio del correo electrónico para mostrar solo el nombre
        const displayName = userName.split('@')[0]; // Divide el correo en dos partes por '@' y toma la primera parte
        userNameElement.textContent = `Hola, ${displayName}`;
    } else {
        sellLink.style.display = "none";
        loginLink.style.display = "block";
        userMenu.style.display = "none";
    }

    // Mostrar/ocultar el menú desplegable de usuario
    userMenu.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Resto de tu código...
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

        filteredProducts.forEach((product, index) => {
            const productItem = document.createElement("div");
            productItem.classList.add("product-item");

            // Si no tiene imagen, mostrar una por defecto
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

    // Función para eliminar un producto
    function deleteProduct(index) {
        products.splice(index, 1); // Elimina el producto del array
        localStorage.setItem("publishedProducts", JSON.stringify(products)); // Actualiza localStorage
        displayProducts(products); // Vuelve a mostrar los productos actualizados
    }

    // Función para editar un producto
    function editProduct(index) {
        const product = products[index];
        const newName = prompt('Nuevo nombre del producto', product.name);
        const newPrice = prompt('Nuevo precio del producto', product.price);
        const newDescription = prompt('Nueva descripción del producto', product.description);

        // Validación antes de guardar los cambios
        if (!newName || !newPrice || !newDescription) {
            alert("Todos los campos deben estar completos.");
            return;
        }

        // Modificar el producto
        products[index] = { ...product, name: newName, price: newPrice, description: newDescription };
        localStorage.setItem("publishedProducts", JSON.stringify(products));
        displayProducts(products); // Actualizar la visualización
    }

    // Función para cargar productos desde localStorage (o backend si está implementado)
    function loadProducts() {
        // Aquí puedes integrar la carga de productos desde un backend si lo deseas
        const storedProducts = JSON.parse(localStorage.getItem("publishedProducts"));
        if (storedProducts) {
            products = storedProducts;
        } else {
            products = []; // En caso de que no haya productos en localStorage
        }
        displayProducts(products); // Muestra los productos cargados
    }

    loadProducts(); // Cargar productos cuando se inicia la página

    // Funcionalidad de búsqueda
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

    // Auto-slide cada 5 segundos
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
<<<<<<< HEAD:dist/js/app.js

    // Funcionalidad para el login
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();  // Evita que el formulario se envíe por defecto

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('https://tutti-tienda-l9p1v97i6-shadow27s-projects.vercel.app/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Autenticación exitosa
                alert('Login exitoso');
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userName", username);

                sellLink.style.display = "block";
                loginLink.style.display = "none";
                userMenu.style.display = "block";
                userNameElement.textContent = `Hola, ${username}`;
            } else {
                // Error en la autenticación
                alert('Error al autenticar el usuario');
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Hubo un problema con la red');
        }
    });
=======
});

import './styles.css';
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226:dist/js/respaldo/index.js
