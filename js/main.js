import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { applySolvedPoseFromAnimation } from './scene/applySolvedPose.js';
import { CubeAnimationController } from './animation/CubeAnimationController.js';

// ==================== THREE.JS SETUP ====================

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const baseCameraPosition = new THREE.Vector3(5, 5, 5);
const isMobileViewport = window.innerWidth <= 768;
const mobileZoomFactor = 1.2; // move camera 20% farther back on mobile
camera.position.copy(
  baseCameraPosition.clone().multiplyScalar(isMobileViewport ? mobileZoomFactor : 1)
);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 20;
controls.target.set(0, 0, 0);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight1.position.set(4, 9, 3);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-4, 4, -6);
scene.add(directionalLight2);

const detailLight = new THREE.DirectionalLight(0xffffff, 1.3);
detailLight.position.set(-2, 2.5, 8);
scene.add(detailLight);

const pointLight = new THREE.PointLight(0xffffff, 0.65);
pointLight.position.set(0, 6, 0);
scene.add(pointLight);

// Load GLTF model
const loader = new GLTFLoader();
loader.load(
  'scene.gltf',
  function (gltf) {
    const model = gltf.scene;

    // Use embedded animation to move cube into solved pose
    applySolvedPoseFromAnimation(model, gltf.animations);

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Scale if needed
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    model.scale.multiplyScalar(scale);

    scene.add(model);

    // Update all matrices after adding to scene and transforming
    scene.updateMatrixWorld(true);

    // Initialize cube animation controller
    const cubeController = new CubeAnimationController(model);

    // Start continuous scramble/solve loop
    cubeController.startContinuousLoop();

    console.log('Rubik\'s Cube loaded successfully!');
    console.log('Animation controller started');
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
