import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function GlobeCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group>
        {/* Central globe */}
        <mesh ref={meshRef} scale={3}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.8}
            chromaticAberration={0.1}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.05}
            iridescence={0.8}
            iridescenceIOR={1.1}
            iridescenceThicknessRange={[0, 1200]}
            color="#3D7A7A"
            transmission={0.92}
            roughness={0.08}
            envMapIntensity={0.4}
          />
        </mesh>

        {/* Inner core */}
        <mesh scale={1.5}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#1A4A4A"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Orbiting rings */}
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 3, 0, 0]} scale={4}>
            <torusGeometry args={[1, 0.008, 16, 128]} />
            <meshStandardMaterial
              color="#66AAAA"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, Math.PI / 6, 0]} scale={4.5}>
            <torusGeometry args={[1, 0.006, 16, 128]} />
            <meshStandardMaterial
              color="#88CCCC"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh rotation={[Math.PI / 4, Math.PI / 3, Math.PI / 6]} scale={5}>
            <torusGeometry args={[1, 0.004, 16, 128]} />
            <meshStandardMaterial
              color="#5599AA"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function CityNodes() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Simulate city positions on a sphere
  const cityPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 3.2;
      positions.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ]);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {cityPositions.map((pos, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0} floatIntensity={0.1}>
          <Sphere args={[0.04, 8, 8]} position={pos}>
            <meshStandardMaterial
              color="#88DDDD"
              emissive="#44AAAA"
              emissiveIntensity={0.8}
              metalness={0.5}
              roughness={0.3}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#88CCCC"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const phi1 = Math.random() * Math.PI;
      const theta1 = Math.random() * Math.PI * 2;
      const phi2 = Math.random() * Math.PI;
      const theta2 = Math.random() * Math.PI * 2;
      const radius = 3.2;
      result.push({
        start: new THREE.Vector3(
          radius * Math.sin(phi1) * Math.cos(theta1),
          radius * Math.sin(phi1) * Math.sin(theta1),
          radius * Math.cos(phi1)
        ),
        end: new THREE.Vector3(
          radius * Math.sin(phi2) * Math.cos(theta2),
          radius * Math.sin(phi2) * Math.sin(theta2),
          radius * Math.cos(phi2)
        )
      });
    }
    return result;
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => {
        const curve = new THREE.QuadraticBezierCurve3(
          line.start,
          new THREE.Vector3(0, 0, 0).lerpVectors(line.start, line.end, 0.5).multiplyScalar(1.3),
          line.end
        );
        const points = curve.getPoints(32);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              attach="material"
              color="#66AAAA"
              transparent
              opacity={0.2}
            />
          </line>
        );
      })}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} color="#88CCCC" />
      <pointLight position={[0, 0, 6]} intensity={0.4} color="#5599AA" />

      <GlobeCore />
      <CityNodes />
      <ParticleField />
      <ConnectionLines />

      <Environment preset="city" />
    </>
  );
}

export function MapBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
