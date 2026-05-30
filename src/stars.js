import * as THREE from 'three';

export function createStarfield(scene, count = 12000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  // Diverse star colors (spectral classes)
  const starColors = [
    new THREE.Color('#9bb0ff'), // Blue-white (O/B class, hot)
    new THREE.Color('#ffffff'), // White (A/F class)
    new THREE.Color('#fff4e8'), // Yellow-white (G class, like Sun)
    new THREE.Color('#ffddb4'), // Yellow-orange (K class)
    new THREE.Color('#ffb4b4')  // Reddish (M class, cool)
  ];

  for (let i = 0; i < count; i++) {
    // Distribute stars in a giant sphere, but concentrate some in a disk (Milky Way)
    let x, y, z;
    const isMilkyWay = Math.random() < 0.45; // 45% stars lie in the galactic plane

    if (isMilkyWay) {
      // Galactic plane distribution (disk with spiral density)
      const angle = Math.random() * Math.PI * 2;
      const radius = 250 + Math.random() * 850;
      const spiralFactor = angle * 2.0;
      
      // Introduce spiral arms
      const armOffset = (Math.random() < 0.5 ? 0 : Math.PI);
      const spiralAngle = angle + spiralFactor * 0.15 + armOffset;

      x = Math.cos(spiralAngle) * radius + (Math.random() - 0.5) * 80;
      z = Math.sin(spiralAngle) * radius + (Math.random() - 0.5) * 80;
      y = (Math.random() - 0.5) * 45; // thin disk
    } else {
      // General spherical distribution for distant space stars
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 800 + Math.random() * 1200; // distant sphere

      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Pick random star color with bias towards white
    let colorIndex = 1; // default white
    const roll = Math.random();
    if (roll < 0.15) colorIndex = 0; // blue
    else if (roll < 0.55) colorIndex = 1; // white
    else if (roll < 0.75) colorIndex = 2; // yellow-white
    else if (roll < 0.90) colorIndex = 3; // yellow-orange
    else colorIndex = 4; // red

    const color = starColors[colorIndex];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // Size variations
    sizes[i] = 0.5 + Math.random() * 2.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom particle texture (procedural glowing point)
  const texture = createCircleTexture();

  const material = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starfield = new THREE.Points(geometry, material);
  scene.add(starfield);
  return starfield;
}

// Procedural texture for glowing stars to avoid blocky points
function createCircleTexture() {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Radial gradient for glow
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.15, 'rgba(230, 248, 255, 0.9)');
  grad.addColorStop(0.3, 'rgba(0, 243, 255, 0.4)');
  grad.addColorStop(0.6, 'rgba(0, 100, 255, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Creates floating cosmic dust particles around the local system
export function createSpaceDust(scene, count = 1500) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    // Distributed around the local orbital space
    const r = 20 + Math.random() * 220;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 60;

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;

    // Small drift velocities
    velocities.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Transparent cyan-ish cosmic dust particle
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(0, 243, 255, 0.6)');
  grad.addColorStop(0.4, 'rgba(0, 100, 255, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 1.5,
    map: texture,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const dust = new THREE.Points(geometry, material);
  scene.add(dust);

  // Return helper object to update positions during animate loop
  return {
    mesh: dust,
    update: () => {
      const posAttr = dust.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        let x = posAttr.getX(i) + velocities[i].x;
        let y = posAttr.getY(i) + velocities[i].y;
        let z = posAttr.getZ(i) + velocities[i].z;

        // Wrap around boundaries
        const dist = Math.sqrt(x*x + z*z);
        if (dist > 250) {
          const angle = Math.random() * Math.PI * 2;
          x = Math.cos(angle) * 20;
          z = Math.sin(angle) * 20;
        }

        posAttr.setX(i, x);
        posAttr.setY(i, y);
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    }
  };
}
