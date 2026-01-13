import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, Sphere } from "@react-three/drei";
import * as THREE from "three";

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
      innerRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <group>
        {/* Outer glass sphere */}
        <mesh ref={meshRef} scale={2.5}>
          <icosahedronGeometry args={[1, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.5}
            chromaticAberration={0.15}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1.2}
            iridescenceThicknessRange={[0, 1400]}
            color="#5599AA"
            transmission={0.95}
            roughness={0.05}
            envMapIntensity={0.5}
          />
        </mesh>

        {/* Inner geometric core */}
        <mesh ref={innerRef} scale={1.2}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#2D5A5A"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Orbiting rings */}
        <mesh rotation={[Math.PI / 4, 0, 0]} scale={3}>
          <torusGeometry args={[1, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#88CCCC"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>

        <mesh rotation={[0, Math.PI / 3, Math.PI / 6]} scale={3.2}>
          <torusGeometry args={[1, 0.015, 16, 100]} />
          <meshStandardMaterial
            color="#66AAAA"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingDots() {
  const groupRef = useRef<THREE.Group>(null);
  const dots = Array.from({ length: 30 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6 - 3
    ] as [number, number, number],
    scale: 0.03 + Math.random() * 0.05,
    speed: 0.5 + Math.random() * 0.5,
  }));

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {dots.map((dot, i) => (
        <Float key={i} speed={dot.speed} rotationIntensity={0} floatIntensity={0.5}>
          <Sphere args={[dot.scale, 8, 8]} position={dot.position}>
            <meshStandardMaterial
              color="#88CCCC"
              emissive="#446666"
              emissiveIntensity={0.5}
              metalness={0.5}
              roughness={0.5}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#88CCCC" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#5599AA" />

      <CentralOrb />
      <FloatingDots />

      <Environment preset="city" />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none opacity-80">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
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
