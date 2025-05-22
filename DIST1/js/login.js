const BACKEND_URL = "http://localhost:3000";  // Asegúrate de usar la URL correcta del backend

document.addEventListener("DOMContentLoaded", () => {
    // Manejo del formulario de inicio de sesión
    const loginForm = document.getElementById("login-form");

    if (!loginForm) {
        console.error("No se encontró el formulario con ID 'login-form'. Verifica que el HTML esté correcto.");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Por favor, llena todos los campos.");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Respuesta del backend:", data);

            if (response.ok) {
                // Login exitoso
                alert(data.message);

                // Después de una autenticación exitosa
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userId', response.userId); // Asegúrate de que esto se está haciendo

                // Redirigir al perfil
                window.location.href = "perfil.html"; // Redirige a la página del perfil
            } else {
                // Error en el inicio de sesión
                alert(data.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.");
            }
        } catch (error) {
            console.error("Error al autenticar el usuario:", error);
            alert("Hubo un error al intentar iniciar sesión. Por favor, intenta nuevamente.");
        }
    });

    // Función para alternar visibilidad de contraseña
    const togglePassword = () => {
        const passwordField = document.getElementById("password");
        if (passwordField) {
            passwordField.type = passwordField.type === "password" ? "text" : "password";
        } else {
            console.error("No se encontró el campo de contraseña con ID 'password'.");
        }
    };

    // Asignar evento de toggle a la visibilidad de la contraseña
    const togglePasswordButton = document.querySelector(".toggle-password");
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener("click", togglePassword);
    } else {
        console.error("No se encontró el botón de alternar visibilidad de contraseña con la clase 'toggle-password'.");
    }
});