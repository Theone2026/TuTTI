// Añade esta función al principio de comprar.js
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
            userAccountLink.href = "/perfil.html";
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
            userAccountLink.href = "/login.html";
        }
        if (logoutButton) {
            logoutButton.classList.add('hidden');
        }
    }
}
async function loadProduct() {
    console.log('Función loadProduct() iniciada');
    const productId = getProductIdFromURL();
    console.log('ID del producto obtenido:', productId);

    if (!productId) {
        console.error('No se encontró el ID del producto');
        alert('No se pudo cargar el producto. Por favor, vuelve a la página anterior e intenta nuevamente.');
        return;
    }

    try {
        console.log('Intentando cargar el producto con ID:', productId);
        const response = await fetch(`http://localhost:3000/api/product/${productId}`);
        console.log('Respuesta recibida:', response);

        if (!response.ok) {
            throw new Error(`Error al cargar el producto: ${response.status}`);
        }

        const product = await response.json();
        console.log('Datos del producto recibidos:', product);

        if (!product || Object.keys(product).length === 0) {
            throw new Error('El producto recibido está vacío o es nulo');
        }

        updateProductInterface(product);
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        alert('No se pudo cargar la información del producto. Por favor, intenta nuevamente.');
        updateProductInterface({
            name: 'Error al cargar el producto',
            price: 0,
            currency: 'UYU',
            images: [],
            retiroLocal: false,
            direccionRetiro: 'Dirección no disponible'
        });
    }
}

function updateProductInterface(product) {
    console.log('Actualizando interfaz con datos del producto:', product);

    // Actualizar elementos existentes
    updateElement('productName', product.name);
    updateElement('productPrice', formatCurrency(product.price, product.currency));
    updateElement('productImage', null, (elem) => {
        elem.src = product.images && product.images.length > 0 ? product.images[0] : '/img/placeholder.jpg';
        elem.alt = product.name || 'Imagen del producto';
    });

    // Actualizar elementos del resumen de compra
    updateElement('productNameSummary', product.name);
    updateElement('totalPriceSummary', formatCurrency(product.price, product.currency));

    // Actualizar el total
    updateElement('totalPrice', formatCurrency(product.price, product.currency));

    // Actualizar la dirección de retiro del vendedor
    const sellerAddressElement = document.getElementById('sellerAddress');
    if (sellerAddressElement) {
        if (product.sellerAddress && product.sellerCity) {
            sellerAddressElement.textContent = `${product.sellerAddress}, ${product.sellerCity}`;
            document.querySelector('input[name="deliveryMethod"][value="pickup"]').disabled = false;
        } else {
            sellerAddressElement.textContent = 'Dirección no disponible';
            document.querySelector('input[name="deliveryMethod"][value="pickup"]').disabled = true;
        }
    }
    console.log('Interfaz actualizada con los datos del producto');
}

function updateElement(id, text, callback) {
    const element = document.getElementById(id);
    if (element) {
        if (callback) {
            callback(element);
        } else {
            element.textContent = text || 'No disponible';
        }
    } else {
        console.error(`Elemento con id '${id}' no encontrado`);
    }
}

async function loadUserAddress() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('No se encontró token de autenticación');
        updateAddressDisplay({ address: 'No disponible', city: 'No disponible' });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const userData = await response.json();
        if (!userData || !userData.address || !userData.city) {
            throw new Error('Datos de dirección incompletos');
        }
        updateAddressDisplay(userData);
    } catch (error) {
        console.error('Error al cargar la dirección del usuario:', error);
        updateAddressDisplay({ 
            address: 'Error al cargar la dirección', 
            city: 'Por favor, intente nuevamente o edite manualmente' 
        });
    }
}

function updateAddressDisplay(addressData) {
    const userAddressElement = document.getElementById('userAddress');
    if (userAddressElement) {
        if (addressData.address === 'No disponible' || addressData.address.includes('Error')) {
            userAddressElement.innerHTML = `
                <span class="text-red-500">${addressData.address}</span><br>
                <span class="text-red-500">${addressData.city}</span>
            `;
        } else {
            userAddressElement.textContent = `${addressData.address}, ${addressData.city}`;
        }
    }
}

function editUserAddress() {
    const newAddress = prompt("Ingrese la nueva dirección:");
    const newCity = prompt("Ingrese la nueva ciudad:");

    if (newAddress && newCity) {
        updateAddressDisplay({ address: newAddress, city: newCity });
        // Aquí deberías también enviar esta información al servidor para actualizarla
        // Implementa una llamada a la API para actualizar la dirección en el servidor
    }
}

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('productId') || urlParams.get('id');

    console.log('URL params:', urlParams.toString());
    console.log('Product ID from URL:', productId);
    if (!productId) {
        productId = localStorage.getItem('currentProductId');
        console.log('Product ID from localStorage:', productId);
    }

    if (!productId) {
        console.error('No se encontró el ID del producto');
        return null;
    }
    return productId;
}
// Función para procesar la compra
async function processPurchase() {
    const productId = getProductIdFromURL();
    const token = localStorage.getItem('authToken');
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!token) {
        alert("Debes iniciar sesión para continuar con la compra.");
        window.location.href = "/login.html";
        return;
    }

    let deliveryAddress;
    if (deliveryMethod === 'homeDelivery') {
        deliveryAddress = document.getElementById('userAddress').textContent;
    } else if (deliveryMethod === 'pickup') {
        deliveryAddress = document.getElementById('sellerAddress').textContent;
    }
    const orderData = {
        productId,
        deliveryMethod,
        deliveryAddress,
        paymentMethod,
    };

    try {
        const response = await fetch("http://localhost:3000/api/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) throw new Error("Error al procesar la compra.");
        const data = await response.json();

        if (data.success) {
            alert("Compra procesada exitosamente.");
            // Generar un ID único para el chat
            const chatId = generateUniqueId();
            console.log("ChatId generado:", chatId); // Para depuración
            // Guardar el chatId en el localStorage
            localStorage.setItem('currentChatId', chatId);
            // Redirigir al chat con el nuevo chatId
            window.location.href = `/chat.html?chatId=${chatId}`;
        } else {
            alert("Hubo un problema al procesar la compra.");
        }
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Hubo un error al procesar la compra. Por favor, intenta nuevamente.");
    }
}

// Función para generar un ID único
function generateUniqueId() {
    return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount, currency = 'UYU') {
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

// Función para actualizar el contador de notificaciones
async function updateNotificationCount(increment = 0) {
    const notificationElement = document.querySelector('.fa-bell + span');
    let count = parseInt(notificationElement.textContent) || 0;
    count += increment;
    notificationElement.textContent = count > 0 ? count : '';
    notificationElement.classList.toggle('hidden', count === 0);
}

// Función para marcar todas las notificaciones como leídas
async function markAllNotificationsAsRead() {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://localhost:3000/api/notifications/mark-all-as-read', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            updateNotificationCount(-parseInt(document.querySelector('.fa-bell + span').textContent || 0));
        }
    } catch (error) {
        console.error("Error al marcar notificaciones como leídas:", error);
    }
}

// Función para crear el enlace al chat
function createChatLink(chatId) {
    if (chatId && chatId !== 'undefined') {
        return `/chat.html?chatId=${chatId}`;
    } else {
        console.error('chatId no válido:', chatId);
        return '/';
    }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded event fired');
    checkUserSession();
    loadProduct();
    loadUserAddress();

    // Añadir evento para editar la dirección
    const editAddressLink = document.getElementById('editAddressLink');
    if (editAddressLink) {
        editAddressLink.addEventListener('click', (e) => {
            e.preventDefault();
            editUserAddress();
        });
    }

    // ... resto del código existente ...

const payButton = document.getElementById("payButton");
if (payButton) {
    payButton.addEventListener("click", processPurchase);
} else {
    console.error('Elemento payButton no encontrado');
}

const continueButton = document.getElementById("continueButton");
if (continueButton) {
    continueButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto si es un botón de tipo submit
        processPurchase();
    });
} else {
    console.error('Elemento continueButton no encontrado');
}
    document.querySelector('.fa-bell').addEventListener('click', markAllNotificationsAsRead);

    const socket = io("http://localhost:3000");
    const userId = localStorage.getItem('userId');
    if (userId) {
        socket.emit("joinRoom", userId);
    }

    socket.on("notification", (notification) => {
        console.log("Nueva notificación:", notification);
        updateNotificationCount(1);
    });
});