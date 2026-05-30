import fs from 'fs';
import path from 'path';
import https from 'https';

const TEXTURES_DIR = path.join(process.cwd(), 'public', 'textures');

// Ensure directory exists
if (!fs.existsSync(TEXTURES_DIR)) {
  fs.mkdirSync(TEXTURES_DIR, { recursive: true });
}

const texturesToDownload = [
  // Sun & Stars
  { name: 'sun.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/sun.jpg' },
  { name: 'stars.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/universe.jpg' },
  
  // Planets
  { name: 'mercury.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/mercury.jpg' },
  { name: 'venus.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/venus.jpg' },
  { name: 'mars.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/mars.jpg' },
  { name: 'jupiter.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/jupiter.jpg' },
  { name: 'saturn.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/saturn.jpg' },
  { name: 'saturn_ring.png', url: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/saturnringpattern.gif' },
  { name: 'uranus.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/uranus.jpg' },
  { name: 'neptune.jpg', url: 'https://cdn.jsdelivr.net/gh/shivam-070208/Solarsystem@master/textures/neptune.jpg' },
  
  // Detailed Earth & Moon Maps from Three.js repo (verified working)
  { name: 'earth.jpg', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg' },
  { name: 'earth_clouds.png', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png' },
  { name: 'earth_specular.jpg', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_specular_2048.jpg' },
  { name: 'earth_normal.jpg', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_normal_2048.jpg' },
  { name: 'earth_lights.png', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_lights_2048.png' },
  { name: 'moon.jpg', url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/moon_1024.jpg' }
];

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete local partial file on error
      reject(err);
    });
  });
}

async function main() {
  console.log(`Starting downloads into ${TEXTURES_DIR}...`);
  for (const item of texturesToDownload) {
    const dest = path.join(TEXTURES_DIR, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await downloadFile(item.url, dest);
      console.log(`Successfully downloaded ${item.name}`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

main();
