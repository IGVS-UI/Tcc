import {
    vertexShader,
    fluidFragmentShader,
    displayFragmentShader,
} from "./shaders.js";

let renderer, scene, camera, mouse, prevMouse;
let pingPongTargets = [];
let currentTarget = 0;
let isReady = false;

window.addEventListener("load", init);

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
    renderer.setClearColor(0x1a1a1a, 1);
    
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    mouse = new THREE.Vector2(0.5, 0.5);
    prevMouse = new THREE.Vector2(0.5, 0.5);
    
    const size = 512;
    
    // Criar ping-pong targets
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
    
    // Carregar texturas
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;
    let topTexture = null;
    let bottomTexture = null;
    let topTextureSize = new THREE.Vector2(1, 1);
    let bottomTextureSize = new THREE.Vector2(1, 1);
    
    const onTexturesLoaded = () => {
        if (loadedCount !== 2) return;
        
        // Criar materiais APÓS texturas carregarem
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
        
        const geometry = new THREE.PlaneGeometry(2, 2);
        const displayMesh = new THREE.Mesh(geometry, displayMaterial);
        scene.add(displayMesh);
        
        let mouseMoving = false;
        let mouseTimeout;
        
        window.addEventListener("mousemove", (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            prevMouse.copy(mouse);
            mouse.x = (event.clientX - rect.left) / rect.width;
            mouse.y = 1 - (event.clientY - rect.top) / rect.height;
            
            mouseMoving = true;
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                mouseMoving = false;
            }, 100);
            
            trailsMaterial.uniforms.uIsMoving.value = mouseMoving;
        });
        
        window.addEventListener("resize", () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            renderer.setSize(width, height);
            displayMaterial.uniforms.uResolution.value.set(width, height);
        });
        
        isReady = true;
        animate(trailsMaterial, displayMaterial, displayMesh);
    };
    
    textureLoader.load("1781186601225_portrait_top.png", (texture) => {
        topTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        topTextureSize.set(texture.image.width, texture.image.height);
        console.log("✓ Imagem TOP carregada:", texture.image.width, "x", texture.image.height);
        loadedCount++;
        onTexturesLoaded();
    }, undefined, (error) => {
        console.error("✗ Erro carregando portrait_top:", error);
    });
    
    textureLoader.load("1781186601224_portrait_bottom.png", (texture) => {
        bottomTexture = texture;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        bottomTextureSize.set(texture.image.width, texture.image.height);
        console.log("✓ Imagem BOTTOM carregada:", texture.image.width, "x", texture.image.height);
        loadedCount++;
        onTexturesLoaded();
    }, undefined, (error) => {
        console.error("✗ Erro carregando portrait_bottom:", error);
    });
}

function animate(trailsMaterial, displayMaterial, displayMesh) {
    requestAnimationFrame(() => animate(trailsMaterial, displayMaterial, displayMesh));
    
    if (!isReady) return;
    
    const size = 512;
    
    // Renderizar simulation de trails
    trailsMaterial.uniforms.uPrevTrails.value = pingPongTargets[1 - currentTarget].texture;
    
    const tempScene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const trailsMesh = new THREE.Mesh(geometry, trailsMaterial);
    tempScene.add(trailsMesh);
    
    const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    renderer.setRenderTarget(pingPongTargets[currentTarget]);
    renderer.render(tempScene, tempCamera);
    
    // Atualizar o resultado para o display
    displayMaterial.uniforms.uFluid.value = pingPongTargets[currentTarget].texture;
    
    // Renderizar resultado final
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    
    currentTarget = 1 - currentTarget;
}