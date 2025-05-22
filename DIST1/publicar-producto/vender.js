// Verificar si el usuario está logeado
function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    return token !== null && userId !== null;
}

// Función para actualizar la barra de navegación
function updateNavbar() {
    const profileLink = document.getElementById("profileLink");
    const profileText = document.getElementById("profileText");
    const logoutButton = document.getElementById("logoutButton");

    if (isUserLoggedIn()) {
        const userName = localStorage.getItem("userName"); // Obtén el nombre del usuario
        if (userName) {
            profileText.textContent = `¡Hola, ${userName.split('@')[0]}!`; // Muestra el nombre del usuario
        } else {
            profileText.textContent = "Mi Perfil"; // Si no se puede obtener el nombre
        }
        logoutButton.classList.remove("hidden"); // Mostrar el botón de cerrar sesión
    } else {
        profileText.textContent = "Iniciar sesión"; // Si el usuario no está logueado
        logoutButton.classList.add("hidden"); // Ocultar el botón de cerrar sesión
    }
}

// Cargar el producto y actualizar la barra de navegación al iniciar la página
document.addEventListener("DOMContentLoaded", function () {
    updateNavbar(); // Actualizar la barra de navegación
});