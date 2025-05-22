let socket;
let currentPage = 1;
const messagesPerPage = 20;

document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    initializeChat();
});

function initializeSocket() {
    socket = io(location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://tu-tti-backend.vercel.app', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('Conectado al servidor'));
    socket.on('disconnect', () => console.log('Desconectado del servidor'));
    socket.on('reconnect', () => console.log('Reconectado al servidor'));
}

async function initializeChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const buyerId = urlParams.get('buyerId');
    const productId = urlParams.get('productId');

    console.log('BuyerId recibido:', buyerId);
    console.log('ProductId recibido:', productId);

    if (!buyerId || !productId) {
        showError('Error: No se pudo cargar el chat. Faltan parámetros necesarios.');
        return;
    }

    socket.emit('joinChat', { buyerId, productId });

    try {
        await loadPreviousMessages(buyerId, productId);
        await loadProductInfo(productId);
    } catch (error) {
        console.error('Error al inicializar el chat:', error);
        showError('No se pudo inicializar el chat correctamente.');
    }

    socket.on('message', function(data) {
        addMessageToUI(data.sender, data.message, false);
    });

    socket.on('typing', function(data) {
        showTypingIndicator(data.sender);
    });

    setupMessageForm(buyerId, productId);
    setupLoadMoreButton(buyerId, productId);
}

async function loadPreviousMessages(buyerId, productId) {
    try {
        const response = await fetch(`/api/messages?buyerId=${buyerId}&productId=${productId}`);
        if (!response.ok) {
            throw new Error('Error al cargar los mensajes');
        }
        const messages = await response.json();
        messages.forEach(msg => addMessageToUI(msg.senderId.fullName, msg.text, true));
    } catch (error) {
        console.error('Error al cargar mensajes anteriores:', error);
        showError('No se pudieron cargar los mensajes anteriores.');
    }
}

function setupMessageForm(buyerId, productId) {
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message) {
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ buyerId, productId, text: message })
                });
                if (response.ok) {
                    addMessageToUI('Tú', message, false);
                    input.value = '';
                } else {
                    throw new Error('Error al enviar el mensaje');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('No se pudo enviar el mensaje.');
            }
        }
    };
}

async function loadProductInfo(productId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/product/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos del producto:", data);

        document.getElementById('product-name').textContent = data.name;
        document.getElementById('product-price').textContent = formatCurrency(data.price, data.currency);
        document.getElementById('product-image').src = data.images[0] || 'placeholder.jpg';
    } catch (error) {
        console.error('Error al cargar la información del producto:', error);
        showError('No se pudo cargar la información del producto.');
    }
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: currency }).format(amount);
}

function addMessageToUI(sender, message, isOld) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender === 'Tú' ? 'sent' : 'received'}`;
    messageElement.innerHTML = `
        <strong>${sender}:</strong>
        <p>${message}</p>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    chatMessages.appendChild(messageElement);
    if (!isOld) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function showTypingIndicator(sender) {
    // Implementar lógica para mostrar indicador de escritura
}

function setupLoadMoreButton(buyerId, productId) {
    // Implementar lógica para cargar más mensajes si es necesario
}