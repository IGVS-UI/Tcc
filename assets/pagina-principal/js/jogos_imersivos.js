const navbar = document.querySelector('.navbar');
const burgerButton = document.querySelector('.nav-burger');
const mobileMenu = document.querySelector('#nav-mobile-menu');
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.nav-link') : [];

const syncNavbarScroll = () => {
  if (!navbar) return;
  navbar.classList.toggle('is-scrolled', window.scrollY > 12);
};

if (burgerButton && mobileMenu) {
  const closeMenu = () => {
    burgerButton.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burgerButton.setAttribute('aria-expanded', 'false');
    burgerButton.setAttribute('aria-label', 'Abrir menu');
  };

  burgerButton.addEventListener('click', () => {
    const isOpen = burgerButton.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    burgerButton.setAttribute('aria-expanded', String(isOpen));
    burgerButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

syncNavbarScroll();
window.addEventListener('scroll', syncNavbarScroll, { passive: true });

const carousel = document.querySelector('#educationCarousel');

if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const arrowButtons = Array.from(carousel.querySelectorAll('.carousel-arrow'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const progressBar = document.querySelector('#carouselProgress');
  const currentLabel = document.querySelector('#carouselCurrent');

  let currentIndex = 0;
  let autoplayId = null;

  const updateCarousel = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentIndex);
      slide.setAttribute('aria-hidden', String(slideIndex !== currentIndex));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    if (progressBar) {
      progressBar.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    }

    if (currentLabel) {
      currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
    }
  };

  const goToNext = () => updateCarousel(currentIndex + 1);
  const goToPrev = () => updateCarousel(currentIndex - 1);

  const stopAutoplay = () => {
    if (!autoplayId) return;
    window.clearInterval(autoplayId);
    autoplayId = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayId = window.setInterval(goToNext, 5500);
  };

  arrowButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.direction;
      if (direction === 'prev') {
        goToPrev();
      } else {
        goToNext();
      }
      startAutoplay();
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.slideTo);
      updateCarousel(target);
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      goToPrev();
      startAutoplay();
    }

    if (event.key === 'ArrowRight') {
      goToNext();
      startAutoplay();
    }
  });

  updateCarousel(0);
  startAutoplay();
}
