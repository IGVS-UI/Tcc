// =============================================================================
// hero_mask.js — Efeito máscara com trail fluido
// Corrigido: HalfFloatType com fallback, canvas fullscreen via position:fixed
// =============================================================================

// ── VERTEX SHADER ─────────────────────────────────────────────────────────────
var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '    vUv = uv;',
    '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
].join('\n');

// ── FLUID SHADER (ping-pong) ──────────────────────────────────────────────────
var fluidFragmentShader = [
    'uniform sampler2D uPrevTrails;',
    'uniform vec2 uMouse;',
    'uniform vec2 uPrevMouse;',
    'uniform float uDecay;',
    'uniform bool uIsMoving;',
    'varying vec2 vUv;',

    'void main() {',
    '    float prev = texture2D(uPrevTrails, vUv).r;',
    '    float val  = prev * uDecay;',

    '    if (uIsMoving) {',
    '        vec2 dir = uMouse - uPrevMouse;',
    '        float len = length(dir);',
    '        if (len > 0.0003) {',
    '            vec2 d = dir / len;',
    '            vec2 toP = vUv - uPrevMouse;',
    '            float proj = clamp(dot(toP, d), 0.0, len);',
    '            float dist = length(vUv - (uPrevMouse + proj * d));',
    '            val += smoothstep(0.07, 0.0, dist) * 0.4;',
    '        }',
    '    }',

    '    gl_FragColor = vec4(clamp(val, 0.0, 1.0), 0.0, 0.0, 1.0);',
    '}'
].join('\n');

// ── DISPLAY SHADER ────────────────────────────────────────────────────────────
var displayFragmentShader = [
    'uniform sampler2D uFluid;',
    'uniform sampler2D uTopTexture;',
    'uniform sampler2D uBottomTexture;',
    'uniform vec2 uResolution;',
    'uniform vec2 uTopTextureSize;',
    'uniform vec2 uBottomTextureSize;',
    'uniform vec2 uRefSize;',
    'uniform float uTime;',
    'uniform float uVelocity;',
    'varying vec2 vUv;',

    // Converte uv usando tamanho de referencia comum para alinhar as duas imagens
    'vec2 alignedUV(vec2 uv, vec2 texSize, vec2 refSize, vec2 resolution) {',
    '    vec2 sRef = resolution / refSize;',
    '    float scRef = max(sRef.x, sRef.y);',
    '    vec2 refScaled = refSize * scRef;',
    '    vec2 offset = (resolution - refScaled) * 0.5;',
    '    vec2 pixRef = uv * resolution - offset;',
    '    vec2 sTex = resolution / texSize;',
    '    float scTex = max(sTex.x, sTex.y);',
    '    return pixRef / (texSize * scTex);',
    '}',

    'void main() {',
    '    float fluid = texture2D(uFluid, vUv).r;',

    '    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);',
    '    float wave  = sin(angle * 5.0 - uTime * 2.5) * 0.015 * uVelocity;',
    '    fluid = fluid + wave * fluid * (1.0 - fluid) * 3.0;',

    '    vec2 topUV    = alignedUV(vUv, uTopTextureSize,    uRefSize, uResolution);',
    '    vec2 bottomUV = alignedUV(vUv, uBottomTextureSize, uRefSize, uResolution);',

    '    vec4 top    = texture2D(uTopTexture,    topUV);',
    '    vec4 bottom = texture2D(uBottomTexture, bottomUV);',

    '    float t = smoothstep(0.01, 0.07, fluid);',
    '    gl_FragColor = mix(top, bottom, t);',
    '}'
].join('\n');

// ── ESTADO ────────────────────────────────────────────────────────────────────
var targetMouse = { x: 0.5, y: 0.5 };
var smoothMouse = { x: 0.5, y: 0.5 };
var prevMouse   = { x: 0.5, y: 0.5 };
var prevSmooth  = { x: 0.5, y: 0.5 };
var velocity    = 0;
var isMoving    = false;
var lastMove    = 0;
var currentTarget = 0;
var startTime   = null;

var renderer, scene, camera, simScene, simCamera;
var trailsMaterial, displayMaterial;
var pingPong = [];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function placeholder() {
    var d = new Uint8Array([0, 0, 0, 255]);
    var t = new THREE.DataTexture(d, 1, 1, THREE.RGBAFormat);
    t.needsUpdate = true;
    return t;
}

var loadedCount = 0;

function loadImg(url, slot, sv, refSz) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        sv.set(img.width, img.height);
        var t = new THREE.Texture(img);
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.needsUpdate = true;
        displayMaterial.uniforms[slot === 'top' ? 'uTopTexture' : 'uBottomTexture'].value = t;
        console.log('Carregou:', url, img.width + 'x' + img.height);

        loadedCount++;
        if (loadedCount === 2) {
            // usa o maior tamanho como referencia para alinhar as duas
            var topSz = displayMaterial.uniforms.uTopTextureSize.value;
            var botSz = displayMaterial.uniforms.uBottomTextureSize.value;
            var rw = Math.max(topSz.x, botSz.x);
            var rh = Math.max(topSz.y, botSz.y);
            refSz.set(rw, rh);
            console.log('RefSize calculado:', rw + 'x' + rh);
        }
    };
    img.onerror = function() { console.error('Erro:', url); };
    img.src = url;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) { console.error('hero-canvas nao encontrado'); return; }

    var HEADER_H = 80; // mesma altura do top no CSS

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight - HEADER_H);

    scene     = new THREE.Scene();
    camera    = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    simScene  = new THREE.Scene();
    simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // --- FIX CRITICO: usar HalfFloatType com fallback para UnsignedByteType ---
    var SIM  = 512;
    var fType = THREE.HalfFloatType;

    // testa se HalfFloat e suportado
    var testTarget = null;
    try {
        testTarget = new THREE.WebGLRenderTarget(2, 2, {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat
        });
        renderer.setRenderTarget(testTarget);
        renderer.clear();
        renderer.setRenderTarget(null);
    } catch(e) {
        fType = THREE.UnsignedByteType;
        console.warn('HalfFloat nao suportado, usando UnsignedByte');
    }
    if (testTarget) testTarget.dispose();

    var rtOpts = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format:    THREE.RGBAFormat,
        type:      fType,
    };

    pingPong = [
        new THREE.WebGLRenderTarget(SIM, SIM, rtOpts),
        new THREE.WebGLRenderTarget(SIM, SIM, rtOpts),
    ];

    renderer.setRenderTarget(pingPong[0]); renderer.clear();
    renderer.setRenderTarget(pingPong[1]); renderer.clear();
    renderer.setRenderTarget(null);

    var topSz  = new THREE.Vector2(1, 1);
    var botSz  = new THREE.Vector2(1, 1);

    trailsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uPrevTrails: { value: placeholder() },
            uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
            uPrevMouse:  { value: new THREE.Vector2(0.5, 0.5) },
            uDecay:      { value: 0.96 },
            uIsMoving:   { value: false },
        },
        vertexShader:   vertexShader,
        fragmentShader: fluidFragmentShader,
    });

    var refSz = new THREE.Vector2(1, 1); // calculado quando as duas imagens carregarem

    displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uFluid:             { value: placeholder() },
            uTopTexture:        { value: placeholder() },
            uBottomTexture:     { value: placeholder() },
            uResolution:        { value: new THREE.Vector2(window.innerWidth, window.innerHeight - HEADER_H) },
            uTopTextureSize:    { value: topSz },
            uBottomTextureSize: { value: botSz },
            uRefSize:           { value: refSz },
            uTime:              { value: 0.0 },
            uVelocity:          { value: 0.0 },
        },
        vertexShader:   vertexShader,
        fragmentShader: displayFragmentShader,
    });

    var geo = new THREE.PlaneGeometry(2, 2);
    simScene.add(new THREE.Mesh(geo, trailsMaterial));
    scene.add(new THREE.Mesh(geo, displayMaterial));

    loadImg('../img/portrait_top.png',    'top',    topSz, refSz);
    loadImg('../img/portrait_bottom.png', 'bottom', botSz, refSz);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize',    onResize);

    startTime = performance.now();
    animate();
    console.log('hero_mask iniciado, tipo de textura:', fType === THREE.HalfFloatType ? 'HalfFloat' : 'UnsignedByte');
}

// ── EVENTOS ───────────────────────────────────────────────────────────────────
function onMove(e) {
    var r = renderer.domElement.getBoundingClientRect();
    targetMouse.x = (e.clientX - r.left) / r.width;
    targetMouse.y = 1 - (e.clientY - r.top)  / r.height;
    isMoving  = true;
    lastMove  = performance.now();
}

function onResize() {
    var HEADER_H = 80;
    renderer.setSize(window.innerWidth, window.innerHeight - HEADER_H);
    displayMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight - HEADER_H);
}

// ── LOOP ──────────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();
    if (isMoving && now - lastMove > 80) isMoving = false;

    // lerp mouse
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.08;
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.08;

    // velocidade
    var dx = smoothMouse.x - prevSmooth.x;
    var dy = smoothMouse.y - prevSmooth.y;
    velocity += (Math.min(Math.sqrt(dx*dx + dy*dy) * 500, 1.0) - velocity) * 0.1;
    prevSmooth.x = smoothMouse.x;
    prevSmooth.y = smoothMouse.y;

    // ping-pong
    var prev = pingPong[1 - currentTarget];
    var curr = pingPong[currentTarget];

    trailsMaterial.uniforms.uPrevTrails.value.needsUpdate = false;
    trailsMaterial.uniforms.uPrevTrails.value = prev.texture;
    trailsMaterial.uniforms.uMouse.value.set(smoothMouse.x, smoothMouse.y);
    trailsMaterial.uniforms.uPrevMouse.value.set(prevMouse.x, prevMouse.y);
    trailsMaterial.uniforms.uIsMoving.value = isMoving;

    prevMouse.x = smoothMouse.x;
    prevMouse.y = smoothMouse.y;

    renderer.setRenderTarget(curr);
    renderer.render(simScene, simCamera);

    displayMaterial.uniforms.uFluid.value    = curr.texture;
    displayMaterial.uniforms.uTime.value     = (now - startTime) / 1000;
    displayMaterial.uniforms.uVelocity.value = velocity;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    currentTarget = 1 - currentTarget;
}

window.addEventListener('load', init);