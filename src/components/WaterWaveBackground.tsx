
import { useEffect, useRef } from 'react';

export const WaterWaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawWave = (amplitude: number, frequency: number, phase: number, opacity: number, color: string) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      for (let x = 0; x <= canvas.width; x++) {
        const y = canvas.height - 200 + Math.sin((x * frequency) + phase) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${color}${Math.floor(opacity * 0.1 * 255).toString(16).padStart(2, '0')}`);

      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create multiple wave layers for depth
      drawWave(30, 0.02, time * 0.5, 0.1, '#3b82f6'); // Blue wave
      drawWave(25, 0.025, time * 0.7 + Math.PI, 0.08, '#8b5cf6'); // Purple wave
      drawWave(35, 0.015, time * 0.3 + Math.PI * 0.5, 0.06, '#06b6d4'); // Cyan wave
      drawWave(20, 0.03, time * 0.9 + Math.PI * 1.5, 0.05, '#10b981'); // Emerald wave

      time += 0.01;
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
