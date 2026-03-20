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
// Onde você tem o código do botão do GitHub
if (btnGithub) {
  btnGithub.addEventListener("click", async () => {
    setStatus("Abrindo GitHub...");
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      console.log("Login GitHub bem-sucedido:", result.user);
      showSuccessModal("Login Concluído ✅");
      // Se onAuthStateChanged estiver no topo, ele cuidará do redirecionamento
      // Você pode até remover o setTimeout daqui se preferir que o onAuthStateChanged seja o único a redirecionar
      // setTimeout(() => {
      //   window.location.href = "index.html";
      // }, 2000);

    } catch (err) {
      console.error("Erro no login com GitHub:", err.code, err.message);

      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData.email;
        const pendingCred = err.credential; // Credencial do GitHub

        console.log("Fluxo de vinculação iniciado para o email:", email);
        console.log("Credencial pendente recebida do GitHub:", pendingCred?.providerId || "desconhecida");
        setStatus(`Uma conta com o e-mail ${email} já existe. Por favor, faça login com o seu provedor original para vincular a conta do GitHub.`);

        try {
          // 1. Encontrar os métodos de login existentes para este e-mail
          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log("Métodos de login existentes para este e-mail:", methods);

          // 2. Tentar autenticar com um dos provedores existentes
          // Este é um exemplo simplificado. Na vida real, você mostraria uma UI
          // para o usuário escolher o provedor ou inseriria as credenciais (email/senha).

          let existingProvider = null;

          if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
            existingProvider = new GoogleAuthProvider();
            setStatus("Por favor, faça login com sua conta Google para vincular o GitHub.");
            // Você pode exibir um botão para "Login com Google" aqui
          } else if (methods.includes(GithubAuthProvider.PROVIDER_ID)) {
             // Se o método existente já for GitHub, significa que o usuário já usou GitHub antes
             // e talvez tenha desvinculado ou algo parecido. Isso não deveria acontecer neste fluxo.
             setStatus("Você já usou GitHub para esta conta. Tentando vincular...");
             existingProvider = new GithubAuthProvider();
          } else {
            // Se houver outros provedores como Email/Senha, você precisaria de um formulário
            // de email/senha aqui. Para simplificar, vou focar em provedores sociais.
            setStatus(`Uma conta com o e-mail ${email} já existe usando um provedor diferente. Por favor, faça login com um de seus métodos existentes (${methods.join(', ')}) para vincular a conta do GitHub.`);
            console.warn("Provedor existente não tratado explicitamente neste exemplo.");
            return; // Interrompe o processo se não houver um provedor social fácil de usar
          }

          // Se encontramos um provedor social existente, tentamos fazer login com ele
          if (existingProvider) {
            isLinkingGithubAccount = true;
            console.log("Tentando autenticar com o provedor existente:", existingProvider.providerId);
            const result = await signInWithPopup(auth, existingProvider);
            const user = result.user;
            console.log(
              "Login com provedor existente concluído. Providers atuais:",
              user.providerData.map((provider) => provider.providerId)
            );

            // 3. Vincular a credencial do GitHub à conta existente
            console.log("Tentando vincular a credencial pendente do GitHub à conta existente...");
            await linkWithCredential(user, pendingCred);
            console.log("Conta GitHub vinculada com sucesso à conta existente:", user);
            showSuccessModal("Contas vinculadas com sucesso! ✅");

            // O onAuthStateChanged deve cuidar do redirecionamento
            // window.location.href = "index.html";
          }

        } catch (linkErr) {
          console.error("Erro ao vincular a conta:", linkErr.code, linkErr.message);
          setStatus(`Erro ao vincular a conta. ${friendlyError(linkErr.code)}`);
          // Se o erro for que o usuário fechou o pop-up, talvez não precise de uma mensagem de erro agressiva
          if (linkErr.code === 'auth/popup-closed-by-user') {
            setStatus("Vinculação cancelada. Você fechou a janela de login.");
          }
        } finally {
          isLinkingGithubAccount = false;
        }

      } else {
        // Outros erros que não sejam auth/account-exists-with-different-credential
        setStatus(friendlyError(err.code));
      }
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

