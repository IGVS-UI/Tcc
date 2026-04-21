const GOOGLE_MAPS_EMBED_API_KEY = "";

const navbar = document.querySelector(".navbar");
const burgerButton = document.querySelector(".nav-burger");
const mobileMenu = document.querySelector("#nav-mobile-menu");
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll(".nav-link") : [];
const viewer = document.querySelector("#mapsViewer");
const viewerCaption = document.querySelector("#viewerCaption");
const viewerBadgeTitle = document.querySelector("#viewerBadgeTitle");
const viewerOpenLink = document.querySelector("#viewerOpenLink");
const viewerExpand = document.querySelector("#viewerExpand");
const viewerShell = document.querySelector("#viewerShell");
const destinationColumns = Array.from(document.querySelectorAll(".destination-column"));

const hasApiKey = () =>
  Boolean(GOOGLE_MAPS_EMBED_API_KEY) &&
  !GOOGLE_MAPS_EMBED_API_KEY.startsWith("YOUR_");

const buildStreetViewSrc = (card) => {
  if (!hasApiKey()) return card.dataset.fallback;

  const params = new URLSearchParams({
    key: GOOGLE_MAPS_EMBED_API_KEY,
    location: card.dataset.location,
    heading: card.dataset.heading,
    pitch: card.dataset.pitch,
    fov: card.dataset.fov,
  });

  return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`;
};

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

const updateViewer = (card) => {
  if (viewer) {
    viewer.src = buildStreetViewSrc(card);
    viewer.title = `Visualizacao de ${card.dataset.place}`;
  }

  if (viewerCaption) viewerCaption.textContent = card.dataset.place;
  if (viewerBadgeTitle) viewerBadgeTitle.textContent = card.dataset.badge;
  if (viewerOpenLink) viewerOpenLink.href = card.dataset.open;
};

const getColumnCards = (column) => Array.from(column.querySelectorAll(".destination-card"));

const renderColumn = (column, nextIndex = 0) => {
  const cards = getColumnCards(column);
  if (!cards.length) return;

  const activeIndex = ((nextIndex % cards.length) + cards.length) % cards.length;
  column.dataset.activeIndex = String(activeIndex);

  cards.forEach((card, index) => {
    const isActive = index === activeIndex;
    card.classList.toggle("is-active", isActive);
    card.classList.toggle("is-behind", !isActive);
    card.tabIndex = isActive ? 0 : -1;
    card.setAttribute("aria-hidden", String(!isActive));
  });
};

const swapColumn = (column) => {
  const activeIndex = Number(column.dataset.activeIndex || 0);
  renderColumn(column, activeIndex + 1);
};

const openDestinationInViewer = (card) => {
  updateViewer(card);
  viewerShell?.scrollIntoView({ behavior: "smooth", block: "center" });
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

destinationColumns.forEach((column) => {
  renderColumn(column, 0);

  const cards = getColumnCards(column);
  const swapButton = column.querySelector(".destination-swap");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      openDestinationInViewer(card);
    });
  });

  swapButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    swapColumn(column);
  });
});

if (viewerExpand && viewerShell) {
  viewerExpand.addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      await viewerShell.requestFullscreen?.();
      return;
    }

    await document.exitFullscreen?.();
  });
}

syncNavbarScroll();
window.addEventListener("scroll", syncNavbarScroll, { passive: true });
