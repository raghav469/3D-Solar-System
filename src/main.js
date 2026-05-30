import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

import { PLANET_DATA, getVisualPosition, getRealisticPosition } from './planets.js';
import { AtmosphereShader, SunPlasmaShader } from './shaders.js';
import { createStarfield, createSpaceDust } from './stars.js';

// --- Globals & Settings ---
let scene, camera, renderer, composer;
let starfield, spaceDust;
let planets = {}; // Holds 3D planet mesh objects
let orbitLines = {}; // Holds 3D orbit lines
let planetAngles = {}; // Current orbital angles
let sunShaderMaterial;

// Scrollytelling Telemetry State
let scrollProgress = 0;
let mouseX = 0, mouseY = 0; // For parallax effect
let activeSectionIndex = 0;
let cameraBasePosition = new THREE.Vector3(0, 60, 160);
let currentParallaxX = 0;
let currentParallaxY = 0;

// Configs
let isPaused = false;
let isRealisticScale = false; // Standard visual layout for scrollytelling
let orbitsVisible = true;
let isAudioOn = false;
let audioCtx = null;
let spaceSynthNode = null;
let timeSpeedMultiplier = 1.0; // Control animation speed

// Clock for shaders & rotation
const clock = new THREE.Clock();

// --- Loading Manager ---
const loadingManager = new THREE.LoadingManager();

// Lazy-load DOM elements (they may not exist at module load time)
function getLoaderBar() { return loaderBar || (loaderBar = document.getElementById('loader-bar')); }
function getLoaderStatus() { return loaderStatus || (loaderStatus = document.getElementById('loader-status')); }
function getLoaderScreen() { return loaderScreen || (loaderScreen = document.getElementById('loader-screen')); }

let loaderBar, loaderStatus, loaderScreen;

const triviaTexts = [
  "One day on Venus is longer than one year on Venus.",
  "Saturn's rings are made of billions of ice particles, dust, and rocks.",
  "Mars boasts Olympus Mons, the largest volcano in the Solar System.",
  "Jupiter's Great Red Spot is a hurricane twice the size of Earth.",
  "Neptune's winds are the fastest in the Solar System, reaching 2,100 km/h.",
  "Uranus rolls on its side at an extreme 98-degree tilt.",
  "Light from the Sun takes approximately 8 minutes and 19 seconds to reach Earth."
];

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const percentage = Math.floor((itemsLoaded / itemsTotal) * 100);
  const bar = getLoaderBar();
  const status = getLoaderStatus();
  if (bar) bar.style.width = `${percentage}%`;
  if (status) status.innerText = `Acquiring cosmic telemetry: ${percentage}%`;
  
  if (itemsLoaded % 2 === 0) {
    const randomTrivia = triviaTexts[Math.floor(Math.random() * triviaTexts.length)];
    const triviaEl = document.getElementById('trivia-text');
    if (triviaEl) triviaEl.innerText = randomTrivia;
  }
};

loadingManager.onError = (url) => {
  console.error('Failed to load texture:', url);
};

loadingManager.onLoad = () => {
  console.log('Cosmic data load complete.');
  const status = getLoaderStatus();
  if (status) status.innerText = "System online. Launching tour...";
  
  setTimeout(() => {
    const screen = getLoaderScreen();
    if (screen) screen.classList.add('hidden');
    
    // Trigger scroll position init
    onScroll();
    
    if (isAudioOn && audioCtx) {
      playTransitionSound();
    }
  }, 1000);
};

const textureLoader = new THREE.TextureLoader(loadingManager);

// --- Initialization ---
function init() {
  console.log('Initializing Three.js scene...');
  const container = document.getElementById('canvas-container');
  
  if (!container) {
    console.error('Canvas container not found. Make sure #canvas-container exists in HTML.');
    return;
  }
  
  console.log('Canvas container found, starting initialization');
  
  // 1. Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020207, 0.0003);

  // 2. Camera Setup (Start wide)
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(0, 60, 160);

  // 3. Optimized Renderer (Performance Fixes)
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    powerPreference: "high-performance",
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Limit pixel ratio to 1.5 to prevent GPU rendering lag on 4K/retina displays
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  // Disable heavy shadows map calculations
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // 4. Lights Setup
  const ambientLight = new THREE.AmbientLight(0x0e0e22, 0.75);
  scene.add(ambientLight);

  // Core point source inside Sun (glowing outwards, no shadows calculation)
  const sunLight = new THREE.PointLight(0xfff7e6, 3.8, 1000, 0.5);
  scene.add(sunLight);

  // 5. Stars & Space Dust (Optimized Counts for performance)
  starfield = createStarfield(scene, 9000);
  spaceDust = createSpaceDust(scene, 1200);

  // 6. Build Celestial Bodies
  buildSolarSystem();

  // 7. Post-Processing Bloom
  initPostProcessing();

  // 8. Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onScroll);
  window.addEventListener('mousemove', onMouseMove);
  
  setupUIEvents();

  // 9. Start Animation
  animate();
}

// --- Build Planets & Sun ---
function buildSolarSystem() {
  const defaultAngle = () => Math.random() * Math.PI * 2;

  Object.keys(PLANET_DATA).forEach((key) => {
    const data = PLANET_DATA[key];
    planetAngles[key] = defaultAngle();

    if (key === 'moon') return; // Handled as nested

    const bodyGroup = new THREE.Group();
    bodyGroup.rotation.z = data.axialTilt;
    scene.add(bodyGroup);

    let mesh;
    let textures = {};

    textures.map = textureLoader.load(data.texture);

    if (key === 'sun') {
      sunShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: SunPlasmaShader.vertexShader,
        fragmentShader: SunPlasmaShader.fragmentShader,
        uniforms: {
          time: { value: 0 },
          sunTexture: { value: textures.map }
        }
      });

      const geometry = new THREE.SphereGeometry(data.radius, 56, 56);
      mesh = new THREE.Mesh(geometry, sunShaderMaterial);
      bodyGroup.add(mesh);
    } else if (key === 'earth') {
      textures.normal = textureLoader.load(data.normalMap);
      textures.specular = textureLoader.load(data.specularMap);
      textures.clouds = textureLoader.load(data.cloudsMap);
      textures.lights = textureLoader.load(data.lightsMap);

      const earthMat = new THREE.MeshStandardMaterial({
        map: textures.map,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(0.7, 0.7),
        roughnessMap: textures.specular,
        roughness: 0.85,
        metalness: 0.1,
        emissiveMap: textures.lights,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.5
      });

      const geometry = new THREE.SphereGeometry(data.radius, 44, 44);
      mesh = new THREE.Mesh(geometry, earthMat);
      bodyGroup.add(mesh);

      // Clouds
      const cloudMat = new THREE.MeshStandardMaterial({
        map: textures.clouds,
        transparent: true,
        opacity: 0.3,
        depthWrite: false
      });
      const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.012, 44, 44);
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMat);
      bodyGroup.add(cloudMesh);
      planets.earthClouds = cloudMesh;
    } else {
      const planetMat = new THREE.MeshStandardMaterial({
        map: textures.map,
        roughness: 0.75,
        metalness: 0.1
      });

      const geometry = new THREE.SphereGeometry(data.radius, 44, 44);
      mesh = new THREE.Mesh(geometry, planetMat);
      bodyGroup.add(mesh);
    }

    planets[key] = {
      mesh: mesh,
      group: bodyGroup,
      radius: data.radius,
      axialTilt: data.axialTilt,
      rotationSpeed: data.rotationSpeed,
      orbitSpeed: data.orbitSpeed,
      distance: data.distance,
      color: data.color
    };

    // Atmosphere glows
    if (['earth', 'venus', 'uranus', 'neptune'].includes(key)) {
      let glowColorHex = 0x00f3ff;
      if (key === 'venus') glowColorHex = 0xffad59;
      if (key === 'uranus') glowColorHex = 0xa6e3e9;
      if (key === 'neptune') glowColorHex = 0x3b82f6;

      const atmosphereMat = new THREE.ShaderMaterial({
        vertexShader: AtmosphereShader.vertexShader,
        fragmentShader: AtmosphereShader.fragmentShader,
        uniforms: {
          glowColor: { value: new THREE.Color(glowColorHex) },
          coefficient: { value: 0.22 },
          power: { value: 3.5 }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });

      const atmosphereGeom = new THREE.SphereGeometry(data.radius * 1.15, 28, 28);
      const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
      bodyGroup.add(atmosphereMesh);
      planets[key].atmosphere = atmosphereMesh;
    }

    // Saturn & Uranus Rings
    if (data.ringInnerRadius) {
      let ringMat;
      if (key === 'saturn') {
        const ringTexture = textureLoader.load(data.ringTexture);
        ringMat = new THREE.MeshStandardMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          roughness: 0.8
        });
      } else {
        ringMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
          roughness: 0.9
        });
      }

      const ringGeometry = new THREE.RingGeometry(data.ringInnerRadius, data.ringOuterRadius, 64);
      ringGeometry.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeometry, ringMat);
      bodyGroup.add(ringMesh);
      planets[key].ring = ringMesh;
    }

    createOrbitLine(key, data.distance, data.color);
  });

  // Nest Moon under Earth
  const moonData = PLANET_DATA.moon;
  const moonGroup = new THREE.Group();
  moonGroup.rotation.z = moonData.axialTilt;

  const moonTexture = textureLoader.load(moonData.texture);
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 0.85,
    metalness: 0.05
  });

  const moonGeometry = new THREE.SphereGeometry(moonData.radius, 28, 28);
  const moonMesh = new THREE.Mesh(moonGeometry, moonMat);
  moonGroup.add(moonMesh);

  const initialMoonPos = getVisualPosition(moonData.distance, planetAngles.moon);
  moonGroup.position.set(initialMoonPos.x, 0, initialMoonPos.z);
  scene.add(moonGroup);

  planets.moon = {
    mesh: moonMesh,
    group: moonGroup,
    radius: moonData.radius,
    orbitSpeed: moonData.orbitSpeed,
    distance: moonData.distance,
    color: moonData.color
  };
}

// --- Create Orbit Paths ---
function createOrbitLine(key, distance, colorHex) {
  if (key === 'sun') return;

  const segments = 100; // Optimized segmentation
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * 3);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const pos = getVisualPosition(distance, angle);
    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(colorHex),
    transparent: true,
    opacity: 0.08, // Subtler orbit indicators
    depthWrite: false
  });

  const orbitLine = new THREE.Line(geometry, material);
  scene.add(orbitLine);
  orbitLines[key] = orbitLine;
}

// --- Post Processing ---
function initPostProcessing() {
  const renderPass = new RenderPass(scene, camera);
  
  // Standard bloom setup with lower resolution sizes for performance
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7,   // strength
    0.3,   // radius
    0.8    // threshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}

// --- Scroll Mechanics and Telemetry Mapping ---
let scrollYVal = window.scrollY;
window.addEventListener('scroll', () => {
  scrollYVal = window.scrollY;
  onScroll();
});

// Each index maps to a section target layout
// returns: { target: Vector3, offset: Vector3 }
function getCameraConfigForSection(index, frac = 0) {
  const configs = [
    // 0: Intro (Wide system view)
    { target: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(0, 60, 160) },
    
    // 1: Sun
    { target: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(0, 8, 48) },
    
    // 2: Mercury
    { target: 'mercury', offset: new THREE.Vector3(0, 2.2, 5.0) },
    
    // 3: Venus
    { target: 'venus', offset: new THREE.Vector3(0, 3.8, 8.8) },
    
    // 4: Earth
    { target: 'earth', offset: new THREE.Vector3(0, 4.2, 9.5) },
    
    // 5: Mars
    { target: 'mars', offset: new THREE.Vector3(0, 3.0, 7.0) },
    
    // 6: Jupiter
    { target: 'jupiter', offset: new THREE.Vector3(0, 11.0, 24.0) },
    
    // 7: Saturn
    { target: 'saturn', offset: new THREE.Vector3(0, 12.0, 28.0) },
    
    // 8: Uranus
    { target: 'uranus', offset: new THREE.Vector3(0, 8.0, 18.0) },
    
    // 9: Neptune
    { target: 'neptune', offset: new THREE.Vector3(0, 8.0, 18.0) },
    
    // 10: Footer / Ending (Wide systems view)
    { target: new THREE.Vector3(0, 0, 0), offset: new THREE.Vector3(0, 80, 240) }
  ];

  const getPosAndOffset = (cfg) => {
    let targetPos = new THREE.Vector3();
    if (!cfg) {
      return { target: targetPos, offset: new THREE.Vector3(0, 60, 160) };
    }
    if (typeof cfg.target === 'string') {
      const planetObj = planets[cfg.target];
      if (planetObj) targetPos.copy(planetObj.group.position);
    } else {
      targetPos.copy(cfg.target);
    }
    return { target: targetPos, offset: cfg.offset.clone() };
  };

  // Clamp index to array bounds
  const clampedIndex = Math.min(Math.max(index, 0), configs.length - 1);
  const cfgA = configs[clampedIndex];
  const cfgB = configs[Math.min(clampedIndex + 1, configs.length - 1)];

  const dataA = getPosAndOffset(cfgA);
  const dataB = getPosAndOffset(cfgB);

  const finalTarget = new THREE.Vector3().lerpVectors(dataA.target, dataB.target, frac);
  const finalOffset = new THREE.Vector3().lerpVectors(dataA.offset, dataB.offset, frac);

  return { target: finalTarget, offset: finalOffset };
}

function onScroll() {
  const scrollY = window.scrollY;
  const sectionHeight = window.innerHeight;
  
  // Total scroll height
  const maxScroll = document.documentElement.scrollHeight - sectionHeight;
  scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

  // Track active section index
  const sectionFloat = scrollY / sectionHeight;
  activeSectionIndex = Math.floor(sectionFloat);

  // Active section markup fade triggers
  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach((sec, idx) => {
    sec.classList.toggle('active', idx === Math.round(sectionFloat));
  });
}

const cameraLookTargetCurrent = new THREE.Vector3();

// --- Mouse Movement Parallax ---
function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) - 0.5;
  mouseY = (event.clientY / window.innerHeight) - 0.5;
}

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const time = clock.getElapsedTime();

  // 1. Update Sun plasma shader
  if (sunShaderMaterial) {
    sunShaderMaterial.uniforms.time.value = time;
  }

  // 2. Space dust drift
  if (spaceDust) {
    spaceDust.update();
  }

  // 3. Orbits & Rotations
  if (!isPaused) {
    const deltaMultiplier = deltaTime * timeSpeedMultiplier * 18.0;

    Object.keys(planets).forEach((key) => {
      if (key === 'moon' || key === 'earthClouds') return;
      const planet = planets[key];

      // Axis spin
      if (planet.mesh) {
        planet.mesh.rotation.y += planet.rotationSpeed * deltaMultiplier;
      }

      // Earth Clouds rotation
      if (key === 'earth' && planets.earthClouds) {
        planets.earthClouds.rotation.y += (planet.rotationSpeed * 1.15) * deltaMultiplier;
      }

      // Orbit translation around Sun
      if (key !== 'sun') {
        planetAngles[key] += planet.orbitSpeed * deltaMultiplier * 0.05;
        const pos = getVisualPosition(planet.distance, planetAngles[key]);
        planet.group.position.set(pos.x, pos.y, pos.z);
      }
    });

    // Update Moon orbital translation
    if (planets.moon && planets.earth) {
      const moon = planets.moon;
      const earth = planets.earth;

      moon.mesh.rotation.y += moon.rotationSpeed * deltaMultiplier;
      planetAngles.moon += moon.orbitSpeed * deltaMultiplier * 0.08;

      const moonRelativePos = getVisualPosition(moon.distance, planetAngles.moon);
      moon.group.position.set(
        earth.group.position.x + moonRelativePos.x,
        earth.group.position.y,
        earth.group.position.z + moonRelativePos.z
      );
    }
  }

  // 4. Update Camera dynamic scroll targeting & mouse parallax
  const sectionHeight = window.innerHeight;
  const sectionFloat = scrollYVal / sectionHeight;
  const index = Math.floor(sectionFloat);
  const fraction = sectionFloat - index;

  const cameraConfig = getCameraConfigForSection(index, fraction);
  
  // Interpolate camera base position to destination coordinate
  const targetCameraPos = cameraConfig.target.clone().add(cameraConfig.offset);
  cameraBasePosition.lerp(targetCameraPos, 0.05);

  // Interpolate camera look-at targets for smooth tracking
  cameraLookTargetCurrent.lerp(cameraConfig.target, 0.05);
  camera.lookAt(cameraLookTargetCurrent);

  // Subtle float based on mouse coords
  const parallaxGoalX = mouseX * 12;
  const parallaxGoalY = -mouseY * 12;
  
  currentParallaxX += (parallaxGoalX - currentParallaxX) * 0.05;
  currentParallaxY += (parallaxGoalY - currentParallaxY) * 0.05;
  
  camera.position.set(
    cameraBasePosition.x + currentParallaxX,
    cameraBasePosition.y + currentParallaxY,
    cameraBasePosition.z
  );

  composer.render();
}

// --- Window Resize ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  
  // Re-trigger scroll positions mapping
  onScroll();
}

// --- UI Events Panel Binding ---
function setupUIEvents() {
  // Audio Toggle Action
  const audioBtn = document.getElementById('toggle-audio-btn');
  audioBtn.addEventListener('click', () => {
    isAudioOn = !isAudioOn;
    audioBtn.classList.toggle('active', isAudioOn);
    
    const label = audioBtn.querySelector('.btn-label');
    if (label) {
      label.innerText = isAudioOn ? 'AUDIO: ON' : 'AUDIO: OFF';
    }

    if (isAudioOn) {
      initAudio();
    } else {
      stopAudio();
    }
  });
}

// --- Procedural Space Audio Synthesizer ---
function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gainNode = audioCtx.createGain();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(55, audioCtx.currentTime); 
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(55.5, audioCtx.currentTime); 

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(140, audioCtx.currentTime);
  filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc1.start();
  osc2.start();

  spaceSynthNode = { osc1, osc2, filter, gainNode };

  animateLFO();
}

function animateLFO() {
  if (!isAudioOn || !spaceSynthNode || !audioCtx) return;
  const time = audioCtx.currentTime;
  const pulseFreq = 140 + Math.sin(time * 0.15) * 35;
  spaceSynthNode.filter.frequency.setValueAtTime(pulseFreq, time);
  requestAnimationFrame(animateLFO);
}

function stopAudio() {
  if (spaceSynthNode) {
    spaceSynthNode.osc1.stop();
    spaceSynthNode.osc2.stop();
    spaceSynthNode.osc1.disconnect();
    spaceSynthNode.osc2.disconnect();
    spaceSynthNode.filter.disconnect();
    spaceSynthNode.gainNode.disconnect();
    spaceSynthNode = null;
  }
}

function playTransitionSound() {
  if (!audioCtx || audioCtx.state === 'suspended') return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.6);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.0);
}

// Init Three.js application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
