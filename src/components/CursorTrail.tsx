import { useEffect, useRef } from 'react';

type TrailDot = {
  x: number;
  y: number;
  life: number;
  color: string;
};

const COLORS = ['#00F0FF', '#B026FF'];

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Desktop pointers only
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots: TrailDot[] = [];
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist < 8) return;
      lastX = e.clientX;
      lastY = e.clientY;
      dots.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      if (dots.length > 40) dots.shift();
    };
    window.addEventListener('mousemove', onMove);

    let frameId = 0;
    const render = () => {
      frameId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        dot.life -= 0.03;
        if (dot.life <= 0) {
          dots.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3 * dot.life, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = dot.life * 0.5;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  );
}
