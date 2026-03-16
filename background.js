const existingCanvas = document.getElementById("bg-animation");
const canvas = existingCanvas || document.createElement("canvas");

if (!existingCanvas) {
  canvas.id = "bg-animation";
  document.body.prepend(canvas);
}

const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const stars = [];
const STAR_COUNT = 140;

for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.8 + 0.4,
    speedX: (Math.random() - 0.5) * 0.12,
    speedY: (Math.random() - 0.5) * 0.12,
    opacity: Math.random() * 0.8 + 0.2,
    twinkleSpeed: Math.random() * 0.02 + 0.005
  });
}

function drawGalaxyFog(time) {
  const t = time * 0.00015;

  const grad1 = ctx.createRadialGradient(
    canvas.width * (0.22 + Math.sin(t) * 0.03),
    canvas.height * (0.28 + Math.cos(t) * 0.02),
    0,
    canvas.width * 0.22,
    canvas.height * 0.28,
    canvas.width * 0.45
  );
  grad1.addColorStop(0, "rgba(5, 3, 36, 0.56)");
  grad1.addColorStop(0.35, "rgba(37, 0, 122, 0.44)");
  grad1.addColorStop(1, "rgba(0, 0, 0, 0)");

  const grad2 = ctx.createRadialGradient(
    canvas.width * (0.76 + Math.cos(t * 1.2) * 0.025),
    canvas.height * (0.22 + Math.sin(t * 1.1) * 0.03),
    0,
    canvas.width * 0.76,
    canvas.height * 0.22,
    canvas.width * 0.42
  );
  grad2.addColorStop(0, "rgba(214, 66, 255, 0.22)");
  grad2.addColorStop(0.38, "rgba(48, 19, 87, 0)");
  grad2.addColorStop(1, "rgba(0, 0, 0, 0.9)");

  const grad3 = ctx.createRadialGradient(
    canvas.width * (0.55 + Math.sin(t * 0.8) * 0.02),
    canvas.height * (0.72 + Math.cos(t * 0.9) * 0.025),
    0,
    canvas.width * 0.55,
    canvas.height * 0.72,
    canvas.width * 0.5
  );
  grad3.addColorStop(0, "rgba(66, 182, 255, 0.12)");
  grad3.addColorStop(0.35, "rgba(66, 108, 255, 0.08)");
  grad3.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = grad3;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars(time) {
  for (const star of stars) {
    star.x += star.speedX;
    star.y += star.speedY;

    if (star.x < 0) star.x = canvas.width;
    if (star.x > canvas.width) star.x = 0;
    if (star.y < 0) star.y = canvas.height;
    if (star.y > canvas.height) star.y = 0;

    const twinkle = 0.65 + Math.sin(time * star.twinkleSpeed + star.x) * 0.35;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.opacity * twinkle})`;
    ctx.fill();
  }
}

function animate(time = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGalaxyFog(time);
  drawStars(time);

  requestAnimationFrame(animate);
}

animate();