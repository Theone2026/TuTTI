import { loadNotifications, setupNotificationPanel, handleNewNotification, handleNotificationClick } from './notifications.js';
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

document.getElementById("commentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const productId = getProductIdFromURL();
    if (!productId) return;

    const commentText = document.getElementById("commentText").value.trim();
    if (!commentText) {
        alert("Por favor, escribe un comentario.");
        return;
    }

    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Debes iniciar sesión para comentar.");
            window.location.href = "/login.html";
            return;
        }

        const response = await fetch(`http://localhost:3000/api/product/${productId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ text: commentText }),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.message === "Comentario agregado") {
            alert("Comentario agregado exitosamente.");
            loadProduct();
        } else {
            alert("Error al agregar el comentario.");
        }
    } catch (error) {
        console.error("Error al enviar el comentario:", error);
        alert("Hubo un error al enviar el comentario. Por favor, intenta nuevamente.");
    }
});

function loadComments(comments, isOwner) {
    const commentsContainer = document.getElementById("commentsContainer");
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "";

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="text-gray-600 text-center py-4">Sé el primero en dejar una opinión sobre este producto</p>';
        return;
    }

    comments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.className = "bg-white rounded-lg shadow-sm mb-6 overflow-hidden";
        commentElement.dataset.commentId = comment._id;

        const commentDate = formatDate(comment.date);
        commentElement.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-start space-x-4">
                    <img src="${comment.userId?.profilePicture || '/img/default-avatar.png'}" alt="Usuario" class="w-10 h-10 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center mb-1">
                            <h4 class="font-semibold text-gray-800 mr-2">${comment.userId?.fullName || "Usuario Anónimo"}</h4>
                            <div class="text-yellow-400">
                                ${generateStarRating(comment.rating || 5)}
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mb-2">${commentDate}</p>
                        <p class="text-gray-700 mb-3">${comment.text}</p>
                        <div class="flex items-center space-x-4">
                            <button class="like-button text-sm text-gray-600 hover:text-blue-600 transition flex items-center">
                                <i class="far fa-thumbs-up mr-1"></i> 
                                <span>Útil</span>
                                <span class="ml-1">(${comment.likes || 0})</span>
                            </button>
                            ${isOwner ? `
                                <button class="reply-button text-sm text-gray-600 hover:text-blue-600 transition flex items-center">
                                    <i class="far fa-comment mr-1"></i> Responder
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            ${comment.replies && comment.replies.length > 0 ? `
                <div class="bg-gray-50 p-4">
                    ${comment.replies.map(reply => `
                        <div class="mb-3 last:mb-0">
                            <div class="flex items-center mb-1">
                                <img src="${reply.userId?.profilePicture || '/img/default-avatar.png'}" alt="Vendedor" class="w-8 h-8 rounded-full mr-2">
                                <h5 class="font-semibold text-gray-800 text-sm">${reply.userId?.fullName || "Vendedor"}</h5>
                            </div>
                            <p class="text-gray-700 text-sm ml-10">${reply.text}</p>
                            <p class="text-xs text-gray-500 ml-10 mt-1">${formatDate(reply.date)}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        const likeButton = commentElement.querySelector('.like-button');
        likeButton.addEventListener('click', () => handleLikeComment(comment._id));
        if (isOwner) {
            const replyButton = commentElement.querySelector('.reply-button');
            replyButton.addEventListener('click', () => showReplyForm(comment._id));
        }

        commentsContainer.appendChild(commentElement);
    });
}

function generateStarRating(rating) {
    return Array(5).fill().map((_, i) => 
        `<i class="fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`
    ).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return `Hoy a las ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    } else {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
}

async function handleLikeComment(commentId) {
}

function showReplyForm(commentId) {
}

async function loadProduct() {
    const productId = getProductIdFromURL();
    if (!productId) {
        alert("Producto no encontrado.");
        window.location.href = "/";
        return;
    }

    try {
        const productResponse = await fetch(`http://localhost:3000/api/product/${productId}`);
        if (!productResponse.ok) throw new Error("Error al cargar el producto.");
        const product = await productResponse.json();

        if (!product) {
            alert("El producto no existe o ha sido eliminado.");
            window.location.href = "/";
            return;
        }

        const userId = localStorage.getItem("userId");
        const isOwner = product.userId._id === userId;

        if (isOwner) {
            document.getElementById("buyButton").classList.add("hidden");
            document.getElementById("publicationsButton").classList.remove("hidden");
        } else {
            document.getElementById("buyButton").classList.remove("hidden");
            document.getElementById("publicationsButton").classList.add("hidden");
        }

        const mainImage = document.getElementById("mainImage");
        const thumbnailContainer = document.getElementById("thumbnail-container");
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            thumbnailContainer.innerHTML = product.images.map((img, index) => `
                <img src="${img}" class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75" onclick="changeImage('${img}')" alt="Miniatura ${index + 1}">
            `).join("");
        } else {
            mainImage.src = "https://via.placeholder.com/600x400";
            thumbnailContainer.innerHTML = "";
        }

        const formattedPrice = formatCurrency(product.price, product.currency);
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productPrice").textContent = `${formattedPrice}`;
        document.getElementById("productCondition").textContent = `Estado: ${product.condition || "Nuevo"}`;
        document.getElementById("productDescription").textContent = product.description;

        document.getElementById("sellerName").textContent = product.userId?.fullName || "Anónimo";
        document.getElementById("sellerSales").textContent = product.userId?.sales || 0;
        document.getElementById("productStock").textContent = product.stock || 0;
        document.getElementById("productAvailability").textContent = product.availability || "En stock";

        const commentsResponse = await fetch(`http://localhost:3000/api/product/${productId}/comments`);
        if (!commentsResponse.ok) throw new Error("Error al cargar los comentarios.");
        const comments = await commentsResponse.json();
        loadComments(comments, isOwner);
    } catch (error) {
        console.error("Error al cargar el producto:", error);
        alert("Hubo un error al cargar el producto.");
    }
}

function changeImage(src) {
    document.getElementById("mainImage").src = src;
}

function checkUserSession() {
    const isLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn')) || false;
    const usernameElement = document.getElementById('username');
    const accountLinkElement = document.getElementById('accountLink');
    const logoutButton = document.getElementById('logoutButton');

    if (isLoggedIn) {
        let userName = localStorage.getItem('userName') || "Usuario Anónimo";
        userName = userName.replace(/@.*$/, '');
        const greeting = `¡Hola, ${userName}!`;

        usernameElement.textContent = greeting;
        accountLinkElement.innerHTML = `<i class="fas fa-user mr-1"></i><span>${greeting}</span>`;
        logoutButton.classList.remove('hidden');
    } else {
        usernameElement.textContent = "Iniciar Sesión";
        accountLinkElement.innerHTML = `<i class="fas fa-user mr-1"></i><span>Iniciar Sesión</span>`;
        logoutButton.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    window.location.href = "/login.html";
}

function formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    });
    return formatter.format(amount);
}

document.addEventListener("DOMContentLoaded", async () => {
    checkUserSession();
    await loadProduct();
    await loadNotifications();
    setupNotificationPanel();

    const socket = io("http://localhost:3000");
    const userId = localStorage.getItem('userId');
    if (userId) {
        socket.emit('joinRoom', userId);
    }

    socket.on('notification', (notification) => {
        console.log("Nueva notificación recibida:", notification);
        handleNewNotification(notification);
    });

    window.handleNotificationClick = handleNotificationClick;

    const buyButton = document.getElementById("buyButton");
    if (buyButton) {
        buyButton.addEventListener("click", () => {
            const productId = getProductIdFromURL();
            if (productId) {
                window.location.href = `comprar.html?id=${productId}`;
            } else {
                alert("No se pudo obtener el ID del producto.");
            }
        });
    } else {
        console.error("El botón 'Comprar Ahora' no fue encontrado.");
    }
});

export { 
    getProductIdFromURL, 
    loadComments, 
    loadProduct, 
    changeImage, 
    checkUserSession, 
    logout, 
    formatCurrency 
};

async function likeComment(productId, commentId) {
  try {
    const response = await fetch(`http://localhost:3000/api/product/${productId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.likes;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function replyToComment(productId, commentId, text) {
  try {
    const response = await fetch(`http://localhost:3000/api/product/${productId}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error('Error al enviar la respuesta');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const commentsContainer = document.getElementById('commentsContainer');

  if (commentsContainer) {
    commentsContainer.addEventListener('click', async (e) => {
      if (e.target.classList.contains('like-button')) {
        const commentElement = e.target.closest('.comment');
        const commentId = commentElement.dataset.commentId;
        const productId = getProductIdFromURL();
        try {
          const newLikes = await likeComment(productId, commentId);
          e.target.textContent = `Me gusta (${newLikes})`;
        } catch (error) {
          console.error('Error al dar me gusta:', error);
          alert('No se pudo dar me gusta al comentario');
        }
      }
    });
  }
});
