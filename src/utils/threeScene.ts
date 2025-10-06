import * as THREE from 'three';
import { Exoplanet, HostStar } from '../lib/supabase';

interface PlanetConfig {
  name: string;
  size: number;
  distance: number;
  color: number;
  orbitSpeed: number;
  rotationSpeed: number;
  emissive?: number;
  emissiveIntensity?: number;
}

const planetConfigs: PlanetConfig[] = [
  { name: 'mercury', size: 0.4, distance: 8, color: 0x8c7853, orbitSpeed: 0.04, rotationSpeed: 0.004 },
  { name: 'venus', size: 0.9, distance: 12, color: 0xffc649, orbitSpeed: 0.015, rotationSpeed: 0.002 },
  { name: 'earth', size: 1, distance: 16, color: 0x2233ff, orbitSpeed: 0.01, rotationSpeed: 0.02 },
  { name: 'mars', size: 0.5, distance: 20, color: 0xdc143c, orbitSpeed: 0.008, rotationSpeed: 0.018 },
  { name: 'jupiter', size: 2.5, distance: 30, color: 0xffa500, orbitSpeed: 0.002, rotationSpeed: 0.04 },
  { name: 'saturn', size: 2.2, distance: 40, color: 0xfad5a5, orbitSpeed: 0.0009, rotationSpeed: 0.038 },
  { name: 'uranus', size: 1.8, distance: 50, color: 0x4fd0e0, orbitSpeed: 0.0004, rotationSpeed: 0.03 },
  { name: 'neptune', size: 1.7, distance: 60, color: 0x4169e1, orbitSpeed: 0.0001, rotationSpeed: 0.032 },
];

export function createSolarSystemScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  camera.position.set(0, 30, 50);
  camera.lookAt(0, 0, 0);

  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
  });

  const starsVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    emissive: 0xfdb813,
    emissiveIntensity: 1
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.userData = { name: 'sun', type: 'star' };
  scene.add(sun);

  const glowGeometry = new THREE.SphereGeometry(3.8, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    transparent: true,
    opacity: 0.4,
  });
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(sunGlow);

  const secondGlowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
  const secondGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa500,
    transparent: true,
    opacity: 0.15,
  });
  const secondGlow = new THREE.Mesh(secondGlowGeometry, secondGlowMaterial);
  scene.add(secondGlow);

  const sunLight = new THREE.PointLight(0xffffff, 3, 300);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = false;
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
  scene.add(ambientLight);

  const planets: Array<{
    mesh: THREE.Mesh;
    config: PlanetConfig;
    angle: number;
    orbit: THREE.Line;
  }> = [];

  const hostStars: Array<{
    mesh: THREE.Mesh;
    light: THREE.PointLight;
    glow: THREE.Mesh;
    data: HostStar;
  }> = [];

  const exoplanets: Array<{
    mesh: THREE.Mesh;
    data: Exoplanet;
    hostStarId?: string;
    angle: number;
  }> = [];

  let followedPlanet: THREE.Mesh | null = null;
  let cameraOffset = new THREE.Vector3(0, 5, 10);
  let targetCameraPosition: THREE.Vector3 | null = null;
  let targetLookAt: THREE.Vector3 | null = null;

  planetConfigs.forEach((config) => {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(angle) * config.distance,
        0,
        Math.sin(angle) * config.distance
      );
    }
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);

    const geometry = new THREE.SphereGeometry(config.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.8,
      metalness: 0.2,
      emissive: config.emissive || 0x000000,
      emissiveIntensity: config.emissiveIntensity || 0,
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.userData = { name: config.name, type: 'planet' };
    planet.castShadow = false;
    planet.receiveShadow = false;

    const angle = Math.random() * Math.PI * 2;
    planet.position.x = Math.cos(angle) * config.distance;
    planet.position.z = Math.sin(angle) * config.distance;

    scene.add(planet);

    planets.push({ mesh: planet, config, angle, orbit });

    if (config.name === 'saturn') {
      const ringGeometry = new THREE.RingGeometry(config.size * 1.5, config.size * 2.5, 64);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9b07a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        roughness: 0.8,
        metalness: 0.1,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
  });

  function addHostStar(hostStarData: HostStar) {
    const starSize = hostStarData.st_rad * 1.5;
    const starColor = parseInt(hostStarData.color.replace('#', '0x'));

    const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: starColor,
      emissive: starColor,
      emissiveIntensity: 1
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.userData = {
      name: hostStarData.hostname,
      type: 'host_star',
      id: hostStarData.id,
      hostStarData: hostStarData
    };

    starMesh.position.set(
      hostStarData.position_x,
      hostStarData.position_y,
      hostStarData.position_z
    );

    const starLight = new THREE.PointLight(starColor, 2, 50);
    starLight.position.copy(starMesh.position);
    scene.add(starLight);

    const glowGeometry = new THREE.SphereGeometry(starSize * 1.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 0.4,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(starMesh.position);
    scene.add(glow);

    scene.add(starMesh);
    hostStars.push({ mesh: starMesh, light: starLight, glow, data: hostStarData });
  }

  function removeHostStar(id: string) {
    const index = hostStars.findIndex((s) => s.data.id === id);
    if (index !== -1) {
      scene.remove(hostStars[index].mesh);
      scene.remove(hostStars[index].light);
      scene.remove(hostStars[index].glow);
      hostStars.splice(index, 1);
    }
  }

  function addExoplanet(exoplanetData: Exoplanet) {
    const geometry = new THREE.SphereGeometry(exoplanetData.size, 32, 32);
    const color = parseInt(exoplanetData.color.replace('#', '0x'));
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3,
      emissive: color,
      emissiveIntensity: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      name: exoplanetData.name,
      type: 'exoplanet',
      id: exoplanetData.id,
      exoplanetData: exoplanetData
    };

    const hostStar = hostStars.find((s) => s.data.id === exoplanetData.host_star_id);
    let posX, posY, posZ;

    if (hostStar) {
      const orbitRadius = 3 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      posX = hostStar.mesh.position.x + Math.cos(angle) * orbitRadius;
      posY = hostStar.mesh.position.y + (Math.random() - 0.5) * 2;
      posZ = hostStar.mesh.position.z + Math.sin(angle) * orbitRadius;
    } else {
      posX = exoplanetData.position_x;
      posY = exoplanetData.position_y;
      posZ = exoplanetData.position_z;
    }

    mesh.position.set(posX, posY, posZ);

    scene.add(mesh);
    exoplanets.push({
      mesh,
      data: exoplanetData,
      hostStarId: exoplanetData.host_star_id,
      angle: Math.random() * Math.PI * 2
    });
  }

  function removeExoplanet(id: string) {
    const index = exoplanets.findIndex((e) => e.data.id === id);
    if (index !== -1) {
      scene.remove(exoplanets[index].mesh);
      exoplanets.splice(index, 1);
    }
  }

  function clearExoplanets() {
    exoplanets.forEach((e) => scene.remove(e.mesh));
    exoplanets.length = 0;
  }

  function clearHostStars() {
    hostStars.forEach((s) => {
      scene.remove(s.mesh);
      scene.remove(s.light);
      scene.remove(s.glow);
    });
    hostStars.length = 0;
  }

  function focusOnPosition(position: THREE.Vector3, distance: number = 20) {
    targetCameraPosition = position.clone().add(new THREE.Vector3(0, distance * 0.3, distance));
    targetLookAt = position.clone();
  }

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let cameraRotation = { x: 0, y: 0 };

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    cameraRotation.y += deltaX * 0.005;
    cameraRotation.x += deltaY * 0.005;

    cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));

    previousMousePosition = { x: e.clientX, y: e.clientY };
    targetCameraPosition = null;
    targetLookAt = null;
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (followedPlanet) {
      const currentDistance = cameraOffset.length();
      const newDistance = currentDistance + e.deltaY * 0.02;
      const clampedDistance = Math.max(5, Math.min(30, newDistance));
      cameraOffset.normalize().multiplyScalar(clampedDistance);
    } else {
      const distance = camera.position.length();
      const newDistance = distance + e.deltaY * 0.05;
      const clampedDistance = Math.max(20, Math.min(300, newDistance));
      camera.position.normalize().multiplyScalar(clampedDistance);
    }

    targetCameraPosition = null;
    targetLookAt = null;
  };

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let clickCallback: ((name: string, type: string, data?: any) => void) | null = null;

  const onClick = (event: MouseEvent) => {
    if (isDragging) return;

    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const allObjects = [
      sun,
      ...planets.map((p) => p.mesh),
      ...exoplanets.map((e) => e.mesh),
      ...hostStars.map((s) => s.mesh)
    ];
    const intersects = raycaster.intersectObjects(allObjects);

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      if (object.userData.name) {
        if (object.userData.type === 'star') {
          followedPlanet = null;
          targetCameraPosition = null;
          targetLookAt = null;
          if (clickCallback) clickCallback(object.userData.name, 'star');
        } else if (object.userData.type === 'host_star') {
          followedPlanet = null;
          focusOnPosition(object.position, 30);
          if (clickCallback) {
            clickCallback(object.userData.name, 'host_star', object.userData.hostStarData);
          }
        } else if (object.userData.type === 'exoplanet') {
          followedPlanet = object;
          const planetSize = (object.geometry as THREE.SphereGeometry).parameters.radius;
          cameraOffset = new THREE.Vector3(0, planetSize * 2, planetSize * 5);
          targetCameraPosition = null;
          targetLookAt = null;
          if (clickCallback) {
            clickCallback(object.userData.name, 'exoplanet', object.userData.exoplanetData);
          }
        } else {
          followedPlanet = object;
          const planetSize = (object.geometry as THREE.SphereGeometry).parameters.radius;
          cameraOffset = new THREE.Vector3(0, planetSize * 2, planetSize * 5);
          targetCameraPosition = null;
          targetLookAt = null;
          if (clickCallback) clickCallback(object.userData.name, 'planet');
        }
      }
    } else {
      followedPlanet = null;
      targetCameraPosition = null;
      targetLookAt = null;
      if (clickCallback) clickCallback('', 'none');
    }
  };

  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseup', onMouseUp);
  container.addEventListener('wheel', onWheel);
  container.addEventListener('click', onClick);

  let animationId: number;

  function animate() {
    animationId = requestAnimationFrame(animate);

    sun.rotation.y += 0.001;
    sunGlow.rotation.y += 0.001;
    secondGlow.rotation.y -= 0.0008;

    planets.forEach(({ mesh, config, angle }) => {
      const newAngle = angle + config.orbitSpeed;
      mesh.position.x = Math.cos(newAngle) * config.distance;
      mesh.position.z = Math.sin(newAngle) * config.distance;

      mesh.rotation.y += config.rotationSpeed;

      planets.find((p) => p.mesh === mesh)!.angle = newAngle;
    });

    hostStars.forEach(({ mesh, glow }) => {
      mesh.rotation.y += 0.002;
      glow.rotation.y += 0.002;
    });

    exoplanets.forEach((exo) => {
      exo.mesh.rotation.y += 0.01;

      if (exo.hostStarId) {
        const hostStar = hostStars.find((s) => s.data.id === exo.hostStarId);
        if (hostStar) {
          const orbitRadius = 3 + Math.random() * 0.1;
          exo.angle += 0.005;
          exo.mesh.position.x = hostStar.mesh.position.x + Math.cos(exo.angle) * orbitRadius;
          exo.mesh.position.z = hostStar.mesh.position.z + Math.sin(exo.angle) * orbitRadius;
        }
      }
    });

    if (targetCameraPosition && targetLookAt) {
      camera.position.lerp(targetCameraPosition, 0.05);
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(100).add(camera.position);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      if (camera.position.distanceTo(targetCameraPosition) < 0.5) {
        targetCameraPosition = null;
        targetLookAt = null;
      }
    } else if (followedPlanet) {
      const targetPosition = followedPlanet.position.clone().add(cameraOffset);
      camera.position.lerp(targetPosition, 0.05);
      camera.lookAt(followedPlanet.position);
    } else {
      const radius = camera.position.length();
      camera.position.x = radius * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.position.y = radius * Math.sin(cameraRotation.x);
      camera.position.z = radius * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }

  animate();

  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener('resize', handleResize);

  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    container.removeEventListener('mousedown', onMouseDown);
    container.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseup', onMouseUp);
    container.removeEventListener('wheel', onWheel);
    container.removeEventListener('click', onClick);
    cancelAnimationFrame(animationId);
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };

  const onPlanetClick = (callback: (name: string, type: string, data?: any) => void) => {
    clickCallback = callback;
  };

  function followExoplanet(exoplanetId: string) {
    const exo = exoplanets.find((e) => e.data.id === exoplanetId);
    if (exo) {
      followedPlanet = exo.mesh;
      const planetSize = (exo.mesh.geometry as THREE.SphereGeometry).parameters.radius;
      cameraOffset = new THREE.Vector3(0, planetSize * 2, planetSize * 5);
      targetCameraPosition = null;
      targetLookAt = null;
    }
  }

  function followPlanet(planetName: string) {
    const planet = planets.find((p) => p.config.name === planetName);
    if (planet) {
      followedPlanet = planet.mesh;
      const planetSize = (planet.mesh.geometry as THREE.SphereGeometry).parameters.radius;
      cameraOffset = new THREE.Vector3(0, planetSize * 2, planetSize * 5);
      targetCameraPosition = null;
      targetLookAt = null;
    }
  }

  return {
    cleanup,
    onPlanetClick,
    addExoplanet,
    removeExoplanet,
    clearExoplanets,
    addHostStar,
    removeHostStar,
    clearHostStars,
    focusOnPosition,
    followExoplanet,
    followPlanet
  };
}
