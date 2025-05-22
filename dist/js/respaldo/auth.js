// public/js/auth.js

// Este script manejará la autenticación del usuario

document.addEventListener('DOMContentLoaded', function() {
    // Simulación de la verificación de autenticación (puedes usar localStorage o cookies para este caso)
    const user = JSON.parse(localStorage.getItem('user')); // Suponiendo que el usuario esté almacenado en localStorage
    const token = localStorage.getItem('token'); // Obtener el token también

    const userMenu = document.getElementById('user-menu');
    const loginLink = document.getElementById('login-link');
    const userName = document.getElementById('user-name');
    const sellLink = document.getElementById('sell-link');
    const logoutButton = document.getElementById('logoutButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Verificar si el usuario está autenticado
    if (user && token) {
        // Mostrar el nombre del usuario en el header
        if (userName) {
            userName.textContent = user.name;
        }
        if (userMenu) {
            userMenu.classList.remove('hidden');
        }
        if (loginLink) {
            loginLink.classList.add('hidden');
        }

        // Habilitar la opción de "Vender" solo si el usuario es admin
        if (sellLink && user.role === 'admin') {
            sellLink.classList.remove('hidden');
        }

        // Mostrar el menú desplegable al hacer clic en el nombre del usuario
        if (userName && dropdownMenu) {
            userName.addEventListener('click', function() {
                dropdownMenu.classList.toggle('hidden');
            });
        }

        // Cerrar sesión
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                localStorage.removeItem('user'); // Eliminar al usuario del localStorage
                localStorage.removeItem('token'); // Eliminar el token
                // Eliminar el carrito de invitado si existe, para asegurar un estado limpio al cerrar sesión
                localStorage.removeItem('guestCart');
                window.location.href = '/'; // Redirigir a la página principal o a la de login
            });
        }
    } else {
        // Si no hay usuario o token, ocultar el menú de usuario y mostrar el link de login
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
        if (loginLink) {
            loginLink.classList.remove('hidden');
        }
    }

    // --- Lógica de Login (SOLO si los elementos existen en la página actual) ---
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm && loginMessage) { // Verifica si los elementos de login existen
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const identifier = loginForm.identifier.value;
            const password = loginForm.password.value;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify({ name: data.username, role: data.role, address: data.address })); // Guardar address
                    // Si el usuario inició sesión, intentar fusionar el carrito de invitado con el del usuario
                    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                    if (guestCart.length > 0) {
                        for (const item of guestCart) {
                            await fetch('/api/cart', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${data.token}` // Usar el nuevo token
                                },
                                body: JSON.stringify({ productId: item.productId, quantity: item.quantity })
                            });
                        }
                        localStorage.removeItem('guestCart'); // Limpiar el carrito de invitado
                    }
                    window.location.href = '/'; // Redirigir a la página principal
                } else {
                    loginMessage.textContent = data.message;
                    loginMessage.classList.remove('hidden');
                    loginMessage.classList.add('bg-red-100', 'text-red-700');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                loginMessage.textContent = 'Hubo un error de conexión al iniciar sesión.';
                loginMessage.classList.remove('hidden');
                loginMessage.classList.add('bg-red-100', 'text-red-700');
            }
        });
    }

    // --- Lógica de Registro (SOLO si los elementos existen en la página actual) ---
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm && registerMessage) { // Verifica si los elementos de registro existen
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const fullName = registerForm.fullName ? registerForm.fullName.value : '';
            const phoneNumber = registerForm.phoneNumber ? registerForm.phoneNumber.value : '';
            const address = registerForm.address ? registerForm.address.value : '';
            const city = registerForm.city ? registerForm.city.value : '';
            const postalCode = registerForm.postalCode ? registerForm.postalCode.value : '';
            const country = registerForm.country ? registerForm.country.value : '';

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, fullName, phoneNumber, address, city, postalCode, country })
                });

                const data = await response.json();
                if (response.ok) {
                    registerMessage.textContent = data.message;
                    registerMessage.classList.remove('hidden');
                    registerMessage.classList.add('bg-green-100', 'text-green-700');
                    registerForm.reset(); // Limpiar el formulario
                } else {
                    registerMessage.textContent = data.message;
                    registerMessage.classList.remove('hidden');
                    registerMessage.classList.add('bg-red-100', 'text-red-700');
                }
            } catch (error) {
                console.error('Error al registrar:', error);
                registerMessage.textContent = 'Hubo un error de conexión al registrar tu cuenta.';
                registerMessage.classList.remove('hidden');
                registerMessage.classList.add('bg-red-100', 'text-red-700');
            }
        });
    }

    // --- Cargar dirección automáticamente (solo si la tenías guardada y los elementos existen) ---
    const addressInput = document.getElementById('address');
    const editAddressButton = document.getElementById('editAddressButton');

    if (addressInput && editAddressButton) {
        const savedAddress = localStorage.getItem('address');
        if (savedAddress) {
            addressInput.value = savedAddress;
        } else if (user && user.address) { // Si no hay en localStorage, usar la del usuario logueado
            addressInput.value = user.address;
            localStorage.setItem('address', user.address); // Guardar para futuras visitas
        }


        editAddressButton.addEventListener('click', function() {
            const newAddress = prompt("Introduce tu nueva dirección:");
            if (newAddress) {
                addressInput.value = newAddress;
                localStorage.setItem('address', newAddress);
                alert('Dirección guardada.');
            } else {
                alert('Por favor, introduce una dirección válida.');
            }
        });
    }
});