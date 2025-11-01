// Cafe Wall Illusion - Three.js Implementation
// The illusion where straight horizontal lines appear slanted due to alternating black/white pattern

// ===== Scene Setup =====
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 6, -6, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// ===== Renderer Configuration =====
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x808080); // Grey background
document.getElementById('container').appendChild(renderer.domElement);

// ===== Camera Position =====
camera.position.z = 10;

// ===== Cafe Wall Pattern Parameters =====
const rows = 12;
const tilesPerRow = 16;
const tileWidth = 1.2;
const tileHeight = 0.8;
const mortarThickness = 0.15;
const offsetAmount = tileWidth * 0.5; // Half tile offset for alternating rows

// ===== Materials =====
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const mortarMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

// ===== Storage Arrays =====
const tiles = [];
const mortarLines = [];
const guideLines = [];

// ===== Create Tile Geometry =====
const tileGeometry = new THREE.PlaneGeometry(tileWidth, tileHeight);
const mortarGeometry = new THREE.PlaneGeometry(20, mortarThickness);
const guideGeometry = new THREE.PlaneGeometry(20, 0.02);

// ===== Create Cafe Wall Pattern =====
function createCafeWallPattern() {
    // Clear existing objects
    tiles.forEach(tile => scene.remove(tile));
    mortarLines.forEach(line => scene.remove(line));
    tiles.length = 0;
    mortarLines.length = 0;

    for (let row = 0; row < rows; row++) {
        const isEvenRow = row % 2 === 0;
        const rowY = (rows - 1) * (tileHeight + mortarThickness) / 2 - row * (tileHeight + mortarThickness);
        
        // Determine starting position and offset for this row
        let startX = -(tilesPerRow * tileWidth) / 2 + tileWidth / 2;
        if (!isEvenRow && !offsetRemoved) {
            startX += offsetAmount;
        }

        // Create tiles for this row
        for (let col = 0; col < tilesPerRow; col++) {
            const tileX = startX + col * tileWidth;
            
            // Alternate colors: even columns black, odd columns white
            const isBlack = col % 2 === 0;
            const material = isBlack ? blackMaterial : whiteMaterial;
            
            const tile = new THREE.Mesh(tileGeometry, material);
            tile.position.set(tileX, rowY, 0);
            
            scene.add(tile);
            tiles.push(tile);
        }
        
        // Create horizontal mortar line below each row (except the last)
        if (row < rows - 1) {
            const mortarY = rowY - (tileHeight + mortarThickness) / 2;
            const mortarLine = new THREE.Mesh(mortarGeometry, mortarMaterial);
            mortarLine.position.set(0, mortarY, 0.01);
            
            scene.add(mortarLine);
            mortarLines.push(mortarLine);
        }
    }
}

// ===== Create Guide Lines =====
function createGuideLines() {
    // Clear existing guide lines
    guideLines.forEach(line => scene.remove(line));
    guideLines.length = 0;

    if (!guideLinesVisible) return;

    // Create red guide lines to show the mortar lines are actually straight
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    for (let row = 0; row < rows - 1; row++) {
        const rowY = (rows - 1) * (tileHeight + mortarThickness) / 2 - row * (tileHeight + mortarThickness);
        const mortarY = rowY - (tileHeight + mortarThickness) / 2;
        
        const guideLine = new THREE.Mesh(guideGeometry, redMaterial);
        guideLine.position.set(0, mortarY, 0.02);
        
        scene.add(guideLine);
        guideLines.push(guideLine);
    }
}

// ===== Control Variables =====
let guideLinesVisible = false;
let offsetRemoved = false;
let needsRedraw = false;

// ===== Initialize Pattern =====
function init() {
    createCafeWallPattern();
    createGuideLines();
    needsRedraw = true;
}

// ===== Initial Pattern Creation =====
init();

// ===== Control Button Handlers =====
document.getElementById('toggleLines').addEventListener('click', function() {
    guideLinesVisible = !guideLinesVisible;
    this.classList.toggle('active');
    this.textContent = guideLinesVisible ? 'Hide Guide Lines' : 'Show Guide Lines';
    createGuideLines();
    needsRedraw = true;
});

document.getElementById('toggleOffset').addEventListener('click', function() {
    offsetRemoved = !offsetRemoved;
    this.classList.toggle('active');
    this.textContent = offsetRemoved ? 'Add Offset' : 'Remove Offset';
    createCafeWallPattern();
    createGuideLines();
    needsRedraw = true;
});

// ===== Animation Loop =====
function animate() {
    requestAnimationFrame(animate);
    
    if (needsRedraw) {
        renderer.render(scene, camera);
        needsRedraw = false;
    }
}

// ===== Window Resize Handler =====
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const height = 6;
    const width = height * aspect;
    
    camera.left = -width;
    camera.right = width;
    camera.top = height;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    needsRedraw = true;
}

window.addEventListener('resize', onWindowResize);
onWindowResize();

// ===== Start Animation =====
animate();