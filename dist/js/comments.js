// comments.js
export function loadComments() {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    const commentsContainer = document.getElementById("commentsContainer");
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="bg-white p-4 rounded-lg mb-4">
            <p><strong>${comment.user || "Anónimo"}:</strong> ${comment.text}</p>
            <small class="text-gray-500">Publicado el ${comment.date}</small>
            <div class="mt-2">
                <span class="cursor-pointer" onclick="likeComment(${comment.id})">👍 ${comment.likes || 0}</span>
                <span class="cursor-pointer ml-2" onclick="reportComment(${comment.id})">Reportar</span>
            </div>
        </div>
    `).join("");
}

// Exportar otras funciones
export function saveComment(comment) { /* ... */ }
export function likeComment(commentId) { /* ... */ }
export function reportComment(commentId) { /* ... */ }