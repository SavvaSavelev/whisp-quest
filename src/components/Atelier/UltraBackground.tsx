// src/components/Atelier/UltraBackground.tsx
import { useEffect, useRef } from 'react';

export function UltraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Установка размера canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Частицы для эффекта
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
      type: 'star' | 'nebula' | 'cosmic';
    }> = [];

    // Создание частиц
    const createParticle = (type: 'star' | 'nebula' | 'cosmic' = 'star') => {
      const colors = {
        star: ['#ffffff', '#ffeeaa', '#aaeeff', '#ffaaee', '#aaffaa'],
        nebula: ['#ff6b9d', '#845ec2', '#4e8397', '#a8e6cf', '#ffd93d'],
        cosmic: ['#00f5ff', '#ff1744', '#ff9800', '#8bc34a', '#e91e63']
      };

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * (type === 'star' ? 2 : 8) + 1,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        life: 0,
        maxLife: Math.random() * 1000 + 500,
        type
      };
    };

    // Инициализация частиц
    for (let i = 0; i < 200; i++) {
      particles.push(createParticle('star'));
    }
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle('nebula'));
    }
    for (let i = 0; i < 30; i++) {
      particles.push(createParticle('cosmic'));
    }

    let time = 0;

    const animate = () => {
      time += 0.016;
      
      // Очистка canvas с градиентом
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a0a1a');
      bgGradient.addColorStop(0.3, '#1a1a3a');
      bgGradient.addColorStop(0.7, '#2a1a4a');
      bgGradient.addColorStop(1, '#1a0a3a');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Рендер частиц
      particles.forEach((particle, index) => {
        particle.life += 1;
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Обновление позиции с учетом границ
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Рендер в зависимости от типа
        const alpha = Math.sin((particle.life / particle.maxLife) * Math.PI);
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;

        if (particle.type === 'star') {
          // Звезды с мерцанием
          const twinkle = Math.sin(time * 3 + particle.x * 0.01) * 0.5 + 0.5;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = particle.size * 2;
          ctx.shadowColor = particle.color;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
          ctx.fill();

          // Крестик для ярких звезд
          if (particle.size > 1.5) {
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x - particle.size * 2, particle.y);
            ctx.lineTo(particle.x + particle.size * 2, particle.y);
            ctx.moveTo(particle.x, particle.y - particle.size * 2);
            ctx.lineTo(particle.x, particle.y + particle.size * 2);
            ctx.stroke();
          }
          
        } else if (particle.type === 'nebula') {
          // Туманности
          const nebulaGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          nebulaGradient.addColorStop(0, particle.color + '80');
          nebulaGradient.addColorStop(0.5, particle.color + '40');
          nebulaGradient.addColorStop(1, particle.color + '00');
          
          ctx.fillStyle = nebulaGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
          
        } else if (particle.type === 'cosmic') {
          // Космические аномалии
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = particle.size * 4;
          ctx.shadowColor = particle.color;
          
          const spikes = 6;
          const rotation = time * 2 + particle.x * 0.01;
          
          ctx.translate(particle.x, particle.y);
          ctx.rotate(rotation);
          
          ctx.beginPath();
          for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Обновление жизни частицы
        if (particle.life >= particle.maxLife) {
          particles[index] = createParticle(particle.type);
        }
      });

      // Дополнительные эффекты
      
      // Пульсирующие кольца энергии
      ctx.save();
      ctx.globalAlpha = 0.1;
      const ringRadius = Math.sin(time) * 100 + 200;
      const ringGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, ringRadius - 50,
        canvas.width / 2, canvas.height / 2, ringRadius + 50
      );
      ringGradient.addColorStop(0, '#00f5ff00');
      ringGradient.addColorStop(0.5, '#00f5ff80');
      ringGradient.addColorStop(1, '#00f5ff00');
      
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Боковые энергетические потоки
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.globalAlpha = 0.05 + Math.sin(time + i) * 0.02;
        
        const flowGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const colors = ['#ff6b9d', '#845ec2', '#4e8397'];
        flowGradient.addColorStop(0, colors[i] + '00');
        flowGradient.addColorStop(0.5, colors[i] + '60');
        flowGradient.addColorStop(1, colors[i] + '00');
        
        ctx.fillStyle = flowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* Дополнительные CSS эффекты */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(132, 94, 194, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(78, 131, 151, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(168, 230, 207, 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Анимированные частицы CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: ['#ffffff', '#ffeeaa', '#aaeeff', '#ffaaee'][Math.floor(Math.random() * 4)],
              borderRadius: '50%',
              boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Мистический туман */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          zIndex: 4,
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              rgba(255, 107, 157, 0.1) 60deg, 
              transparent 120deg, 
              rgba(132, 94, 194, 0.1) 180deg, 
              transparent 240deg, 
              rgba(78, 131, 151, 0.1) 300deg, 
              transparent 360deg)
          `,
          animation: 'spin 120s linear infinite'
        }}
      />
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
