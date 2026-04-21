const navbar = document.querySelector(".navbar");
const burgerButton = document.querySelector(".nav-burger");
const mobileMenu = document.querySelector("#nav-mobile-menu");
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll(".nav-link") : [];
const launchButton = document.querySelector(".launch-button");
const simulatorSection = document.querySelector("#simulador");

const syncNavbarScroll = () => {
  if (!navbar) return;
  navbar.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  if (!burgerButton || !mobileMenu) return;
  burgerButton.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  burgerButton.setAttribute("aria-expanded", "false");
  burgerButton.setAttribute("aria-label", "Abrir menu");
};

if (burgerButton && mobileMenu) {
  burgerButton.addEventListener("click", () => {
    const isOpen = burgerButton.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", isOpen);
    burgerButton.setAttribute("aria-expanded", String(isOpen));
    burgerButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

if (launchButton && simulatorSection) {
  launchButton.addEventListener("click", (event) => {
    event.preventDefault();
    simulatorSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

syncNavbarScroll();
window.addEventListener("scroll", syncNavbarScroll, { passive: true });
