// Función para manejar el clic en los cuadros de carga de imágenes
function handleImageClick(index) {
    document.getElementById(`imageInput${index}`).click();
}

// Función para manejar la subida de imágenes
function handleImageUpload(event, index) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const imageBox = document.querySelector(`#imageUploadContainer div:nth-child(${index})`);
        imageBox.innerHTML = `<img src="${e.target.result}" alt="Imagen ${index}">`;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Función para validar el formulario
function validateForm() {
    let hasImages = false;
    for (let i = 1; i <= 4; i++) {
        const fileInput = document.getElementById(`imageInput${i}`);
        if (fileInput?.files.length > 0) {
            hasImages = true;
            break;
        }
    }

    if (!hasImages) {
        alert('Debes subir al menos una imagen del producto.');
        return false;
    }

    return true;
}

// Función para enviar el formulario
async function submitForm(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const formData = new FormData();
    formData.append('productName', document.getElementById('product-name').value);
    formData.append('productCategory', document.getElementById('product-category').value);
    formData.append('currency', document.getElementById('currency').value);
    formData.append('productPrice', document.getElementById('product-price').value);
    formData.append('productDescription', document.getElementById('product-description').value);
    formData.append('productStock', document.getElementById('product-stock').value);
    formData.append('productCondition', document.getElementById('product-condition').value);
    formData.append('freeShipping', document.getElementById('free-shipping').checked);

    for (let i = 1; i <= 4; i++) {
        const fileInput = document.getElementById(`imageInput${i}`);
        if (fileInput?.files.length > 0) {
            formData.append('images', fileInput.files[0]);
        }
    }

    try {
        const response = await fetch('http://localhost:3000/submit-product', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData);
            alert(`Error: ${errorData.message || 'Error al publicar producto'}`);
            return;
        }

        const data = await response.json();
        alert('Producto publicado exitosamente');
        window.location.href = '/perfil.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al publicar el producto. Inténtalo de nuevo.');
    }
}

// Asignar el evento submit al formulario
document.getElementById('product-form').addEventListener('submit', submitForm);

// Verificar la sesión del usuario al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn')) || false;
    if (!isLoggedIn) {
        alert('Por favor, inicia sesión para publicar un producto.');
        window.location.href = '/login.html';
    }
});