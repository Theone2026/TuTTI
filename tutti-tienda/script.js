// Script para cambiar las imágenes del Hero
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide img');
const heroBackground = document.querySelector('.hero-background');

const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function changeSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    const slideWidth = slides[0].clientWidth;

    // Actualiza la posición del carrusel
    document.querySelector('.hero-slide').style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    // Cambia el fondo del hero
    heroBackground.style.backgroundImage = `url(${slides[currentSlide].src})`;
}

function autoChangeSlide() {
    changeSlide(currentSlide + 1);
}

prevBtn.addEventListener('click', () => changeSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => changeSlide(currentSlide + 1));

setInterval(autoChangeSlide, 3000);

// Script para agregar productos desde el formulario
const sellForm = document.getElementById('sellForm');
sellForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;

    const newProduct = document.createElement('div');
    newProduct.classList.add('product-item');
    newProduct.innerHTML = `
        <div class="product-info">
            <h3 class="product-title">${name}</h3>
            <p class="product-price">${price}</p>
            <p class="shipping">Envío Gratis</p>
            <button class="buy-button">Comprar</button>
        </div>
    `;

    document.getElementById('productsGrid').appendChild(newProduct);

    // Limpia el formulario
    sellForm.reset();
});
