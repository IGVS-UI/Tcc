// auth.js - login, social login, route protection and logout
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase config
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

function getCurrentPage() {
  const normalizedPath = window.location.pathname.replace(/\\/g, "/");
  const page = normalizedPath.split("/").pop();
  return page || "index.html";
}

function redirectTo(targetPage) {
  if (getCurrentPage() === targetPage) return;
  window.location.replace(targetPage);
}

let authFlowInProgress = false;
let redirectTimer = null;

function queueRedirect(targetPage, delay = 1500) {
  if (redirectTimer) {
    window.clearTimeout(redirectTimer);
  }

  redirectTimer = window.setTimeout(() => {
    redirectTimer = null;
    redirectTo(targetPage);
  }, delay);
}

// Page elements
const emailEl = document.querySelector("#email");
const passEl = document.querySelector("#password");
const formEl = document.querySelector("#authForm");

const btnGoogle = document.querySelector("#btnGoogle");
const btnGithub = document.querySelector("#btnGithub");
const btnMicrosoft = document.querySelector("#btnMicrosoft");

const btnLogout = document.querySelector("#btnLogout");
const statusEl = document.querySelector("#status");

const currentPage = getCurrentPage();
const isLoginPage = currentPage === "login.html";
const isProtectedPage = currentPage === "index.html" || currentPage === "home.html";

// Single auth observer to avoid duplicated redirects and reload loops.
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario logado detectado pelo onAuthStateChanged.");

    if (isLoginPage && !authFlowInProgress && !redirectTimer) {
      redirectTo("index.html");
    }
    return;
  }

  console.log("Nenhum usuario logado detectado pelo onAuthStateChanged.");
  if (isProtectedPage) {
    redirectTo("login.html");
  }
});

function getEmailPass() {
  if (!emailEl || !passEl) {
    setStatus("Campos de email/senha nao encontrados.");
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

// Email/password login
if (formEl) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Entrando...");
    authFlowInProgress = true;

    const data = getEmailPass();
    if (!data) {
      authFlowInProgress = false;
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.pass);
      showSuccessModal("Login concluido");
      queueRedirect("index.html");
    } catch (err) {
      authFlowInProgress = false;
      setStatus(friendlyError(err.code));
    }
  });
}

// Google login
if (btnGoogle) {
  btnGoogle.addEventListener("click", async () => {
    setStatus("Abrindo Google...");
    authFlowInProgress = true;

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log("Login Google bem-sucedido:", result.user);
      showSuccessModal("Login concluido");
      queueRedirect("index.html");
    } catch (err) {
      authFlowInProgress = false;
      console.error("Erro no login Google:", err.code, err.message);
      setStatus(friendlyError(err.code));
    }
  });
}

// GitHub login
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    authFlowInProgress = true;

    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      console.log("Login GitHub bem-sucedido:", result.user);
      showSuccessModal("Login concluido");
      queueRedirect("index.html");
    } catch (err) {
      console.error("Erro no login com GitHub:", err.code, err.message);

      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        const pendingCred = err.credential;

        if (!email || !pendingCred) {
          authFlowInProgress = false;
          setStatus("Nao foi possivel recuperar os dados para vincular a conta GitHub.");
          return;
        }

        setStatus(
          `Uma conta com o e-mail ${email} ja existe. Faca login com o provedor original para vincular o GitHub.`
        );

        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log("Metodos de login existentes para este e-mail:", methods);

          let existingProvider = null;

          if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
            existingProvider = new GoogleAuthProvider();
            setStatus("Faca login com sua conta Google para vincular o GitHub.");
          } else if (methods.includes(GithubAuthProvider.PROVIDER_ID)) {
            setStatus("Voce ja usou GitHub nesta conta. Tentando vincular...");
            existingProvider = new GithubAuthProvider();
          } else {
            authFlowInProgress = false;
            setStatus(
              `Essa conta ja existe com outro metodo (${methods.join(", ")}). Entre com ele primeiro para vincular o GitHub.`
            );
            console.warn("Provedor existente nao tratado explicitamente neste fluxo.");
            return;
          }

          const result = await signInWithPopup(auth, existingProvider);
          const user = result.user;

          await linkWithCredential(user, pendingCred);
          console.log("Conta GitHub vinculada com sucesso a conta existente:", user);
          showSuccessModal("Contas vinculadas com sucesso");
          queueRedirect("index.html");
        } catch (linkErr) {
          authFlowInProgress = false;
          console.error("Erro ao vincular a conta:", linkErr.code, linkErr.message);

          if (linkErr.code === "auth/popup-closed-by-user") {
            setStatus("Vinculacao cancelada. Voce fechou a janela de login.");
            return;
          }

          setStatus(`Erro ao vincular a conta. ${friendlyError(linkErr.code)}`);
        }
      } else {
        authFlowInProgress = false;
        setStatus(friendlyError(err.code));
      }
    }
  });
}

// Microsoft button exists in the UI, but there is no provider flow implemented yet.
if (btnMicrosoft) {
  btnMicrosoft.addEventListener("click", () => {
    setStatus("Login com Microsoft ainda nao foi configurado.");
  });
}

// Logout
async function handleLogout() {
  setStatus("Saindo...");

  try {
    await signOut(auth);
    redirectTo("login.html");
  } catch (err) {
    setStatus(friendlyError(err.code));
  }
}

if (btnLogout) {
  btnLogout.addEventListener("click", handleLogout);
}

// Helpers
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
    "auth/invalid-email": "Email invalido.",
    "auth/missing-password": "Digite a senha.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/user-not-found": "Usuario nao encontrado.",
    "auth/weak-password": "Senha fraca (minimo 6 caracteres).",
    "auth/popup-closed-by-user": "Voce fechou a janela de login.",
    "auth/account-exists-with-different-credential":
      "Esse email ja existe com outro provedor. Tente entrar com o metodo correto.",
    "auth/operation-not-allowed":
      "Esse provedor nao esta ativo no Firebase Authentication."
  };

  return map[code] || `Erro: ${code}`;
}
