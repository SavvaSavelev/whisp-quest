import { useEffect, useRef } from "react";

export const ParallaxBackground = () => {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0, y = 0;
    let tx = 0, ty = 0;

    const handleMouseMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2; // чувствительность
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      x += (tx - x) * 0.05;
      y += (ty - y) * 0.05;

      if (ref1.current) {
        ref1.current.style.transform = `translate(${x * 40}px, ${y * 40}px) scale(1.1)`;
      }
      if (ref2.current) {
        ref2.current.style.transform = `translate(${x * 60}px, ${y * 60}px) scale(1.12)`;
      }
      if (ref3.current) {
        ref3.current.style.transform = `translate(${x * 80}px, ${y * 80}px) scale(1.14)`;
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Задний слой */}
      <div
        ref={ref1}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
        style={{
          backgroundImage: "url(/images/ghibli-space.png)",
          filter: "brightness(0.9)",
        }}
      />

      {/* Средний слой — можно поставить лёгкий градиент, облака, или планеты */}
      <div
        ref={ref2}
        className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-indigo-800/20 to-transparent"
      />

      {/* Передний слой — пыльца, звёзды или текстуры */}
      <div
        ref={ref3}
        className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent mix-blend-soft-light"
      />
    </div>
  );
};
