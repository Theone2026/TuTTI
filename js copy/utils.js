// utils.js

export function checkUserSession() {
    const isLoggedIn = isUserLoggedIn();
    const usernameElement = document.getElementById('username');
    const accountLinkElement = document.getElementById('accountLink');
    const logoutButton = document.getElementById('logoutButton');

    if (isLoggedIn) {
        const user = getCurrentUser();
        const userName = user.fullName || user.email.split('@')[0] || "Usuario";
        const greeting = `¡Hola, ${userName}!`;

        if (usernameElement) usernameElement.textContent = greeting;
        if (accountLinkElement) accountLinkElement.innerHTML = `<i class="fas fa-user mr-1"></i><span>${greeting}</span>`;
        if (logoutButton) logoutButton.classList.remove('hidden');
    } else {
        if (usernameElement) usernameElement.textContent = "Iniciar Sesión";
        if (accountLinkElement) accountLinkElement.innerHTML = `<i class="fas fa-user mr-1"></i><span>Iniciar Sesión</span>`;
        if (logoutButton) logoutButton.classList.add('hidden');
    }
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/login.html';
}

export function setUserSession(token, userId, userInfo) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export function getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

export function isUserLoggedIn() {
    return !!localStorage.getItem('authToken');
}

export function getAuthToken() {
    return localStorage.getItem('authToken');
}