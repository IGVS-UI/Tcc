# Documentação de Rotas e Proteção

## Estrutura de Roteamento

O sistema de rotas foi modularizado para melhor organização e manutenção.

### Arquivos de Roteamento

#### `routes.js` (assets/sistema-login/js/routes.js)
Módulo central que gerencia toda a navegação e proteção de rotas. Exporta as seguintes funções:

- **`getCurrentPage()`** - Retorna o nome da página atual
- **`getFullPath()`** - Retorna o caminho completo da URL
- **`redirectTo(targetPage)`** - Redireciona para uma página com caminhos relativos corretos
- **`queueRedirect(targetPage, delay)`** - Redireciona com delay (padrão 1500ms)
- **`isProtectedPage()`** - Verifica se a página atual requer autenticação
- **`isAuthPage()`** - Verifica se é página de login/cadastro
- **`protectRoute(isUserLoggedIn)`** - Gerencia proteção baseado no estado de autenticação

#### `auth.js` (assets/sistema-login/js/auth.js)
Módulo de autenticação que:
1. Importa todas as funções de `routes.js`
2. Gerencia autenticação com Firebase
3. Usa `protectRoute()` para redirecionar baseado no estado de autenticação
4. Dispara logins sociais (Google, GitHub)

### Fluxo de Proteção

```
┌─────────────────────────────────────────┐
│     Usuário acessa uma página           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Firebase valida    │
        │   autenticação      │
        └─────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
    ┌────────┐         ┌──────────┐
    │ Logado │         │ Não logado│
    └────┬───┘         └─────┬────┘
         │                   │
         ▼                   ▼
  ┌─────────────────┐  ┌──────────────────┐
  │ Em página de    │  │ Em página        │
  │ login/cadastro? │  │ protegida?       │
  └────┬────────────┘  └─────┬────────────┘
       │ Sim                  │ Sim
       ▼                      ▼
  Redireciona para    Redireciona para
  index.html          login.html
```

### Páginas Protegidas

As seguintes páginas requerem autenticação:
- `index.html` (página inicial)
- `home.html` (se existir)

### Páginas de Autenticação

As seguintes páginas não requerem autenticação:
- `login.html`
- `cadastro.html`

## Como está conectado

### 1. `index.html` → `auth.js`
Na tag `<script>` do index.html:
```html
<script type="module" src="assets/sistema-login/js/auth.js"></script>
```

### 2. `login.html` → `auth.js`
Na tag `<script>` do login.html:
```html
<script type="module" src="../js/auth.js"></script>
```

### 3. `cadastro.html` → `auth.js`
Na tag `<script>` do cadastro.html:
```html
<script type="module" src="../js/auth.js"></script>
```

### 4. `auth.js` → `routes.js`
Na primeira linha de auth.js:
```javascript
import {
  getCurrentPage,
  redirectTo,
  queueRedirect,
  isProtectedPage,
  isAuthPage,
  protectRoute
} from "./routes.js";
```

## Exemplo de Uso

Quando o usuário:

1. **Abre `index.html` sem estar logado:**
   - Firebase detecta que não há usuário autenticado
   - `onAuthStateChanged()` dispara com `user = null`
   - `protectRoute(false)` é chamado
   - Como `isProtectedPage()` retorna true, redireciona para `login.html`

2. **Faz login com sucesso:**
   - Firebase autentica o usuário
   - `onAuthStateChanged()` dispara com `user ≠ null`
   - `protectRoute(true)` é chamado
   - Como é página de autenticação, redireciona para `index.html`

3. **Clica em "Sair":**
   - `signOut(auth)` é chamado
   - Firebase detecta logout
   - `onAuthStateChanged()` dispara com `user = null`
   - `protectRoute(false)` redireciona para `login.html`

## Caminhos Relativos

Os caminhos são ajustados automaticamente conforme a localização:

- De `index.html` para `login.html`: `assets/sistema-login/html/login.html`
- De `assets/sistema-login/html/login.html` para `index.html`: `../../index.html`
- De `assets/sistema-login/html/login.html` para `cadastro.html`: `cadastro.html`
