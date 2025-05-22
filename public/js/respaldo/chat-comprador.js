document.addEventListener('DOMContentLoaded', initializeChat);

async function initializeChat() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Por favor, inicia sesión para ver esta página.');
        window.location.href = '/login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const buyerId = urlParams.get('buyerId');
    const productId = urlParams.get('productId');

    if (!buyerId || !productId) {
        alert('No se pudo obtener el ID del comprador o el ID del producto. Por favor, verifica el enlace.');
        console.error(`buyerId: ${buyerId}, productId: ${productId}`);
        window.location.href = '/dashboard.html';
        return;
    }

    const socket = io("http://localhost:3000");
    socket.emit('joinRoom', { productId });

    socket.on('newMessage', (message) => {
        if (message.productId === productId) {
            addMessageToChat(message);
        }
    });

    setupEventListeners(buyerId, productId, token);
    await loadUserAndProductData(token, productId);
    await loadMessages(buyerId, productId, token);
}

function setupEventListeners(buyerId, productId, token) {
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chatInput');
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        try {
            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ buyerId, text: messageText, productId }),
            });

            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

            const data = await response.json();
            chatInput.value = '';
            socket.emit('newMessage', data.newMessage);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
        }
    });

    // Add event listeners for clearChatButton and deleteMessagesButton here
}

async function loadMessages(buyerId, productId, token) {
    try {
        const response = await fetch(`http://localhost:3000/api/messages?buyerId=${encodeURIComponent(buyerId)}&productId=${encodeURIComponent(productId)}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const messages = await response.json();
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = messages.length ? '' : '<p class="text-center text-gray-600">No tienes mensajes aún.</p>';
        messages.forEach(addMessageToChat);
    } catch (error) {
        console.error('Error al cargar los mensajes:', error);
        alert('Hubo un error al cargar los mensajes. Por favor, inténtalo de nuevo.');
    }
}

function addMessageToChat(message) {
    const chatContainer = document.getElementById('chatContainer');
    const currentUserId = localStorage.getItem('userId');
    const isSender = message.senderId._id === currentUserId;
    const senderName = isSender ? 'Tú' : message.senderId.fullName || 'Usuario Anonimo';

    const messageElement = document.createElement('div');
    messageElement.className = `mb-4 flex ${isSender ? 'justify-end' : 'justify-start'}`;
    messageElement.innerHTML = `
        <div class="max-w-xs bg-${isSender ? 'blue' : 'gray'}-200 p-3 rounded-lg shadow-md">
            <p class="font-bold text-sm text-${isSender ? 'blue' : 'gray'}-800">${senderName}</p>
            <p class="text-sm text-gray-800">${message.text}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(message.date).toLocaleTimeString()}</p>
        </div>
    `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function loadUserAndProductData(token, productId) {
    try {
        const [userResponse, productResponse] = await Promise.all([
            fetch('http://localhost:3000/api/user', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`http://localhost:3000/api/product/${productId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!userResponse.ok || !productResponse.ok) {
            throw new Error('Error al cargar datos de usuario o producto');
        }

        const userData = await userResponse.json();
        const productData = await productResponse.json();

        updateUserInterface(userData, productData);
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al cargar los datos. Inténtalo de nuevo.');
    }
}

function updateUserInterface(userData, productData) {
    document.getElementById('profile-picture').src = userData.profilePicture || localStorage.getItem('profilePicture') || '/img/default-avatar.png';
    document.getElementById('username').textContent = userData.fullName || 'Usuario Anonimo';

    const productName = productData.name || 'Producto';
    document.getElementById('chatTitle').textContent = `Chat sobre ${productName}`;
    document.getElementById('chatSectionTitle').textContent = `Chat sobre ${productName}`;
}

