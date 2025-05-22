import { loadNotifications, setupNotificationPanel, handleNewNotification } from './notifications.js';
// ==================== INICIALIZACIÓN Y CONFIGURACIÓN ====================
let setupComplete = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!setupComplete) {
        console.log('Inicializando dashboard');
        loadDashboardData();
        loadNotifications();
        setupPanels();
        loadUserData();
        setupWebSocket();
        setupComplete = true;
    } else {
        console.warn('Setup ya completado, evitando reinicialización');
    }
});

// ==================== CARGA DE DATOS DEL DASHBOARD ====================
async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3000/api/dashboard-data', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();

        updateDashboardUI(data);
        await loadMessages();
    } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
    }
}

function updateDashboardUI(data) {
    // Actualizar estadísticas
    document.getElementById('totalVentas').textContent = formatCurrency(data.totalSales);
    document.getElementById('countVentas').textContent = `${data.sales.length} ventas`;
    document.getElementById('totalCompras').textContent = formatCurrency(data.totalPurchases);
    document.getElementById('countCompras').textContent = `${data.purchases.length} compras`;
    document.getElementById('productosEnVenta').textContent = data.products.length;

    // Actualizar ventas recientes
    updateRecentSales(data.sales);

    // Actualizar compras recientes
    updateRecentPurchases(data.purchases);
}

// ==================== FUNCIONES DE UTILIDAD ====================
function formatCurrency(amount, currency = 'UYU') {
    const currencySymbols = {
        'UYU': '$', 
        'USD': 'US$',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${new Intl.NumberFormat('es-UY').format(amount)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return `Hoy a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
}

// ==================== MANEJO DE VENTAS Y COMPRAS ====================
function updateRecentSales(sales) {
    const ventasRecientesBody = document.getElementById('ventasRecientesBody');
    ventasRecientesBody.innerHTML = sales.slice(0, 5).map(sale => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="#" class="text-blue-600 hover:text-blue-800" onclick="openChat('${sale.chatId}', '${sale.productId._id}')">
                    ${sale.productId.name}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(sale.price)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${new Date(sale.datePurchased).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function updateRecentPurchases(purchases) {
    const comprasRecientesBody = document.getElementById('comprasRecientesBody');
    comprasRecientesBody.innerHTML = purchases.slice(0, 5).map(purchase => {
        const productId = purchase.productId && typeof purchase.productId === 'object' ? purchase.productId._id : purchase.productId;
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <a href="#" class="text-blue-600 hover:text-blue-800" onclick="openChat('${purchase.chatId}', '${productId}')">
                        ${purchase.productName || (purchase.productId && purchase.productId.name) || 'Producto desconocido'}
                    </a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(purchase.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(purchase.datePurchased).toLocaleDateString()}</td>
            </tr>
        `;
    }).join('');
}

function openChat(chatId, productId) {
    window.location.href = `/chat.html?chatId=${chatId}&productId=${productId}`;
}

// ==================== MANEJO DE MENSAJES ====================
let messagesData = [];
async function loadMessages() {
    try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            console.error('Token o userId no disponible');
            return;
        }

        const response = await fetch(`/api/messages?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Respuesta del servidor:', response.status, errorText);
            throw new Error(`Error al cargar mensajes: ${response.status} ${errorText}`);
        }

        const messages = await response.json();
        console.log('Mensajes recibidos:', messages);

        messagesData = messages;
        updateMessageCount(messagesData.filter(msg => !msg.read).length);
        renderMessages();
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
    }
}

function renderMessages() {
    const messageList = document.getElementById('messageList');
    if (!messageList) {
        console.error('Elemento messageList no encontrado');
        return;
    }

    messageList.innerHTML = '';

    if (messagesData.length === 0) {
        messageList.innerHTML = '<li class="py-2 px-4 text-gray-500">No tienes mensajes nuevos</li>';
        return;
    }

    messagesData.forEach(message => {
        const li = document.createElement('li');
        li.className = 'py-2 px-4 hover:bg-gray-100 cursor-pointer';
        li.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" src="${message.senderId.profilePicture || 'default-avatar.png'}" alt="${message.senderId.fullName}">
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${message.senderId.fullName}</p>
                    <p class="text-sm text-gray-500">${message.text.substring(0, 30)}${message.text.length > 30 ? '...' : ''}</p>
                    <p class="text-xs text-gray-400">${message.productId ? message.productId.name : 'Producto no especificado'}</p>
                </div>
                <p class="ml-auto text-xs text-gray-500">${formatDate(message.date)}</p>
            </div>
        `;
        li.addEventListener('click', () => openChat(message.productId._id, message.senderId._id));
        messageList.appendChild(li);
    });
}

function updateMessageCount(count) {
    const countElement = document.getElementById('messageCount');
    if (countElement) {
        countElement.textContent = count > 0 ? count : '';
        countElement.classList.toggle('hidden', count === 0);
    } else {
        console.error('Elemento messageCount no encontrado');
    }
}

// ==================== CONFIGURACIÓN DE PANELES ====================
function setupPanels() {
    setupNotificationPanel();
    setupMessagePanel();
}

function setupMessagePanel() {
    const messageIcon = document.getElementById('messageIcon');
    const messagePanel = document.getElementById('messagePanel');

    if (messageIcon && messagePanel) {
        messageIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            messagePanel.classList.toggle('hidden');
            console.log('Panel de mensajes toggled');
        });

        // Cerrar el panel al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (!messagePanel.contains(e.target) && e.target !== messageIcon) {
                messagePanel.classList.add('hidden');
            }
        });
    } else {
        console.error('Elementos de mensajes no encontrados');
    }
}

// ==================== MANEJO DE USUARIO ====================
async function loadUserData() {
    try {
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const userData = await response.json();

        document.getElementById('username').textContent = userData.fullName;
        if (userData.profilePicture) {
            document.getElementById('profile-picture').src = userData.profilePicture;
        }
    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
    }
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

// ==================== WEBSOCKET Y NOTIFICACIONES EN TIEMPO REAL ====================
function setupWebSocket() {
    const socket = io();

    socket.on('connect', () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            socket.emit('joinRoom', userId);
        }
    });

    socket.on('notification', handleNewNotification);
}

// ==================== EXPORTACIÓN DE FUNCIONES ====================
export {
    loadDashboardData,
    openChat,
    loadMessages,
    setupPanels,
    loadUserData,
    cerrarSesion
};
