import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { exoplanetAPI, generateSampleExoplanetData } from '../services/api';

// Planet component for individual exoplanets
function Planet({ position, data, onClick, isSelected, prediction }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Enhanced animation with orbital motion
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation
      meshRef.current.rotation.y += 0.01;
      
      // Orbital motion
      const time = state.clock.elapsedTime;
      const orbitalSpeed = 0.2;
      const radius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
      
      meshRef.current.position.x = radius * Math.cos(time * orbitalSpeed + Math.atan2(position[2], position[0]));
      meshRef.current.position.z = radius * Math.sin(time * orbitalSpeed + Math.atan2(position[2], position[0]));
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.2;
      
      // Pulsing effect for selected planets
      if (isSelected) {
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(hovered ? 1.3 : 1);
      }
    }
  });

  // Determine planet color based on prediction
  const getPlanetColor = () => {
    if (prediction) {
      return prediction === 'CONFIRMED' ? '#4ade80' : '#fbbf24';
    }
    return isSelected ? '#3b82f6' : '#8b5cf6';
  };

  const planetSize = Math.max(0.4, Math.min(2.0, (data.koi_depth || 0.01) * 100));

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={getPlanetColor()}
          emissive={getPlanetColor()}
          emissiveIntensity={isSelected ? 0.4 : 0.2}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      
      {/* Planet label */}
      {hovered && (
        <mesh position={[0, planetSize + 1, 0]}>
          <planeGeometry args={[3, 0.8]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Orbital ring for selected planets */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planetSize + 0.5, planetSize + 0.7, 32]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Central star (Kepler)
function CentralStar() {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y += 0.005;
      
      // Pulsing effect
      const time = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
      
      // Enhanced pulsing when hovered
      if (hovered) {
        const enhancedPulse = 1 + Math.sin(time * 4) * 0.2;
        meshRef.current.scale.setScalar(enhancedPulse);
      }
    }
  });

  return (
    <group>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ff6b35"
          emissiveIntensity={hovered ? 0.6 : 0.3}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Star corona effect */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Star label */}
      {hovered && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[4, 1]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '18px',
      textAlign: 'center'
    }}>
      <div>Loading 3D Universe...</div>
      <div style={{ fontSize: '14px', marginTop: '10px', color: '#ccc' }}>
        Preparing Kepler's journey through space
      </div>
    </div>
  );
}

// Main GalaxyScene component
export default function GalaxyScene({ 
  exoplanets = [], 
  onPlanetClick, 
  selectedPlanet,
  predictions = {}
}) {
  const [cameraPosition, setCameraPosition] = useState([20, 10, 20]);

  // Generate 3D positions for exoplanets
  const planetPositions = useMemo(() => {
    return exoplanets.map((planet, index) => {
      const ra = (planet.ra || Math.random() * 360) * (Math.PI / 180);
      const dec = (planet.dec || (Math.random() - 0.5) * 180) * (Math.PI / 180);
      const distance = 5 + Math.random() * 15; // Distance from center
      
      const x = distance * Math.cos(dec) * Math.cos(ra);
      const y = distance * Math.sin(dec);
      const z = distance * Math.cos(dec) * Math.sin(ra);
      
      return [x, y, z];
    });
  }, [exoplanets]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ 
          background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          width: '100%',
          height: '100%'
        }}
        shadows
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight 
            position={[0, 0, 0]} 
            intensity={2} 
            color="#ffd700" 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[15, 15, 15]} intensity={0.8} color="#4f46e5" />
          <pointLight position={[-15, -15, -15]} intensity={0.6} color="#8b5cf6" />
          
          {/* Enhanced Stars background */}
          <Stars
            radius={150}
            depth={80}
            count={8000}
            factor={6}
            saturation={0}
            fade
            speed={0.5}
          />
          
          {/* Central star */}
          <CentralStar />
          
          {/* Exoplanets */}
          {exoplanets.map((planet, index) => (
            <Planet
              key={planet.koi_name || index}
              position={planetPositions[index]}
              data={planet}
              onClick={() => onPlanetClick(planet)}
              isSelected={selectedPlanet?.koi_name === planet.koi_name}
              prediction={predictions[planet.koi_name]}
            />
          ))}
          
          {/* Enhanced Camera controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
        </Suspense>
      </Canvas>
      
      {/* Enhanced Overlay instructions */}
      <div className="space-card absolute top-4 left-4 animate-fadeIn">
        <h3 className="font-semibold mb-2 text-lg text-glow">🌌 Kepler Exoplanet System</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-space-green rounded-full animate-pulse"></span>
            <span>Confirmed Exoplanets</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-space-yellow rounded-full animate-pulse"></span>
            <span>Candidate Exoplanets</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-space-accent rounded-full animate-glow"></span>
            <span>Selected Planet</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 space-y-1">
              <div>🖱️ Click planets to analyze</div>
              <div>🔄 Drag to rotate view</div>
              <div>🔍 Scroll to zoom</div>
              <div>⌨️ Use WASD to move</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats overlay */}
      <div className="space-card absolute top-4 right-4 animate-fadeIn">
        <h4 className="font-semibold mb-2 text-glow">System Stats</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Total Planets:</span>
            <span className="text-space-accent">{exoplanets.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Confirmed:</span>
            <span className="planet-confirmed">{Object.values(predictions).filter(p => p?.prediction === 'CONFIRMED').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Candidates:</span>
            <span className="planet-candidate">{Object.values(predictions).filter(p => p?.prediction === 'CANDIDATE').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected:</span>
            <span className="planet-selected">{selectedPlanet?.koi_name || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
