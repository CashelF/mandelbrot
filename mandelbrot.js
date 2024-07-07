const canvas = document.getElementById('canvas');
let gl = canvas.getContext('experimental-webgl', { powerPreference: 'high-performance' }) ||
         canvas.getContext('webgl', { powerPreference: 'high-performance' });

if (!gl) {
    alert('Your browser does not support WebGL');
}

const ext = gl.getExtension('WEBGL_debug_renderer_info');
if (ext) {
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    console.log(`Vendor: ${vendor}`);
    console.log(`Renderer: ${renderer}`);
} else {
    console.log('WEBGL_debug_renderer_info extension not available');
}

// Vertex shader program
const vsSource = `
    attribute vec2 aPosition;
    void main(void) {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

// Fragment shader program
const fsSource = `
    precision highp float;

    uniform vec2 uResolution;
    uniform vec2 uCenter;
    uniform float uZoom;
    uniform int uMaxIterations;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    void main(void) {
        float aspectRatio = uResolution.x / uResolution.y;
        vec2 scaledCoords = (gl_FragCoord.xy / uResolution - 0.5) * vec2(aspectRatio, 1.0) * uZoom + uCenter;
        vec2 z = vec2(0.0, 0.0);
        int iterations = 0;
        const int maxIterations = 10000;
        for (int i = 0; i < maxIterations; i++) {
            if (i >= uMaxIterations) break; // For dynamic max iterations
            if (length(z) > 2.0) break;
            z = vec2(z.x * z.x - z.y * z.y + scaledCoords.x, 2.0 * z.x * z.y + scaledCoords.y);
            iterations++;
        }
        float colorMix = float(iterations) / float(uMaxIterations);
        vec3 color = mix(uColor1, uColor2, colorMix);
        color = mix(color, uColor3, sqrt(colorMix));
        gl_FragColor = vec4(color, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

if (!vertexShader || !fragmentShader) {
    console.error('Shader creation failed');
}

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

const positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
const resolutionLocation = gl.getUniformLocation(shaderProgram, 'uResolution');
const centerLocation = gl.getUniformLocation(shaderProgram, 'uCenter');
const zoomLocation = gl.getUniformLocation(shaderProgram, 'uZoom');
const maxIterationsLocation = gl.getUniformLocation(shaderProgram, 'uMaxIterations');
const color1Location = gl.getUniformLocation(shaderProgram, 'uColor1');
const color2Location = gl.getUniformLocation(shaderProgram, 'uColor2');
const color3Location = gl.getUniformLocation(shaderProgram, 'uColor3');

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
]);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const vaoExtension = gl.getExtension('OES_vertex_array_object');
const vao = vaoExtension.createVertexArrayOES();
vaoExtension.bindVertexArrayOES(vao);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
}

// Function to generate random RGB values
function getRandomColor() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

let centerX = -0.5;
let centerY = 0;
let zoom = 4;
let maxIterations = 500;

// Convert random color objects to arrays
let color1Obj = getRandomColor();
let color2Obj = getRandomColor();
let color3Obj = getRandomColor();

let color1 = [color1Obj.r / 255, color1Obj.g / 255, color1Obj.b / 255];
let color2 = [color2Obj.r / 255, color2Obj.g / 255, color2Obj.b / 255];
let color3 = [color3Obj.r / 255, color3Obj.g / 255, color3Obj.b / 255];

// Initialize color pickers with random colors
const colorPicker1 = new iro.ColorPicker("#colorPicker1", {
    width: document.body.clientWidth < 600 ? 100 : 150,
    color: color1Obj
});
const colorPicker2 = new iro.ColorPicker("#colorPicker2", {
    width: document.body.clientWidth < 600 ? 100 : 150,
    color: color2Obj
});
const colorPicker3 = new iro.ColorPicker("#colorPicker3", {
    width: document.body.clientWidth < 600 ? 100 : 150,
    color: color3Obj
});

colorPicker1.on('color:change', function(color) {
    color1 = [color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255];
    render();
});
colorPicker2.on('color:change', function(color) {
    color2 = [color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255];
    render();
});
colorPicker3.on('color:change', function(color) {
    color3 = [color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255];
    render();
});

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(centerLocation, centerX, centerY);
    gl.uniform1f(zoomLocation, zoom);
    gl.uniform1i(maxIterationsLocation, maxIterations);
    gl.uniform3fv(color1Location, color1);
    gl.uniform3fv(color2Location, color2);
    gl.uniform3fv(color3Location, color3);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function zoomHandler(event) {
    const delta = event.deltaY * -0.01;
    zoom *= Math.pow(1.1, delta);
    hideControls();
    render();
}

function resolutionHandler(event) {
    maxIterations = event.target.value;
    hideControls();
    render();
}

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function mouseDownHandler(event) {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    hideControls();
}

function mouseMoveHandler(event) {
    if (!isDragging) return;
    const deltaX = (event.clientX - lastMouseX) / canvas.width * zoom;
    const deltaY = (event.clientY - lastMouseY) / canvas.height * zoom;
    centerX -= deltaX;
    centerY += deltaY;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    render();
}

function mouseUpHandler() {
    isDragging = false;
}

let initialPinchDistance = null;
let lastZoom = zoom;

function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function touchStartHandler(event) {
    if (event.touches.length == 2) {
        isDragging = false; // Disable dragging when two fingers are used
        initialPinchDistance = getDistance(event.touches);
        lastZoom = zoom;
        event.preventDefault();
    } else if (event.touches.length == 1) {
        isDragging = true;
        lastMouseX = event.touches[0].clientX;
        lastMouseY = event.touches[0].clientY;
        event.preventDefault();
    }
    hideControls();
}

function touchMoveHandler(event) {
    if (event.touches.length == 2 && initialPinchDistance != null) {
        const currentPinchDistance = getDistance(event.touches);
        const ratio = currentPinchDistance / initialPinchDistance;
        zoom = lastZoom / ratio;
        render();
        event.preventDefault();
    } else if (isDragging && event.touches.length == 1) {
        const mouseX = event.touches[0].clientX;
        const mouseY = event.touches[0].clientY;
        const deltaX = (mouseX - lastMouseX) / canvas.width * zoom;
        const deltaY = (mouseY - lastMouseY) / canvas.height * zoom;
        centerX -= deltaX;
        centerY += deltaY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        render();
        event.preventDefault();
    }
}

function touchEndHandler(event) {
    if (event.touches.length < 2) {
        initialPinchDistance = null;
        lastZoom = zoom;
    }
    if (event.touches.length === 0) {
        isDragging = false;
    }
}

canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);
canvas.addEventListener('touchend', touchEndHandler);
canvas.addEventListener('touchcancel', touchEndHandler); // Handle interruption

canvas.addEventListener('wheel', zoomHandler);
canvas.addEventListener('mousedown', mouseDownHandler);
canvas.addEventListener('mousemove', mouseMoveHandler);
canvas.addEventListener('mouseup', mouseUpHandler);
canvas.addEventListener('mouseleave', mouseUpHandler);

document.getElementById('resolution').addEventListener('input', resolutionHandler);
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
render();

// Toggle settings panel
const settingsButton = document.getElementById('settingsButton');
const controls = document.getElementById('controls');

settingsButton.addEventListener('click', () => {
    controls.style.display = 'block';
    settingsButton.style.display = 'none';
});

function hideControls() {
    controls.style.display = 'none';
    settingsButton.style.display = 'block';
}
