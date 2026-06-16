// ── Shaders ──────────────────────────────────────────────────────────────────
const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const displayFragmentShader = `
uniform sampler2D uTopTexture;
uniform sampler2D uBottomTexture;
uniform vec2 uResolution;
uniform vec2 uTopTextureSize;
uniform vec2 uBottomTextureSize;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uEdge;
uniform float uTime;
uniform float uVelocity;

varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
}

void main() {
    vec2 topUV    = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);

    vec4 topColor    = texture2D(uTopTexture,    topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);

    vec2 pos      = vUv * uResolution;
    vec2 mousePos = uMouse * uResolution;
    float angle   = atan(pos.y - mousePos.y, pos.x - mousePos.x);

    float waveFreq        = 5.0;
    float waveAmp         = 18.0 * uVelocity;
    float wavePropagation = 2.5;

    float dist     = distance(pos, mousePos);
    float wave     = sin(angle * waveFreq - uTime * wavePropagation) * waveAmp;
    float decay    = exp(-dist * 0.005);
    float distorted = dist - wave * decay;

    float mask = 1.0 - smoothstep(uRadius - uEdge, uRadius, distorted);

    gl_FragColor = mix(topColor, bottomColor, mask);
}`;

// ── Three.js via CDN (global, nao modulo) ─────────────────────────────────────
// carregado pelo <script> no html antes deste arquivo

// ── Estado ───────────────────────────────────────────────────────────────────
const targetMouse = new THREE.Vector2(0.5, 0.5);
const smoothMouse = new THREE.Vector2(0.5, 0.5);
const prevSmooth  = new THREE.Vector2(0.5, 0.5);

let velocity = 0;
let renderer, scene, camera, displayMaterial;
let startTime = null;

// ── Helpers ──────────────────────────────────────────────────────────────────
function createPlaceholderTexture() {
    const data    = new Uint8Array([200, 200, 200, 255]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
}

function loadImage(url, slot, sizeVector) {
    const img        = new Image();
    img.crossOrigin  = 'Anonymous';
    img.onload = function() {
        sizeVector.set(img.width, img.height);
        const tex        = new THREE.Texture(img);
        tex.minFilter    = THREE.LinearFilter;
        tex.magFilter    = THREE.LinearFilter;
        tex.needsUpdate  = true;
        if (slot === 'top') {
            displayMaterial.uniforms.uTopTexture.value = tex;
        } else {
            displayMaterial.uniforms.uBottomTexture.value = tex;
        }
        console.log('Textura carregada:', url, img.width + 'x' + img.height);
    };
    img.onerror = function() {
        console.error('ERRO ao carregar imagem:', url);
    };
    img.src = url;
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) { console.error('hero-canvas nao encontrado'); return; }

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    var topSize    = new THREE.Vector2(1, 1);
    var bottomSize = new THREE.Vector2(1, 1);

    displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTopTexture:        { value: createPlaceholderTexture() },
            uBottomTexture:     { value: createPlaceholderTexture() },
            uResolution:        { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTopTextureSize:    { value: topSize    },
            uBottomTextureSize: { value: bottomSize },
            uMouse:             { value: smoothMouse },
            uRadius:            { value: 150.0 },
            uEdge:              { value: 80.0  },
            uTime:              { value: 0.0   },
            uVelocity:          { value: 0.0   },
        },
        vertexShader:   vertexShader,
        fragmentShader: displayFragmentShader,
    });

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), displayMaterial);
    scene.add(mesh);

    // ajuste o caminho das imagens conforme sua estrutura de pastas
    loadImage('./portrait_top.png',    'top',    topSize);
    loadImage('./portrait_bottom.png', 'bottom', bottomSize);

    window.addEventListener('mousemove', function(e) {
        var rect = renderer.domElement.getBoundingClientRect();
        targetMouse.x = (e.clientX - rect.left) / rect.width;
        targetMouse.y = 1 - (e.clientY - rect.top) / rect.height;
    });

    window.addEventListener('resize', function() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        displayMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    startTime = performance.now();
    animate();
}

// ── Loop ─────────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);

    // lerp suave do mouse
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.08;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.08;

    // velocidade para amplitude da onda
    var dx    = smoothMouse.x - prevSmooth.x;
    var dy    = smoothMouse.y - prevSmooth.y;
    var speed = Math.sqrt(dx * dx + dy * dy) * 600;
    velocity += (Math.min(speed, 1.0) - velocity) * 0.12;
    prevSmooth.copy(smoothMouse);

    displayMaterial.uniforms.uTime.value     = (performance.now() - startTime) / 1000;
    displayMaterial.uniforms.uVelocity.value = velocity;

    renderer.render(scene, camera);
}

// ── Aguarda DOM e Three.js carregarem ────────────────────────────────────────
window.addEventListener('load', init);