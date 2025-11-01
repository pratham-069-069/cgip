// Fake Cafe Wall Illusion - Three.js Implementation
// The twist: lines are actually slanted, unlike the real illusion where they appear slanted but are straight

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

// ===== Pattern Parameters =====
const rows = 12;
const tilesPerRow = 16;
const tileWidth = 1.2;
const tileHeight = 0.8;
const mortarThickness = 0.15;
const offsetAmount = tileWidth * 0.5;

// ===== Materials =====
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const mortarMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

// ===== Storage Arrays =====
const tiles = [];
const mortarLines = [];
const guideLines = [];

// ===== Control Variables =====
let guideLinesVisible = false;
let patternRemoved = false;
let slantAngle = 3; // degrees
let needsRedraw = false;

// ===== Create Tile Geometry =====
const tileGeometry = new THREE.PlaneGeometry(tileWidth, tileHeight);

// ===== Create Slanted Mortar Line Geometry =====
function createSlantedMortarGeometry(angle) {
    const geometry = new THREE.PlaneGeometry(20, mortarThickness);
    
    // Apply rotation to create slanted effect
    const angleRad = (angle * Math.PI) / 180;
    geometry.rotateZ(angleRad);
    
    return geometry;
}

// ===== Create Fake Cafe Wall Pattern =====
function createFakeCafeWallPattern() {
    // Clear existing objects
    tiles.forEach(tile => scene.remove(tile));
    mortarLines.forEach(line => scene.remove(line));
    tiles.length = 0;
    mortarLines.length = 0;

    if (patternRemoved) return;

    for (let row = 0; row < rows; row++) {
        const isEvenRow = row % 2 === 0;
        const rowY = (rows - 1) * (tileHeight + mortarThickness) / 2 - row * (tileHeight + mortarThickness);
        
        // Determine starting position and offset for this row
        let startX = -(tilesPerRow * tileWidth) / 2 + tileWidth / 2;
        if (!isEvenRow) {
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
        
        // Create SLANTED horizontal mortar line below each row (except the last)
        if (row < rows - 1) {
            const mortarY = rowY - (tileHeight + mortarThickness) / 2;
            
            // Create slanted mortar geometry based on current angle
            const slantedMortarGeometry = createSlantedMortarGeometry(slantAngle);
            const mortarLine = new THREE.Mesh(slantedMortarGeometry, mortarMaterial);
            mortarLine.position.set(0, mortarY, 0.01);
            
            scene.add(mortarLine);
            mortarLines.push(mortarLine);
        }
    }
}

// ===== Create Guide Lines (Actually Straight) =====
function createGuideLines() {
    // Clear existing guide lines
    guideLines.forEach(line => scene.remove(line));
    guideLines.length = 0;

    if (!guideLinesVisible) return;

    // Create straight red guide lines to show what truly straight lines look like
    const guideGeometry = new THREE.PlaneGeometry(20, 0.03);
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

// ===== Initialize Pattern =====
function init() {
    createFakeCafeWallPattern();
    createGuideLines();
    needsRedraw = true;
}

// ===== Update Slant Angle =====
function updateSlantAngle(newAngle) {
    slantAngle = newAngle;
    createFakeCafeWallPattern();
    createGuideLines();
    needsRedraw = true;
}

// ===== Control Button Handlers =====
document.getElementById('toggleLines').addEventListener('click', function() {
    guideLinesVisible = !guideLinesVisible;
    this.classList.toggle('active');
    this.textContent = guideLinesVisible ? 'Hide Straight Guide' : 'Show Straight Guide';
    createGuideLines();
    needsRedraw = true;
});

document.getElementById('togglePattern').addEventListener('click', function() {
    patternRemoved = !patternRemoved;
    this.classList.toggle('active');
    this.textContent = patternRemoved ? 'Show Pattern' : 'Remove Pattern';
    createFakeCafeWallPattern();
    createGuideLines();
    needsRedraw = true;
});

// ===== Slant Slider Handler =====
document.getElementById('slantSlider').addEventListener('input', function() {
    const value = parseFloat(this.value);
    updateSlantAngle(value);
    document.getElementById('slantValue').textContent = value + '°';
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

// ===== Initialize and Start =====
init();
animate();