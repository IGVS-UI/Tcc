import {
    vertexShader,
    fluidFragmentShader,
    displayFragmentShader,
} from "./shaders.js";

let renderer, scene, camera, mouse, prevMouse;
let trailsTexture;
let pingPongTargets = [];
let currentTarget = 0;

window.addEventListener("load", init);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseenter", onMouseEnter);
window.addEventListener("mouseleave", onMouseLeave);
window.addEventListener("resize", onWindowResize);

function init() {
    const canvas = document.querySelector("canvas");
    
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        precision: "highp",
        alpha: true,
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    mouse = new THREE.Vector2(0.5, 0.5);
    prevMouse = new THREE.Vector2(0.5, 0.5);
    
    const size = 500;
    
    // Criar ping-pong targets para simular trails
    pingPongTargets = [
        new THREE.WebGLRenderTarget(size, size, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        }),
        new THREE.WebGLRenderTarget(size, size, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
        }),
    ];
    
    // Carregar texturas das imagens
    const textureLoader = new THREE.TextureLoader();
    
    let topTexture = null;
    let bottomTexture = null;
    let topTextureSize = new THREE.Vector2(1, 1);
    let bottomTextureSize = new THREE.Vector2(1, 1);
    
    // Carregar imagens
    textureLoader.load("portrait_top.png", (texture) => {
        topTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        topTextureSize.set(texture.image.width, texture.image.height);
    });
    
    textureLoader.load("portrait_bottom.png", (texture) => {
        bottomTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        bottomTextureSize.set(texture.image.width, texture.image.height);
    });
    
    // Material para simular trails (fluid simulation)
    const trailsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uPrevTrails: { value: null },
            uMouse: { value: mouse },
            uPrevMouse: { value: prevMouse },
            uResolution: { value: new THREE.Vector2(size, size) },
            uDecay: { value: 0.97 },
            uIsMoving: { value: false },
        },
        vertexShader,
        fragmentShader: fluidFragmentShader,
    });
    
    // Material para exibir resultado final
    const displayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uFluid: { value: null },
            uTopTexture: { value: topTexture },
            uBottomTexture: { value: bottomTexture },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uDpr: { value: renderer.getPixelRatio() },
            uTopTextureSize: { value: topTextureSize },
            uBottomTextureSize: { value: bottomTextureSize },
        },
        vertexShader,
        fragmentShader: displayFragmentShader,
    });
    
    // Geometria de tela cheia
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const trailsMesh = new THREE.Mesh(geometry, trailsMaterial);
    const displayMesh = new THREE.Mesh(geometry, displayMaterial);
    
    scene.add(displayMesh);
    
    let mouseMoving = false;
    let mouseTimeout;
    
    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) / rect.width;
        mouse.y = 1 - (event.clientY - rect.top) / rect.height;
        
        mouseMoving = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            mouseMoving = false;
        }, 100);
        
        prevMouse.copy(mouse);
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Atualizar uniforms
        trailsMaterial.uniforms.uIsMoving.value = mouseMoving;
        trailsMaterial.uniforms.uPrevTrails.value = pingPongTargets[1 - currentTarget].texture;
        
        // Renderizar trails para o target atual
        renderer.setRenderTarget(pingPongTargets[currentTarget]);
        renderer.render(scene, camera, pingPongTargets[currentTarget]);
        
        // Atualizar material de exibição com o resultado dos trails
        displayMaterial.uniforms.uFluid.value = pingPongTargets[currentTarget].texture;
        displayMaterial.uniforms.uTopTexture.value = topTexture;
        displayMaterial.uniforms.uBottomTexture.value = bottomTexture;
        
        // Renderizar para tela
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        
        // Alternar entre targets (ping-pong)
        currentTarget = 1 - currentTarget;
    }
    
    animate();
}

function onMouseMove(event) {
    const canvas = document.querySelector("canvas");
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / rect.width;
    mouse.y = 1 - (event.clientY - rect.top) / rect.height;
}

function onMouseEnter() {
    // Opcional: resetar quando mouse entra
}

function onMouseLeave() {
    // Opcional: resetar quando mouse sai
}

function onWindowResize() {
    if (!renderer) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    renderer.setSize(width, height);
    
    if (scene.children.length > 0) {
        const mesh = scene.children[0];
        if (mesh.material && mesh.material.uniforms.uResolution) {
            mesh.material.uniforms.uResolution.value.set(width, height);
        }
    }
}