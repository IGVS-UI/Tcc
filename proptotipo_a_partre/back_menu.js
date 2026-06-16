const canvas = document.getElementById('wc');
const ctx = canvas.getContext('2d');
const menuOverlay = document.getElementById('menu-overlay');

function resize() {
    // força dimensoes fisicas do canvas usando a janela (menu e fullscreen)
    canvas.width  = window.innerWidth  * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
}

const BG     = '#2a2632';
const STROKE = 'rgba(190,178,215,0.18)';

const bands = Array.from({ length: 14 }, () => ({
    amp:    28  + Math.random() * 55,
    wl:     520 + Math.random() * 600,
    speed:  0.00012 + Math.random() * 0.00018,
    phase:  Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    speedY: 0.00006 + Math.random() * 0.0001,
}));

let t = 0, last = null, animId = null;

function draw(ts) {
    if (!menuOverlay.classList.contains('active')) {
        cancelAnimationFrame(animId);
        animId = null;
        last   = null;
        return;
    }

    if (!last) last = ts;
    const dt = ts - last;
    last = ts;
    t   += dt;

    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    bands.forEach((b, i) => {
        const yCenter = (h / (bands.length - 1)) * i;
        const yDrift  = Math.sin(t * b.speedY + b.phaseY) * 18;

        ctx.beginPath();
        ctx.strokeStyle = STROKE;
        ctx.lineWidth   = 1;

        const steps = Math.ceil(w / 4);
        for (let s = 0; s <= steps; s++) {
            const x = (w / steps) * s;
            const y = yCenter + yDrift
                + Math.sin(x / b.wl       * Math.PI * 2 + t * b.speed          + b.phase)        * b.amp
                + Math.sin(x / (b.wl*0.6) * Math.PI * 2 + t * b.speed * 1.3   + b.phase * 1.7)  * b.amp * 0.3
                + Math.sin(x / (b.wl*1.7) * Math.PI * 2 - t * b.speed * 0.7   + b.phase * 0.5)  * b.amp * 0.15;
            s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    animId = requestAnimationFrame(draw);
}

function startWave() {
    if (animId) return;
    // aguarda o proximo frame para o display:flex ja estar ativo
    requestAnimationFrame(() => {
        resize();
        last   = null;
        animId = requestAnimationFrame(draw);
    });
}

const observer = new MutationObserver(() => {
    if (menuOverlay.classList.contains('active')) {
        startWave();
    }
});

observer.observe(menuOverlay, { attributes: true, attributeFilter: ['class'] });

window.addEventListener('resize', () => {
    if (menuOverlay.classList.contains('active')) resize();
});