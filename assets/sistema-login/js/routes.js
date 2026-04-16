// routes.js - Gerenciamento de rotas e proteção de páginas

/**
 * Obtém o nome da página atual
 * @returns {string} Nome da página (ex: "index.html", "login.html")
 */
export function getCurrentPage() {
  const normalizedPath = window.location.pathname.replace(/\\/g, "/");
  const page = normalizedPath.split("/").pop();
  return page || "index.html";
}

/**
 * Obtém o caminho completo da página atual
 * @returns {string} Caminho completo da URL
 */
export function getFullPath() {
  return window.location.pathname.replace(/\\/g, "/");
}

/**
 * Redireciona para uma página específica com caminhos relativos corretos
 * @param {string} targetPage - Nome da página (ex: "index.html", "login.html")
 */
export function redirectTo(targetPage) {
  const currentPage = getCurrentPage();
  if (currentPage === targetPage) return;

  const currentPath = getFullPath();
  let redirectPath;

  if (targetPage === "index.html") {
    redirectPath = currentPath.includes("assets/sistema-login/html")
      ? "../../../index.html"
      : "index.html";
  } else if (targetPage === "login.html") {
    redirectPath = currentPath.includes("assets/sistema-login/html")
      ? "login.html"
      : "assets/sistema-login/html/login.html";
  } else if (targetPage === "cadastro.html") {
    redirectPath = currentPath.includes("assets/sistema-login/html")
      ? "cadastro.html"
      : "assets/sistema-login/html/cadastro.html";
  } else {
    redirectPath = targetPage;
  }

  window.location.replace(redirectPath);
}

/**
 * Redireciona para uma página com delay
 * @param {string} targetPage - Nome da página
 * @param {number} delay - Delay em ms (padrão: 1500ms)
 * @returns {function} Função para limpar o timer
 */
export function queueRedirect(targetPage, delay = 1500) {
  let redirectTimer = window.setTimeout(() => {
    redirectTo(targetPage);
  }, delay);

  // Retorna função para limpar o timer se necessário
  return () => window.clearTimeout(redirectTimer);
}

/**
 * Verifica se a página atual é protegida (requer autenticação)
 * @returns {boolean} True se a página é protegida
 */
export function isProtectedPage() {
  const currentPage = getCurrentPage();
  return currentPage === "index.html" || currentPage === "home.html";
}

/**
 * Verifica se a página atual é uma página de autenticação
 * @returns {boolean} True se é página de login ou cadastro
 */
export function isAuthPage() {
  const currentPage = getCurrentPage();
  return currentPage === "login.html" || currentPage === "cadastro.html";
}

/**
 * Gerencia proteção de rotas baseado no estado de autenticação do usuário
 * @param {boolean} isUserLoggedIn - Se o usuário está autenticado
 */
export function protectRoute(isUserLoggedIn) {
  if (isUserLoggedIn) {
    // Usuário logado
    if (isAuthPage()) {
      // Se está em página de autenticação, redireciona para index
      redirectTo("index.html");
    }
  } else {
    // Usuário NÃO logado
    if (isProtectedPage()) {
      // Se está em página protegida, redireciona para login
      redirectTo("login.html");
    }
  }
}
