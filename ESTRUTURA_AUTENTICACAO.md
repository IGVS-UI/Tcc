# 📋 Estrutura de Autenticação - TCC VR

## 🔄 Fluxo de Autenticação

```
index.html → login.html → [auth.js] → home.html
                ↓           ↑
            cadastro.html → [cadastro.js]
```

---

## 📄 Arquivos e suas Responsabilidades

### 1. **auth.js** - APENAS LOGIN
**Páginas vinculadas:** `login.html`

**Funcionalidades:**
- ✅ Login com email/senha
- ✅ Login social (Google, GitHub, Microsoft)
- ✅ Logout (deslogar da home)
- ✅ Proteção de rota (home.html só acessível se autenticado)
- ✅ Mensagens de status e erros

**Como funciona:**
1. User preenche email e senha em `login.html`
2. Form `#authForm` dispara evento
3. `signInWithEmailAndPassword()` valida as credenciais
4. Se OK → Redireciona para `home.html`
5. Se Erro → Mostra mensagem amigável

---

### 2. **cadastro.js** - APENAS CADASTRO
**Páginas vinculadas:** `cadastro.html`

**Funcionalidades:**
- ✅ Criar conta com email/senha
- ✅ Cadastro social (Google, GitHub, Microsoft)
- ✅ Validações de email e senha
- ✅ Mensagens de status e erros

**Como funciona:**
1. User preenche email e senha em `cadastro.html`
2. Form `#signupForm` dispara evento
3. `createUserWithEmailAndPassword()` cria a conta no Firebase
4. Se OK → Redireciona para `home.html`
5. Se Erro → Mostra mensagem amigável

---

## 🔐 Fluxo Detalhado

### Login (auth.js)
```
login.html
    ↓
[Preenchimento de email/senha]
    ↓
#authForm submit → validação
    ↓
signInWithEmailAndPassword() ✅
    ↓
home.html 🎉
```

### Cadastro (cadastro.js)
```
cadastro.html
    ↓
[Preenchimento de email/senha]
    ↓
#signupForm submit → validação
    ↓
createUserWithEmailAndPassword() ✅
    ↓
home.html 🎉
```

### Logout (auth.js)
```
home.html
    ↓
[Clique em #btnLogout]
    ↓
signOut() ✅
    ↓
login.html 🔑
```

---

## 📱 Métodos Sociais (Ambos os arquivos)

Tanto `auth.js` quanto `cadastro.js` suportam:

| Botão | Função |
|-------|--------|
| `#btnGoogle` | SignIn/SignUp com Google |
| `#btnGithub` | SignIn/SignUp com GitHub |
| `#btnMicrosoft` | SignIn/SignUp com Microsoft |

Todos utilizam `signInWithPopup()` que:
- Abre janela de login do provedor
- Se é primeira vez → Cria conta automática
- Se já existe → Faz login direto
- Redireciona para `home.html`

---

## 🛡️ Validações Implementadas

### Email/Senha
```javascript
// Verificação de campos vazios
if (!email || !pass) {
  setStatus("Preencha email e senha.");
  return null;
}

// Verificação de senha mínima (apenas cadastro)
if (pass.length < 6) {
  setStatus("A senha deve ter no mínimo 6 caracteres.");
  return null;
}
```

### Proteção de Rota (home.html)
```javascript
onAuthStateChanged(auth, (user) => {
  const isHome = window.location.pathname.includes("home.html");
  if (isHome && !user) {
    window.location.href = "login.html"; // Redireciona se não autenticado
  }
});
```

---

## 🎯 Mensagens de Erro Personalizadas

Ambos os arquivos mapeiam erros do Firebase para mensagens amigáveis:

```javascript
"auth/invalid-email" → "Email inválido."
"auth/user-not-found" → "Usuário não encontrado."
"auth/wrong-password" → "Senha incorreta."
"auth/email-already-in-use" → "Esse email já está em uso."
"auth/weak-password" → "Senha fraca (mínimo 6 caracteres)."
// ... etc
```

---

## 📊 Resumo das Diferenças

| Aspecto | auth.js | cadastro.js |
|---------|---------|-------------|
| Página | `login.html` | `cadastro.html` |
| Form | `#authForm` | `#signupForm` |
| Função Principal | `signInWithEmailAndPassword()` | `createUserWithEmailAndPassword()` |
| Função Social | `signInWithPopup()` | `signInWithPopup()` |
| Logout | ✅ | ❌ |
| Proteção de Rota | ✅ | ❌ |

---

## ✅ Checklist de Implementação

- [x] `auth.js` carregado apenas em `login.html`
- [x] `cadastro.js` carregado apenas em `cadastro.html`
- [x] Login com email/senha funciona
- [x] Cadastro com email/senha funciona
- [x] Login social (Google, GitHub, Microsoft) funciona
- [x] Cadastro social funciona
- [x] Logout funciona
- [x] Home protegida (redireciona se não autenticado)
- [x] Mensagens de erro personalizadas
- [x] Redirecionamentos funcionam

---

## 🚀 Próximos Passos (Opcional)

Se quiser melhorar ainda mais:

1. **Adicionar confirmação de email** → Verificar email antes de ativar conta
2. **Recuperação de senha** → Link para resetar senha
3. **Perfil de usuário** → Salvar dados adicionais (nome, foto, etc.)
4. **2FA** → Autenticação de dois fatores
5. **Controle de acesso** → Diferentes níveis de permissão
