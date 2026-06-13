import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

varying vec2 vUv;
varying float vWave;
varying vec3 vPos;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float x = pos.x;
  float y = pos.y;

  float xfreq = 4.5;
  float xamp = 0.08;
  float yfreq = 10.0;
  float yamp = 0.03;

  float distortionX = snoise(vec2(xfreq * x + u_time, 0.0)) * xamp;
  float distortionY = snoise(vec2(0.0, yfreq * y + u_time)) * yamp;

  float dist = sqrt(x * x + y * y);
  float mouseDist = length(u_mouse);

  float wave1 = sin(5.0 * dist - u_time * 2.5 + mouseDist * 3.0) * 0.08;
  float wave2 = sin(3.0 * dist - u_time * 1.8 - mouseDist * 2.0) * 0.04;
  float combinedWave = wave1 + wave2;

  pos.z += (distortionX + distortionY) + combinedWave;
  pos.z += exp(-dist * 3.0) * 0.1;

  vWave = pos.z;
  vPos = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying float vWave;
varying vec3 vPos;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec3 color1 = vec3(0.902, 0.224, 0.275);
  vec3 color2 = vec3(0.831, 0.639, 0.451);
  vec3 color3 = vec3(0.545, 0.361, 0.965);

  vec2 uv = gl_FragCoord.xy / u_resolution;

  float gradientFactor = uv.y + 0.2;
  vec3 baseGradient = mix(color1, color2, gradientFactor);

  vec3 color = mix(baseGradient, color3, vWave + 0.5 * uv.y);

  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  color += (0.02 / max(dist, 0.01)) * color3 * 0.15;

  float alpha = 1.0 - smoothstep(0.4, 1.0, dist);
  color *= alpha;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020202, 1);

    const scene = new THREE.Scene();
    const cameraDistance = 1;
    const fov = 2 * Math.atan(window.innerHeight / 2 / cameraDistance) * (180 / Math.PI);
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = cameraDistance;

    const aspectRatio = window.innerWidth / window.innerHeight;
    const planeHeight = cameraDistance * 2 * Math.tan((fov * Math.PI / 180) / 2);
    const planeWidth = planeHeight * aspectRatio;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 128, 128);

    const uniforms = {
      u_time: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const mouseTarget = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const newFov = 2 * Math.atan(h / 2 / cameraDistance) * (180 / Math.PI);
      camera.fov = newFov;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);

      const newAspect = w / h;
      const newPlaneHeight = cameraDistance * 2 * Math.tan((newFov * Math.PI / 180) / 2);
      const newPlaneWidth = newPlaneHeight * newAspect;
      mesh.scale.set(newPlaneWidth / planeWidth, newPlaneHeight / planeHeight, 1);
    };

    window.addEventListener('resize', handleResize);

    const startTime = performance.now();
    let rafId: number;

    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      uniforms.u_time.value = elapsed;
      uniforms.u_mouse.value.x += (mouseTarget.x - uniforms.u_mouse.value.x) * 0.08;
      uniforms.u_mouse.value.y += (mouseTarget.y - uniforms.u_mouse.value.y) * 0.08;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
