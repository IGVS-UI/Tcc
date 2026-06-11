import * as THREE from "three";
import {
vertexShader,
fluidFragmentShader,
displayFragmentShader,
} from "./shaders.js";

window.addEventListener("load", init);

function init(){
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({
canvas,
antialias: true,
precision: "highp",
})

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const mouse = new THREE.Vector2(0.5,0.5);
const prevMouse = new THREE.Vector2(0.5, 0.5);
let isMoving = false;
let lastMoveTime = 0;
let mouseInCanvas = false;


const size = 500;
const pingPongTargets = [
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

let currentTarget = 0;

const topTexture = createPlaceholderTexture("#0000ff");
const bottomTexture = createPlaceholderTexture("#ff0000");

const topTextureSize = new THREE.Vector2(1, 1);
const bottomTextureSize = new THREE.Vector2(1, 1);


const trailsMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPrevTrails : {value:nue},
        uMouse : { value:mouse },
        uPrevmouse : {value: prevMouse},
        uResolution: {value: new THREE.Vector2(size,size)},
        uDecay:{ value:0.97},
        uIsMoving : {value:false},

    },
    vertexShader,
    fragmentShader:fluidFragmentShader,
})

}