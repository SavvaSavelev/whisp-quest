import React from "react";
import { DoubleSide } from "three";

export const MagicalCastle = () => {
  return (
    <group
      // При желании можно отрегулировать масштаб, чтобы замок идеально вписался в вашу сцену
      scale={[0.6, 0.6, 0.6] as [number, number, number]}
      position={[0, -1.5, 0] as [number, number, number]}
    >
      {/* 
        --- ОСНОВАНИЕ ЗАМКА ---
        Базовый уровень: уже не такой массивный, более компактный по площади и чуть выше по пропорциям 
      */}
      <mesh position={[0, 1.2, 0] as [number, number, number]}>
        {/* Размеры: уже не 4x2.5x4, а меньше в ширину/глубину, но чуть выше */}
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial
          color="#F5E6E8"    // светло-кремовый цвет стен
          emissive="#F5D0D3"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 
        --- ВТОРОЙ УРОВЕНЬ ---
        Чуть уже и ниже по высоте, создаёт стройную «пирамидальную» форму 
      */}
      <mesh position={[0, 3.5, 0] as [number, number, number]}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial
          color="#FDEBD0"    // пастельно-жёлтый тон, чуть отличающийся от основания
          emissive="#FAD7A0"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 
        --- КРЫША ВТОРОГО УРОВНЯ ---
        Небольшая кольцевая конструкция, на которой будут стоять мини-башенки 
      */}
      <mesh position={[0, 4.6, 0] as [number, number, number]}>
        <cylinderGeometry args={[1.5, 1.5, 0.4, 32, 1, true]} />
        <meshStandardMaterial
          color="#E6B7B0"
          emissive="#E8C7C0"
          emissiveIntensity={0.2}
          side={DoubleSide}
        />
      </mesh>

      {/* 
        --- ГЛАВНАЯ КРЫША (конус) ---
        Тонкая и вытянутая, чтобы придать башне воздушность 
      */}
      <mesh position={[0, 5.4, 0] as [number, number, number]}>
        <coneGeometry args={[1.3, 2.5, 32]} />
        <meshStandardMaterial
          color="#D86E70"   // тёплый красно-розовый
          emissive="#E87B85"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/*
        --- МИНИ-Башенки на втором уровне ---
        Расставим маленькие башенки по окружности, чтобы напоминало башенки на иллюстрации
      */}
      {[
        [1.2, 4.6, 0],   // правая
        [-1.2, 4.6, 0],  // левая
        [0, 4.6, 1.2],   // передняя
        [0, 4.6, -1.2],  // задняя
      ].map((pos, idx) => (
        <group key={`mini-tower-${idx}`} position={pos as [number, number, number]}>
          {/* Тонкий «ствол» башни */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
            <meshStandardMaterial
              color="#F5E6E8"
              emissive="#F5D0D3"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Маленький конус-купол */}
          <mesh position={[0, 0.5, 0] as [number, number, number]}>
            <coneGeometry args={[0.25, 0.5, 16]} />
            <meshStandardMaterial
              color="#a3c4dc"  // нежно-голубой (или пастельно-синий) 
              emissive="#a3c4dc"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}

      {/*
        --- СТОРОЖЕВАЯ БАШНЯ ---
        Дополнительная высокая башня, более тонкая, напоминающая вытянутую часть на заднем плане
      */}
      <group position={[1.7, 1.5, -1.4] as [number, number, number]}>
        {/* Основание цилиндра */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
          <meshStandardMaterial
            color="#FDEBD0"
            emissive="#FAD7A0"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Верхний купол */}
        <mesh position={[0, 2.0, 0] as [number, number, number]}>
          <coneGeometry args={[0.5, 1, 16]} />
          <meshStandardMaterial
            color="#D86E70"
            emissive="#E87B85"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/*
        --- ОКНА ---
        Несколько маленьких окошек с мягким свечением на основном уровне
      */}
      {[
        [1.2, 2, 1.49],
        [-1.2, 2, 1.49],
        [1.2, 2, -1.49],
        [-1.2, 2, -1.49],
      ].map((pos, idx) => (
        <mesh key={`win-main-${idx}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#FFFFDD"
            emissive="#FFFBDC"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/*
        --- ДВЕРЬ ---
        Простая дверь в передней части основания
      */}
      <mesh position={[0, 0.75, 1.51] as [number, number, number]}>
        <boxGeometry args={[0.8, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
    </group>
  );
};
