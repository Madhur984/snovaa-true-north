import { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Trail, Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Easing functions for smooth animations
const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutElastic = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Glowing halo effect around nodes
function GlowHalo({ position, color, scale }: {
  position: [number, number, number];
  color: string;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 2) * 0.15;
    meshRef.current.scale.setScalar(scale * pulse * 2.5);
    // @ts-expect-error ThreeJS material property access dynamic
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(time * 1.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Energy wave that pulses outward periodically
function EnergyWave({ delay = 0 }: { delay?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now() + delay * 1000);
  const duration = 4000;

  useFrame(() => {
    if (!ringRef.current) return;

    const elapsed = (Date.now() - startTime.current) % duration;
    const progress = elapsed / duration;
    const easedProgress = easeOutExpo(progress);

    const scale = 1 + easedProgress * 8;
    ringRef.current.scale.setScalar(scale);

    // @ts-expect-error ThreeJS material property access dynamic
    if (ringRef.current.material) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.2;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.02, 8, 64]} />
      <meshBasicMaterial
        color="#5599AA"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Click ripple effect - expanding ring that fades out with enhanced visuals
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
  const ring2Ref = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const duration = 1400;

  useFrame(() => {
    if (!ringRef.current || !ring2Ref.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);

    // Primary ring
    const scale1 = 0.3 + easedProgress * 4;
    ringRef.current.scale.setScalar(scale1);
    ringRef.current.rotation.z = progress * Math.PI * 0.5;

    // Secondary ring (delayed)
    const progress2 = Math.max(0, (elapsed - 100) / duration);
    const easedProgress2 = easeOutExpo(Math.min(progress2, 1));
    const scale2 = 0.2 + easedProgress2 * 3;
    ring2Ref.current.scale.setScalar(scale2);
    ring2Ref.current.rotation.z = -progress2 * Math.PI * 0.3;

    // @ts-expect-error ThreeJS material property access dynamic
    if (ringRef.current.material) {
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = (1 - progress) * 1.5;
    }
    // @ts-expect-error ThreeJS material property access dynamic
    if (ring2Ref.current.material) {
      (ring2Ref.current.material as THREE.MeshStandardMaterial).opacity = (1 - progress2) * 0.8;
    }

    if (progress >= 1) {
      onComplete();
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.04, 8, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.02, 8, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
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
  const duration = 1800;
  const pos = useRef([...startPosition]);
  const rotation = useRef([Math.random() * Math.PI, Math.random() * Math.PI]);

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);

    // Physics with air resistance
    const gravity = -2.5;
    const drag = 0.98;
    const t = easedProgress * 2;
    pos.current[0] = startPosition[0] + velocity[0] * t * drag;
    pos.current[1] = startPosition[1] + velocity[1] * t * drag + 0.5 * gravity * t * t;
    pos.current[2] = startPosition[2] + velocity[2] * t * drag;

    meshRef.current.position.set(pos.current[0], pos.current[1], pos.current[2]);

    // Spin while falling
    meshRef.current.rotation.x = rotation.current[0] + progress * 8;
    meshRef.current.rotation.y = rotation.current[1] + progress * 6;

    // Scale with bounce
    const bounceScale = progress < 0.2
      ? easeOutElastic(progress * 5) * 0.2
      : (1 - progress) * 0.18;
    meshRef.current.scale.setScalar(bounceScale);

    // @ts-expect-error ThreeJS material property access dynamic
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 1 - progress * 0.7;
    }

    if (progress >= 1) {
      onComplete();
    }
  });

  return (
    <mesh ref={meshRef} position={startPosition}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
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
    // Mouse repulsion effect - dampened
    const mouseInfluence = 0.5;
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

// Animated orbital ring system - replaces static calendar
function OrbitalRings({ position, mousePos }: {
  position: [number, number, number];
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // React to mouse
    groupRef.current.rotation.y = mousePos.current.x * 0.4 + time * 0.1;
    groupRef.current.rotation.x = -mousePos.current.y * 0.3;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.15;

    // Animate rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.z = time * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * 0.4;
      ring2Ref.current.rotation.x = time * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.6;
      ring3Ref.current.rotation.y = time * 0.25;
    }

    // Pulsing core
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.15;
      coreRef.current.scale.setScalar(pulse * 0.3);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        {/* Glowing core */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color="#5599AA"
            emissive="#5599AA"
            emissiveIntensity={1.5}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Orbital ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.6, 0.015, 16, 64]} />
          <meshStandardMaterial
            color="#88CCCC"
            emissive="#88CCCC"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Orbital ring 2 */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.8, 0.012, 16, 64]} />
          <meshStandardMaterial
            color="#5599AA"
            emissive="#5599AA"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Orbital ring 3 */}
        <mesh ref={ring3Ref} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          <torusGeometry args={[1, 0.01, 16, 64]} />
          <meshStandardMaterial
            color="#3D7A7A"
            emissive="#5599AA"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <OrbitingDot key={i} index={i} />
        ))}
      </group>
    </Float>
  );
}

// Small orbiting dot for the orbital system
function OrbitingDot({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const radius = 0.5 + (index % 3) * 0.25;
  const speed = 1 + index * 0.3;
  const offset = (index / 6) * Math.PI * 2;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed + offset;

    meshRef.current.position.x = Math.cos(time) * radius;
    meshRef.current.position.y = Math.sin(time * 1.3) * radius * 0.5;
    meshRef.current.position.z = Math.sin(time) * radius * 0.8;

    const pulse = 1 + Math.sin(time * 3) * 0.3;
    meshRef.current.scale.setScalar(0.03 * pulse);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#88CCCC"
        emissive="#88CCCC"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

// DNA-like helix animation
function HelixStructure({ mousePos }: {
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const helixNodes = useMemo(() => {
    const nodes: Array<{ offset: number; radius: number; strand: number }> = [];
    for (let i = 0; i < 24; i++) {
      nodes.push({ offset: i * 0.3, radius: 0.08, strand: 0 });
      nodes.push({ offset: i * 0.3 + Math.PI, radius: 0.08, strand: 1 });
    }
    return nodes;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.rotation.y = time * 0.2 + mousePos.current.x * 0.3;
    groupRef.current.rotation.x = mousePos.current.y * 0.1;
    groupRef.current.position.y = Math.sin(time * 0.4) * 0.2;
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]} scale={0.8}>
      {helixNodes.map((node, i) => (
        <HelixNode key={i} index={i} offset={node.offset} strand={node.strand} />
      ))}
    </group>
  );
}

function HelixNode({ index, offset, strand }: { index: number; offset: number; strand: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY = (index / 2 - 6) * 0.3;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    const angle = time * 0.8 + offset;
    const radius = 1.2;

    meshRef.current.position.x = Math.cos(angle) * radius;
    meshRef.current.position.z = Math.sin(angle) * radius;
    meshRef.current.position.y = baseY;

    const pulse = 1 + Math.sin(time * 2 + index * 0.2) * 0.2;
    meshRef.current.scale.setScalar(0.06 * pulse);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color={strand === 0 ? "#5599AA" : "#88CCCC"}
        emissive={strand === 0 ? "#5599AA" : "#88CCCC"}
        emissiveIntensity={1.2}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
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
    // Dampened mouse tracking
    mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, state.pointer.x, 0.05);
    mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, state.pointer.y, 0.05);
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

      {/* Glow halos behind nodes */}
      {nodes.map((node, i) => (
        <GlowHalo key={`halo-${i}`} position={node.position} color={node.color} scale={node.scale} />
      ))}

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

      {/* Animated orbital systems */}
      <OrbitalRings position={[-2.5, 0.8, 0.5]} mousePos={mousePos} />
      <OrbitalRings position={[2.5, -0.3, 0.5]} mousePos={mousePos} />

      {/* DNA helix in background */}
      <HelixStructure mousePos={mousePos} />

      {/* Orbiting particles with trails */}
      <OrbitingParticle radius={4} speed={0.3} offset={0} mousePos={mousePos} />
      <OrbitingParticle radius={5} speed={0.25} offset={Math.PI * 0.7} mousePos={mousePos} />
      <OrbitingParticle radius={3.5} speed={0.35} offset={Math.PI * 1.4} mousePos={mousePos} />
      <OrbitingParticle radius={4.5} speed={0.2} offset={Math.PI * 1.1} mousePos={mousePos} />

      {/* Ambient particle field */}
      <AmbientParticles count={150} mousePos={mousePos} />

      {/* Periodic energy waves from center */}
      <EnergyWave delay={0} />
      <EnergyWave delay={1.5} />
      <EnergyWave delay={3} />

      {/* Sparkles for ambient glow */}
      <Sparkles
        count={60}
        size={1.5}
        scale={[14, 10, 8]}
        speed={0.4}
        color="#5599AA"
        opacity={0.5}
      />
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
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
