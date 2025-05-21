let notificationsData = [];

export async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }

        });
        if (!response.ok) throw new Error('Error al cargar notificaciones');
        notificationsData = await response.json();
        updateNotificationCount(notificationsData.length);
        renderNotifications();
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

export function setupNotificationPanel() {
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationPanel = document.getElementById('notificationPanel');

    if (notificationIcon && notificationPanel) {
        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!notificationPanel.contains(e.target) && e.target !== notificationIcon) {
                notificationPanel.classList.add('hidden');
            }
        });
    }
}

export function handleNotificationClick(notification) {
    console.log('Notificación clickeada:', notification);
    if (notification.type === 'comment' && notification.productId) {
        window.location.href = `/producto.html?id=${notification.productId}`;
    }
    // ... manejar otros tipos de notificaciones
}


function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) {
        console.error('Elemento notificationList no encontrado');
        return;
    }

    notificationList.innerHTML = notificationsData.map(notification => `
        <li class="notification-item hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer" onclick="window.handleNotificationClick(${JSON.stringify(notification)})">
            <div class="flex items-start p-4">
                <div class="flex-shrink-0 pt-1">
                    <i class="fas fa-bell text-blue-500 text-lg"></i>
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm text-gray-900 font-medium">${notification.message}</p>
                    <p class="mt-1 text-xs text-gray-500">${formatNotificationDate(notification.date)}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button class="text-gray-400 hover:text-gray-500" onclick="event.stopPropagation(); window.markAsRead('${notification.id}')">
                        <span class="sr-only">Cerrar</span>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </li>
    `).join('');

    if (notificationsData.length === 0) {
        notificationList.innerHTML = '<li class="p-4"><p class="text-sm text-gray-500 text-center">No hay notificaciones</p></li>';
    }
}

function formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return 'Hoy';
    } else if (diffDays === 1) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString();
    }
}

function updateNotificationCount(count) {
    const countElement = document.getElementById('notificationCount');
    if (countElement) {
        countElement.textContent = count > 0 ? count : '';
        countElement.classList.toggle('hidden', count === 0);
    }
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) throw new Error('Error al marcar notificación como leída');
        // Actualizar el estado local de las notificaciones
        notificationsData = notificationsData.filter(n => n.id !== notificationId);
        updateNotificationCount(notificationsData.length);
        renderNotifications();
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
    }
}

export function handleNewNotification(notification) {
    // Agregar la nueva notificación al principio del array
    notificationsData.unshift(notification);

    // Actualizar el contador de notificaciones
    updateNotificationCount(notificationsData.length);

    // Volver a renderizar la lista de notificaciones
    renderNotifications();

    // Aquí puedes agregar lógica adicional según el tipo de notificación
    switch(notification.type) {
        case 'comment':
            console.log('Nueva notificación de comentario:', notification);
            // Puedes agregar lógica específica para notificaciones de comentarios
            break;
        case 'purchase':
            console.log('Nueva notificación de compra:', notification);
            // Lógica específica para notificaciones de compra
            break;
        case 'message':
            console.log('Nueva notificación de mensaje:', notification);
            // Lógica específica para notificaciones de mensajes
            break;
        default:
            console.log('Nueva notificación de tipo desconocido:', notification);
    }

    // Aquí podrías agregar lógica adicional, como mostrar una alerta o reproducir un sonido
    // Por ejemplo:
    // playNotificationSound();
    // showNotificationAlert(notification);
}

// Hacer las funciones disponibles globalmente
window.handleNotificationClick = handleNotificationClick;
window.markAsRead = markAsRead;
// Al final del archivo
window.handleNotificationClick = handleNotificationClick;
// Exportar funciones adicionales si es necesario
export {
    markAsRead,
    updateNotificationCount
};