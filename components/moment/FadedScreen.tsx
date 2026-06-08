'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Floating ash particle for the faded canvas ──────────────────────────
interface AshParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

function createAsh(canvas: HTMLCanvasElement): AshParticle {
  return {
    x: Math.random() * canvas.width,
    y: -10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * 0.4 + 0.2,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.35 + 0.05,
    life: 0,
    maxLife: Math.random() * 400 + 200,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
  };
}

function AshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<AshParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
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

    for (let i = 0; i < 40; i++) {
      const p = createAsh(canvas);
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.opacity * Math.sin(lifeRatio * Math.PI);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, alpha);
        // Draw a soft rectangular flake
        ctx.fillStyle = '#c41230';
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();

        return p.life < p.maxLife;
      });

      while (particlesRef.current.length < 40) {
        particlesRef.current.push(createAsh(canvas));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="atmosphere-canvas"
      aria-hidden="true"
    />
  );
}

export default function FadedScreen() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Dark atmospheric vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,18,48,0.03) 0%, #0a0a0a 75%)',
        }}
        aria-hidden="true"
      />

      {/* Falling ash canvas */}
      <AshCanvas />

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Broken heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl mb-12"
          aria-hidden="true"
        >
          💔
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, delay: 0.8 }}
          className="h-px bg-charcoal-800 mb-12"
        />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-5xl font-light text-white mb-8 leading-tight"
        >
          This moment has faded
          <br />
          <span className="text-gradient-crimson italic">from the surface.</span>
        </motion.h1>

        {/* Emotional sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-sm sm:text-base text-ash-300 leading-relaxed mb-14 max-w-sm mx-auto"
        >
          But it still exists between you both.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 2.8 }}
          className="h-px bg-charcoal-700 mb-12"
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 3.2 }}
        >
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-ash-400 mb-6">
            Pass the feeling forward
          </p>
          <Link
            href="/create"
            id="btn-faded-create"
            className="inline-flex items-center justify-center px-8 py-4 bg-crimson text-white font-body text-sm tracking-widest uppercase hover:bg-rose glow-crimson transition-all duration-500 min-w-[220px]"
          >
            Create your own moment
          </Link>
        </motion.div>

        {/* Brand mark */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 4 }}
          className="font-body text-[9px] tracking-[0.35em] uppercase text-ash-400 mt-12"
        >
          lovethatneverfades
        </motion.p>
      </div>
    </div>
  );
}
