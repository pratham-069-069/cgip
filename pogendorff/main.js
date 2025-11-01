// ===== POGGENDORFF ILLUSION =====

// Basic setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// ===== OrthographicCamera setup =====
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 30; 
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

// ===== Occluding Grey Bar =====
const barMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x808080,
  transparent: true, 
  opacity: 1.0 
});
const bar = new THREE.Mesh(new THREE.PlaneGeometry(4, 30), barMaterial);
bar.position.z = 0.1; // In foreground
scene.add(bar);

// ===== Transversal Lines (Poggendorff Layout) =====

// Black line
const blackLineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-8, 11, 0),
  new THREE.Vector3(-2, 2, 0)
]);
const blackLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 5 });
const blackLine = new THREE.Line(blackLineGeometry, blackLineMaterial);
blackLine.position.z = 0;
scene.add(blackLine);

// Red line (THE CORRECT ONE)
const redLineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(2, -4, 0),
  new THREE.Vector3(8, -13, 0)
]);
const redLineMaterial = new THREE.LineBasicMaterial({ color: 0xcc0000, linewidth: 5 });
const redLine = new THREE.Line(redLineGeometry, redLineMaterial);
redLine.position.z = 0;
scene.add(redLine);

// Blue line (THE "TRICK" ONE)
// CHANGED: Fixed typo "BufferGometries" to "BufferGeometry"
const blueLineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(2, -2.5, 0),
  new THREE.Vector3(8, -11.5, 0)
]);
const blueLineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 5 });
const blueLine = new THREE.Line(blueLineGeometry, blueLineMaterial);
blueLine.position.z = 0;
scene.add(blueLine);

// ===== Connecting Line for Reveal =====
const connectGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-2, 2, 0),   // End of black line
  new THREE.Vector3(2, -4, 0)  // Start of red line
]);
const connectMat = new THREE.LineDashedMaterial({ 
  color: 0x555555,
  linewidth: 2, 
  dashSize: 0.5, 
  gapSize: 0.25 
});
const connectingLine = new THREE.Line(connectGeo, connectMat);
connectingLine.computeLineDistances();
connectingLine.position.z = 0.05;
connectingLine.visible = false;
scene.add(connectingLine);


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

// ===== Event Listener for Reveal Button =====
const revealButton = document.getElementById('revealBtn');

revealButton.addEventListener('click', () => {
  if (bar.material.opacity === 1.0) {
    bar.material.opacity = 0.2;
    connectingLine.visible = true;
    revealButton.textContent = 'Hide Illusion';
  } else {
    bar.material.opacity = 1.0;
    connectingLine.visible = false;
    revealButton.textContent = 'Reveal Illusion';
  }
  render();
  
  // Send a message to the parent window when the illusion is revealed
  if (connectingLine.visible) {
    window.parent.postMessage({ quizPassed: 'walkingFeet' }, '*');
  }
});


// Initial render
render();

console.log("Poggendorff illusion loaded! Lines are now thicker.");