import React from "react";
import { Canvas } from "@react-three/fiber";
import FloatingSpirit from "../components/FloatingSpirit";
 

const MindRoomScene: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        // Фиксированная камера: положение [0, 2, 5] и FOV 50
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: "#f0eae2" }} // пока задаём однотонный фон, позднее можно заменить на текстуру или градиент
      >
        {/* Мягкое общее освещение */}
        <ambientLight intensity={0.5} />
        {/* Свет, имитирующий дневной свет из окна */}
        <directionalLight intensity={0.8} position={[5, 10, 7.5]} />

        {/* Размещаем одного духа в сцене */}
        <FloatingSpirit />

        {/*
          TODO: Добавить геометрию комнаты — стены, пол, окна и декоративные элементы.
          Здесь можно использовать PlaneGeometry для плоскостей или загрузить готовые модели.
        */}
      </Canvas>
    </div>
  );
};

export default MindRoomScene;
