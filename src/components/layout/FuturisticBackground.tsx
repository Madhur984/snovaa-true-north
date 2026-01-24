import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sphere, Torus, MeshDistortMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const Bot = ({ position, scale = 1, speed = 1 }: { position: [number, number, number], scale?: number, speed?: number }) => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Very slow, heavy hover (Sileent style)
            group.current.position.y += Math.sin(state.clock.elapsedTime * speed * 0.2) * 0.0005;

            // Damped mouse interaction (Drift rather than react)
            const targetX = (state.mouse.x * window.innerWidth) / 200; // Reduced sensitivity
            const targetY = (state.mouse.y * window.innerHeight) / 200;

            // Extremely slow lerp for 'heavy' feel
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetY, 0.01);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.01);
        }
    });

    return (
        <group ref={group} position={position} scale={scale}>
            <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={1}>
                {/* Head */}
                <Sphere args={[0.5, 32, 32]} position={[0, 0.8, 0]}>
                    <MeshDistortMaterial
                        color="#1a1a1a"
                        speed={2}
                        distort={0.3}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </Sphere>

                {/* Ring */}
                <Torus args={[0.7, 0.05, 16, 100]} position={[0, 0.8, 0]} rotation={[1.5, 0, 0]}>
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} toneMapped={false} />
                </Torus>

                {/* Body */}
                <Sphere args={[0.7, 32, 32]} position={[0, -0.2, 0]}>
                    <meshStandardMaterial
                        color="#000000"
                        roughness={0.1}
                        metalness={0.9} // Shiny Black
                    />
                </Sphere>

                {/* Floating Orb Ornaments */}
                <Sphere args={[0.1, 16, 16]} position={[0.9, 0, 0]}>
                    <meshStandardMaterial color="#ffffff" />
                </Sphere>
                <Sphere args={[0.1, 16, 16]} position={[-0.9, 0, 0]}>
                    <meshStandardMaterial color="#ffffff" />
                </Sphere>
            </Float>
        </group>
    );
};

const Particles = ({ count = 50 }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const light = useRef<THREE.PointLight>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            particle.mx += (state.mouse.x * 1000 - particle.mx) * 0.01;
            particle.my += (state.mouse.y * 1000 - 1 - particle.my) * 0.01;

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#202020" />
        </instancedMesh>
    );
};


const FuturisticBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-background transition-colors duration-500">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

                {/* Environment for reflections */}
                <Environment preset="city" />

                {/* 3D Bots */}
                <Bot position={[-4, 2, -2]} scale={1.2} speed={0.8} />
                <Bot position={[4, -2, -5]} scale={1.5} speed={1.2} />
                <Bot position={[0, -5, -8]} scale={2} speed={0.5} />
                <Bot position={[6, 5, -10]} scale={2.5} speed={0.7} />

                {/* Floating Particles for atmosphere */}
                <Particles count={80} />
            </Canvas>
            {/* Overlay to ensure text readability if needed, though bots are mostly dark */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
        </div>
    );
};

export default FuturisticBackground;
