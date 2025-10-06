import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { exoplanetAPI, generateSampleExoplanetData } from '../services/api';

function Planet({ position, data, onClick, isSelected, prediction }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Reducido de 0.01 a 0.002
      const time = state.clock.elapsedTime;
      const orbitalSpeed = 0.05; // Reducido de 0.2 a 0.05
      const radius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
      
      meshRef.current.position.x = radius * Math.cos(time * orbitalSpeed + Math.atan2(position[2], position[0]));
      meshRef.current.position.z = radius * Math.sin(time * orbitalSpeed + Math.atan2(position[2], position[0]));
      meshRef.current.position.y = position[1] + Math.sin(time * 0.2) * 0.1; // Reducido movimiento vertical
      
      if (isSelected) {
        const pulse = 1 + Math.sin(time * 1.5) * 0.05; // Reducido pulso
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(hovered ? 1.2 : 1); // Reducido hover scale
      }
    }
  });

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
      
      {/* Aura verde para planetas confirmados */}
      {prediction === 'CONFIRMED' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planetSize + 1, planetSize + 1.5, 32]} />
          <meshBasicMaterial 
            color="#4ade80" 
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Componente para cargar el modelo 3D del satélite
function SatelliteModel({ url, onLoad }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Intentar cargar el modelo GLB, si falla usar geometría por defecto
  let scene = null;
  try {
    const gltf = useGLTF(url);
    scene = gltf.scene;
  } catch (error) {
    console.log('No se pudo cargar el modelo GLB, usando geometría por defecto');
  }

  // Notificar cuando el modelo se carga
  useEffect(() => {
    if (onLoad) {
      onLoad();
      setModelLoaded(true);
    }
  }, [onLoad]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const time = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
      
      if (hovered) {
        const enhancedPulse = 1 + Math.sin(time * 4) * 0.2;
        meshRef.current.scale.setScalar(enhancedPulse);
      }
    }
  });

  return (
    <group>
      {scene ? (
        // Usar modelo GLB si está disponible
        <primitive 
          ref={meshRef}
          object={scene.clone()}
          scale={[2, 2, 2]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      ) : (
        // Geometría por defecto del satélite
        <group 
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Cuerpo principal del satélite */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 1, 1]} />
            <meshStandardMaterial
              color="#c0c0c0"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Paneles solares */}
          <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 2, 0.8]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.1, 2, 0.8]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          
          {/* Antena */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
            <meshStandardMaterial
              color="#ff6b35"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          
          {/* Antena superior */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial
              color="#ff6b35"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}
      
      {/* Aura de luz alrededor del satélite */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color="#4f46e5"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {hovered && (
        <mesh position={[0, 4, 0]}>
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

// Fallback si no se puede cargar el modelo
function CentralStar() {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const time = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
      
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
      
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b35"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
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

function LoadingFallback() {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      color: 'white', fontSize: '1.5rem', textAlign: 'center'
    }}>
      Loading 3D Scene...
    </div>
  );
}

export default function GalaxyScene() {
  const [exoplanets, setExoplanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [satelliteModelLoaded, setSatelliteModelLoaded] = useState(false);

  const cameraPosition = useMemo(() => [0, 10, 20], []);
  
  // URL del modelo del satélite
  const satelliteModelUrl = '/modelos/satelite.glb';

  // Generate sample data on component mount
  useEffect(() => {
    const generateSampleData = async () => {
      try {
        // Try to get uploaded files first
        const uploadsResponse = await exoplanetAPI.listUploads();
        const uploadedFiles = uploadsResponse.files || [];
        
        if (uploadedFiles.length > 0) {
          // Use uploaded data to generate planets
          const samplePlanets = [];
          for (let i = 0; i < Math.min(20, uploadedFiles.length * 3); i++) {
            samplePlanets.push(generateSampleExoplanetData({
              koi_name: `KOI-${1000 + i}`,
              ra: Math.random() * 360,
              dec: (Math.random() - 0.5) * 180,
              // Add some variation based on uploaded files
              koi_depth: 0.001 + Math.random() * 0.1,
              koi_period: 1 + Math.random() * 1000,
              koi_model_snr: 5 + Math.random() * 45,
            }));
          }
          setExoplanets(samplePlanets);
        } else {
          // Fallback to default sample data
          const samplePlanets = [];
          for (let i = 0; i < 20; i++) {
            samplePlanets.push(generateSampleExoplanetData({
              koi_name: `KOI-${1000 + i}`,
              ra: Math.random() * 360,
              dec: (Math.random() - 0.5) * 180,
            }));
          }
          setExoplanets(samplePlanets);
        }
      } catch (error) {
        console.error('Failed to load uploaded data, using default:', error);
        // Fallback to default sample data
        const samplePlanets = [];
        for (let i = 0; i < 20; i++) {
          samplePlanets.push(generateSampleExoplanetData({
            koi_name: `KOI-${1000 + i}`,
            ra: Math.random() * 360,
            dec: (Math.random() - 0.5) * 180,
          }));
        }
        setExoplanets(samplePlanets);
      }
    };
    generateSampleData();
  }, []);

  const deg2rad = (degrees) => degrees * (Math.PI / 180);

  const planetPositions = useMemo(() => {
    return exoplanets.map(planet => {
      const raRad = deg2rad(planet.ra);
      const decRad = deg2rad(planet.dec);
      const dist = Math.random() * 100 + 50; // Random distance from center
      const x = dist * Math.cos(decRad) * Math.cos(raRad);
      const y = dist * Math.cos(decRad) * Math.sin(raRad);
      const z = dist * Math.sin(decRad);
      
      return [x, y, z];
    });
  }, [exoplanets]);

  const handlePlanetClick = async (planet) => {
    setSelectedPlanet(planet);
    if (!predictions[planet.koi_name]) {
      setIsLoading(true);
      try {
        const predictionResult = await exoplanetAPI.predictExoplanet(planet);
        setPredictions(prev => ({ ...prev, [planet.koi_name]: predictionResult }));
      } catch (error) {
        console.error('Prediction failed:', error);
        setPredictions(prev => ({ ...prev, [planet.koi_name]: { prediction: 'ERROR', confidence: 0 } }));
      } finally {
        setIsLoading(false);
      }
    }
  };

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
          
          <Stars
            radius={150}
            depth={80}
            count={8000}
            factor={6}
            saturation={0}
            fade
            speed={0.5}
          />
          
          {/* Modelo del satélite central */}
          <Suspense fallback={<CentralStar />}>
            <SatelliteModel 
              url={satelliteModelUrl}
              onLoad={() => setSatelliteModelLoaded(true)}
            />
          </Suspense>
          
          {exoplanets.map((planet, index) => (
            <Planet
              key={planet.koi_name || index}
              position={planetPositions[index]}
              data={planet}
              onClick={() => handlePlanetClick(planet)}
              isSelected={selectedPlanet?.koi_name === planet.koi_name}
              prediction={predictions[planet.koi_name]}
            />
          ))}
          
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
      
      <div className="space-card absolute top-4 left-4 animate-fadeIn">
        <h3 className="font-semibold mb-2 text-lg text-glow">🛰️ Kepler Satellite System</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Confirmed Exoplanets</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span>Candidate Exoplanets</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-glow"></span>
            <span>Selected Planet</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span>Kepler Satellite</span>
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
      
      <div className="space-card absolute top-4 right-4 animate-fadeIn">
        <h4 className="font-semibold mb-2 text-glow">System Stats</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Total Planets:</span>
            <span className="text-blue-400">{exoplanets.length}</span>
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

      {selectedPlanet && (
        <div className="space-card absolute bottom-4 left-4 animate-fadeIn">
          <h4 className="font-semibold mb-2 text-glow">Selected Planet</h4>
          <div className="text-sm space-y-1">
            <div><strong>Name:</strong> {selectedPlanet.koi_name}</div>
            <div><strong>Period:</strong> {selectedPlanet.koi_period?.toFixed(2)} days</div>
            <div><strong>Depth:</strong> {selectedPlanet.koi_depth?.toFixed(4)}</div>
            {predictions[selectedPlanet.koi_name] && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    predictions[selectedPlanet.koi_name].prediction === 'CONFIRMED' 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {predictions[selectedPlanet.koi_name].prediction}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(predictions[selectedPlanet.koi_name].confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}