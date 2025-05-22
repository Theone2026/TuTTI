const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://tutti-production.up.railway.app';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al iniciar sesión');
        }
        
        const data = await response.json();
        
        // Guardar token y datos de usuario
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Redirigir al home o a la página previa
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/';
        window.location.href = returnUrl;
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Función para mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Función para login con redes sociales
function initSocialLogin() {
    document.querySelector('.btn-google').addEventListener('click', () => {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    });
    
    document.querySelector('.btn-facebook').addEventListener('click', () => {
        window.location.href = `${API_BASE_URL}/api/auth/facebook`;
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initSocialLogin();
    
    // Si ya está autenticado, redirigir
    if (localStorage.getItem('authToken')) {
        window.location.href = '/';
    }
});