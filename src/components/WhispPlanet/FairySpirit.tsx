// вверху: импорт как раньше
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Html } from '@react-three/drei'

type FairySpiritProps = {
  position: [number, number, number] | { x: number; y: number; z: number }
  emotion?: 'happy' | 'sleepy' | 'surprised'
  color?: string
}

export const FairySpirit = ({
  position,
  emotion = 'happy',
  color = '#A8E6FF',
}: FairySpiritProps) => {
  const groupRef = useRef<Group>(null)

  // 🛠 Преобразуем объект в массив, если нужно
  const posArray: [number, number, number] =
    Array.isArray(position)
      ? position
      : [position.x, position.y, position.z]

  // Анимация плавания
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = posArray[1] + Math.sin(t * 2) * 0.1
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.5
    }
  })

  return (
    <group ref={groupRef} position={posArray}>
      {/* Тело духа */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Глазки */}
      <mesh position={[-0.05, 0.05, 0.14]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.05, 0.05, 0.14]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Эмоция */}
      <Html distanceFactor={10}>
        <div style={{ fontSize: '12px', color: 'white', textAlign: 'center' }}>
          {emotion === 'happy' && '😊'}
          {emotion === 'sleepy' && '😴'}
          {emotion === 'surprised' && '😲'}
        </div>
      </Html>
    </group>
  )
}
