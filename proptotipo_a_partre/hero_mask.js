// =============================================================================
// hero_mask.js — Efeito máscara com trail fluido (ping-pong) + onda suave
// Inspirado no tutorial, corrigido e integrado ao projeto principal
// Não usa ES modules — THREE vem do CDN global no HTML
// =============================================================================

// ── VERTEX SHADER ─────────────────────────────────────────────────────────────
var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '    vUv = uv;',
    '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
].join('\n');

// ── FLUID SHADER (ping-pong): desenha o trail do mouse e decai ────────────────
var fluidFragmentShader = [
    'uniform sampler2D uPrevTrails;',
    'uniform vec2 uMouse;',
    'uniform vec2 uPrevMouse;',
    'uniform vec2 uResolution;',
    'uniform float uDecay;',
    'uniform bool uIsMoving;',
    'varying vec2 vUv;',

    'void main() {',
    '    vec4 prevState = texture2D(uPrevTrails, vUv);',
    '    float newValue = prevState.r * uDecay;',

    '    if (uIsMoving) {',
    '        vec2 mouseDir = uMouse - uPrevMouse;',
    '        float lineLen = length(mouseDir);',

    '        if (lineLen > 0.0005) {',
    '            vec2 dir = mouseDir / lineLen;',
    '            vec2 toPixel = vUv - uPrevMouse;',
    '            float proj = clamp(dot(toPixel, dir), 0.0, lineLen);',
    '            vec2 closest = uPrevMouse + proj * dir;',
    '            float dist = length(vUv - closest);',
    '            float intensity = smoothstep(0.08, 0.0, dist) * 0.35;',
    '            newValue += intensity;',
    '        }',
    '    }',

    '    newValue = clamp(newValue, 0.0, 1.0);',
    '    gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);',
    '}'
].join('\n');

// ── DISPLAY SHADER: mistura as duas texturas usando o fluid como máscara ──────
var displayFragmentShader = [
    'uniform sampler2D uFluid;',
    'uniform sampler2D uTopTexture;',
    'uniform sampler2D uBottomTexture;',
    'uniform vec2 uResolution;',
    'uniform vec2 uTopTextureSize;',
    'uniform vec2 uBottomTextureSize;',
    'uniform float uTime;',
    'uniform float uVelocity;',
    'varying vec2 vUv;',

    'vec2 getCoverUV(vec2 uv, vec2 tSize) {',
    '    if (tSize.x < 1.0 || tSize.y < 1.0) return uv;',
    '    vec2 s = uResolution / tSize;',
    '    float scale = max(s.x, s.y);',
    '    vec2 scaledSize = tSize * scale;',
    '    vec2 offset = (uResolution - scaledSize) * 0.5;',
    '    return (uv * uResolution - offset) / scaledSize;',
    '}',

    'void main() {',
    '    float fluid = texture2D(uFluid, vUv).r;',

    // onda radial na borda da máscara
    '    vec2 pos = vUv * uResolution;',
    '    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);',
    '    float wave = sin(angle * 6.0 - uTime * 3.0) * 0.012 * uVelocity;',
    '    float fluidWaved = fluid + wave * fluid * (1.0 - fluid) * 4.0;',

    '    vec2 topUV    = getCoverUV(vUv, uTopTextureSize);',
    '    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);',

    '    vec4 topColor    = texture2D(uTopTexture,    topUV);',
    '    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);',

    '    float t = smoothstep(0.01, 0.06, fluidWaved);',
    '    gl_FragColor = mix(topColor, bottomColor, t);',
    '}'
].join('\n');

// ── ESTADO ────────────────────────────────────────────────────────────────────
var mouse     = new THREE.Vector2(0.5, 0.5);
var prevMouse = new THREE.Vector2(0.5, 0.5);

// lerp suave
var targetMouse = new THREE.Vector2(0.5, 0.5);
var smoothMouse = new THREE.Vector2(0.5, 0.5);
var prevSmooth  = new THREE.Vector2(0.5, 0.5);
var velocity    = 0;

var isMoving       = false;
var lastMoveTime   = 0;
var currentTarget  = 0;
var startTime      = null;

var renderer, scene, camera;
var trailsMaterial, displayMaterial;
var simScene, simCamera;
var pingPongTargets = [];

// ── PLACEHOLDER TEXTURE ───────────────────────────────────────────────────────
function createPlaceholder() {
    var data    = new Uint8Array([0, 0, 0, 255]);
    var tex     = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
}

// ── CARREGAR IMAGEM ───────────────────────────────────────────────────────────
function loadImage(url, slot, sizeVec) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        sizeVec.set(img.width, img.height);
        var tex         = new THREE.Texture(img);
        tex.minFilter   = THREE.LinearFilter;
        tex.magFilter   = THREE.LinearFilter;
        tex.needsUpdate = true;
        if (slot === 'top') {
            displayMaterial.uniforms.uTopTexture.value = tex;
        } else {
            displayMaterial.uniforms.uBottomTexture.value = tex;
        }
        console.log('OK carregou:', url, img.width + 'x' + img.height);
    };
    img.onerror = function () {
        console.error('ERRO ao carregar:', url);
    };
    img.src = url;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) { console.error('hero-canvas nao encontrado'); return; }

    // renderer principal
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // cena de display
    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // cena de simulacao (ping-pong)
    simScene  = new THREE.Scene();
    simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ping-pong render targets
    var SIM = 512;
    pingPongTargets = [
        new THREE.WebGLRenderTarget(SIM, SIM, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format:    THREE.RGBAFormat,
            type:      THREE.FloatType,
        }),
        new THREE.WebGLRenderTarget(SIM, SIM, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format:    THREE.RGBAFormat,
            type:      THREE.FloatType,
        }),
    ];

    // limpar targets
    renderer.setRenderTarget(pingPongTargets[0]); renderer.clear();
    renderer.setRenderTarget(pingPongTargets[1]); renderer.clear();
    renderer.setRenderTarget(null);

    var topSize    = new THREE.Vector2(1, 1);
    var bottomSize = new THREE.Vector2(1, 1);

    // material de simulação de fluido
    trailsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uPrevTrails: { value: createPlaceholder() },
            uMouse:      { value: mouse      },
            uPrevMouse:  { value: prevMouse  },
            uResolution: { value: new THREE.Vector2(SIM, SIM) },
            uDecay:      { value: 0.965 },
            uIsMoving:   { value: false  },
        },
        vertexShader:   vertexShader,
        fragmentShader: fluidFragmentShader,
    });

    // material de display
    displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uFluid:             { value: createPlaceholder() },
            uTopTexture:        { value: createPlaceholder() },
            uBottomTexture:     { value: createPlaceholder() },
            uResolution:        { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTopTextureSize:    { value: topSize    },
            uBottomTextureSize: { value: bottomSize },
            uTime:              { value: 0.0 },
            uVelocity:          { value: 0.0 },
        },
        vertexShader:   vertexShader,
        fragmentShader: displayFragmentShader,
    });

    // mesh de simulacao
    var simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailsMaterial);
    simScene.add(simMesh);

    // mesh de display
    var displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), displayMaterial);
    scene.add(displayMesh);

    // imagens — caminho relativo a partir de proptotipo_a_partre/
    loadImage('../img/portrait_top.png',    'top',    topSize);
    loadImage('../img/portrait_bottom.png', 'bottom', bottomSize);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize',    onResize);

    startTime = performance.now();
    animate();
}

// ── EVENTOS ───────────────────────────────────────────────────────────────────
function onMouseMove(e) {
    var rect = renderer.domElement.getBoundingClientRect();

    // lerp target
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = 1 - (e.clientY - rect.top) / rect.height;

    isMoving     = true;
    lastMoveTime = performance.now();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    displayMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

// ── LOOP ──────────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);

    var now     = performance.now();
    var elapsed = (now - startTime) / 1000;

    // para o isMoving apos 80ms sem movimento
    if (isMoving && now - lastMoveTime > 80) {
        isMoving = false;
    }

    // lerp suave do mouse (0.08 = fluido; 0.15 = mais rapido)
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.08;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.08;

    // velocidade para amplitude da onda
    var dx    = smoothMouse.x - prevSmooth.x;
    var dy    = smoothMouse.y - prevSmooth.y;
    var speed = Math.sqrt(dx * dx + dy * dy) * 500;
    velocity += (Math.min(speed, 1.0) - velocity) * 0.1;
    prevSmooth.copy(smoothMouse);

    // atualiza uniforms do trail
    var prev = pingPongTargets[1 - currentTarget];
    var curr = pingPongTargets[currentTarget];

    trailsMaterial.uniforms.uPrevTrails.value    = prev.texture;
    trailsMaterial.uniforms.uMouse.value.copy(smoothMouse);
    trailsMaterial.uniforms.uPrevMouse.value.copy(prevMouse);
    trailsMaterial.uniforms.uIsMoving.value      = isMoving;
    prevMouse.copy(smoothMouse);

    // renderiza simulacao de fluido no render target
    renderer.setRenderTarget(curr);
    renderer.render(simScene, simCamera);

    // usa resultado como mascara no display
    displayMaterial.uniforms.uFluid.value        = curr.texture;
    displayMaterial.uniforms.uTime.value         = elapsed;
    displayMaterial.uniforms.uVelocity.value     = velocity;

    // renderiza cena final na tela
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    currentTarget = 1 - currentTarget;
}

// ── START ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', init);