'use client';

import { useRef, useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PRODUCTS, CATEGORY_COLORS } from '@/data';
import SectionHeader from '@/components/SectionHeader';
import { useFormatCurrency } from '@/context/LocaleContext';
import { useTranslation } from '@/context/LocaleContext';

function createCategoryTexture(categoryId: string, label: string, price: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  const color = CATEGORY_COLORS[categoryId] || '#0084FF';
  const gradient = ctx.createLinearGradient(0, 0, 512, 768);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 768);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(24, 24, 464, 720);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  const words = label.split(' ');
  words.forEach((word, i) => {
    ctx.fillText(word, 256, 320 + i * 44);
  });

  ctx.font = '28px Space Mono, monospace';
  ctx.fillStyle = '#C87941';
  ctx.fillText(price, 256, 480);

  ctx.font = '16px Space Grotesk, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('BEST STORE', 256, 680);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ---------- 3D Card ---------- */
function CarouselCard({
  index,
  total,
  radius,
  rotationOffset,
  texture,
  isActive,
}: {
  index: number;
  total: number;
  radius: number;
  rotationOffset: React.MutableRefObject<number>;
  texture: THREE.CanvasTexture;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleStep = (Math.PI * 2) / total;

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [texture]
  );

  const backMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#111111',
        roughness: 0.6,
      }),
    []
  );

  const sideMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0A0A0A',
        roughness: 0.7,
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0084FF',
        emissive: '#0084FF',
        emissiveIntensity: 0.15,
        roughness: 0.3,
        transparent: true,
        opacity: 0.3,
      }),
    []
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const angle = index * angleStep + rotationOffset.current;
    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    const targetRotY = -angle + Math.PI / 2;

    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.12;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.12;
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.12;

    const targetScale = isActive ? 1.15 : 1.0;
    meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.1;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.1;
    meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.1;
  });

  const materials = [sideMaterial, sideMaterial, sideMaterial, sideMaterial, frontMaterial, backMaterial];

  return (
    <group>
      <mesh ref={meshRef} material={materials} castShadow>
        <boxGeometry args={[2.2, 3.2, 0.08]} />
      </mesh>
      {isActive && (
        <mesh
          ref={(m) => {
            if (m && meshRef.current) {
              m.position.copy(meshRef.current.position);
              m.rotation.copy(meshRef.current.rotation);
              m.scale.set(
                meshRef.current.scale.x * 1.05,
                meshRef.current.scale.y * 1.05,
                meshRef.current.scale.z * 1.05
              );
            }
          }}
        >
          <boxGeometry args={[2.2, 3.2, 0.08]} />
          <primitive object={glowMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
}

/* ---------- Carousel Scene ---------- */
function CarouselScene({
  activeIndex,
  setActiveIndex,
  textures,
}: {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  textures: THREE.CanvasTexture[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationOffset = useRef(0);
  const targetRotation = useRef(0);
  const isInteracting = useRef(false);
  const interactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;
  const radius = isMobile ? 3.5 : 4.5;

  const goTo = useCallback(
    (index: number) => {
      const angleStep = (Math.PI * 2) / PRODUCTS.length;
      targetRotation.current = -index * angleStep;
      isInteracting.current = true;
      setActiveIndex(index);
      if (interactTimeout.current) clearTimeout(interactTimeout.current);
      interactTimeout.current = setTimeout(() => {
        isInteracting.current = false;
      }, 3000);
    },
    [setActiveIndex]
  );

  useFrame((_, delta) => {
    if (!isInteracting.current) {
      targetRotation.current += delta * 0.15;
    }
    rotationOffset.current += (targetRotation.current - rotationOffset.current) * 0.08;

    const angleStep = (Math.PI * 2) / PRODUCTS.length;
    const normalizedRot = ((rotationOffset.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const newIndex = Math.round(normalizedRot / angleStep) % PRODUCTS.length;
    const clampedIndex = (PRODUCTS.length - newIndex) % PRODUCTS.length;
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  });

  useEffect(() => {
    const g = groupRef.current as THREE.Group & { userData: Record<string, unknown> };
    if (g) {
      g.userData.goNext = () => goTo((activeIndex + 1) % PRODUCTS.length);
      g.userData.goPrev = () => goTo((activeIndex - 1 + PRODUCTS.length) % PRODUCTS.length);
      g.userData.goTo = goTo;
    }
  }, [activeIndex, goTo]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#0084FF" />
      {PRODUCTS.map((product, i) => (
        <CarouselCard
          key={product.id}
          index={i}
          total={PRODUCTS.length}
          radius={radius}
          rotationOffset={rotationOffset}
          texture={textures[i]}
          isActive={i === activeIndex}
        />
      ))}
    </group>
  );
}

/* ---------- Main Section ---------- */
export default function ProductCatalog() {
  const [activeIndex, setActiveIndex] = useState(0);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const groupRef = useRef<THREE.Group & { userData: Record<string, () => void> }>(null);
  const formatPrice = useFormatCurrency();
  const { t } = useTranslation();

  const textures = useMemo(
    () =>
      PRODUCTS.map((product) =>
        createCategoryTexture(
          product.categoryId,
          product.name,
          formatPrice(product.price)
        )
      ),
    [formatPrice]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (canvasWrapRef.current) observer.observe(canvasWrapRef.current);
    return () => observer.disconnect();
  }, []);

  const goNext = () => groupRef.current?.userData?.goNext?.();
  const goPrev = () => groupRef.current?.userData?.goPrev?.();
  const goTo = (index: number) => {
    const fn = groupRef.current?.userData?.goTo as ((index: number) => void) | undefined;
    fn?.(index);
  };

  const activeProduct = PRODUCTS[activeIndex];

  return (
    <section id="catalog" className="bg-krylo-bg py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="FEATURED PRODUCTS"
          headline="Built for Gamers"
          subtitle="Browse our full catalog of premium gaming products."
        />

        <div ref={canvasWrapRef} className="group relative mt-16 h-[400px] md:h-[500px]">
          {isVisible && (
            <Canvas
              camera={{ position: [0, 0, 6], fov: 50 }}
              gl={{ alpha: true, antialias: true }}
              style={{ background: 'transparent' }}
            >
              <Suspense fallback={null}>
                <CarouselScene
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  textures={textures}
                />
                <group ref={groupRef} />
              </Suspense>
            </Canvas>
          )}

          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-krylo-border bg-white/5 text-krylo-muted opacity-0 transition-all duration-300 hover:border-krylo-blue hover:text-white group-hover:opacity-100 md:left-8"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-krylo-border bg-white/5 text-krylo-muted opacity-0 transition-all duration-300 hover:border-krylo-blue hover:text-white group-hover:opacity-100 md:right-8"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-2xl font-medium text-white md:text-3xl">
            {activeProduct.name}
            <span className="ml-2 text-lg text-krylo-muted">· {activeProduct.duration}</span>
          </h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-krylo-copper">
            {formatPrice(activeProduct.price)}
          </p>

          <div className="mt-6 flex justify-center gap-2">
            {PRODUCTS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 bg-krylo-blue' : 'bg-krylo-border hover:bg-krylo-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
