/**
 * Script de Animações Avançadas
 * Aplica animações dinâmicas a todos os elementos da página
 */

// ============================================
// OBSERVER PARA ANIMAÇÕES AO SCROLL
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Adiciona classe de animação quando elemento fica visível
      entry.target.classList.add('animate__animated');
      
      // Define a tipo de animação baseado na classe
      if (entry.target.classList.contains('slide-in-bottom')) {
        entry.target.classList.add('animate__slideInUp');
      } else if (entry.target.classList.contains('fade-in-up')) {
        entry.target.classList.add('animate__fadeInUp');
      } else if (entry.target.classList.contains('zoom-in')) {
        entry.target.classList.add('animate__zoomIn');
      }
      
      // Remove o observer após a animação
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// ============================================
// APLICAR OBSERVADOR A ELEMENTOS ESPECÍFICOS
// ============================================

export function initAnimations() {
  const animatableElements = document.querySelectorAll(
    'h1, h2, h3, p, .card, .card-cat, .btn, img, button, form, input, .destination-card, .viewer-card, article'
  );

  animatableElements.forEach(element => {
    observer.observe(element);
  });

  // Observar Spline viewers especialmente
  const splineViewers = document.querySelectorAll('spline-viewer');
  splineViewers.forEach(viewer => {
    observer.observe(viewer);
  });
}

// ============================================
// ANIMAR ELEMENTOS AO APRESENTÁ-LOS
// ============================================

export function animateElement(element, animationType = 'fadeInUp', delay = 0) {
  element.style.animationDelay = `${delay}s`;
  element.classList.add('animate__animated', `animate__${animationType}`);
}

// ============================================
// REMOVER ELEMENTO COM ANIMAÇÃO
// ============================================

export function removeElementWithAnimation(element, animationType = 'fadeOut', duration = 400) {
  element.classList.add('animate__animated', `animate__${animationType}`);
  
  setTimeout(() => {
    element.remove();
  }, duration);
}

// ============================================
// STAGGER ANIMATIONS PARA MÚLTIPLOS ELEMENTOS
// ============================================

export function staggerAnimations(elements, animationType = 'fadeInUp', startDelay = 0, delayBetween = 0.1) {
  elements.forEach((element, index) => {
    const delay = startDelay + (index * delayBetween);
    animateElement(element, animationType, delay);
  });
}

// ============================================
// ANIMAR ELEMENTOS AO CARREGAR A PÁGINA
// ============================================

export function animatePageLoad() {
  // Animar navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    animateElement(navbar, 'fadeIn', 0);
  }

  // Animar hero content
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    animateElement(heroContent, 'slideInLeft', 0.1);
  }

  // Animar hero visual/spline
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    animateElement(heroVisual, 'slideInUp', 0.3);
  }

  // Animar todos os cards
  const cards = document.querySelectorAll('.card, .card-cat');
  staggerAnimations(cards, 'slideInUp', 0.4, 0.1);

  // Animar formulários
  const inputs = document.querySelectorAll('input, textarea, select');
  staggerAnimations(inputs, 'slideInUp', 0.3, 0.08);

  // Animar botões
  const buttons = document.querySelectorAll('button');
  staggerAnimations(buttons, 'slideInUp', 0.5, 0.08);
}

// ============================================
// INICIALIZAR TUDO AO CARREGAR
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animatePageLoad();
    initAnimations();
  });
} else {
  animatePageLoad();
  initAnimations();
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Animar elemento quando mouse passa por cima
 */
export function animateOnHover(selector, animationType = 'pulse') {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.classList.add('animate__animated', `animate__${animationType}`);
    });

    element.addEventListener('animationend', () => {
      element.classList.remove('animate__animated', `animate__${animationType}`);
    });
  });
}

/**
 * Animar elemento ao clicar
 */
export function animateOnClick(selector, animationType = 'tada') {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.addEventListener('click', () => {
      element.classList.add('animate__animated', `animate__${animationType}`);
      
      element.addEventListener('animationend', () => {
        element.classList.remove('animate__animated', `animate__${animationType}`);
      }, { once: true });
    });
  });
}

/**
 * Animar progressão de elementos em sequência infinita
 */
export function infiniteStagger(selector, animationType = 'fadeInUp', interval = 500) {
  const elements = document.querySelectorAll(selector);
  let currentIndex = 0;

  setInterval(() => {
    if (currentIndex < elements.length) {
      animateElement(elements[currentIndex], animationType, 0);
      currentIndex++;
    } else {
      currentIndex = 0;
    }
  }, interval);
}

/**
 * Log de animações (útil para debug)
 */
export function enableAnimationDebug() {
  document.addEventListener('animationstart', (e) => {
    console.log('🎬 Animação iniciada:', e.animationName, e.target);
  });

  document.addEventListener('animationend', (e) => {
    console.log('✅ Animação finalizada:', e.animationName, e.target);
  });
}

console.log('✨ Animações carregadas com sucesso!');
