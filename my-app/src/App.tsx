import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Home, Bed, Bath, Menu, X } from 'lucide-react';

export default function HouseDashboard() {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(2000);
  const [menuOpen, setMenuOpen] = useState(false);
  const [crupPopupOpen, setCrupPopupOpen] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const houseRef = useRef(null);
  const cameraRef = useRef(null);
  const modelSectionRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  
  // Second scene for realistic house
  const realisticMountRef = useRef(null);
  const realisticSceneRef = useRef(null);
  const realisticRendererRef = useRef(null);
  const realisticHouseRef = useRef(null);
  const realisticCameraRef = useRef(null);

  // Smooth scroll to model section
  const handleRunModel = () => {
    if (modelSectionRef.current) {
      modelSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Smooth scroll to about section
  const handleScrollToAbout = () => {
    if (aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    // Import Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    
    script.onload = () => {
      const THREE = (window as any).THREE;
      
      // Scene setup
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
      mountRef.current!.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Lighting
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
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a4d1a,
        roughness: 0.8
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      scene.add(ground);
      
      // Create House Group
      const house = new THREE.Group();
      houseRef.current = house;
      scene.add(house);
      
      // House Base
      const baseGeometry = new THREE.BoxGeometry(4, 3, 4);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4c5a0,
        roughness: 0.7
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0;
      base.castShadow = true;
      base.receiveShadow = true;
      house.add(base);
      
      // Roof
      const roofGeometry = new THREE.ConeGeometry(3.5, 2.5, 4);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb91c1c,
        roughness: 0.6
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = 2.75;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      house.add(roof);
      
      // Door
      const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
      const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b4423,
        roughness: 0.8
      });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(0, -0.75, 2.05);
      house.add(door);
      
      // Door knob
      const knobGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const knobMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        metalness: 0.8,
        roughness: 0.2
      });
      const knob = new THREE.Mesh(knobGeometry, knobMaterial);
      knob.position.set(0.3, -0.75, 2.1);
      house.add(knob);
      
      // Create windows function
      const createWindow = (x: number, y: number, z: number) => {
        const windowGroup = new THREE.Group();
        
        const frameGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xb91c1c,
          roughness: 0.6
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        windowGroup.add(frame);
        
        const glassGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.05);
        const glassMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.7,
          roughness: 0.1
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = 0.03;
        windowGroup.add(glass);
        
        windowGroup.position.set(x, y, z);
        return windowGroup;
      };
      
      // Store windows for dynamic updates
      house.userData.windows = [];
      
      // Bathroom orbs
      house.userData.orbs = [];
      const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const orbMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3b82f6,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      
      for (let i = 0; i < 10; i++) {
        const orb = new THREE.Mesh(orbGeometry, orbMaterial.clone());
        orb.visible = false;
        house.add(orb);
        house.userData.orbs.push(orb);
      }
      
      // Animation
      let frame = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate house
        house.rotation.y += 0.005;
        frame++;
        
        // Animate orbs
        house.userData.orbs.forEach((orb: any, i: number) => {
          if (orb.visible) {
            const angle = (i / bathrooms) * Math.PI * 2 + frame * 0.02;
            const radius = 4;
            orb.position.x = Math.cos(angle) * radius;
            orb.position.z = Math.sin(angle) * radius;
            orb.position.y = 3 + Math.sin(frame * 0.05 + i) * 0.3;
          }
        });
        
        renderer.render(scene, camera);
      };
      animate();
      
      // Initial window setup
      updateHouse();
    };
    
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  // Update house based on parameters
  const updateHouse = () => {
    if (!houseRef.current) return;
    
    const house = houseRef.current;
    
    // Update scale based on bedrooms and sqft
    const scale = 0.6 + (bedrooms / 40) + (sqft / 15000);
    house.scale.set(scale, scale, scale);
    
    // Update windows
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
      if (typeof window !== 'undefined' && (window as any).THREE) {
        const windowGroup = createWindow(...windowPositions[i]);
        house.add(windowGroup);
        house.userData.windows.push(windowGroup);
      }
    }
    
    // Update bathroom orbs visibility
    house.userData.orbs.forEach((orb: any, i: number) => {
      orb.visible = i < bathrooms;
    });
  };
  
  const createWindow = (x: number, y: number, z: number) => {
    if (typeof window === 'undefined' || !(window as any).THREE) return null;
    
    const THREE = (window as any).THREE;
    const windowGroup = new THREE.Group();
    
    const frameGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xb91c1c,
      roughness: 0.6
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    windowGroup.add(frame);
    
    const glassGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.05);
    const glassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.z = 0.03;
    windowGroup.add(glass);
    
    windowGroup.position.set(x, y, z);
    return windowGroup;
  };
  
  useEffect(() => {
    updateHouse();
  }, [bedrooms, bathrooms, sqft]);

  // Realistic house scene
  useEffect(() => {
    if (typeof window === 'undefined' || !realisticMountRef.current) return;

    const initRealisticHouse = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !realisticMountRef.current) return;
      
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      realisticSceneRef.current = scene;
      
      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        realisticMountRef.current.clientWidth / realisticMountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(10, 8, 15);
      camera.lookAt(0, 0, 0);
      realisticCameraRef.current = camera;
      
      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(realisticMountRef.current.clientWidth, realisticMountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      realisticMountRef.current.appendChild(renderer.domElement);
      realisticRendererRef.current = renderer;
      
      // Enhanced Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(15, 25, 15);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.left = -25;
      directionalLight.shadow.camera.right = 25;
      directionalLight.shadow.camera.top = 25;
      directionalLight.shadow.camera.bottom = -25;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);
      
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-10, 10, -10);
      scene.add(fillLight);
      
      const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
      rimLight.position.set(-5, 5, -15);
      scene.add(rimLight);
      
      // Realistic Ground with texture-like appearance
      const groundGeometry = new THREE.PlaneGeometry(40, 40);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d5016,
        roughness: 0.9,
        metalness: 0.1
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2.5;
      ground.receiveShadow = true;
      scene.add(ground);
      
      // Create Realistic House Group
      const house = new THREE.Group();
      realisticHouseRef.current = house;
      scene.add(house);
      
      // House Foundation
      const foundationGeometry = new THREE.BoxGeometry(5, 0.5, 5);
      const foundationMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b7355,
        roughness: 0.8,
        metalness: 0.1
      });
      const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
      foundation.position.y = -1.75;
      foundation.castShadow = true;
      foundation.receiveShadow = true;
      house.add(foundation);
      
      // Main Structure - more detailed
      const mainStructureGeometry = new THREE.BoxGeometry(4.5, 3.5, 4.5);
      const mainStructureMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe8dcc0,
        roughness: 0.7,
        metalness: 0.2
      });
      const mainStructure = new THREE.Mesh(mainStructureGeometry, mainStructureMaterial);
      mainStructure.position.y = 0;
      mainStructure.castShadow = true;
      mainStructure.receiveShadow = true;
      house.add(mainStructure);
      
      // Realistic Roof with shingles effect
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-2.5, 0);
      roofShape.lineTo(0, 2.5);
      roofShape.lineTo(2.5, 0);
      roofShape.lineTo(-2.5, 0);
      
      const roofExtrudeSettings = {
        depth: 5.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
      };
      
      const roofGeometry = new THREE.ExtrudeGeometry(roofShape, roofExtrudeSettings);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b1a1a,
        roughness: 0.8,
        metalness: 0.1
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.rotation.z = Math.PI / 2;
      roof.position.set(0, 2.5, 0);
      roof.castShadow = true;
      house.add(roof);
      
      // Second roof section for gable
      const roof2 = roof.clone();
      roof2.rotation.z = -Math.PI / 2;
      roof2.rotation.y = Math.PI / 2;
      house.add(roof2);
      
      // Chimney
      const chimneyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
      const chimneyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5a5a5a,
        roughness: 0.9,
        metalness: 0.1
      });
      const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
      chimney.position.set(1.5, 3.5, -1.5);
      chimney.castShadow = true;
      house.add(chimney);
      
      // Realistic Door with frame
      const doorFrameGeometry = new THREE.BoxGeometry(1.2, 2.2, 0.15);
      const doorFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a3728,
        roughness: 0.7
      });
      const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
      doorFrame.position.set(0, -0.4, 2.28);
      house.add(doorFrame);
      
      const doorGeometry = new THREE.BoxGeometry(0.9, 2, 0.1);
      const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d2817,
        roughness: 0.8,
        metalness: 0.1
      });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(0, -0.4, 2.35);
      door.castShadow = true;
      house.add(door);
      
      // Door panels (decorative)
      for (let i = 0; i < 2; i++) {
        const panelGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.05);
        const panelMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x2d1f14,
          roughness: 0.9
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(i === 0 ? -0.2 : 0.2, -0.4, 2.4);
        house.add(panel);
      }
      
      // Realistic door knob
      const knobGeometry = new THREE.SphereGeometry(0.06, 16, 16);
      const knobMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf4d03f,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x3d2817,
        emissiveIntensity: 0.1
      });
      const knob = new THREE.Mesh(knobGeometry, knobMaterial);
      knob.position.set(0.35, -0.4, 2.4);
      house.add(knob);
      
      // Realistic Windows with frames and glass
      const createRealisticWindow = (x: number, y: number, z: number, width: number = 0.8, height: number = 0.8) => {
        const windowGroup = new THREE.Group();
        
        // Window frame (outer)
        const outerFrameGeometry = new THREE.BoxGeometry(width + 0.15, height + 0.15, 0.12);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x8b7355,
          roughness: 0.6,
          metalness: 0.2
        });
        const outerFrame = new THREE.Mesh(outerFrameGeometry, frameMaterial);
        windowGroup.add(outerFrame);
        
        // Window frame (inner)
        const innerFrameGeometry = new THREE.BoxGeometry(width, height, 0.1);
        const innerFrame = new THREE.Mesh(innerFrameGeometry, frameMaterial);
        innerFrame.position.z = 0.01;
        windowGroup.add(innerFrame);
        
        // Window panes (cross pattern)
        const paneThickness = 0.05;
        const verticalPane = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, height, paneThickness),
          frameMaterial
        );
        verticalPane.position.z = 0.03;
        windowGroup.add(verticalPane);
        
        const horizontalPane = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.08, paneThickness),
          frameMaterial
        );
        horizontalPane.position.z = 0.03;
        windowGroup.add(horizontalPane);
        
        // Glass
        const glassGeometry = new THREE.BoxGeometry(width - 0.1, height - 0.1, 0.04);
        const glassMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xa8d8f0,
          transparent: true,
          opacity: 0.6,
          roughness: 0.05,
          metalness: 0.1,
          emissive: 0x87ceeb,
          emissiveIntensity: 0.2
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.z = 0.05;
        windowGroup.add(glass);
        
        windowGroup.position.set(x, y, z);
        return windowGroup;
      };
      
      // Store windows
      house.userData.windows = [];
      
      // Add windows
      const windowPositions = [
        [-1.5, 0.8, 2.28],
        [1.5, 0.8, 2.28],
        [-1.5, -0.5, 2.28],
        [1.5, -0.5, 2.28],
        [2.28, 0.8, -1.5],
        [2.28, 0.8, 1.5],
        [-2.28, 0.8, -1.5],
        [-2.28, 0.8, 1.5],
      ];
      
      windowPositions.forEach(pos => {
        const window = createRealisticWindow(...pos);
        house.add(window);
        house.userData.windows.push(window);
      });
      
      // Porch/Steps
      const stepGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.8);
      const stepMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b5b4a,
        roughness: 0.8
      });
      const step1 = new THREE.Mesh(stepGeometry, stepMaterial);
      step1.position.set(0, -1.6, 2.8);
      step1.castShadow = true;
      step1.receiveShadow = true;
      house.add(step1);
      
      const step2 = new THREE.Mesh(stepGeometry, stepMaterial);
      step2.position.set(0, -1.4, 3.2);
      step2.castShadow = true;
      step2.receiveShadow = true;
      house.add(step2);
      
      // Animation
      let frame = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate house smoothly
        house.rotation.y += 0.005;
        frame++;
        
        renderer.render(scene, camera);
      };
      animate();
      
      // Handle resize
      const handleResize = () => {
        if (!realisticMountRef.current || !realisticCameraRef.current || !realisticRendererRef.current) return;
        realisticCameraRef.current.aspect = realisticMountRef.current.clientWidth / realisticMountRef.current.clientHeight;
        realisticCameraRef.current.updateProjectionMatrix();
        realisticRendererRef.current.setSize(realisticMountRef.current.clientWidth, realisticMountRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      
      // Store cleanup function
      if (realisticRendererRef.current) {
        (realisticRendererRef.current as any).userData = (realisticRendererRef.current as any).userData || {};
        (realisticRendererRef.current as any).userData.cleanup = () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    };

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    // Check if Three.js is already loaded
    if ((window as any).THREE) {
      initRealisticHouse();
    } else {
      // Wait for Three.js to load (from first scene)
      checkInterval = setInterval(() => {
        if ((window as any).THREE) {
          if (checkInterval) clearInterval(checkInterval);
          initRealisticHouse();
        }
      }, 100);

      // Cleanup interval after 10 seconds if Three.js doesn't load
      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 10000);
    }
    
    // Cleanup
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (realisticRendererRef.current && (realisticRendererRef.current as any).userData?.cleanup) {
        (realisticRendererRef.current as any).userData.cleanup();
      }
      if (realisticRendererRef.current && realisticMountRef.current && (realisticRendererRef.current as any).domElement) {
        try {
          realisticMountRef.current.removeChild((realisticRendererRef.current as any).domElement);
        } catch (e) {
          // Element may already be removed
        }
      }
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <button 
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="logo">HOUSE PRICE PREDICTOR</div>
        
        <div className="header-right">
          <button 
            className="crup-button"
            onClick={() => setCrupPopupOpen(true)}
          >
            CRUP
          </button>
        </div>
      </header>

      {/* CRUP Popup */}
      {crupPopupOpen && (
        <div className="crup-popup-overlay" onClick={() => setCrupPopupOpen(false)}>
          <div className="crup-popup-box" onClick={(e) => e.stopPropagation()}>
            <button 
              className="crup-popup-close"
              onClick={() => setCrupPopupOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <p className="crup-popup-text">
              We love CRUP. A huge #shoutout to our sponsors The Incredible Fabulous Wonderful Amazing Anika. and Patrick.
            </p>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="menu-content">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => { setMenuOpen(false); handleScrollToAbout(); }}>About</a>
            <a href="#model" onClick={() => { setMenuOpen(false); handleRunModel(); }}>Model</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div ref={mountRef} className="three-container"></div>
          <div className="hero-overlay"></div>
        </div>
        
        {/* Bottom Text and Button */}
        <div className="hero-bottom">
          <h1 className="hero-title">
            HOUSE<br />
            PRICE<br />
            PREDICTOR
          </h1>
          <button className="run-model-button" onClick={handleRunModel}>
            RUN MODEL
          </button>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutSectionRef} className="about-section" id="about">
        <div className="about-content">
          <div className="about-container">
            <h2 className="about-title">ABOUT THE PROJECT</h2>
            
            <div className="about-section-block">
              <h3 className="about-subtitle">Central Problem & Real-World Impact</h3>
              <p className="about-text">
                Housing affordability is a pressing issue worldwide, affecting buyers, renters, policymakers, and city planners. Our project seeks to address the question: how can we make housing markets more fair, transparent, and predictable by understanding how size and location influence home prices? Accurately predicting home prices allows us to identify neighborhoods where housing is becoming unaffordable, detect overpricing or underpricing, and reveal structural inequalities in the market. The ultimate beneficiaries of such insights are low- and middle-income families, first-time home buyers, and communities at risk of displacement. Policymakers and city planners also benefit by using this information to guide fairer housing policies, allocate resources effectively, and plan interventions where they are most needed. Real-world decisions that could be informed by this model include setting fair listing prices, identifying areas at risk of rapid price increases, targeting neighborhoods for affordable housing initiatives, and evaluating the effect of size and location on equity and sustainability.
              </p>
            </div>

            <div className="about-section-block">
              <h3 className="about-subtitle">Dataset Overview</h3>
              <p className="about-text">
                The dataset used for this project includes individual home transactions, with each row representing a single sale. Key features include home size, location (zip code or geographic coordinates), number of bedrooms and bathrooms, and year built. The dataset contains [insert number] examples. While the dataset provides a strong foundation for predictive modeling, it has some limitations. Certain neighborhoods may be underrepresented, and features such as school quality, neighborhood amenities, or crime rates are not included. Additionally, historical pricing biases may be reflected in the data, which could influence predictions.
              </p>
            </div>

            <div className="about-section-block">
              <h3 className="about-subtitle">Methodology</h3>
              <p className="about-text">
                We experimented with both linear regression and Ridge Regression to model home prices. While linear regression provides a straightforward approach, Ridge Regression was ultimately chosen because it mitigates overfitting, particularly in datasets with multicollinearity or highly correlated features. Ridge Regression introduces a regularization term that constrains the model coefficients, producing a more stable and reliable solution. Conceptually, one can imagine the model's error, or loss, as a mountainous terrain in multiple dimensions, where each point represents a different combination of feature weights. Linear regression may produce a long, flat valley of minima—many combinations of weights yielding similar errors. Ridge Regression "folds the edges of this valley," producing a unique absolute minimum, which stabilizes predictions and ensures a balanced weighting of features. We tuned the regularization strength (alpha) to optimize the trade-off between bias and variance.
              </p>
            </div>

            <div className="about-section-block">
              <h3 className="about-subtitle">Results and Insights</h3>
              <p className="about-text">
                Our Ridge Regression model demonstrates that home size and location are strong predictors of price, while regularization helps reduce the impact of outliers and correlated features. Evaluation metrics such as [insert metrics, e.g., RMSE, MAE, R²] indicate that the model reliably predicts prices across a range of neighborhoods. The model provides actionable insights by highlighting areas with rapid price increases, potential overpricing, and inequities in housing access. However, it is important to acknowledge limitations. The model does not account for non-quantitative factors such as school quality or neighborhood amenities, and predictions may be less accurate in highly volatile markets. Historical biases in the data could also influence model outputs.
              </p>
            </div>

            <div className="about-section-block">
              <h3 className="about-subtitle">Conclusion</h3>
              <p className="about-text">
                By applying Ridge Regression to size and location features, we can predict home prices more objectively and transparently. This approach allows stakeholders to identify areas where housing is becoming unaffordable, expose market inequalities, and make informed decisions about fair pricing and policy interventions. Ultimately, the model provides a tool to improve housing market fairness, support vulnerable communities, and guide city planning toward more equitable and sustainable outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Model Section (where it scrolls to) */}
      <section ref={modelSectionRef} className="model-section">
        <div className="model-content">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black tracking-wider mb-2">BUILD YOUR HOME</h2>
            </div>

            <div className="model-split-container">
              {/* Left Panel - Controls (50%) */}
              <div className="model-controls-panel">
                <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 h-full">
                  <h3 className="text-3xl font-black mb-8 tracking-wide glow-text">BUILD YOUR HOME</h3>
                  
                  {/* Bedrooms Control */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bed className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-light">Bedrooms</span>
                      </div>
                      <span className="text-2xl font-light text-blue-400">{bedrooms}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((bedrooms - 1) / 19) * 100}%, #27272a ${((bedrooms - 1) / 19) * 100}%, #27272a 100%)`
                      }}
                    />
                  </div>

                  {/* Bathrooms Control */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bath className="w-5 h-5 text-purple-400" />
                        <span className="text-lg font-light">Bathrooms</span>
                      </div>
                      <span className="text-2xl font-light text-purple-400">{bathrooms}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((bathrooms - 1) / 9) * 100}%, #27272a ${((bathrooms - 1) / 9) * 100}%, #27272a 100%)`
                      }}
                    />
                  </div>

                  {/* Size Control */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-cyan-400" />
                        <span className="text-lg font-light">Square Footage</span>
                      </div>
                      <span className="text-2xl font-light text-cyan-400">{sqft.toLocaleString()} sq ft</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="100"
                      value={sqft}
                      onChange={(e) => setSqft(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((sqft - 500) / 9500) * 100}%, #27272a ${((sqft - 500) / 9500) * 100}%, #27272a 100%)`
                      }}
                    />
                  </div>

                  {/* Info Display */}
                  <div className="mt-8 pt-6 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400 tracking-wide">
                      Bedrooms: {bedrooms} | Bathrooms: {bathrooms} | Size: {sqft.toLocaleString()} sq ft
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Realistic 3D House (50%) */}
              <div className="model-house-panel">
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-lg p-8 border border-zinc-800 w-full h-full">
                  <div 
                    ref={realisticMountRef}
                    className="realistic-house-container"
                  />
                  
                  {/* Corner accents */}
                  <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-blue-500 opacity-50"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-purple-500 opacity-50"></div>
                  
                  {/* Rotation indicator */}
                  <div className="absolute bottom-4 right-4 text-xs text-zinc-500 tracking-wider">
                    360° ROTATION
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}