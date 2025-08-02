import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { Spirit } from '../../entities/types';
import { getMoodTexture } from '../../lib/getMoodTexture';
import { useSpiritModalStore } from '../../store/useSpiritModalStore';
import { useSpiritGossipStore } from '../../store/useSpiritGossipStore';

interface OptimizedSpiritProps {
  spirit: Spirit;
  position: [number, number, number];
  size?: number;
  enableAnimations?: boolean;
}

// Мемоизированный компонент для оптимизации рендеринга
export const OptimizedSpirit = React.memo<OptimizedSpiritProps>(({ 
  spirit, 
  position, 
  size = 1.5,
  enableAnimations = true 
}) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  const texture = useLoader(TextureLoader, getMoodTexture(spirit.mood));
  
  const { openModal } = useSpiritModalStore();
  const gossip = useSpiritGossipStore((state) => state.currentGossip);

  // Мемоизированная целевая позиция
  const targetPosition = useMemo(() => {
    if (!gossip) return new THREE.Vector3(...position);
    
    if (gossip.from.id === spirit.id) {
      return new THREE.Vector3(-4, -5.5, 0);
    } else if (gossip.to.id === spirit.id) {
      return new THREE.Vector3(4, -5.5, 0);
    }
    
    return new THREE.Vector3(...position);
  }, [gossip, spirit.id, position]);

  // Оптимизированный обработчик клика
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(spirit);
  }, [openModal, spirit]);

  // Анимационный цикл с условным выполнением
  useFrame(({ clock }) => {
    if (!spriteRef.current || !enableAnimations) return;

    const sprite = spriteRef.current;
    
    // Плавное движение к цели
    sprite.position.lerp(targetPosition, 0.08);
    
    // Легкая флотация только если не в диалоге
    if (!gossip || (gossip.from.id !== spirit.id && gossip.to.id !== spirit.id)) {
      const t = clock.getElapsedTime();
      const floatY = Math.sin(t * 2 + position[0]) * 0.05;
      sprite.position.y = targetPosition.y + floatY;
    }
  });

  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[size, size, 1]}
      onClick={handleClick}
    >
      <spriteMaterial 
        map={texture} 
        transparent 
        depthWrite={false}
        alphaTest={0.1}
      />
    </sprite>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для React.memo
  return (
    prevProps.spirit.id === nextProps.spirit.id &&
    prevProps.spirit.mood === nextProps.spirit.mood &&
    prevProps.size === nextProps.size &&
    prevProps.enableAnimations === nextProps.enableAnimations &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2]
  );
});

OptimizedSpirit.displayName = 'OptimizedSpirit';
