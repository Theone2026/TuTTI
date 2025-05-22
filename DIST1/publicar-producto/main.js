// Función para verificar la sesión del usuario
function checkUserSession() {
  const isLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn')) || false;
  const usernameElement = document.getElementById('username');
  const logoutButton = document.getElementById('logoutButton');

  if (isLoggedIn) {
      const userName = localStorage.getItem('userName') || "Usuario";
      usernameElement.textContent = userName;
      logoutButton.classList.remove('hidden');
  } else {
      usernameElement.textContent = "Iniciar Sesión";
      logoutButton.classList.add('hidden');
  }
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userName');
  window.location.href = "/login.html";
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
});