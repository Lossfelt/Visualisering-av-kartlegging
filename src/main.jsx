import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import './main.css';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;
controls.update();

// Grid dimensions (change these based on your data)
const clinics = 5;
const labAreas = 5;
const processes = 5;

// Cube size & spacing
const cubeSize = 0.5;
const spacing = 0.8;

// Labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Function to create labels
function createLabel(text, position, axis, index) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = text;
  div.style.color = 'white';
  div.style.fontSize = '12px';
  div.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  div.style.padding = '2px 5px';
  div.style.borderRadius = '4px';
  div.style.cursor = 'pointer';

  div.addEventListener('pointerdown', (event) => {
      event.stopPropagation(); // Hindrer at klikket påvirker Three.js-kontroller
      console.log(`Label clicked: ${text} (Axis: ${axis}, Index: ${index})`);
      filterByAxis(axis, index);
  });

  const label = new CSS2DObject(div);
  label.position.copy(position);
  scene.add(label);
  return label;
}


// Adding labels to axes next to first row of cubes
for (let x = 0; x < clinics; x++) {
    createLabel(`Clinic ${x + 1}`, new THREE.Vector3((x - clinics / 2) * spacing, (0 - labAreas / 2) * spacing, -processes / 2 * spacing - cubeSize * 1.5), 'x', x);
}
for (let y = 0; y < labAreas; y++) {
    createLabel(`Lab ${y + 1}`, new THREE.Vector3(-clinics / 2 * spacing - cubeSize * 1.5, (y - labAreas / 2) * spacing, (0 - processes / 2) * spacing), 'y', y);
}
for (let z = 0; z < processes; z++) {
    createLabel(`Process ${z + 1}`, new THREE.Vector3((0 - clinics / 2) * spacing, -labAreas / 2 * spacing - cubeSize * 1.5, (z - processes / 2) * spacing), 'z', z);
}

// Function to get color based on process type (for demo purposes)
function getColorByProcessType(type) {
    const colors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff]; // Red, Yellow, Green, Blue
    return colors[type % colors.length];
}

// Create 3D grid of cubes
const cubes = [];
for (let x = 0; x < clinics; x++) {
    for (let y = 0; y < labAreas; y++) {
        for (let z = 0; z < processes; z++) {
            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            const material = new THREE.MeshStandardMaterial({ color: getColorByProcessType(z), transparent: true, opacity: 1 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (x - clinics / 2) * spacing,
                (y - labAreas / 2) * spacing,
                (z - processes / 2) * spacing
            );
            cube.userData = { x, y, z };
            scene.add(cube);
            cubes.push(cube);
        }
    }
}

// Function to filter cubes based on clicked label
function filterByAxis(axis, index) {
  console.log(`Filtering by ${axis} at index ${index}`);
    cubes.forEach(cube => {
        if (cube.userData[axis] === index) {
            cube.material.opacity = 1;
        } else {
            cube.material.opacity = 0.3;
            cube.material.transparent = true;
        }
    });
}

// Function to reset cube transparency
function resetTransparency() {
  cubes.forEach(cube => {
      cube.material.opacity = 1;
      cube.material.transparent = true;
  });
}

// Add event listener for reset on double-click
window.addEventListener('dblclick', resetTransparency);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera position
camera.position.set(3, 3, 10);
controls.update();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();

// Handle resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
