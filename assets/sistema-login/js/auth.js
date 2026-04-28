// auth.js - login + cadastro + social + logout + proteção de rota
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import {
  getCurrentPage,
  redirectTo,
  queueRedirect,
  isProtectedPage,
  isAuthPage,
  protectRoute
} from "./routes.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOfHsJq2lBKq87n4PYL1aq1cLrhkC0wIg",
  authDomain: "tcc-7491c.firebaseapp.com",
  projectId: "tcc-7491c",
  storageBucket: "tcc-7491c.firebasestorage.app",
  messagingSenderId: "626560679583",
  appId: "1:626560679583:web:9514f3b9c9a4c1fa26acaa",
  measurementId: "G-Y76EJYVFMN"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Detectar página atual ──────────────────────────────────
const currentPage  = getCurrentPage();
const isLoginPage  = currentPage === "login.html";
const isSignupPage = currentPage === "cadastro.html";

// ── Elementos da página ───────────────────────────────────
const emailEl       = document.querySelector("#email");
const passEl        = document.querySelector("#password");
const formEl        = document.querySelector("#authForm");       // login
const signupFormEl  = document.querySelector("#signupForm");     // cadastro
const fullNameEl    = document.querySelector("#fullName");
const confirmPassEl = document.querySelector("#confirmPassword");
const acceptTermsEl = document.querySelector("#acceptTerms");
const btnGoogle     = document.querySelector("#btnGoogle");
const btnGithub     = document.querySelector("#btnGithub");
const btnMicrosoft  = document.querySelector("#btnMicrosoft");
const btnLogout     = document.querySelector("#btnLogout");
const statusEl      = document.querySelector("#status");

let authFlowInProgress = false;
let redirectTimer      = null;

// ── Observer de autenticação ──────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    protectRoute(true);
    return;
  }
  protectRoute(false);
});

// ── Helpers ────────────────────────────────────────────────
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function scheduleRedirect(target) {
  if (redirectTimer) clearTimeout(redirectTimer);
  redirectTimer = setTimeout(() => {
    redirectTimer = null;
    redirectTo(target);
  }, 1500);
}

function getEmailPass() {
  const email = emailEl?.value.trim();
  const pass  = passEl?.value;
  if (!email || !pass) { setStatus("Preencha email e senha."); return null; }
  return { email, pass };
}

function showSuccessModal(message) {
  const existing = document.getElementById("successModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "successModal";
  modal.style.cssText = `
    position:fixed; top:20px; right:20px;
    background:linear-gradient(135deg,rgba(42,13,79,.95),rgba(85,32,139,.95));
    border:2px solid #b01bff; border-radius:15px;
    padding:20px 30px; text-align:center;
    z-index:9999; min-width:280px;
    box-shadow:0 0 30px rgba(176,27,255,.4);
    animation:slideInRight .4s ease-out;
  `;
  modal.innerHTML = `
    <h2 style="color:#b01bff;font-size:18px;margin:0 0 8px 0;font-weight:600">${message}</h2>
    <p style="color:rgba(255,255,255,.75);font-size:13px;margin:0">Redirecionando...</p>
  `;
  document.body.appendChild(modal);

  const style = document.createElement("style");
  style.textContent = `@keyframes slideInRight{from{opacity:0;transform:translateX(400px)}to{opacity:1;transform:translateX(0)}}`;
  document.head.appendChild(style);
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email":                         "Email inválido.",
    "auth/missing-email":                         "Digite um email.",
    "auth/missing-password":                      "Digite a senha.",
    "auth/wrong-password":                        "Senha incorreta.",
    "auth/user-not-found":                        "Usuário não encontrado.",
    "auth/invalid-credential":                    "Email ou senha incorretos.",
    "auth/email-already-in-use":                  "Este email já está em uso.",
    "auth/weak-password":                         "Senha fraca (mínimo 6 caracteres).",
    "auth/popup-closed-by-user":                  "Você fechou a janela de login.",
    "auth/account-exists-with-different-credential":
      "Esse email já existe com outro provedor. Tente entrar com o método correto.",
    "auth/operation-not-allowed":
      "Esse provedor não está ativo no Firebase Authentication."
  };
  return map[code] || `Erro: ${code}`;
}

// ── LOGIN com email/senha ─────────────────────────────────
if (formEl) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Entrando...");
    authFlowInProgress = true;

    const data = getEmailPass();
    if (!data) { authFlowInProgress = false; return; }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.pass);
      showSuccessModal("Login concluído");
      scheduleRedirect("index.html");
    } catch (err) {
      authFlowInProgress = false;
      setStatus(friendlyError(err.code));
    }
  });
}

// ── CADASTRO com email/senha ──────────────────────────────
if (signupFormEl) {
  signupFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Criando conta...");
    authFlowInProgress = true;

    const data = getEmailPass();
    if (!data) { authFlowInProgress = false; return; }

    const fullName   = fullNameEl?.value.trim() || "";
    const confirmPass = confirmPassEl?.value || "";

    if (!fullName) {
      authFlowInProgress = false;
      setStatus("Digite seu nome completo.");
      return;
    }
    if (data.pass.length < 6) {
      authFlowInProgress = false;
      setStatus("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (confirmPass !== data.pass) {
      authFlowInProgress = false;
      setStatus("As senhas não coincidem.");
      return;
    }
    if (acceptTermsEl && !acceptTermsEl.checked) {
      authFlowInProgress = false;
      setStatus("Aceite os termos para continuar.");
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      try {
        await updateProfile(credential.user, { displayName: fullName });
      } catch (profileErr) {
        console.warn("Nome não salvo:", profileErr);
      }
      showSuccessModal("Conta criada!");
      scheduleRedirect("index.html");
    } catch (err) {
      authFlowInProgress = false;
      setStatus(friendlyError(err.code));
    }
  });
}

// ── GOOGLE ────────────────────────────────────────────────
if (btnGoogle) {
  btnGoogle.addEventListener("click", async () => {
    setStatus(isSignupPage ? "Conectando com Google..." : "Abrindo Google...");
    authFlowInProgress = true;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      showSuccessModal(isSignupPage ? "Conta criada!" : "Login concluído");
      scheduleRedirect("index.html");
    } catch (err) {
      authFlowInProgress = false;
      setStatus(friendlyError(err.code));
    }
  });
}

// ── GITHUB ────────────────────────────────────────────────
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    authFlowInProgress = true;
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      showSuccessModal("Login concluído");
      scheduleRedirect("index.html");
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email       = err.customData?.email;
        const pendingCred = err.credential;
        if (!email || !pendingCred) {
          authFlowInProgress = false;
          setStatus("Não foi possível vincular a conta GitHub.");
          return;
        }
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          let provider  = null;
          if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
            provider = new GoogleAuthProvider();
            setStatus("Faça login com Google para vincular o GitHub.");
          } else {
            authFlowInProgress = false;
            setStatus(`Conta existente com outro método (${methods.join(", ")}).`);
            return;
          }
          const result = await signInWithPopup(auth, provider);
          await linkWithCredential(result.user, pendingCred);
          showSuccessModal("Contas vinculadas!");
          scheduleRedirect("index.html");
        } catch (linkErr) {
          authFlowInProgress = false;
          setStatus(friendlyError(linkErr.code));
        }
      } else {
        authFlowInProgress = false;
        setStatus(friendlyError(err.code));
      }
    }
  });
}

// ── MICROSOFT ─────────────────────────────────────────────
if (btnMicrosoft) {
  btnMicrosoft.addEventListener("click", () => {
    setStatus("Login com Microsoft ainda não configurado.");
  });
}

// ── LOGOUT ────────────────────────────────────────────────
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    setStatus("Saindo...");
    try {
      await signOut(auth);
      redirectTo("login.html");
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}