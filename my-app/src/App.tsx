// App.tsx
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { Home, Bed, Bath, Menu, X } from 'lucide-react';

declare global {
  interface Window {
    THREE: any;
  }
}

export default function HouseDashboard() {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(2000);
  const [menuOpen, setMenuOpen] = useState(false);
  const [crupPopupOpen, setCrupPopupOpen] = useState(false);

  // Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const houseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const modelSectionRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  const realisticMountRef = useRef<HTMLDivElement>(null);
  const realisticSceneRef = useRef<any>(null);
  const realisticRendererRef = useRef<any>(null);
  const realisticHouseRef = useRef<any>(null);
  const realisticCameraRef = useRef<any>(null);

  // Smooth scroll
  const handleRunModel = () => {
    if (modelSectionRef.current) {
      modelSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleScrollToAbout = () => {
    if (aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Main 3D House Scene
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;

    script.onload = () => {
      const THREE = window.THREE;
      if (!THREE || !mountRef.current) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(8, 6, 12);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
      scene.add(directionalLight);
      const pointLight = new THREE.PointLight(0x3b82f6, 0.5);
      pointLight.position.set(-5, 5, 5);
      scene.add(pointLight);

      // Ground
      const groundGeometry = new THREE.PlaneGeometry(30, 30);
      const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a4d1a, roughness: 0.8 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      scene.add(ground);

      // House
      const house = new THREE.Group();
      houseRef.current = house;
      scene.add(house);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0xd4c5a0, roughness: 0.7 })
      );
      base.position.y = 0;
      base.castShadow = true;
      base.receiveShadow = true;
      house.add(base);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 })
      );
      roof.position.y = 2.75;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      house.add(roof);

      // Door
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.5, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 })
      );
      door.position.set(0, -0.75, 2.05);
      house.add(door);

      // Door knob
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 })
      );
      knob.position.set(0.3, -0.75, 2.1);
      house.add(knob);

      // Windows helper
      const createHouseWindow = (x: number, y: number, z: number) => {
        const windowGroup = new THREE.Group();
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.7, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 })
        );
        windowGroup.add(frame);
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7, roughness: 0.1 })
        );
        glass.position.z = 0.03;
        windowGroup.add(glass);
        windowGroup.position.set(x, y, z);
        return windowGroup;
      };

      house.userData.windows = [];
      house.userData.orbs = [];
      const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const orbMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.5, roughness: 0.3 });
      for (let i = 0; i < 10; i++) {
        const orb = new THREE.Mesh(orbGeometry, orbMaterial.clone());
        orb.visible = false;
        house.add(orb);
        house.userData.orbs.push(orb);
      }

      let frameCount = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        house.rotation.y += 0.005;
        frameCount++;
        house.userData.orbs.forEach((orb: any, i: number) => {
          if (orb.visible) {
            const angle = (i / bathrooms) * Math.PI * 2 + frameCount * 0.02;
            const radius = 4;
            orb.position.x = Math.cos(angle) * radius;
            orb.position.z = Math.sin(angle) * radius;
            orb.position.y = 3 + Math.sin(frameCount * 0.05 + i) * 0.3;
          }
        });
        renderer.render(scene, camera);
      };
      animate();

      // Initial update
      updateHouse();
    };

    document.body.appendChild(script);

    return () => {
      if (rendererRef.current && mountRef.current) mountRef.current.removeChild(rendererRef.current.domElement);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Update house
  const updateHouse = () => {
    if (typeof window === 'undefined' || !houseRef.current) return;

    const house = houseRef.current;
    const scale = 0.6 + bedrooms / 40 + sqft / 15000;
    house.scale.set(scale, scale, scale);

    // Remove old windows
    house.userData.windows.forEach((w: any) => house.remove(w));
    house.userData.windows = [];

    const windowPositions: [number, number, number][] = [
      [-1.2, 0.5, 2.05],
      [1.2, 0.5, 2.05],
      [-1.2, -0.5, 2.05],
      [1.2, -0.5, 2.05],
      [2.05, 0.5, -1.2],
      [2.05, 0.5, 1.2],
      [-2.05, 0.5, -1.2],
      [-2.05, 0.5, 1.2],
    ];

    const numWindows = Math.min(bedrooms, 8);
    for (let i = 0; i < numWindows; i++) {
      const windowGroup = createHouseWindow(...windowPositions[i]);
      house.add(windowGroup);
      house.userData.windows.push(windowGroup);
    }

    // Update orbs
    house.userData.orbs.forEach((orb: any, i: number) => {
      orb.visible = i < bathrooms;
    });
  };

  useEffect(() => {
    updateHouse();
  }, [bedrooms, bathrooms, sqft]);

  // (The realistic house scene logic stays the same; add the same window check and TypeScript safety)

  return (
    <div className="landing-page">
      {/* HEADER + CRUP + MENU + HERO + ABOUT + MODEL sections remain unchanged */}
      {/* Just ensure all refs and updateHouse calls are inside useEffect for safety */}
      {/* You can copy your JSX from the original file here */}
    </div>
  );
}
