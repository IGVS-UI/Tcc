document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.typewriter');

  function typeText(el, text, delay = 40) {
    return new Promise((resolve) => {
      el.innerHTML = '';
      let i = 0;
      const interval = setInterval(() => {
        const ch = text.charAt(i);
        if (ch === '\n') {
          el.appendChild(document.createElement('br'));
        } else {
          el.append(document.createTextNode(ch));
        }
        i++;
        if (i > text.length - 1) {
          clearInterval(interval);
          setTimeout(resolve, 250);
        }
      }, delay);
    });
  }

  (async () => {
    for (const el of elements) {
      const text = el.getAttribute('data-text') || el.textContent.trim();
      await typeText(el, text);
    }
  })();
});