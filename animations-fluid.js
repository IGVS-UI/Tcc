/**
 * Script de Animações Otimizado - APENAS PARA INDEX.HTML
 * Desabilita IntersectionObserver para máxima fluidez
 * 
 * Usar este script NO INDEX.HTML para evitar conflitos
 * Usar o animations.js padrão nas outras páginas
 */

// Desabilitar observer no index para máxima fluidez
console.log('✨ Animações fluidas ativadas (index.html otimizado)');

// Apenas exportar funções, sem ativar automaticamente
export function animateElement(element, animationType = 'fadeInUp', delay = 0) {
  element.style.animationDelay = `${delay}s`;
  element.classList.add('animate__animated', `animate__${animationType}`);
}

export function removeElementWithAnimation(element, animationType = 'fadeOut', duration = 300) {
  element.classList.add('animate__animated', `animate__${animationType}`);
  
  setTimeout(() => {
    element.remove();
  }, duration);
}

export function staggerAnimations(elements, animationType = 'fadeInUp', startDelay = 0, delayBetween = 0.08) {
  elements.forEach((element, index) => {
    const delay = startDelay + (index * delayBetween);
    animateElement(element, animationType, delay);
  });
}

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

console.log('✨ Sistema de animações fluido pronto!');
