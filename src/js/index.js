document.addEventListener("DOMContentLoaded", () => {
    const heroSlide = document.getElementById("heroSlide");
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    let currentSlide = 0;

    // Verificar que los elementos existen antes de agregarles eventos
    if (heroSlide && prevButton && nextButton) {
        function showSlide(index) {
            const slides = heroSlide.children;
            if (index >= slides.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = index;
            }
            heroSlide.style.transform = `translateX(-${currentSlide * 100}%)`;
            console.log(`Mostrando diapositiva: ${currentSlide}`);
        }

        prevButton.addEventListener("click", () => {
            showSlide(currentSlide - 1);
        });

        nextButton.addEventListener("click", () => {
            showSlide(currentSlide + 1);
        });

        // Cambiar de diapositiva automáticamente cada 5 segundos
        setInterval(() => {
            console.log(`Avanzando a la siguiente diapositiva: ${currentSlide + 1}`);
            showSlide(currentSlide + 1);
        }, 5000);
    } else {
        console.error("Faltan elementos para el carrusel.");
    }
});
