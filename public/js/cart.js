document.addEventListener('DOMContentLoaded', () => {
    const cartModal = document.getElementById('cartModal');
    const closeButton = document.querySelector('.close-button');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn'); // Asume que tienes botones con esta clase

    let cart = []; // Array para almacenar los productos en el carrito

    // Función para guardar el carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para cargar el carrito de localStorage
    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartDisplay(); // Actualiza la visualización al cargar
    }

    // Función para actualizar la visualización del carrito
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Limpiar el contenido actual
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');
                itemDiv.innerHTML = `
                    <span>${item.name}</span>
                    <span>S/. ${item.price.toFixed(2)} x ${item.quantity}</span>
                    <span>S/. ${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item-btn" data-product-id="${item.id}">X</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
                subtotal += item.price * item.quantity;
            });
        }
        cartSubtotalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
        saveCart(); // Guarda el carrito cada vez que se actualiza
    }

    // Evento para abrir el modal del carrito
    function openCartModal() {
        updateCartDisplay(); // Asegúrate de que el carrito esté actualizado al abrir
        cartModal.style.display = 'block';
    }

    // Evento para cerrar el modal del carrito
    closeButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    continueShoppingBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Evento para ir a la página de pago
    goToCheckoutBtn.addEventListener('click', () => {
        // Redirige a pago.html y pasa los datos del carrito si es necesario (ej. como parámetros de URL o en localStorage)
        localStorage.setItem('checkoutCart', JSON.stringify(cart)); // Guarda el carrito para la página de pago
        window.location.href = 'pago.html'; // Asegúrate de que 'pago.html' exista en tu dist/
    });

    // Lógica para añadir un producto al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            const productName = "HOGWARTS LEGACY PS5"; // Asume que este es el nombre del producto
            const productPrice = parseFloat(event.target.dataset.productPrice);

            const existingItemIndex = cart.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1; // Incrementa la cantidad si ya existe
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }
            openCartModal(); // Abre el carrito al añadir
        });
    });

    // Lógica para eliminar un producto del carrito
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn')) {
            const productIdToRemove = event.target.dataset.productId;
            cart = cart.filter(item => item.id !== productIdToRemove);
            updateCartDisplay();
        }
    });

    // Cargar el carrito al inicio
    loadCart();
});