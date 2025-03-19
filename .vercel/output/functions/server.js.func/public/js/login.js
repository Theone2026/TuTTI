document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    // Función para actualizar el estado de autenticación
    function updateAuthState() {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        const userName = localStorage.getItem("userName");

        console.log(`Estado de autenticación: ${isAuthenticated ? 'Autenticado' : 'No autenticado'}`);
        console.log(`Usuario: ${userName}`);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('https://tutti-tienda.vercel.app/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("isAuthenticated", "true");
                    localStorage.setItem("userName", username);
                    alert(data.message);
                    updateAuthState();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Error de conexión');
            }
        });
    }
});
