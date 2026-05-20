# 🎬 Guia de Animações - TCC VR

## ✨ O que foi implementado?

Um sistema completo de animações usando **Animate.css** + **CSS customizado** que:
- ✅ Anima elementos ao carregar as páginas
- ✅ Faz itens surgir com efeito staggered (escalonado)
- ✅ Suporta desaparecimento suave de elementos
- ✅ Funciona em todas as telas (Home, Explore, Portal, Login, Cadastro)

---

## 🚀 Animações Automáticas (já aplicadas)

### 1️⃣ **Página Home (index.html)**
- `navbar` →  fade in rápido
- `hero-content` → slide in from left
- `hero-eyebrow` → fade in com delay
- `hero-h1` → zoom in suave
- `hero-sub` → slide up
- `hero-btns` → fade in com botões em cascata
- `kpi` → fade in staggered (2 itens)
- `card-cat` → slide up staggered (3 cards)
- `hero-visual` → slide in from right
- `hero-ring` → rotação contínua suave

### 2️⃣ **Páginas Explore e Portal Interativo**
- Todos os elementos com classe `card` → slide up staggered
- Todos os elementos com classe `item` → fade in up staggered

### 3️⃣ **Páginas de Login/Cadastro**
- Todos os `input-group` → fade in up staggered
- Logo e título → fade in
- Botões → slide up

---

## 📝 Como Usar em Novos Elementos

### **Opção 1: Usar Animate.css direto**

```html
<!-- Fade in -->
<div class="animate__animated animate__fadeIn">
  Conteúdo
</div>

<!-- Slide up -->
<div class="animate__animated animate__slideInUp">
  Conteúdo
</div>

<!-- Zoom in -->
<div class="animate__animated animate__zoomIn">
  Conteúdo
</div>
```

**Classes do Animate.css disponíveis:**
- `fadeIn`, `fadeOut`
- `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`
- `zoomIn`, `zoomOut`
- `slideOutUp`, `slideOutDown`
- E muitas outras em: https://animate.style/

### **Opção 2: Usar Classes CSS Customizadas**

```html
<!-- Cards - animate automaticamente (fade in up staggered) -->
<div class="card">Cartão 1</div>
<div class="card">Cartão 2</div>
<div class="card">Cartão 3</div>

<!-- Items - animate automaticamente -->
<div class="item">Item 1</div>
<div class="item">Item 2</div>

<!-- Inputs de formulário -->
<div class="input-group">
  <label>Email</label>
  <input type="email">
</div>
```

### **Opção 3: Adicionar Delays Customizados**

```html
<div class="animate__animated animate__fadeIn" style="animation-delay: 0.2s;">
  Fade in com 0.2s de delay
</div>

<div class="animate__animated animate__slideInUp" style="animation-delay: 0.4s;">
  Slide up com 0.4s de delay
</div>
```

---

## 🎯 Fazer Elemento Desaparecer

Aplique a classe `fade-out` quando quiser animar um elemento saindo:

```javascript
// Remover elemento com animação
const element = document.querySelector('.meu-elemento');
element.classList.add('fade-out');

// Aguardar a animação terminar e remover do DOM
setTimeout(() => {
  element.remove();
}, 400); // 400ms = duração do fade-out
```

---

## ⚙️ Personalizar Velocidade de Animações

No `animations.css`, ajuste a `duration`:

```css
.meu-elemento {
  animation: fadeIn 0.6s ease-in-out; /* Mude 0.6s para sua duração */
}
```

**Velocidades recomendadas:**
- Rápido: `0.3s` - `0.4s`
- Normal: `0.5s` - `0.7s`
- Lento: `0.8s` - `1s`

---

## 📊 Estrutura de Arquivo

```
c:\Users\igorg\Downloads\Tcc\
├── animations.css          ← Arquivo NOVO com todas as animações
├── index.html              ← Atualizado
├── index.css
├── assets/
│   ├── pagina-principal/
│   │   ├── html/
│   │   │   ├── explore.html          ← Atualizado
│   │   │   ├── portal_interativo.html ← Atualizado
│   │   │   └── tecnologias.html
│   │   └── css/
│   └── sistema-login/
│       ├── html/
│       │   ├── login.html   ← Atualizado
│       │   └── cadastro.html ← Atualizado
│       └── css/
```

---

## 🎨 Efeitos de Hover (bônus)

Todos os `.card`, `.card-cat` e `.btn` têm efeito hover:

```css
.card:hover,
.card-cat:hover {
  transform: translateY(-8px);  /* Sobe 8px */
  transition: all 0.3s ease-out;
}
```

---

## 🔄 Duração Total de Animações

- **Navbar**: 0.6s (começa imediatamente)
- **Hero content**: 0.8s
- **Todos elementos Hero**: até 0.9s total
- **Cards categoria**: 0.6s cada (delays até 0.9s)

**Total até tudo acabado: ~1.8s**

---

## ❓ Dúvidas Comuns

### "Como adiciono animação a um novo card?"
R: Basta adicionar a classe `card` ao elemento. As animações são aplicadas automaticamente via CSS.

### "Como mudo a velocidade de uma animação?"
R: Edite `animations.css` e altere o valor de `animation: fadeIn 0.6s` para o tempo desejado.

### "Como deixo um elemento estático (sem animar)?"
R: Não adicione a classe de animação. Ou remova do `animations.css` se está herdando.

### "Posso combinar múltiplas animações?"
R: Sim! Use JavaScript ou CSS:
```html
<div class="animate__animated animate__fadeIn animate__slower">
  Fade in mais lento
</div>
```

---

## 🎭 Classes Adicionais do Animate.css

```html
<!-- Velocidade -->
<div class="animate__animated animate__fadeIn animate__faster">Fast</div>
<div class="animate__animated animate__fadeIn animate__slow">Slow</div>
<div class="animate__animated animate__fadeIn animate__slower">Slower</div>

<!-- Repetição -->
<div class="animate__animated animate__infinite animate__pulse">Pulse infinito</div>
```

---

## 📚 Referências

- **Animate.css Docs**: https://animate.style/
- **MDN Web Docs - CSS Animations**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- **Seu arquivo local**: `animations.css`

---

**Criado em:** 23 de Abril de 2026  
**Para:** Projeto TCC VR
