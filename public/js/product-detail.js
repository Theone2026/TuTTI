// public/js/product-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const productNameElement = document.getElementById('product-name');
    const productTitleElement = document.getElementById('product-title'); // Para el título de la página
    const productSkuElement = document.getElementById('product-sku');
    const productConditionElement = document.getElementById('product-condition');
    const productPriceElement = document.getElementById('product-price');
    const productQuantityInput = document.getElementById('product-quantity');
    const quantityMinusBtn = document.getElementById('quantity-minus');
    const quantityPlusBtn = document.getElementById('quantity-plus');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const sellerNameElement = document.getElementById('seller-name');
    const productFullDescription = document.getElementById('product-full-description');
    const productSpecsTable = document.getElementById('product-specs');
    const relatedProductsContainer = document.getElementById('related-products');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbProductName = document.getElementById('breadcrumb-product-name');

    // Manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('tab-active'));
            button.classList.add('tab-active');

            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(`tab-${tab}`).classList.remove('hidden');
            document.getElementById(`tab-${tab}`).classList.add('active-tab'); // Para la animación fadeIn
        });
    });

    // Obtener ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    let currentProductData = null; // Variable para almacenar los datos del producto actual

    if (!productId) {
        // Redirigir o mostrar un mensaje de error si no hay ID
        productNameElement.textContent = 'Producto no encontrado';
        productTitleElement.textContent = 'Producto no encontrado';
        productFullDescription.innerHTML = '<p>Lo sentimos, no pudimos cargar la información de este producto.</p>';
        return;
    }

    // --- Cargar datos del producto ---
    async function fetchProductDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${id}`); // Asume que tienes un endpoint para producto por ID
            if (!response.ok) {
                console.warn(`API de producto no disponible (${response.status}). Cargando desde fallback local.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error al cargar detalles del producto desde la API:', error);
            // Fallback a `recent-products.json` y busca el producto por ID
            const fallbackResponse = await fetch('/api/recent-products.json');
            const fallbackProducts = await fallbackResponse.json();
            const product = fallbackProducts.find(p => p._id === id);
            if (product) {
                console.log('Cargando producto desde el fallback local JSON.');
                return product;
            }
            return null; // Producto no encontrado en fallback
        }
    }

    // --- Renderizar detalles del producto ---
    async function renderProduct(product) {
        if (!product) {
            productNameElement.textContent = 'Producto no encontrado';
            productTitleElement.textContent = 'Producto no encontrado';
            productFullDescription.innerHTML = '<p>Lo sentimos, el producto solicitado no existe o no está disponible.</p>';
            return;
        }

        currentProductData = product; // Almacenar datos del producto

        productTitleElement.textContent = `${product.name} - Tutti Market`;
        productNameElement.textContent = product.name;
        productSkuElement.textContent = product.sku || 'N/A';
        productConditionElement.textContent = product.condition || 'Nuevo';
        productPriceElement.textContent = product.price.toFixed(2);
        sellerNameElement.textContent = product.userId ? product.userId.fullName : 'Vendedor Anónimo';
        productFullDescription.innerHTML = product.fullDescription || product.description || 'No hay una descripción completa disponible.';

        // Breadcrumbs
        breadcrumbCategory.textContent = product.category || 'Categoría';
        breadcrumbCategory.href = `/category.html?cat=${encodeURIComponent(product.category)}`;
        breadcrumbProductName.textContent = product.name;

        // Imágenes
        const images = product.images && product.images.length > 0 ? product.images : [product.image]; // Usar múltiples imágenes o la principal
        if (images[0]) {
            mainProductImage.src = images[0];
            mainProductImage.dataset.originalSrc = images[0]; // Para zoom o futura funcionalidad
        } else {
            mainProductImage.src = 'img/placeholder.jpg';
            mainProductImage.dataset.originalSrc = 'img/placeholder.jpg';
        }
        
        thumbnailGallery.innerHTML = '';
        images.forEach((imgSrc, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imgSrc;
            thumbnail.alt = `Miniatura ${index + 1}`;
            thumbnail.classList.add('rounded-md', 'shadow-sm', 'cursor-pointer', 'border-2', 'border-transparent', 'hover:border-blue-600', 'transition-all');
            if (index === 0) thumbnail.classList.add('active', 'border-blue-600');
            thumbnail.addEventListener('click', () => {
                mainProductImage.src = imgSrc;
                document.querySelectorAll('.thumbnail-gallery img').forEach(thumb => thumb.classList.remove('active', 'border-blue-600'));
                thumbnail.classList.add('active', 'border-blue-600');
            });
            thumbnailGallery.appendChild(thumbnail);
        });

        // Especificaciones
        productSpecsTable.innerHTML = ''; // Limpiar tabla existente
        if (product.specs) {
            for (const key in product.specs) {
                if (Object.hasOwnProperty.call(product.specs, key)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td class="py-2 px-4 border-b border-gray-200 font-semibold w-1/3">${key}</td><td class="py-2 px-4 border-b border-gray-200">${product.specs[key]}</td>`;
                    productSpecsTable.appendChild(row);
                }
            }
        } else {
            productSpecsTable.innerHTML = '<tr><td colspan="2" class="py-4 text-center text-gray-500">No hay especificaciones disponibles.</td></tr>';
        }

        // Cargar productos relacionados (simulación, toma 4 productos diferentes)
        fetchProducts().then(allProducts => {
            const filteredProducts = allProducts.filter(p => p._id !== product._id && p.category === product.category);
            const related = filteredProducts.slice(0, 4); // Obtener hasta 4 productos relacionados
            displayProducts(related, 'related-products');
        });
    }

    // Función auxiliar para displayProducts (copiada de main.js, puedes unificarla)
    function displayProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No se encontraron productos relacionados.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <a href="/product-detail.html?id=${product._id}" class="block">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <div class="p-4">
                        <h3 class="font-poppins text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${product.name}</h3>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description.substring(0, 70)}...</p>
                        <div class="flex justify-between items-center mt-auto">
                            <span class="price">$${product.price.toFixed(2)}</span>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold" onclick="window.addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                                <i class="fas fa-cart-plus mr-2"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', productCard);
        });
    }

    // Función auxiliar para fetchProducts (copiada de main.js, puedes unificarla)
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            if (!response.ok) {
                console.warn(`API de productos no disponible (${response.status}). Cargando desde fallback local.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error al cargar productos desde la API:', error);
            try {
                const fallbackResponse = await fetch('/api/recent-products.json'); // Ruta al JSON local
                if (!fallbackResponse.ok) throw new Error('Failed to load fallback products');
                console.log('Cargando productos desde el fallback local JSON.');
                return await fallbackResponse.json();
            } catch (fallbackError) {
                console.error('Error al cargar productos desde el fallback JSON:', fallbackError);
                return [];
            }
        }
    }


    // --- Manejo de Cantidad ---
    quantityMinusBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        if (currentQuantity > 1) {
            productQuantityInput.value = currentQuantity - 1;
        }
    });

    quantityPlusBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        productQuantityInput.value = currentQuantity + 1;
    });

    productQuantityInput.addEventListener('change', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        if (isNaN(currentQuantity) || currentQuantity < 1) {
            productQuantityInput.value = 1;
        }
    });

    // --- Botones de acción (Carrito y Comprar Ahora) ---
    addToCartBtn.addEventListener('click', () => {
        if (currentProductData) {
            const quantity = parseInt(productQuantityInput.value);
            // Reutilizamos la función global addToCart definida en main.js
            window.addToCart(
                currentProductData._id,
                currentProductData.name,
                currentProductData.price,
                currentProductData.image, // O la primera imagen si hay un array
                quantity
            );
            alert(`${quantity} "${currentProductData.name}" añadido(s) al carrito.`);
        }
    });

    buyNowBtn.addEventListener('click', () => {
        if (currentProductData) {
            const quantity = parseInt(productQuantityInput.value);
            // Aquí puedes redirigir directamente a la página de checkout con este producto
            const product = {
                id: currentProductData._id,
                name: currentProductData.name,
                price: currentProductData.price,
                image: currentProductData.image,
                quantity: quantity
            };
            localStorage.setItem('buyNowProduct', JSON.stringify(product)); // Guarda el producto para la compra directa
            window.location.href = '/checkout.html?directBuy=true'; // Redirige al checkout
        }
    });

    // Cargar y renderizar el producto al iniciar
    const product = await fetchProductDetails(productId);
    renderProduct(product);
});