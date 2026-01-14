import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Trail, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

// Event node - represents a floating event orb
function EventNode({ 
  position, 
  scale, 
  color, 
  speed,
  mousePos 
}: { 
  position: [number, number, number]; 
  scale: number; 
  color: string;
  speed: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const originalPos = useRef(position);
  const pulsePhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Base floating motion
    const floatY = Math.sin(time * speed + pulsePhase.current) * 0.3;
    const floatX = Math.cos(time * speed * 0.7 + pulsePhase.current) * 0.2;
    
    // Mouse repulsion effect
    const mouseInfluence = 2.5;
    const dx = (mousePos.current.x * 5) - originalPos.current[0];
    const dy = (mousePos.current.y * 3) - originalPos.current[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelStrength = Math.max(0, 1 - dist / 4) * mouseInfluence;
    
    meshRef.current.position.x = originalPos.current[0] + floatX - (dx / dist) * repelStrength * (dist < 4 ? 1 : 0);
    meshRef.current.position.y = originalPos.current[1] + floatY - (dy / dist) * repelStrength * (dist < 4 ? 1 : 0);
    
    // Pulse scale on hover
    const targetScale = hovered ? scale * 1.4 : scale;
    const pulseScale = 1 + Math.sin(time * 3) * (hovered ? 0.1 : 0.02);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale * pulseScale, 0.1));
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.3}
        metalness={0.2}
        roughness={0.3}
        transparent
        opacity={hovered ? 1 : 0.85}
      />
    </mesh>
  );
}

// Connection lines between nodes
function ConnectionLines({ nodes }: { nodes: Array<{ position: [number, number, number] }> }) {
  const lineRef = useRef<THREE.Group>(null);
  
  const connections = useMemo(() => {
    const lines: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        );
        if (dist < 4) {
          lines.push({ start: nodes[i].position, end: nodes[j].position });
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={lineRef}>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color="#5599AA"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}
    </group>
  );
}

// Floating calendar icon made of geometry
function CalendarIcon({ position, mousePos }: { 
  position: [number, number, number];
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Look at mouse position slightly
    groupRef.current.rotation.y = mousePos.current.x * 0.3;
    groupRef.current.rotation.x = -mousePos.current.y * 0.2;
    
    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.2;
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={position} scale={0.6}>
        {/* Calendar body */}
        <mesh>
          <boxGeometry args={[1.5, 1.8, 0.1]} />
          <meshStandardMaterial 
            color="#3D7A7A" 
            metalness={0.6} 
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Calendar top bar */}
        <mesh position={[0, 0.7, 0.06]}>
          <boxGeometry args={[1.5, 0.4, 0.1]} />
          <meshStandardMaterial 
            color="#5599AA" 
            metalness={0.8} 
            roughness={0.1}
          />
        </mesh>
        {/* Calendar rings */}
        {[-0.4, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0.95, 0]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial color="#88CCCC" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Grid dots */}
        {[...Array(9)].map((_, i) => (
          <mesh 
            key={i} 
            position={[
              ((i % 3) - 1) * 0.35, 
              -0.1 - Math.floor(i / 3) * 0.35, 
              0.08
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color="#88CCCC" 
              emissive="#5599AA"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Users icon made of geometry
function UsersIcon({ position, mousePos }: { 
  position: [number, number, number];
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.rotation.y = mousePos.current.x * 0.2 + Math.sin(time * 0.3) * 0.1;
    groupRef.current.rotation.x = -mousePos.current.y * 0.15;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.6 + 1) * 0.15;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef} position={position} scale={0.5}>
        {/* Main person */}
        <group position={[0, 0, 0.3]}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#5599AA" 
              metalness={0.5} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
            <meshStandardMaterial 
              color="#3D7A7A" 
              metalness={0.5} 
              roughness={0.3}
            />
          </mesh>
        </group>
        {/* Left person */}
        <group position={[-0.7, -0.15, -0.2]} scale={0.8}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#88CCCC" 
              metalness={0.5} 
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
            <meshStandardMaterial 
              color="#5599AA" 
              metalness={0.5} 
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
        {/* Right person */}
        <group position={[0.7, -0.15, -0.2]} scale={0.8}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#88CCCC" 
              metalness={0.5} 
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
            <meshStandardMaterial 
              color="#5599AA" 
              metalness={0.5} 
              roughness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// Orbiting particle trail
function OrbitingParticle({ radius, speed, offset, mousePos }: { 
  radius: number; 
  speed: number; 
  offset: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed + offset;
    
    // Orbital motion with mouse influence
    const mouseInfluence = 0.5;
    meshRef.current.position.x = Math.cos(time) * radius + mousePos.current.x * mouseInfluence;
    meshRef.current.position.y = Math.sin(time * 1.3) * radius * 0.6 + mousePos.current.y * mouseInfluence;
    meshRef.current.position.z = Math.sin(time) * radius * 0.3;
  });

  return (
    <Trail
      width={0.5}
      length={8}
      color="#88CCCC"
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="#88CCCC"
          emissive="#5599AA"
          emissiveIntensity={1}
        />
      </mesh>
    </Trail>
  );
}

// Ambient particles
function AmbientParticles({ count, mousePos }: { 
  count: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = time * 0.02 + mousePos.current.x * 0.1;
    pointsRef.current.rotation.x = mousePos.current.y * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#88CCCC"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main scene with mouse tracking
function Scene() {
  const mousePos = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const nodes = useMemo(() => [
    { position: [-3, 1.5, 0] as [number, number, number], scale: 0.25, color: "#5599AA", speed: 0.8 },
    { position: [3.5, 0.5, -1] as [number, number, number], scale: 0.3, color: "#88CCCC", speed: 0.6 },
    { position: [-2, -1.5, 0.5] as [number, number, number], scale: 0.2, color: "#3D7A7A", speed: 1 },
    { position: [2, 2, -0.5] as [number, number, number], scale: 0.22, color: "#5599AA", speed: 0.7 },
    { position: [0, -2.5, 0] as [number, number, number], scale: 0.28, color: "#88CCCC", speed: 0.9 },
    { position: [-4, -0.5, -1] as [number, number, number], scale: 0.18, color: "#3D7A7A", speed: 1.1 },
    { position: [4.5, -1.5, 0] as [number, number, number], scale: 0.24, color: "#5599AA", speed: 0.75 },
    { position: [-1, 2.5, -0.5] as [number, number, number], scale: 0.2, color: "#88CCCC", speed: 0.85 },
  ], []);

  useFrame((state) => {
    // Convert pointer to normalized coordinates
    mousePos.current.x = state.pointer.x;
    mousePos.current.y = state.pointer.y;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} color="#88CCCC" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#5599AA" />

      {/* Event nodes */}
      {nodes.map((node, i) => (
        <EventNode key={i} {...node} mousePos={mousePos} />
      ))}

      {/* Connection lines */}
      <ConnectionLines nodes={nodes} />

      {/* Thematic icons */}
      <CalendarIcon position={[-1.5, 0.5, 1]} mousePos={mousePos} />
      <UsersIcon position={[1.5, -0.5, 1]} mousePos={mousePos} />

      {/* Orbiting particles with trails */}
      <OrbitingParticle radius={4} speed={0.3} offset={0} mousePos={mousePos} />
      <OrbitingParticle radius={5} speed={0.25} offset={Math.PI * 0.7} mousePos={mousePos} />
      <OrbitingParticle radius={3.5} speed={0.35} offset={Math.PI * 1.4} mousePos={mousePos} />

      {/* Ambient particle field */}
      <AmbientParticles count={100} mousePos={mousePos} />
    </>
  );
}

export function EventConstellationScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
