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
    }

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