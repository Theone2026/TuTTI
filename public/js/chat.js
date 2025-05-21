const socket = io('http://localhost:3000');
const chatMessages = document.getElementById('chatMessages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatTitle = document.getElementById('chatTitle');

// Obtener chatId y productId de la URL
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('chatId');
const productId = urlParams.get('productId');

if (!chatId || !productId) {
    alert('Error: Falta información del chat');
    window.location.href = '/dashboard.html';
}

// Unirse a la sala del chat
socket.emit('joinRoom', chatId);

// Cargar mensajes anteriores
loadPreviousMessages();

// Escuchar nuevos mensajes
socket.on('newMessage', addMessageToChat);

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (content) {
        sendMessage(content);
        messageInput.value = '';
    }
});

function loadPreviousMessages() {
    fetch(`/api/chat/${chatId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => response.json())
    .then(messages => {
        chatMessages.innerHTML = ''; // Limpiar mensajes existentes
        messages.forEach(message => {
            addMessageToChat({
                ...message,
                role: message.sender === localStorage.getItem('userId') ? localStorage.getItem('userRole') : (message.role || 'unknown'),
                senderName: message.senderName || 'Anónimo'
            });
        });
    })
    .catch(error => console.error('Error al cargar mensajes:', error));
}
function sendMessage(content) {
    fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
            content,
            senderName: localStorage.getItem('userName'),
            role: localStorage.getItem('userRole')
        })
    })
    .then(response => response.json())
    .then(message => {
        console.log('Mensaje enviado:', message);
        // No es necesario añadir el mensaje aquí, ya que se recibirá a través del socket
    })
    .catch(error => console.error('Error al enviar mensaje:', error));
}

function addMessageToChat(message) {
    console.log('Añadiendo mensaje:', message);
    const currentUserId = localStorage.getItem('userId');
    const currentUserRole = localStorage.getItem('userRole');

    const isCurrentUser = String(message.sender) === currentUserId;
    const senderRole = message.role || (isCurrentUser ? currentUserRole : (currentUserRole === 'buyer' ? 'seller' : 'buyer'));

    const messageElement = document.createElement('div');
    messageElement.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`;

    const innerDiv = document.createElement('div');
    innerDiv.className = `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`;

    // Añadir avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `w-8 h-8 rounded-full ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'} flex items-center justify-center ${isCurrentUser ? 'order-2 ml-2' : 'mr-2'}`;
    avatarDiv.textContent = senderRole === 'buyer' ? 'C' : 'V';
    messageElement.appendChild(avatarDiv);

    // Información del remitente
    const senderInfo = document.createElement('div');
    senderInfo.className = 'text-xs font-bold mb-1';
    senderInfo.textContent = isCurrentUser ? 'Tú' : (senderRole === 'buyer' ? 'Comprador' : 'Vendedor');
    innerDiv.appendChild(senderInfo);

    // Contenido del mensaje
    const contentElement = document.createElement('p');
    contentElement.className = 'text-sm';
    contentElement.textContent = message.content;
    innerDiv.appendChild(contentElement);

    // Hora del mensaje
    const timeElement = document.createElement('span');
    timeElement.className = 'text-xs opacity-50 mt-1 inline-block';
    timeElement.textContent = new Date(message.timestamp).toLocaleTimeString();
    innerDiv.appendChild(timeElement);

    messageElement.appendChild(innerDiv);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// En tu archivo chat.js, añade esto después de obtener chatId y productId

// Cargar información del producto
fetch(`/api/product/${productId}`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
})
.then(response => response.json())
.then(product => {
    document.getElementById('chatTitle').textContent = `Chat: ${product.name}`;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;

    const productImage = document.getElementById('productImage');
    if (product.imageUrl) {
        productImage.src = `/uploads/${product.imageUrl}`;
        productImage.onerror = function() {
            this.src = '/img/placeholder.png';
        };
    } else {
        productImage.src = '/img/placeholder.png';
    }
})
.catch(error => {
    console.error('Error al obtener detalles del producto:', error);
    document.getElementById('productImage').src = '/img/placeholder.png';
});

// Cerrar sesión
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
});