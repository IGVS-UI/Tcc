// auth.js (UNICO) - Login + Cadastro + Social + Proteção Home + Logout
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// ====== Elementos (podem existir ou não dependendo da página) ======
const emailEl = document.querySelector("#email");
const passEl = document.querySelector("#password");

const formEl = document.querySelector("#authForm");      // index.html
const signupForm = document.querySelector("#signupForm"); // cadastro.html

const btnGoogle = document.querySelector("#btnGoogle");
const btnGithub = document.querySelector("#btnGithub");
const btnMicrosoft = document.querySelector("#btnMicrosoft");

const btnLogout = document.querySelector("#btnLogout"); // home.html

const statusEl = document.querySelector("#status");

// ====== Helpers ======
function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "Email inválido.",
    "auth/missing-password": "Digite a senha.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/email-already-in-use": "Esse email já está em uso.",
    "auth/weak-password": "Senha fraca (mínimo 6 caracteres).",
    "auth/popup-closed-by-user": "Você fechou a janela de login.",
    "auth/account-exists-with-different-credential":
      "Esse email já existe com outro provedor. Tente entrar com o método correto.",
    "auth/operation-not-allowed":
      "Esse provedor não está ativo no Firebase Authentication.",
  };
  return map[code] || `Erro: ${code}`;
}

function getEmailPass() {
  if (!emailEl || !passEl) {
    setStatus("Campos de email/senha não encontrados. Confira os IDs: #email e #password.");
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

// ====== Login Email/Senha (index.html) ======
if (formEl) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Entrando...");

    const data = getEmailPass();
    if (!data) return;

    try {
      await signInWithEmailAndPassword(auth, data.email, data.pass);
      setStatus("Logado ✅");
      window.location.href = "home.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Cadastro Email/Senha (cadastro.html) ======
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Criando conta...");

    const data = getEmailPass();
    if (!data) return;

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.pass);
      setStatus("Conta criada ✅");
      window.location.href = "home.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Google ======
if (btnGoogle) {
  btnGoogle.addEventListener("click", async () => {
    setStatus("Abrindo Google...");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      window.location.href = "home.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== GitHub ======
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      window.location.href = "home.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Microsoft ======
if (btnMicrosoft) {
  btnMicrosoft.addEventListener("click", async () => {
    setStatus("Abrindo Microsoft...");
    try {
      await signInWithPopup(auth, new OAuthProvider("microsoft.com"));
      window.location.href = "home.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Logout (home.html) ======
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      setStatus(friendlyError(err.code));
    }
  });
}

// ====== Proteção da home.html ======
onAuthStateChanged(auth, (user) => {
  const isHome = window.location.pathname.includes("home.html");
  if (isHome && !user) {
    window.location.href = "index.html";
  }
});
