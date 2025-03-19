document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de manera tradicional

    // Obtén los valores de los campos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Verifica que los campos no estén vacíos
    if (!email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        // Envia los datos al backend
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        // Parsear la respuesta del servidor
        const data = await response.json();

        if (response.ok) {
            // Si el login es exitoso, redirige a la página principal o dashboard
            alert('Inicio de sesión exitoso');
            window.location.href = '/dashboard'; // Cambia la URL a donde desees redirigir
        } else {
            // Si las credenciales son incorrectas, muestra un mensaje de error
            alert(data.message || 'Error desconocido');
        }
    } catch (error) {
        // Maneja errores de la solicitud, como problemas de red
        console.error('Error en la solicitud de login:', error);
        alert('Hubo un problema al intentar iniciar sesión.');
    }
});
