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

    const products = JSON.parse(localStorage.getItem("publishedProducts")) || [];
    let currentSlide = 0;

    // Verificar autenticación
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userName = localStorage.getItem("userName");

    // Verificar si el usuario es el administrador "Maikel10"
    const isAdmin = userName === "Maikel10"; 

    if (isAuthenticated) {
        sellLink.style.display = "block";
        loginLink.style.display = "none";
        userMenu.style.display = "block";
        userNameElement.textContent = `Hola, ${userName}`;
    } else {
        // Si no está autenticado, ocultar la opción de eliminar y modificar productos
        const deleteButtons = document.querySelectorAll('.delete-button');
        const editButtons = document.querySelectorAll('.edit-button');
        deleteButtons.forEach(button => button.style.display = "none");
        editButtons.forEach(button => button.style.display = "none");
    }

    // Mostrar/ocultar menú desplegable
    userMenu.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

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

    // Función para mostrar productos
    function displayProducts(filteredProducts) {
        productsCarousel.innerHTML = "";
        if (filteredProducts.length === 0) {
            productsCarousel.innerHTML = "<p>No hay productos destacados en este momento.</p>";
            return;
        }

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
                ${isAdmin && isAuthenticated ? `<button class="delete-button" data-index="${index}">Eliminar</button>
                                                 <button class="edit-button" data-index="${index}">Modificar</button>` : ''}
            `;
            productsCarousel.appendChild(productItem);
        });

        // Agregar eventos a los botones de eliminar y modificar solo si el usuario está autenticado
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

    // Función para eliminar producto
    function deleteProduct(index) {
        products.splice(index, 1); // Elimina el producto del array
        localStorage.setItem("publishedProducts", JSON.stringify(products)); // Actualiza localStorage
        displayProducts(products); // Vuelve a mostrar los productos actualizados
    }

    // Función para editar producto
    function editProduct(index) {
        const product = products[index];
        const newName = prompt('Nuevo nombre del producto', product.name);
        const newPrice = prompt('Nuevo precio del producto', product.price);
        const newDescription = prompt('Nueva descripción del producto', product.description);

        // Modificar el producto
        products[index] = { ...product, name: newName, price: newPrice, description: newDescription };
        localStorage.setItem("publishedProducts", JSON.stringify(products));
        displayProducts(products); // Actualizar la visualización
    }

    // Inicializar con todos los productos
    displayProducts(products);

    // Funcionalidad de búsqueda
    searchButton.addEventListener("click", () => {
        const searchTerm = searchInput.value.toLowerCase();
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
});
