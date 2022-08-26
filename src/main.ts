import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";
import meshToonTextureImage from "/textures/gradients/3.jpg";
import gsap from "gsap";

const textureLoader = new THREE.TextureLoader();
const meshToonTexture = textureLoader.load(meshToonTextureImage);
meshToonTexture.magFilter = THREE.NearestFilter;

const gui = new GUI();

const PARAMETERS = {
  materialColor: "#ff35e4",
  lightColor: "#ffffff",
  lightIntesity: 1,
};

const CURSOR_POSITION = {
  x: 0,
  y: 0,
};

gui.addColor(PARAMETERS, "materialColor").onChange(() => {
  material.color.set(PARAMETERS.materialColor);
  particlesMaterial.color.set(PARAMETERS.materialColor);
});
gui
  .addColor(PARAMETERS, "lightColor")
  .onChange(() => light.color.set(PARAMETERS.lightColor));
gui
  .add(PARAMETERS, "lightIntesity")
  .min(0.01)
  .max(2)
  .step(0.01)
  .onChange(() => (light.intensity = PARAMETERS.lightIntesity));

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector("canvas#webgl")!;
const scene = new THREE.Scene();

/*
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/*
 * Meshes
 */
const objectsDistance = 4;
const material = new THREE.MeshToonMaterial({
  color: PARAMETERS.materialColor,
  gradientMap: meshToonTexture,
});
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 64), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
mesh2.position.y = -objectsDistance;
mesh3.position.y = -objectsDistance * 2;
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;
scene.add(mesh1, mesh2, mesh3);

const sectionsMeshes = [mesh1, mesh2, mesh3];

/*
 * Particles
 */
const particlesCount = 200;
const particlesPositions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  const x = i * 3;
  const y = i * 3 + 1;
  const z = i * 3 + 2;
  particlesPositions[x] = (Math.random() - 0.5) * 10;
  particlesPositions[y] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionsMeshes.length;
  particlesPositions[z] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlesPositions, 3)
);
const particlesMaterial = new THREE.PointsMaterial({
  color: PARAMETERS.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/*
 * Light
 */
const light = new THREE.DirectionalLight(
  PARAMETERS.lightColor,
  PARAMETERS.lightIntesity
);
light.position.set(1, 1, 0);
scene.add(light);

/*
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/*
 * Resize
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousemove", (event) => {
  CURSOR_POSITION.x = event.clientX / sizes.width - 0.5;
  CURSOR_POSITION.y = event.clientY / sizes.height - 0.5;
});

/*
 * Scroll
 */
let { scrollY } = window;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const sectionIndex = Math.round(scrollY / sizes.height);

  if (currentSection !== sectionIndex) {
    currentSection = sectionIndex;

    gsap.to(sectionsMeshes[currentSection].rotation, {
      x: "+=6",
      y: "+=3",
      ease: "power2.inOut",
      duration: 1.5,
    });
  }
});

/*
 * Animation
 */
const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = CURSOR_POSITION.x * 0.25;
  const parallaxY = -CURSOR_POSITION.y * 0.25;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  for (const mesh of sectionsMeshes) {
    mesh.rotation.x += deltaTime * 0.14;
    mesh.rotation.y += deltaTime * 0.12;
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
