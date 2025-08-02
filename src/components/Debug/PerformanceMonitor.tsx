import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../../store/appStore';

export const PerformanceMonitor: React.FC = () => {
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef<number[]>([]);
  
  const { fps, renderTime, spiritCount, debugMode } = useAppStore();
  const { setFPS, setRenderTime } = useAppStore();

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    
    frameRef.current++;
    
    // Обновляем FPS каждые 60 кадров
    if (frameRef.current % 60 === 0) {
      const currentFPS = Math.round(1000 / delta);
      fpsRef.current.push(currentFPS);
      
      // Оставляем только последние 10 значений для усреднения
      if (fpsRef.current.length > 10) {
        fpsRef.current.shift();
      }
      
      const avgFPS = Math.round(
        fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length
      );
      
      setFPS(avgFPS);
      setRenderTime(delta);
    }
    
    lastTimeRef.current = now;
  });

  if (!debugMode) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      <div className="space-y-1">
        <div>FPS: <span className={fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}>{fps}</span></div>
        <div>Render: {renderTime.toFixed(2)}ms</div>
        <div>Spirits: {spiritCount}</div>
        <div>Memory: {(performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ? 
          ((performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 'N/A'}MB</div>
      </div>
    </div>
  );
};
