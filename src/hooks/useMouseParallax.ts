import { useEffect, useRef } from 'react';

export function useMouseParallax(intensity: number = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      currentRef.current.x += (mouseRef.current.x * intensity - currentRef.current.x) * 0.05;
      currentRef.current.y += (mouseRef.current.y * intensity - currentRef.current.y) * 0.05;

      if (ref.current) {
        ref.current.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return ref;
}
