export const PLANET_DATA = {
  sun: {
    name: 'sun',
    displayName: 'The Sun',
    radius: 18.0, // Visually adjusted size
    distance: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.002,
    axialTilt: 0.126, // 7.25 degrees
    texture: '/textures/sun.jpg',
    color: '#ffaa00',
    stats: {
      diameter: '1,392,700 km',
      gravity: '274 m/s²',
      orbit: '0 Days',
      temp: '5,500 °C',
      mass: '1.989 × 10³⁰ kg',
      day: '609.6 hours',
      moons: '0'
    },
    description: 'The Sun is the yellow dwarf star at the center of our solar system. It accounts for 99.86% of the mass in the entire solar system and provides the energy that supports life on Earth through nuclear fusion.',
    trivia: 'The Sun is about 4.6 billion years old and has consumed about half of the hydrogen in its core.'
  },
  mercury: {
    name: 'mercury',
    displayName: 'Mercury',
    radius: 1.2,
    distance: 28,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
    axialTilt: 0.0006, // 0.034 degrees
    texture: '/textures/mercury.jpg',
    color: '#9e9e9e',
    stats: {
      diameter: '4,879 km',
      gravity: '3.7 m/s²',
      orbit: '88 Days',
      temp: '167 °C',
      mass: '3.301 × 10²³ kg',
      day: '1407.6 hours',
      moons: '0'
    },
    description: 'Mercury is the closest planet to the Sun and the smallest in our Solar System. Since it has no atmosphere to retain heat, it experiences extreme temperature fluctuations, ranging from icy nights to scorching days.',
    trivia: 'Despite being closest to the Sun, it is not the hottest planet; that title belongs to Venus.'
  },
  venus: {
    name: 'venus',
    displayName: 'Venus',
    radius: 2.2,
    distance: 40,
    orbitSpeed: 0.015,
    rotationSpeed: -0.002, // Retrograde rotation
    axialTilt: 3.094, // 177.3 degrees
    texture: '/textures/venus.jpg',
    color: '#e5c185',
    stats: {
      diameter: '12,104 km',
      gravity: '8.87 m/s²',
      orbit: '225 Days',
      temp: '464 °C',
      mass: '4.867 × 10²⁴ kg',
      day: '5832.5 hours',
      moons: '0'
    },
    description: 'Venus is the second planet from the Sun and is often called Earth\'s sister planet due to its similar size. However, a runaway greenhouse effect has trapped solar heat, making its surface hot enough to melt lead.',
    trivia: 'Venus rotates in the opposite direction of most other planets (retrograde), meaning the sun rises in the west.'
  },
  earth: {
    name: 'earth',
    displayName: 'Earth',
    radius: 2.4,
    distance: 56,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    axialTilt: 0.41, // 23.44 degrees
    texture: '/textures/earth.jpg',
    normalMap: '/textures/earth_normal.jpg',
    specularMap: '/textures/earth_specular.jpg',
    cloudsMap: '/textures/earth_clouds.png',
    lightsMap: '/textures/earth_lights.png',
    color: '#2563eb',
    stats: {
      diameter: '12,742 km',
      gravity: '9.81 m/s²',
      orbit: '365.25 Days',
      temp: '15 °C',
      mass: '5.972 × 10²⁴ kg',
      day: '24 hours',
      moons: '1'
    },
    description: 'Earth is the third planet from the Sun and the only place in the universe known to harbor life. It features liquid surface water, a protective magnetic field, and an atmosphere rich in oxygen and nitrogen.',
    trivia: 'Earth is the only planet in our Solar System not named after a mythological god or goddess.'
  },
  moon: {
    name: 'moon',
    displayName: 'The Moon',
    radius: 0.6,
    distance: 5.5, // Relative to Earth
    orbitSpeed: 0.08, // Orbit speed around Earth
    rotationSpeed: 0.008,
    axialTilt: 0.116, // 6.68 degrees
    texture: '/textures/moon.jpg',
    color: '#cbd5e1',
    stats: {
      diameter: '3,474 km',
      gravity: '1.62 m/s²',
      orbit: '27.3 Days',
      temp: '-20 °C',
      mass: '7.342 × 10²² kg',
      day: '708 hours',
      moons: '0'
    },
    description: 'The Moon is Earth\'s only natural satellite. It is tidally locked to Earth, meaning it always shows the same face to us. The Moon controls Earth\'s tides and stabilizes our axial wobble.',
    trivia: 'The Moon was likely formed about 4.5 billion years ago when a Mars-sized body collided with proto-Earth.'
  },
  mars: {
    name: 'mars',
    displayName: 'Mars',
    radius: 1.6,
    distance: 72,
    orbitSpeed: 0.008,
    rotationSpeed: 0.018,
    axialTilt: 0.44, // 25.19 degrees
    texture: '/textures/mars.jpg',
    color: '#dc2626',
    stats: {
      diameter: '6,779 km',
      gravity: '3.71 m/s²',
      orbit: '687 Days',
      temp: '-62 °C',
      mass: '6.390 × 10²³ kg',
      day: '24.6 hours',
      moons: '2'
    },
    description: 'Mars is the fourth planet from the Sun and is nicknamed the "Red Planet" due to iron oxide (rust) on its surface. It has thin atmospheric carbon dioxide and boasts the largest volcano in the Solar System, Olympus Mons.',
    trivia: 'Mars has two small irregular moons, Phobos and Deimos, which are thought to be captured asteroids.'
  },
  jupiter: {
    name: 'jupiter',
    displayName: 'Jupiter',
    radius: 6.0,
    distance: 100,
    orbitSpeed: 0.004,
    rotationSpeed: 0.04, // Extremely fast rotation
    axialTilt: 0.054, // 3.13 degrees
    texture: '/textures/jupiter.jpg',
    color: '#ea580c',
    stats: {
      diameter: '139,820 km',
      gravity: '24.79 m/s²',
      orbit: '12 Years',
      temp: '-108 °C',
      mass: '1.898 × 10²⁷ kg',
      day: '9.9 hours',
      moons: '95'
    },
    description: 'Jupiter is the fifth planet from the Sun and the largest in our solar system—twice as massive as all other planets combined. It is a gas giant with a core probably made of rock, surrounded by metallic hydrogen.',
    trivia: 'Jupiter\'s Great Red Spot is a persistent high-pressure storm larger than Earth that has raged for at least 300 years.'
  },
  saturn: {
    name: 'saturn',
    displayName: 'Saturn',
    radius: 5.0,
    distance: 130,
    orbitSpeed: 0.002,
    rotationSpeed: 0.036,
    axialTilt: 0.47, // 26.73 degrees
    texture: '/textures/saturn.jpg',
    ringTexture: '/textures/saturn_ring.png',
    ringInnerRadius: 7.0,
    ringOuterRadius: 13.0,
    color: '#d97706',
    stats: {
      diameter: '116,460 km',
      gravity: '10.44 m/s²',
      orbit: '29 Years',
      temp: '-139 °C',
      mass: '5.683 × 10² kg',
      day: '10.7 hours',
      moons: '146'
    },
    description: 'Saturn is the sixth planet from the Sun and the second-largest gas giant. It is famous for its massive and complex ring system, made of billions of particles of water ice, dust, and rocky debris.',
    trivia: 'Saturn has the lowest density of all planets; it is less dense than water, meaning it would float in a giant bathtub.'
  },
  uranus: {
    name: 'uranus',
    displayName: 'Uranus',
    radius: 3.5,
    distance: 160,
    orbitSpeed: 0.001,
    rotationSpeed: -0.015,
    axialTilt: 1.706, // 97.77 degrees (rolls on its side)
    texture: '/textures/uranus.jpg',
    ringInnerRadius: 5.0,
    ringOuterRadius: 6.2,
    color: '#0ea5e9',
    stats: {
      diameter: '50,724 km',
      gravity: '8.69 m/s²',
      orbit: '84 Years',
      temp: '-197 °C',
      mass: '8.681 × 10²⁵ kg',
      day: '17.2 hours',
      moons: '28'
    },
    description: 'Uranus is the seventh planet from the Sun and an ice giant. It is unique for its extreme axial tilt of 98 degrees, causing it to literally roll on its side as it orbits the Sun, likely the result of an ancient collision.',
    trivia: 'Uranus is the coldest planet in the Solar System, even though Neptune is further away from the Sun.'
  },
  neptune: {
    name: 'neptune',
    displayName: 'Neptune',
    radius: 3.4,
    distance: 190,
    orbitSpeed: 0.0006,
    rotationSpeed: 0.016,
    axialTilt: 0.49, // 28.32 degrees
    texture: '/textures/neptune.jpg',
    color: '#2563eb',
    stats: {
      diameter: '49,244 km',
      gravity: '11.15 m/s²',
      orbit: '165 Years',
      temp: '-201 °C',
      mass: '1.024 × 10²⁶ kg',
      day: '16.1 hours',
      moons: '16'
    },
    description: 'Neptune is the eighth and most distant major planet from the Sun. It is a blue ice giant, swept by the fastest winds in the Solar System, which reach speeds of up to 2,100 kilometers per hour.',
    trivia: 'Neptune was the first planet discovered by mathematical calculations rather than direct observation.'
  }
};

// Returns visual coordinates for orbital render
export function getVisualPosition(distance, angle) {
  return {
    x: Math.cos(angle) * distance,
    z: Math.sin(angle) * distance,
    y: 0
  };
}

// Returns realistic coordinates (logarithmic compression so distances fit on screen)
export function getRealisticPosition(distance, angle) {
  // Compression formula: log scaling to make it visible
  const scaleLog = Math.log(distance + 1) * 20;
  return {
    x: Math.cos(angle) * scaleLog,
    z: Math.sin(angle) * scaleLog,
    y: 0
  };
}
