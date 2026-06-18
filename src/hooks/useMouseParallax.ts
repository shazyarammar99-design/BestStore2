'use client';

import { useEffect, useRef } from 'react';

export function useMouseParallax(intensity: number = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      if (!activeRef.current) return;
      currentRef.current.x += (mouseRef.current.x * intensity - currentRef.current.x) * 0.05;
      currentRef.current.y += (mouseRef.current.y * intensity - currentRef.current.y) * 0.05;
      el.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(animate);
    };

    const stop = () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    observer.observe(el);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return ref;
}
