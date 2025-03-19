document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    loadProduct();
    document.getElementById("continueButton").addEventListener("click", processPurchase);
});

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        alert("Producto no encontrado.");
        window.location.href = "/";
        return;
    }

    try {
        const response = await fetch(`/api/product/${productId}`);
        if (!response.ok) throw new Error("Error al cargar el producto.");
        const product = await response.json();

        document.getElementById("productName").textContent = product.name;
        document.getElementById("productPrice").textContent = `US$ ${product.price}`;
        document.getElementById("totalPrice").textContent = `US$ ${product.price}`;
        document.getElementById("productImage").src = product.images?.[0] || "https://via.placeholder.com/600x400";
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al cargar el producto.");
    }
}

function checkUserSession() {
    const isLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn')) || false;
    document.getElementById('username').textContent = isLoggedIn ? localStorage.getItem('userName') || "Usuario" : "Iniciar Sesión";
    document.getElementById('logoutButton').classList.toggle('hidden', !isLoggedIn);
}

function logout() {
    localStorage.clear();
    window.location.href = "/login.html";
}

async function processPurchase() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    if (!userId || !authToken) {
        alert("Inicia sesión para comprar.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${authToken}` 
            },
            body: JSON.stringify({ 
                userId, 
                productId, 
                deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked').value 
            })
        });

        if (!response.ok) throw new Error("Error en la compra.");
        alert("Compra exitosa.");
        window.location.href = "/confirmacion.html";
    } catch (error) {
        alert("Error al procesar la compra.");
    }
}
