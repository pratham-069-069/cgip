// Import PointerLockControls (now loaded in HTML)
const { PointerLockControls } = THREE;

// Get the canvas element
const canvas = document.querySelector('#c');

// Create the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
scene.fog = new THREE.Fog(0x87CEEB, 10, 50); // Add atmospheric fog

// Create the camera (positioned at the "peephole")
const camera = new THREE.PerspectiveCamera(
    35, // FOV - narrower for better illusion
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    100 // Far clipping plane
);
camera.position.set(0, 0, 0);

// ===== CONTROLS (NEW) =====
// Use PointerLockControls for FPS-style mouse-look
const controls = new PointerLockControls(camera, renderer.domElement);

// Add a click listener to the whole page to lock the controls
document.body.addEventListener('click', () => {
    controls.lock();
});

// Add key listeners for movement
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ===== LIGHTING (MODERN SETUP) =====
// Ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Hemisphere light for natural outdoor lighting effect
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
scene.add(hemisphereLight);

// Point light at camera for illumination
const pointLight = new THREE.PointLight(0xffffff, 0.8, 50);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
scene.add(pointLight);

// Directional light for shadows and depth
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// ===== MODERN PROCEDURAL TEXTURES =====
// Create a wood floor texture
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create wood grain effect
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add wood planks
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    for (let i = 0; i < canvas.height; i += 64) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Add noise for texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 20 - 10;
        imageData.data[i] += noise;
        imageData.data[i + 1] += noise;
        imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// Create a subtle noise texture for walls
function createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Soft beige/cream color
    ctx.fillStyle = '#E8DCC4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle noise for texture variation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 15 - 7.5;
        imageData.data[i] += noise;
        imageData.data[i + 1] += noise;
        imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Create normal map for depth
function createNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base normal color (pointing towards camera)
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// ===== CREATE THE AMES ROOM =====
const geometry = new THREE.BufferGeometry();

// Define the 8 vertices (distorted coordinates)
const v_nbl = [-3, -3, -8]; // 0: near_bottom_left
const v_nbr = [ 3, -3, -8]; // 1: near_bottom_right
const v_ntl = [-3,  3, -8]; // 2: near_top_left
const v_ntr = [ 3,  3, -8]; // 3: near_top_right
const v_fbl = [-8, -6, -20]; // 4: far_bottom_left
const v_fbr = [ 4, -4, -12]; // 5: far_bottom_right
const v_ftl = [-8,  6, -20]; // 6: far_top_left
const v_ftr = [ 4,  4, -12]; // 7: far_top_right

// Create vertex array with flipped normals (pointing IN)
const vertices = new Float32Array([
    // Floor
    ...v_nbl, ...v_fbr, ...v_nbr,
    ...v_nbl, ...v_fbl, ...v_fbr,
    // Ceiling
    ...v_ntl, ...v_ftr, ...v_ntr,
    ...v_ntl, ...v_ftl, ...v_ftr,
    // Back wall
    ...v_fbl, ...v_ftr, ...v_fbr,
    ...v_fbl, ...v_ftl, ...v_ftr,
    // Left wall
    ...v_nbl, ...v_ftl, ...v_fbl,
    ...v_nbl, ...v_ntl, ...v_ftl,
    // Right wall
    ...v_nbr, ...v_ftr, ...v_fbr,
    ...v_nbr, ...v_ntr, ...v_ftr
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

// ===== THE PROJECTIVE TEXTURE FIX =====
// We create a "virtual projector" camera at the peephole
const peepholeCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
peepholeCamera.position.set(0, 0, 0);
peepholeCamera.lookAt(0, 0, -1);
peepholeCamera.updateMatrixWorld(); // Update its matrices

const uvs = [];
const tempVector = new THREE.Vector3();

// Loop through every vertex in our geometry
for (let i = 0; i < vertices.length; i += 3) {
    // Get the vertex position
    tempVector.set(vertices[i], vertices[i+1], vertices[i+2]);
    
    // "Project" it onto the virtual camera's screen
    tempVector.project(peepholeCamera);
    
    // Convert from clip space (-1 to 1) to UV space (0 to 1)
    const uv_x = (tempVector.x + 1) / 2;
    const uv_y = (tempVector.y + 1) / 2;
    
    uvs.push(uv_x, uv_y);
}

geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
// --- End of Projective Fix ---

geometry.computeVertexNormals(); // Let Three.js calculate the (now correct) inward-facing normals

// ===== CREATE ROOM MATERIALS (MODERN PBR) =====
const floorTexture = createWoodTexture();
const wallTexture = createWallTexture();
const normalMap = createNormalMap();

const roomMaterials = [
    // Floor - Wood
    new THREE.MeshStandardMaterial({ 
        map: floorTexture,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.5, 0.5),
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.1,
        envMapIntensity: 0.5
    }),
    // Ceiling - Plain cream
    new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0,
        color: new THREE.Color(0xFAF0E6)
    }),
    // Back wall - Plain beige
    new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0,
        color: new THREE.Color(0xE8DCC4)
    }),
    // Left wall - Plain beige
    new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0,
        color: new THREE.Color(0xE8DCC4)
    }),
    // Right wall - Plain beige
    new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.DoubleSide,
        roughness: 0.9,
        metalness: 0.0,
        color: new THREE.Color(0xE8DCC4)
    })
];

// Add material groups
geometry.addGroup(0, 6, 0);   // Floor
geometry.addGroup(6, 6, 1);   // Ceiling
geometry.addGroup(12, 6, 2);  // Back wall
geometry.addGroup(18, 6, 3);  // Left wall
geometry.addGroup(24, 6, 4);  // Right wall

// Create the room mesh
const roomMesh = new THREE.Mesh(geometry, roomMaterials);
roomMesh.castShadow = true;
roomMesh.receiveShadow = true;
scene.add(roomMesh);

// Add some ambient particles for depth
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 20;     // x
    particlePositions[i + 1] = (Math.random() - 0.5) * 12; // y
    particlePositions[i + 2] = -Math.random() * 20 - 8;    // z
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.3
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ===== CREATE THE SUBJECTS (MODERN SPHERES WITH BETTER MATERIALS) =====
const sphereGeo = new THREE.SphereGeometry(0.5, 64, 64);

const redSphere = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ 
    color: 0xff3333,
    metalness: 0.4,
    roughness: 0.3,
    emissive: 0xff0000,
    emissiveIntensity: 0.2
}));
redSphere.castShadow = true;
redSphere.receiveShadow = true;

const blueSphere = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ 
    color: 0x3333ff,
    metalness: 0.4,
    roughness: 0.3,
    emissive: 0x0000ff,
    emissiveIntensity: 0.2
}));
blueSphere.castShadow = true;
blueSphere.receiveShadow = true;

// Set positions (raised slightly off the floor)
const farPosition = new THREE.Vector3(-6, -4.5, -18);
const nearPosition = new THREE.Vector3(2.5, -2.5, -10);

redSphere.position.copy(farPosition);
blueSphere.position.copy(nearPosition);

scene.add(redSphere);
scene.add(blueSphere);

// ===== ANIMATION =====
let time = 0;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); // Time in seconds since last frame
    
    // --- NEW: Handle WASD Movement ---
    if (controls.isLocked) {
        const moveSpeed = 5.0 * delta;
        if (keys['KeyW']) controls.moveForward(moveSpeed);
        if (keys['KeyS']) controls.moveForward(-moveSpeed);
        if (keys['KeyA']) controls.moveRight(-moveSpeed);
        if (keys['KeyD']) controls.moveRight(moveSpeed);
    }
    
    // Animate the red sphere
    time += delta * 0.5;
    const t = (Math.sin(time) + 1) / 2;
    redSphere.position.lerpVectors(farPosition, nearPosition, t);
    
    renderer.render(scene, camera);
}

// ===== "REVEAL" KEY LISTENER (MODIFIED) =====
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR') {
        console.log("Illusion Restored! (Resetting camera)");
        controls.unlock(); // Unlock the mouse
        camera.position.set(0, 0, 0); // Reset position
        camera.rotation.set(0, 0, 0); // Reset look
    }
});

// ===== HANDLE WINDOW RESIZING =====
window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update peephole camera aspect ratio
    peepholeCamera.aspect = window.innerWidth / window.innerHeight;
    peepholeCamera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Start the animation loop
animate();

console.log("Ames Room Illusion loaded!");
console.log("Click the screen to lock mouse, then use WASD to move.");
console.log("Press 'R' to reset the illusion.");
