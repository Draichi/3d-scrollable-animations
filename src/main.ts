import "./style.css";
import * as THREE from "three";
import GUI from "lil-gui";
import meshToonTextureImage from "/textures/gradients/3.jpg";

const textureLoader = new THREE.TextureLoader();
const meshToonTexture = textureLoader.load(meshToonTextureImage);
meshToonTexture.magFilter = THREE.NearestFilter;

const gui = new GUI();

const PARAMETERS = {
  materialColor: "#ff35e4",
  lightColor: "#ffffff",
  lightIntesity: 1,
};
gui
  .addColor(PARAMETERS, "materialColor")
  .onChange(() => material.color.set(PARAMETERS.materialColor));
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

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

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

const light = new THREE.DirectionalLight(
  PARAMETERS.lightColor,
  PARAMETERS.lightIntesity
);
light.position.set(1, 1, 0);
scene.add(light);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let { scrollY } = window;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  for (const mesh of sectionsMeshes) {
    mesh.rotation.x = elapsedTime * 0.14;
    mesh.rotation.y = elapsedTime * 0.12;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
