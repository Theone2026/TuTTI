class ProductSlider {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    // Configuración con valores por defecto
    const defaults = {
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 3 } },
        { breakpoint: 768, settings: { slidesToShow: 2 } },
        { breakpoint: 480, settings: { slidesToShow: 1 } }
      ]
    };

    this.settings = { ...defaults, ...options };
    this.slides = this.container.querySelectorAll('.product-card');
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.interval = null;

    this.init();
  }

  init() {
    if (this.slides.length <= this.settings.slidesToShow) return;

    this.setupSlider();
    this.setupResponsive();
    if (this.settings.autoplay) this.startAutoplay();

    // Event listeners
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  setupSlider() {
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';
    
    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    sliderTrack.style.display = 'flex';
    sliderTrack.style.transition = 'transform 0.5s ease';
    
    // Mover slides al track
    this.slides.forEach(slide => {
      sliderTrack.appendChild(slide.cloneNode(true));
      slide.remove();
    });
    
    this.container.appendChild(sliderTrack);
    this.track = sliderTrack;
    this.updateSlider();
  }

  updateSlider() {
    const slideWidth = 100 / this.settings.slidesToShow;
    this.track.style.width = `${this.slides.length * 100}%`;
    
    Array.from(this.track.children).forEach(slide => {
      slide.style.minWidth = `${slideWidth}%`;
    });

    this.moveToSlide(this.currentIndex);
  }

  moveToSlide(index) {
    if (index < 0) {
      index = this.settings.infinite ? this.slides.length - 1 : 0;
    } else if (index >= this.slides.length) {
      index = this.settings.infinite ? 0 : this.slides.length - this.settings.slidesToShow;
    }

    this.currentIndex = index;
    const translateX = -index * (100 / this.slides.length) * this.settings.slidesToShow;
    this.track.style.transform = `translateX(${translateX}%)`;
  }

  nextSlide() {
    this.moveToSlide(this.currentIndex + this.settings.slidesToScroll);
  }

  prevSlide() {
    this.moveToSlide(this.currentIndex - this.settings.slidesToScroll);
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
    if (this.interval) clearInterval(this.interval);
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
    if (this.settings.autoplay) this.startAutoplay();
  }

  handleSwipe() {
    const threshold = 50;
    if (this.touchStartX - this.touchEndX > threshold) {
      this.nextSlide();
    } else if (this.touchEndX - this.touchStartX > threshold) {
      this.prevSlide();
    }
  }

  startAutoplay() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.nextSlide();
    }, this.settings.autoplaySpeed);
  }

  setupResponsive() {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let newSettings = { ...this.settings };

      this.settings.responsive.forEach(breakpoint => {
        if (windowWidth <= breakpoint.breakpoint) {
          newSettings = { ...newSettings, ...breakpoint.settings };
        }
      });

      this.settings = newSettings;
      this.updateSlider();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar al cargar
  }
}

// Inicialización del slider cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ProductSlider('#featured-products', {
    autoplay: true,
    autoplaySpeed: 5000
  });

  new ProductSlider('#special-offers', {
    slidesToShow: 3,
    autoplay: false
  });
});