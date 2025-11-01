// ===== EBBINGHAUS ILLUSION =====

// Basic setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// ===== OrthographicCamera setup =====
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20;
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

// ===== Create Central Orange Circles (Identical Size) =====
const centralCircleRadius = 1.5;
const centralCircleGeometry = new THREE.CircleGeometry(centralCircleRadius, 32);
const centralCircleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });

// Left central circle
const leftCentralCircle = new THREE.Mesh(centralCircleGeometry, centralCircleMaterial);
leftCentralCircle.position.set(-6, 0, 0);
scene.add(leftCentralCircle);

// Right central circle
const rightCentralCircle = new THREE.Mesh(centralCircleGeometry, centralCircleMaterial);
rightCentralCircle.position.set(6, 0, 0);
scene.add(rightCentralCircle);

// ===== Create Surrounding Circles =====
const surroundingCircles = [];

// Left side - Large surrounding circles (make center appear smaller)
const largeCircleRadius = 2.0;
const largeCircleGeometry = new THREE.CircleGeometry(largeCircleRadius, 32);
const largeCircleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

// Create 6 large circles in a proper ring around the left center
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const distance = 4.2; // Distance from center
  const x = -6 + Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  const circle = new THREE.Mesh(largeCircleGeometry, largeCircleMaterial);
  circle.position.set(x, y, -0.1);
  scene.add(circle);
  surroundingCircles.push(circle);
}

// Right side - Small surrounding circles (make center appear larger)
const smallCircleRadius = 0.6;
const smallCircleGeometry = new THREE.CircleGeometry(smallCircleRadius, 32);
const smallCircleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

// Create 12 small circles in a proper ring around the right center
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  const distance = 2.5; // Closer distance from center
  const x = 6 + Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  const circle = new THREE.Mesh(smallCircleGeometry, smallCircleMaterial);
  circle.position.set(x, y, -0.1);
  scene.add(circle);
  surroundingCircles.push(circle);
}

// ===== Reveal Button Functionality =====
let surroundingVisible = true;
const revealBtn = document.getElementById('revealBtn');

revealBtn.addEventListener('click', () => {
  surroundingVisible = !surroundingVisible;
  
  surroundingCircles.forEach(circle => {
    circle.visible = surroundingVisible;
  });
  
  if (surroundingVisible) {
    revealBtn.textContent = 'Hide Surrounding Circles';
  } else {
    revealBtn.textContent = 'Show Surrounding Circles';
  }
  
  render();
});

// ===== Static Render =====
function render() {
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (frustumSize * aspect) / -2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
});

// Initial render
render();

console.log("Ebbinghaus illusion loaded! The two orange circles are identical in size.");