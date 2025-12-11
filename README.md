# My Project
import React, { useState, useEffect, useRef } from 'react';
import { Home, Bed, Bath } from 'lucide-react';

export default function HouseDashboard() {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(2000);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const houseRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    // Import Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    
    script.onload = () => {
      const THREE = window.THREE;
      
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
      mountRef.current.appendChild(renderer.domElement);
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
      const createWindow = (x, y, z) => {
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
        house.userData.orbs.forEach((orb, i) => {
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
    house.userData.windows.forEach(w => house.remove(w));
    house.userData.windows = [];
    
    const windowPositions = [
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
      if (typeof window !== 'undefined' && window.THREE) {
        const windowGroup = createWindow(...windowPositions[i]);
        house.add(windowGroup);
        house.userData.windows.push(windowGroup);
      }
    }
    
    // Update bathroom orbs visibility
    house.userData.orbs.forEach((orb, i) => {
      orb.visible = i < bathrooms;
    });
  };
  
  const createWindow = (x, y, z) => {
    if (typeof window === 'undefined' || !window.THREE) return null;
    
    const THREE = window.THREE;
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

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black tracking-wider mb-2 title-3d rounded-title">
            HOUSE PRICE PREDICTOR
          </h1>
          <div className="h-px bg-gradient-to-r from-blue-500 via-purple-500 to-transparent mx-auto w-3/4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Panel - Controls */}
          <div className="space-y-8">
            <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
              <h2 className="text-3xl font-black mb-8 tracking-wide glow-text">BUILD YOUR HOME</h2>
              
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

          {/* Right Panel - 3D House Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-lg p-8 border border-zinc-800">
              <div 
                ref={mountRef} 
                style={{ width: '600px', height: '600px' }}
                className="rounded-lg overflow-hidden"
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

      <style jsx>{`
        .rounded-title {
          font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;
          letter-spacing: 0.05em;
        }

        .title-3d {
          text-shadow: 
            0 1px 0 #0d3d0d,
            0 2px 0 #0d3d0d,
            0 3px 0 #0d3d0d,
            0 4px 0 #0d3d0d,
            0 5px 0 #0d3d0d,
            0 6px 0 #0d3d0d,
            0 7px 0 #0d3d0d,
            0 8px 0 #0d3d0d,
            0 9px 0 #0d3d0d,
            0 10px 15px rgba(13, 61, 13, 0.7),
            0 15px 25px rgba(13, 61, 13, 0.5),
            0 20px 35px rgba(13, 61, 13, 0.4);
          transform: translateZ(0);
          color: #ffffff;
        }

        .glow-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))
                  drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))
                  drop-shadow(0 0 60px rgba(6, 182, 212, 0.4));
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))
                    drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))
                    drop-shadow(0 0 60px rgba(6, 182, 212, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(59, 130, 246, 1))
                    drop-shadow(0 0 60px rgba(139, 92, 246, 0.8))
                    drop-shadow(0 0 90px rgba(6, 182, 212, 0.6));
          }
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}