// public/js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsContainer = document.getElementById('checkout-items-container');
    const checkoutSubtotalSpan = document.getElementById('checkoutSubtotal');
    const checkoutShippingSpan = document.getElementById('checkoutShipping');
    const checkoutTotalSpan = document.getElementById('checkoutTotal');
    const checkoutEmptyCartMessage = document.getElementById('checkoutEmptyCartMessage');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const creditCardFields = document.getElementById('creditCardFields');
    const paypalMessage = document.getElementById('paypalMessage');

    const SHIPPING_COST = 15.00; // Costo de envío fijo

    // Función para cargar y renderizar los items del carrito
    function loadAndRenderCheckoutItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        checkoutItemsContainer.innerHTML = ''; // Limpiar el contenedor

        let subtotal = 0;

        if (cart.length === 0) {
            checkoutEmptyCartMessage.classList.remove('hidden');
            placeOrderBtn.disabled = true;
            placeOrderBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            checkoutEmptyCartMessage.classList.add('hidden');
            placeOrderBtn.disabled = false;
            placeOrderBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('flex', 'items-center', 'justify-between', 'text-gray-700', 'text-sm');
                itemDiv.innerHTML = `
                    <span class="font-medium">${item.name} (x${item.quantity})</span>
                    <span>S/. ${itemTotal.toFixed(2)}</span>
                `;
                checkoutItemsContainer.appendChild(itemDiv);
            });
        }

        checkoutSubtotalSpan.textContent = `S/. ${subtotal.toFixed(2)}`;
        checkoutShippingSpan.textContent = `S/. ${SHIPPING_COST.toFixed(2)}`;
        const total = subtotal + SHIPPING_COST;
        checkoutTotalSpan.textContent = `S/. ${total.toFixed(2)}`;
    }

    // Manejar el cambio de método de pago
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'creditCard') {
                creditCardFields.classList.remove('hidden');
                paypalMessage.classList.add('hidden');
                // Habilitar campos de tarjeta si es necesario
                creditCardFields.querySelectorAll('input').forEach(input => input.required = true);
            } else if (event.target.value === 'paypal') {
                creditCardFields.classList.add('hidden');
                paypalMessage.classList.remove('hidden');
                // Deshabilitar campos de tarjeta y quitar required
                creditCardFields.querySelectorAll('input').forEach(input => {
                    input.required = false;
                    input.value = ''; // Limpiar campos al cambiar
                });
            }
        });
    });

    // Manejar el envío del formulario de pedido
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Evita el envío por defecto del formulario

            // Validar formularios de envío y pago
            const shippingForm = document.getElementById('shipping-form');
            const paymentForm = document.getElementById('payment-form');

            if (!shippingForm.checkValidity()) {
                alert('Por favor, completa todos los campos de envío.');
                shippingForm.reportValidity(); // Muestra mensajes de validación HTML5
                return;
            }

            if (!paymentForm.checkValidity()) {
                alert('Por favor, completa todos los campos de pago.');
                paymentForm.reportValidity(); // Muestra mensajes de validación HTML5
                return;
            }

            // Recopilar datos
            const shippingData = Object.fromEntries(new FormData(shippingForm).entries());
            const paymentData = Object.fromEntries(new FormData(paymentForm).entries());
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

            if (cartItems.length === 0) {
                alert('Tu carrito está vacío. No puedes finalizar la compra.');
                return;
            }

            const orderData = {
                shippingInfo: shippingData,
                paymentInfo: paymentData,
                items: cartItems,
                subtotal: parseFloat(checkoutSubtotalSpan.textContent.replace('S/. ', '')),
                shippingCost: SHIPPING_COST,
                total: parseFloat(checkoutTotalSpan.textContent.replace('S/. ', ''))
            };

            console.log('Datos del pedido:', orderData);
            // Aquí puedes enviar 'orderData' a tu backend
            try {
                // Simulación de una llamada API de confirmación de pedido
                const response = await fetch('/api/place-order', { // Asume que tienes un endpoint /api/place-order
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` // Si el usuario está autenticado
                    },
                    body: JSON.stringify(orderData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('¡Pedido realizado con éxito! Gracias por tu compra.');
                    localStorage.removeItem('cart'); // Limpiar el carrito después de la compra
                    window.location.href = '/confirmacion.html'; // Redirigir a una página de confirmación
                } else {
                    alert(`Error al procesar el pedido: ${result.message || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Error al confirmar el pedido:', error);
                alert('Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo más tarde.');
            }
        });
    }

    // Cargar los items del carrito al iniciar la página de checkout
    loadAndRenderCheckoutItems();
});