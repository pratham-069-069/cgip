// ===== SQUINT OPTICAL ILLUSION =====

// Basic setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antTialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080); // Grey background

// ===== OrthographicCamera setup =====
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 25; 
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);

camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

// ===== Clock for Animation =====
const clock = new THREE.Clock();

// ===== Shader Material for Color Wheel Effect =====
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uRotation;
  varying vec2 vUv;
  
  // HSV to RGB conversion function
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    // Center the UVs
    vec2 uv = vUv - 0.5;
    
    // Rotate the UVs based on uRotation uniform
    float cosR = cos(uRotation);
    float sinR = sin(uRotation);
    mat2 rotationMatrix = mat2(cosR, -sinR, sinR, cosR);
    uv = rotationMatrix * uv;
    
    // Calculate the angle
    float angle = atan(uv.y, uv.x);
    
    // Normalize the angle to [0, 1] range
    float normalizedAngle = (angle + 3.14159) / (2.0 * 3.14159);
    
    // Use normalized angle as hue in HSV color space
    vec3 color = hsv2rgb(vec3(normalizedAngle, 1.0, 1.0));
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create base shader material
const baseShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uRotation: { value: 0.0 }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

// ===== Create Ring Geometry =====
const ringGeo = new THREE.RingGeometry(0.8, 1.6, 32); // Smaller individual rings

// ===== Array to hold rings for animation =====
const ringMeshes = [];

// ===== Create 12 Color Wheel Rings =====
for (let i = 0; i < 12; i++) {
  // Calculate angle for placing each circle
  const angle = (i / 12) * Math.PI * 2;
  
  // Clone the base shader material
  const material = baseShaderMaterial.clone();
  
  // Set the INITIAL rotation uniform for this ring
  material.uniforms.uRotation.value = angle;
  
  // Create the mesh
  const mesh = new THREE.Mesh(ringGeo, material);
  
  // Position the ring in a more compact circle to match reference
  mesh.position.set(Math.cos(angle) * 7, Math.sin(angle) * 7, 0);
  
  // Add to scene
  scene.add(mesh);
  
  // Add to our array for animation
  ringMeshes.push(mesh);
}

// ===== Add Central Arrows for Motion Illusion =====

// ===== CHANGED: New arrow shape to match your reference images =====
const arrowShape = new THREE.Shape();

const headWidth = 1.2;
const headLength = 0.7;
const stemWidth = 0.6;
const stemLength = 0.7;

// We build the arrow pointing UP, centered around (0, 0)
// Y-coordinate for the base of the head / top of the stem
const headBaseY = stemLength / 2;
// Y-coordinate for the base of the stem
const stemBaseY = -stemLength / 2;
// Y-coordinate for the tip of the head
const tipY = headBaseY + headLength;

// Start at bottom-left of stem
arrowShape.moveTo(-stemWidth / 2, stemBaseY);
// Bottom-right of stem
arrowShape.lineTo(stemWidth / 2, stemBaseY);
// Top-right of stem
arrowShape.lineTo(stemWidth / 2, headBaseY);
// Right corner of arrowhead
arrowShape.lineTo(headWidth / 2, headBaseY);
// Tip of arrow
arrowShape.lineTo(0, tipY);
// Left corner of arrowhead
arrowShape.lineTo(-headWidth / 2, headBaseY);
// Top-left of stem
arrowShape.lineTo(-stemWidth / 2, headBaseY);
// Close shape at bottom-left of stem
arrowShape.lineTo(-stemWidth / 2, stemBaseY);
// ===== End of new arrow shape definition =====

const arrowGeo = new THREE.ShapeGeometry(arrowShape);
// Subtle but visible grey arrows for motion illusion
const arrowMat = new THREE.MeshBasicMaterial({ 
  color: 0x666666, 
  side: THREE.DoubleSide
}); 

const arrowDist = 1.5;

// Create all four arrows
const arrowUp = new THREE.Mesh(arrowGeo, arrowMat);
arrowUp.position.y = arrowDist;
scene.add(arrowUp);

const arrowDown = new THREE.Mesh(arrowGeo, arrowMat);
arrowDown.position.y = -arrowDist;
arrowDown.rotation.z = Math.PI; // Rotates the "up" arrow to point down
scene.add(arrowDown);

const arrowLeft = new THREE.Mesh(arrowGeo, arrowMat);
arrowLeft.position.x = -arrowDist;
arrowLeft.rotation.z = Math.PI / 2; // Rotates the "up" arrow to point left
scene.add(arrowLeft);

const arrowRight = new THREE.Mesh(arrowGeo, arrowMat);
arrowRight.position.x = arrowDist;
arrowRight.rotation.z = -Math.PI / 2; // Rotates the "up" arrow to point right
scene.add(arrowRight);

// Store arrows for direction switching and motion illusion
const arrows = {
    up: arrowUp,
    down: arrowDown,
    left: arrowLeft,
    right: arrowRight
};

// ===== Animation Loop =====
function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // --- Continuous Color Rotation (Much Faster) ---
  const rotationSpeed = 16.0; // Adjusted speed for illusion
  
  // Continuous rotation - clockwise direction - synchronized
  ringMeshes.forEach((mesh, i) => {
    // Remove baseAngle to sync all rings together
    mesh.material.uniforms.uRotation.value = -elapsedTime * rotationSpeed;
  });
  
  // --- Arrow Direction Switching (Every 3 seconds) ---
  const arrowInterval = 3.0;
  const arrowState = Math.floor(elapsedTime / arrowInterval) % 4; // 4 different directions
  
  // Hide all arrows first
  Object.values(arrows).forEach(arrow => arrow.visible = false);
  
  // Show arrow patterns like in reference images
  switch(arrowState) {
    case 0: // Vertical arrows (up and down)
      arrows.up.visible = true;
      arrows.down.visible = true;
      break;
      
    case 1: // Horizontal arrows (left and right)
      arrows.left.visible = true;  
      arrows.right.visible = true;
      break;
      
    case 2: // Single upward arrow (based on image 6095fb)
      arrows.up.visible = true;
      // You could add more arrows here if needed
      break;
      
    case 3: // All four arrows (based on image 6095c1 / 609616)
      arrows.up.visible = true;
      arrows.down.visible = true;
      arrows.left.visible = true;
      arrows.right.visible = true;
      break;
  }
  
  // --- Render ---
  renderer.render(scene, camera);
}

// ===== Handle window resize =====
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== Start the animation loop =====
animate();

console.log("Squint optical illusion loaded! Arrow shape updated.");