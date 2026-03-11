// cadastro.js - Cadastro de Novos Usuários + Social
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup
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

// ====== Elementos da Página de Cadastro ======
const emailEl = document.querySelector("#email");
const passEl = document.querySelector("#password");
const signupForm = document.querySelector("#signupForm"); // cadastro.html

const btnGoogle = document.querySelector("#btnGoogle");
const btnGithub = document.querySelector("#btnGithub");
const btnMicrosoft = document.querySelector("#btnMicrosoft");

const statusEl = document.querySelector("#status");

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
    "auth/email-already-in-use": "Esse email já está em uso.",
    "auth/weak-password": "Senha fraca (mínimo 6 caracteres).",
    "auth/popup-closed-by-user": "Você fechou a janela de cadastro.",
    "auth/account-exists-with-different-credential":
      "Esse email já existe com outro provedor. Tente outro método.",
    "auth/operation-not-allowed":
      "Esse provedor não está ativo no Firebase Authentication.",
  };
  return map[code] || `Erro: ${code}`;
}

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

  if (pass.length < 6) {
    setStatus("A senha deve ter no mínimo 6 caracteres.");
    return null;
  }

  return { email, pass };
}

// ====== CADASTRO Email/Senha (cadastro.html) ======
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Criando conta...");

    const data = getEmailPass();
    if (!data) return;

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.pass);
      showSuccessModal("Cadastro Concluído ✅");
      // Redireciona para index após cadastro bem-sucedido
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== CADASTRO com Google ======
if (btnGoogle) {
  btnGoogle.addEventListener("click", async () => {
    setStatus("Abrindo Google...");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      showSuccessModal("Cadastro Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== CADASTRO com GitHub ======
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      showSuccessModal("Cadastro Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== CADASTRO com Microsoft ======
if (btnMicrosoft) {
  btnMicrosoft.addEventListener("click", async () => {
    setStatus("Abrindo Microsoft...");
    try {
      await signInWithPopup(auth, new OAuthProvider("microsoft.com"));
      showSuccessModal("Cadastro Concluído ✅");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}
