'use client';

import { useEffect, useRef } from 'react';

/** Background image variants for each page */
const VARIANT_IMAGES: Record<string, string> = {
  landing:
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
  quiz:
    'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?q=80&w=2000&auto=format&fit=crop',
  results:
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2000&auto=format&fit=crop',
};

/** Per-variant opacity for best contrast */
const VARIANT_OPACITY: Record<string, number> = {
  landing: 0.15,
  quiz: 0.12,
  results: 0.18,
};

/** Sakura petal colors */
const PETAL_COLORS = [
  'rgba(249, 168, 184, 0.6)',  // soft pink
  'rgba(244, 114, 182, 0.5)',  // rose
  'rgba(252, 205, 214, 0.5)',  // light blush
  'rgba(253, 164, 175, 0.45)', // salmon pink
  'rgba(254, 205, 211, 0.4)',  // pale rose
  'rgba(255, 241, 242, 0.35)', // near-white pink
];

/** A single sakura petal tracked entirely in mutable refs — zero React state */
interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  opacityDir: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  color: string;
}

interface SakuraBackgroundProps {
  variant?: 'landing' | 'quiz' | 'results';
}

export default function SakuraBackground({ variant = 'landing' }: SakuraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationRef = useRef<number>(0);
  const initializedRef = useRef(false);

  // Single useEffect with [] — runs ONCE on mount, cleans up on unmount
  useEffect(() => {
    // Guard against double-init in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const PETAL_COUNT = isMobile ? 18 : 32;

    // Resize canvas to fill viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create initial petals (stored in ref, NOT state)
    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height, // start above viewport
      size: 2 + Math.random() * 6,
      speedY: 0.3 + Math.random() * 1.0,
      speedX: -0.2 + Math.random() * 0.4,
      opacity: 0.15 + Math.random() * 0.45,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * (0.002 + Math.random() * 0.003),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    });

    // Initialize petals array — spread across viewport for immediate effect
    petalsRef.current = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const petal = createPetal();
      petal.y = Math.random() * canvas.height; // visible immediately
      petalsRef.current.push(petal);
    }

    // Animation loop — uses requestAnimationFrame, NOT setInterval
    let lastTime = performance.now();
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // Frame rate limiting
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const petals = petalsRef.current;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Update position
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobbleOffset) * 0.3;
        p.wobbleOffset += p.wobbleSpeed;

        // Animate opacity (gentle pulse)
        p.opacity += p.opacityDir;
        if (p.opacity >= 0.6) { p.opacity = 0.6; p.opacityDir *= -1; }
        if (p.opacity <= 0.1) { p.opacity = 0.1; p.opacityDir *= -1; }

        // Recycle petal when it falls off screen
        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw petal (soft circle with glow)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Subtle glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * 0.15;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // Start the animation loop
    animationRef.current = requestAnimationFrame(animate);

    // CLEANUP: cancel animation frame and remove listener on unmount
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      petalsRef.current = [];
      initializedRef.current = false;
    };
  }, []); // Empty dependency array — runs exactly ONCE

  const imageUrl = VARIANT_IMAGES[variant] || VARIANT_IMAGES.landing;
  const opacityValue = VARIANT_OPACITY[variant] || VARIANT_OPACITY.landing;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ willChange: 'transform' }}
    >
      {/* "Twilight in Kyoto" deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#1a0b2e] to-slate-900" />

      {/* Dynamic Unsplash overlay — changes per page */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          opacity: opacityValue,
        }}
      />

      {/* Subtle atmospheric fog layers */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-slate-950/80 to-transparent" />
      </div>

      {/* Custom canvas sakura particles — zero React state, pure refs + rAF */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
