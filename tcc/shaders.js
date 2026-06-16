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
    vec2 topUV = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);

    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);

    // distancia do pixel ate o mouse, em pixels da tela
    vec2 pos = vUv * uResolution;
    vec2 mousePos = uMouse * uResolution;
    float dist = distance(pos, mousePos);

    // mascara circular: dentro do raio mostra a imagem de baixo (mascara)
    float mask = 1.0 - smoothstep(uRadius - uEdge, uRadius, dist);

    vec4 finalColor = mix(topColor, bottomColor, mask);

    gl_FragColor = finalColor;
}`;

export { vertexShader, displayFragmentShader };