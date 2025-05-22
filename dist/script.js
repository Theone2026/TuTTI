// script.js

document.addEventListener('DOMContentLoaded', function () {
    const userName = localStorage.getItem('userName'); // Recuperamos el nombre del usuario desde el almacenamiento local
    const loginLink = document.querySelector('#login-link');
    const userMenu = document.querySelector('#user-menu');
    const userNameDisplay = document.querySelector('#user-name');
    const sellLink = document.querySelector('#sell-link');
    const logoutLink = document.querySelector('#logout-link');

    if (userName) {
        // Si el usuario está logeado, mostrar su nombre y el menú
        userNameDisplay.textContent = userName;
        loginLink.style.display = 'none';  // Ocultar el link de login
        userMenu.style.display = 'block';  // Mostrar el menú del usuario
        sellLink.style.display = 'block'; // Mostrar el link de vender
    } else {
        // Si no está logeado, ocultar el menú del usuario y el link de vender
        loginLink.style.display = 'block';
        userMenu.style.display = 'none';
        sellLink.style.display = 'none';
    }

    // Función para cerrar sesión
    logoutLink.addEventListener('click', function () {
        localStorage.removeItem('userName');  // Eliminar el usuario del localStorage
        location.reload();  // Recargar la página
    });
});
 // scripts.js

 