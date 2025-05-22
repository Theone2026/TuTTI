// Este script manejará la autenticación del usuario

document.addEventListener('DOMContentLoaded', function() {
    // Simulación de la verificación de autenticación (puedes usar localStorage o cookies para este caso)
    const user = JSON.parse(localStorage.getItem('user')); // Suponiendo que el usuario esté almacenado en localStorage

    const userMenu = document.getElementById('user-menu');
    const loginLink = document.getElementById('login-link');
    const userName = document.getElementById('user-name');
    const sellLink = document.getElementById('sell-link');
    const logoutButton = document.getElementById('logoutButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Verificar si el usuario está autenticado
    if (user) {
        // Mostrar el nombre del usuario en el header
        userName.textContent = user.name; // Suponiendo que el nombre del usuario esté en el objeto 'user'
        userMenu.classList.remove('hidden');
        loginLink.classList.add('hidden');

        // Habilitar la opción de "Vender" solo si el usuario es admin
        if (user.role === 'admin') {
            sellLink.classList.remove('hidden');
        }

        // Mostrar el menú desplegable al hacer clic en el nombre del usuario
        userName.addEventListener('click', function() {
            dropdownMenu.classList.toggle('hidden');
        });

        // Cerrar sesión
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('user'); // Eliminar al usuario del localStorage
            window.location.href = '/login.html'; // Redirigir al login
        });
    } else {
        // Si no hay usuario, ocultar el menú y mostrar el link de login
        userMenu.classList.add('hidden');
        loginLink.classList.remove('hidden');
    }
});
