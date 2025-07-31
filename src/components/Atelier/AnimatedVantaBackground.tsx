import React, { useRef, useEffect } from 'react';

export const AnimatedVantaBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: any;

    // Устанавливаем скрипты Three.js → Vanta.BIRDS из CDN
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(`Failed to load ${src}`);
        document.head.appendChild(s);
      });

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta/dist/vanta.birds.min.js'))
      .then(() => {
        if (ref.current && (window as any).VANTA) {
          effect = (window as any).VANTA.BIRDS({
            el: ref.current,
            THREE: (window as any).THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor: 0x000000,
            color1: 0xff4444,
            color2: 0x4444ff,
            size: 1.2,
            waveHeight: 20.0,
          });
        }
      })
      .catch(console.error);

    return () => effect?.destroy();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,          // чтобы фон был позади
      }}
    />
  );
};
