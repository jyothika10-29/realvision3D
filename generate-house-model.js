const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const fs = require('fs');

// Create a scene
const scene = new THREE.Scene();

// Create a simple house model using geometry
function createHouse() {
  const houseGroup = new THREE.Group();
  
  // House base (cube)
  const baseGeometry = new THREE.BoxGeometry(4, 2, 3);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 1;
  houseGroup.add(base);
  
  // Roof (triangular prism)
  const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xa52a2a });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 2.75;
  roof.rotation.y = Math.PI / 4;
  houseGroup.add(roof);
  
  // Door
  const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.75, 1.51);
  houseGroup.add(door);
  
  // Windows
  const windowGeometry = new THREE.PlaneGeometry(0.6, 0.6);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6 });
  
  // Front windows
  const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow1.position.set(-1.2, 1.2, 1.51);
  houseGroup.add(frontWindow1);
  
  const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow2.position.set(1.2, 1.2, 1.51);
  houseGroup.add(frontWindow2);
  
  // Side windows
  const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  sideWindow1.position.set(2.01, 1.2, 0);
  sideWindow1.rotation.y = Math.PI / 2;
  houseGroup.add(sideWindow1);
  
  const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  sideWindow2.position.set(-2.01, 1.2, 0);
  sideWindow2.rotation.y = Math.PI / 2;
  houseGroup.add(sideWindow2);
  
  // Back windows
  const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
  backWindow.position.set(0, 1.2, -1.51);
  backWindow.rotation.y = Math.PI;
  houseGroup.add(backWindow);
  
  // Ground/Yard
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7cfc00 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  houseGroup.add(ground);
  
  return houseGroup;
}

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Create the house and add it to the scene
const house = createHouse();
scene.add(house);

// Export to GLB
const exporter = new GLTFExporter();

exporter.parse(
  scene,
  (gltf) => {
    const output = Buffer.from(JSON.stringify(gltf));
    fs.writeFileSync('public/models/simple-house.gltf', output);
    console.log('GLTF model has been saved!');
  },
  { binary: false }
);