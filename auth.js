// auth.js - Login + Social + Proteção Home + Logout
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
 getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail, // <-- Importar esta função
  linkWithCredential       // <-- Importar esta função
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// ====== Configuração Firebase ======
const firebaseConfig = {
  apiKey: "AIzaSyCOfHsJq2lBKq87n4PYL1aq1cLrhkC0wIg",
  authDomain: "tcc-7491c.firebaseapp.com",
  projectId: "tcc-7491c",
  storageBucket: "tcc-7491c.firebasestorage.app",
  messagingSenderId: "626560679583",
  appId: "1:626560679583:web:9514f3b9c9a4c1fa26acaa",
  measurementId: "G-Y76EJYVFMN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let isLinkingGithubAccount = false;

// ====== Elementos da Página de Login ======
const emailEl = document.querySelector("#email");
const passEl = document.querySelector("#password");
const formEl = document.querySelector("#authForm"); // login.html

const btnGoogle = document.querySelector("#btnGoogle");
const btnGithub = document.querySelector("#btnGithub");
const btnMicrosoft = document.querySelector("#btnMicrosoft");

const btnLogout = document.querySelector("#btnLogout"); // home.html
const statusEl = document.querySelector("#status");

// Seu onAuthStateChanged existente
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    console.log("Usuário logado detectado pelo onAuthStateChanged:", user);
    if (isLinkingGithubAccount) {
      console.log("Login detectado durante a vinculação da conta. Redirecionamento suspenso temporariamente.");
      return;
    }
    // Redireciona para a página principal se não estiver nela
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage && currentPage !== "index.html") {
        window.location.href = "index.html";
    }
  } else {
    // Usuário não está logado
    console.log("Nenhum usuário logado detectado pelo onAuthStateChanged.");
    // Se estiver em uma página protegida, redireciona para a página de login
    // if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
    //     window.location.href = "login.html"; // Ajuste para sua página de login
    // }
  }
});

function getEmailPass() {
  if (!emailEl || !passEl) {
    setStatus("Campos de email/senha não encontrados.");
    return null;
  }
  const email = emailEl.value.trim();
  const pass = passEl.value;

  if (!email || !pass) {
    setStatus("Preencha email e senha.");
    return null;
  }

  return { email, pass };
}

// ====== LOGIN Email/Senha (login.html) ======
if (formEl) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Entrando...");

    const data = getEmailPass();
    if (!data) return;

    try {
      await signInWithEmailAndPassword(auth, data.email, data.pass);
      showSuccessModal("Login Concluído ✅");
      // Redireciona para index após login bem-sucedido
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== LOGIN com Google ======

if (btnGoogle) {
  btnGoogle.addEventListener("click", async () => {
    setStatus("Abrindo Google...");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log("Cadastro Google bem-sucedido:", result.user);
      showSuccessModal("Cadastro Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      console.error("Erro no cadastro Google:", err.code, err.message);
      setStatus(friendlyError(err.code));
    }
  });
}


// ====== LOGIN com GitHub ======
// ====== LOGIN com GitHub ======
// Onde você tem o código do botão do GitHub
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    console.log("Iniciando login com GitHub..."); // Log 1

    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      showSuccessModal("Login Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}


// ====== LOGIN com Microsoft ======
if (btnMicrosoft) {
  btnMicrosoft.addEventListener("click", async () => {
    setStatus("Abrindo Microsoft...");
    try {
      await signInWithPopup(auth, new OAuthProvider("microsoft.com"));
      showSuccessModal("Login Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== LOGOUT (home.html) ======
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Proteção da home.html - Redirecionar não autenticados ======
onAuthStateChanged(auth, (user) => {
  const isHome = window.location.pathname.includes("home.html");
  if (isHome && !user) {
    window.location.href = "login.html";
  }
});


// ====== Funções Auxiliares ======
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function showSuccessModal(message) {
  const modal = document.createElement("div");
  modal.id = "successModal";
  modal.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(42, 13, 79, 0.95), rgba(85, 32, 139, 0.95));
    border: 2px solid #b01bff;
    border-radius: 15px;
    padding: 20px 30px;
    text-align: center;
    z-index: 9999;
    min-width: 280px;
    box-shadow: 0 0 30px rgba(176, 27, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1);
    animation: slideInRight 0.4s ease-out;
  `;
  
  modal.innerHTML = `
    <h2 style="color: #b01bff; font-size: 18px; margin: 0 0 8px 0; font-family: Orbitron, sans-serif; font-weight: 600;">${message}</h2>
    <p style="color: rgba(255, 255, 255, 0.75); font-size: 13px; margin: 0; font-family: 'Segoe UI', sans-serif;">Redirecionando...</p>
  `;
  
  document.body.appendChild(modal);
  
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "Email inválido.",
    "auth/missing-password": "Digite a senha.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/weak-password": "Senha fraca (mínimo 6 caracteres).",
    "auth/popup-closed-by-user": "Você fechou a janela de login.",
    "auth/account-exists-with-different-credential":
      "Esse email já existe com outro provedor. Tente entrar com o método correto.",
    "auth/operation-not-allowed":
      "Esse provedor não está ativo no Firebase Authentication.",
  };
  return map[code] || `Erro: ${code}`;
}

