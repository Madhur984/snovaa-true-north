import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Trail, Line } from "@react-three/drei";
import * as THREE from "three";

// Click ripple effect - expanding ring that fades out
function ClickRipple({ 
  position, 
  color, 
  onComplete 
}: { 
  position: [number, number, number]; 
  color: string;
  onComplete: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const duration = 1200; // ms

  useFrame(() => {
    if (!ringRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Expand and fade
    const scale = 0.5 + progress * 3;
    ringRef.current.scale.setScalar(scale);
    
    // @ts-ignore - accessing material opacity
    if (ringRef.current.material) {
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - progress;
    }
    
    if (progress >= 1) {
      onComplete();
    }
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.03, 8, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Burst particle - spawned on click
function BurstParticle({ 
  startPosition, 
  velocity, 
  color,
  onComplete 
}: { 
  startPosition: [number, number, number]; 
  velocity: [number, number, number];
  color: string;
  onComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const duration = 1500;
  const pos = useRef([...startPosition]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Physics: position + velocity * time + gravity
    const gravity = -2;
    const t = progress * 1.5;
    pos.current[0] = startPosition[0] + velocity[0] * t;
    pos.current[1] = startPosition[1] + velocity[1] * t + 0.5 * gravity * t * t;
    pos.current[2] = startPosition[2] + velocity[2] * t;
    
    meshRef.current.position.set(pos.current[0], pos.current[1], pos.current[2]);
    
    // Scale down and fade
    const scale = (1 - progress) * 0.15;
    meshRef.current.scale.setScalar(scale);
    
    // @ts-ignore
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - progress * 0.8;
    }
    
    if (progress >= 1) {
      onComplete();
    }
  });

  return (
    <mesh ref={meshRef} position={startPosition}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

// Click effects manager
interface ClickEffect {
  id: number;
  type: 'ripple' | 'particle';
  position: [number, number, number];
  color: string;
  velocity?: [number, number, number];
}

function useClickEffects() {
  const [effects, setEffects] = useState<ClickEffect[]>([]);
  const idCounter = useRef(0);

  const spawnEffects = useCallback((position: [number, number, number], color: string) => {
    const newEffects: ClickEffect[] = [];
    
    // Add ripple
    newEffects.push({
      id: idCounter.current++,
      type: 'ripple',
      position: [...position] as [number, number, number],
      color,
    });
    
    // Add burst particles (8-12 particles)
    const particleCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2;
      const upward = 1.5 + Math.random() * 2;
      
      newEffects.push({
        id: idCounter.current++,
        type: 'particle',
        position: [...position] as [number, number, number],
        color,
        velocity: [
          Math.cos(angle) * speed,
          upward,
          Math.sin(angle) * speed * 0.5,
        ],
      });
    }
    
    setEffects(prev => [...prev, ...newEffects]);
  }, []);

  const removeEffect = useCallback((id: number) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  return { effects, spawnEffects, removeEffect };
}

// Event node - represents a floating event orb with click interaction
function EventNode({ 
  position, 
  scale, 
  color, 
  speed,
  mousePos,
  onNodeClick
}: { 
  position: [number, number, number]; 
  scale: number; 
  color: string;
  speed: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  onNodeClick: (pos: [number, number, number], color: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const originalPos = useRef(position);
  const pulsePhase = useRef(Math.random() * Math.PI * 2);
  const clickTime = useRef(0);

  const handleClick = useCallback(() => {
    if (!meshRef.current) return;
    
    setClicked(true);
    clickTime.current = Date.now();
    
    // Get current world position
    const worldPos: [number, number, number] = [
      meshRef.current.position.x,
      meshRef.current.position.y,
      meshRef.current.position.z,
    ];
    
    onNodeClick(worldPos, color);
  }, [color, onNodeClick]);

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
    
    // Click bounce effect
    const clickElapsed = Date.now() - clickTime.current;
    const clickBounce = clicked && clickElapsed < 300 
      ? Math.sin((clickElapsed / 300) * Math.PI) * 0.3 
      : 0;
    
    if (clicked && clickElapsed > 300) {
      setClicked(false);
    }
    
    // Pulse scale on hover + click bounce
    const baseScale = clicked ? scale * 1.6 : (hovered ? scale * 1.4 : scale);
    const pulseScale = 1 + Math.sin(time * 3) * (hovered ? 0.1 : 0.02) + clickBounce;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, baseScale * pulseScale, 0.15));
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={clicked ? 1.5 : (hovered ? 0.8 : 0.3)}
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

// Main scene with mouse tracking and click effects
function Scene() {
  const mousePos = useRef({ x: 0, y: 0 });
  const { effects, spawnEffects, removeEffect } = useClickEffects();

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
    mousePos.current.x = state.pointer.x;
    mousePos.current.y = state.pointer.y;
  });

  const handleNodeClick = useCallback((pos: [number, number, number], color: string) => {
    spawnEffects(pos, color);
  }, [spawnEffects]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} color="#88CCCC" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#5599AA" />

      {/* Event nodes with click handler */}
      {nodes.map((node, i) => (
        <EventNode key={i} {...node} mousePos={mousePos} onNodeClick={handleNodeClick} />
      ))}

      {/* Click effects */}
      {effects.map((effect) => 
        effect.type === 'ripple' ? (
          <ClickRipple
            key={effect.id}
            position={effect.position}
            color={effect.color}
            onComplete={() => removeEffect(effect.id)}
          />
        ) : (
          <BurstParticle
            key={effect.id}
            startPosition={effect.position}
            velocity={effect.velocity!}
            color={effect.color}
            onComplete={() => removeEffect(effect.id)}
          />
        )
      )}

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
        style={{ pointerEvents: "auto", cursor: "default" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
