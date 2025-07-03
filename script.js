// === Raycaster for hover labels ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const labelDiv = document.getElementById('label');
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// === Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Responsive Camera Distance ===
function getInitialCameraZ() {
  return window.innerWidth <= 768 ? 60 : 30;
}
camera.position.z = getInitialCameraZ();

// === Lighting ===
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 0, 0);
scene.add(light);

// === Sun ===
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.name = "Sun"; // ✅ Add Sun label
scene.add(sun);

// === Planet Data ===
const planetData = [
  { name: "Mercury", size: 0.3, distance: 4, color: 0xaaaaaa },
  { name: "Venus", size: 0.5, distance: 6, color: 0xffcc99 },
  { name: "Earth", size: 0.5, distance: 8, color: 0x3366ff },
  { name: "Mars", size: 0.4, distance: 10, color: 0xff3300 },
  { name: "Jupiter", size: 1.2, distance: 13, color: 0xff9966 },
  { name: "Saturn", size: 1.0, distance: 16, color: 0xffcc66 },
  { name: "Uranus", size: 0.8, distance: 19, color: 0x66ffff },
  { name: "Neptune", size: 0.8, distance: 22, color: 0x3366cc },
];

const planets = [];
const speeds = {};
const hoverableObjects = [sun]; // ✅ Include Sun

// === Create Planets ===
planetData.forEach((planet, index) => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = planet.name; // ✅ Add name to mesh
  scene.add(mesh);

  planets.push({ mesh, ...planet, angle: Math.random() * Math.PI * 2 });
  speeds[planet.name] = 0.01 + index * 0.002;
  hoverableObjects.push(mesh); // ✅ Add planet to hover list

  // Create speed slider
  const slidersDiv = document.getElementById("sliders");
  const label = document.createElement("label");
  label.textContent = planet.name;
  const input = document.createElement("input");
  input.type = "range";
  input.min = 0.001;
  input.max = 0.05;
  input.step = 0.001;
  input.value = speeds[planet.name];
  input.addEventListener("input", (e) => {
    speeds[planet.name] = parseFloat(e.target.value);
  });

  slidersDiv.appendChild(label);
  slidersDiv.appendChild(input);
});

// === Pause/Resume Animation ===
let isPaused = false;
const toggleBtn = document.getElementById("toggleBtn");
toggleBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  toggleBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
});

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet) => {
      planet.angle += speeds[planet.name];
      planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
      planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
    });
  }

  // === Hover Detection ===
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hoverableObjects);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    labelDiv.style.display = 'block';
    labelDiv.textContent = object.name;
    labelDiv.style.left = (mouseX + 10) + 'px';
    labelDiv.style.top = (mouseY - 20) + 'px';
  } else {
    labelDiv.style.display = 'none';
  }

  renderer.render(scene, camera);
}
animate();

// === Responsive Resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Add Stars in Background ===
function addStars(count) {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });

  const positions = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    positions.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars(300);
