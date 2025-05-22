document.addEventListener('DOMContentLoaded', initializePage);

async function initializePage() {
    setupEventListeners();
    await loadUserData();
}

function setupEventListeners() {
    document.getElementById('precio-producto').addEventListener('input', calcularComision);
    document.getElementById('currency').addEventListener('change', calcularComision);
    document.getElementById('envioDomicilio').addEventListener('change', toggleEnvioDomicilioDetalles);
    document.getElementById('retiroLocal').addEventListener('change', toggleRetiroLocalDetalles);
    document.getElementById('nueva-publicacion-form').addEventListener('submit', handleFormSubmit);
    setupSidebarToggle();
}

function toggleEnvioDomicilioDetalles() {
    document.getElementById('envioDomicilioDetalles').classList.toggle('hidden', !this.checked);
}

function toggleRetiroLocalDetalles() {
    document.getElementById('retiroLocalDetalles').classList.toggle('hidden', !this.checked);
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const openSidebar = document.getElementById('openSidebar');

    closeSidebar?.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        openSidebar.classList.remove('hidden');
    });

    openSidebar?.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        openSidebar.classList.add('hidden');
    });

    window.addEventListener('scroll', adjustOpenSidebarPosition);
}

function adjustOpenSidebarPosition() {
    const openSidebar = document.getElementById('openSidebar');
    openSidebar.style.top = window.scrollY > 50 ? 'auto' : '80px';
    openSidebar.style.bottom = window.scrollY > 50 ? '16px' : 'auto';
}

function calcularComision() {
    const precio = parseFloat(document.getElementById('precio-producto').value);
    const moneda = document.getElementById('currency').value;
    const comision = !isNaN(precio) && precio > 0 ? precio * 0.05 : 0;
    document.getElementById('comision').textContent = `$${comision.toFixed(2)} ${moneda}`;
}

async function loadUserData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        redirectToLogin('Por favor, inicia sesión para crear una publicación.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/user', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const userData = await response.json();
        updateUserInterface(userData);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Hubo un error al cargar los datos del usuario. Inténtalo de nuevo.');
    }
}

function updateUserInterface(userData) {
    document.getElementById('profile-picture').src = userData.profilePicture || '/img/default-avatar.png';
    document.getElementById('username').textContent = userData.fullName || 'Usuario';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token || isTokenExpired(token)) {
        redirectToLogin('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
    }

    if (!validateForm()) return;

    const formData = new FormData(e.target);
    addImagesToFormData(formData);

    try {
        showLoadingModal();
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                // No incluyas 'Content-Type' aquí, FormData lo establece automáticamente
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        hideLoadingModal();
        showAlert('Publicación creada con éxito!', 'success');
        // Redirigir a la página de la publicación o limpiar el formulario
        // window.location.href = `/publicacion/${result.id}`;
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        hideLoadingModal();
        showAlert(`Error al crear la publicación: ${error.message}. Por favor, inténtalo de nuevo.`);
    }
}

function validateForm() {
    // Implementar validación de campos
    return true; // Placeholder
}

function addImagesToFormData(formData) {
    const coverImageInput = document.getElementById('coverImageInput');
    if (coverImageInput.files.length > 0) {
        formData.append('imagenes', coverImageInput.files[0]);
    }

    for (let i = 1; i <= 4; i++) {
        const otherImageInput = document.getElementById(`otherImageInput${i}`);
        if (otherImageInput && otherImageInput.files.length > 0) {
            formData.append('imagenes', otherImageInput.files[0]);
        }
    }
}

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
}

function redirectToLogin(message) {
    alert(message);
    window.location.href = '/login.html';
}

function showAlert(message, type = 'error') {
    // Implementar lógica para mostrar alertas
    alert(message);
}

function showLoadingModal() {
    document.getElementById('loadingModal').classList.remove('hidden');
}

function hideLoadingModal() {
    document.getElementById('loadingModal').classList.add('hidden');
}

// Funciones para manejar la subida de imágenes (sin cambios)