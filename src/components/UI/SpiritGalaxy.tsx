// src/components/UI/SpiritGalaxy.tsx
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { useSpiritArchiveStore } from '../../store/useSpiritArchiveStore';
import { useSpiritModalStore } from '../../store/useSpiritModalStore';
import { Spirit } from '../../entities/types';
import * as THREE from 'three';

// Компонент одного духа в 3D пространстве
function SpiritStar({ spirit, position }: { spirit: Spirit; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { openModal } = useSpiritModalStore();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Определяем размер и цвет на основе редкости
  const { size, color, intensity } = useMemo(() => {
    switch (spirit.rarity) {
      case 'легендарный':
        return { size: 1.5, color: '#FFD700', intensity: 3 };
      case 'эпический':
        return { size: 1.2, color: '#9333EA', intensity: 2.5 };
      case 'редкий':
        return { size: 1.0, color: '#3B82F6', intensity: 2 };
      default:
        return { size: 0.8, color: '#10B981', intensity: 1.5 };
    }
  }, [spirit.rarity]);

  // Анимация пульсации
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(
        size * (1 + Math.sin(time * 2) * 0.1 * intensity)
      );
      
      // Вращение
      meshRef.current.rotation.y = time * 0.5;
      
      // Эффект при наведении
      if (hovered) {
        meshRef.current.scale.multiplyScalar(1.2);
      }
    }
  });

  return (
    <group position={position}>
      {/* Основная сфера духа */}
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onClick={() => {
          setClicked(true);
          openModal(spirit);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Внешнее свечение */}
      <Sphere args={[size * 1.3, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Орбитальные кольца для легендарных духов */}
      {spirit.rarity === 'легендарный' && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 2, size * 2.2, 64]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[size * 2.5, size * 2.7, 64]} />
            <meshBasicMaterial color="#FFA500" transparent opacity={0.2} />
          </mesh>
        </>
      )}

      {/* Tooltip при наведении */}
      {hovered && (
        <Html>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20">
            <div className="font-bold text-blue-300">{spirit.essence}</div>
            <div className="text-xs text-gray-300">🎭 {spirit.mood}</div>
            <div className="text-xs text-yellow-300">⭐ {spirit.rarity}</div>
          </div>
        </Html>
      )}

      {/* Эффект клика */}
      {clicked && (
        <Sphere args={[size * 3, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  );
}

// Фоновые звезды
function BackgroundStars() {
  const starsRef = useRef<THREE.Points>(null);
  
  const starsGeometry = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[starsGeometry, 3]}
          count={1000}
          array={starsGeometry}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.1} transparent opacity={0.6} />
    </points>
  );
}

// Система частиц
function ParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.1;
      particlesRef.current.rotation.x = time * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesGeometry, 3]}
          count={200}
          array={particlesGeometry}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#4F46E5" 
        size={0.05} 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Главный компонент галактики
export function SpiritGalaxy({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { spirits } = useSpiritArchiveStore();
  
  // Расположение духов в 3D пространстве
  const spiritPositions = useMemo(() => {
    return spirits.map((spirit) => {
      // Располагаем по концентрическим сферам в зависимости от редкости
      let radius: number;
      switch (spirit.rarity) {
        case 'легендарный': radius = 5; break;
        case 'эпический': radius = 8; break;
        case 'редкий': radius = 12; break;
        default: radius = 16; break;
      }
      
      // Случайное положение на сфере
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      
      return [x, y, z] as [number, number, number];
    });
  }, [spirits]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Заголовок и управление */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌌 Духовная Вселенная
          </h1>
          <p className="text-slate-300 text-sm">
            {spirits.length} духов • Управление: мышь + колесо
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="bg-red-500/20 hover:bg-red-500/40 text-white px-4 py-2 rounded-lg border border-red-400/30 hover:border-red-400/60 transition-all"
        >
          ✕ Закрыть галактику
        </button>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-white font-bold mb-2">Легенда:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#FFD700]"></div>
            <span className="text-yellow-300">Легендарные духи</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#9333EA]"></div>
            <span className="text-purple-300">Эпические духи</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3B82F6]"></div>
            <span className="text-blue-300">Редкие духи</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#10B981]"></div>
            <span className="text-green-300">Обычные духи</span>
          </div>
        </div>
      </div>

      {/* 3D Сцена */}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
      >
        {/* Освещение */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4F46E5" />

        {/* Фоновые элементы */}
        <BackgroundStars />
        <ParticleSystem />

        {/* Духи */}
        {spirits.map((spirit, index) => (
          <SpiritStar
            key={spirit.id}
            spirit={spirit}
            position={spiritPositions[index]}
          />
        ))}

        {/* Управление камерой */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
}
