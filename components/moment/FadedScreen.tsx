'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Ash particle canvas ─────────────────────────────────────────────────────
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
  windPhase: number;
}

function createAsh(canvas: HTMLCanvasElement): AshParticle {
  return {
    x:             Math.random() * canvas.width,
    y:             -10,
    vx:            (Math.random() - 0.5) * 0.4,
    vy:            Math.random() * 0.45 + 0.2,
    size:          Math.random() * 2.5 + 0.8,
    opacity:       Math.random() * 0.28 + 0.04,
    life:          0,
    maxLife:       Math.random() * 500 + 250,
    rotation:      Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.015,
    windPhase:     Math.random() * Math.PI * 2,
  };
}

function AshCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<AshParticle[]>([]);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Pre-scatter initial particles across the whole screen
    for (let i = 0; i < 55; i++) {
      const p    = createAsh(canvas);
      p.life     = Math.random() * p.maxLife;
      p.y        = Math.random() * canvas.height;
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x        += p.vx + Math.sin(p.life * 0.012 + p.windPhase) * 0.55;
        p.y        += p.vy;
        p.rotation += p.rotationSpeed;

        const lifeRatio = p.life / p.maxLife;
        const alpha     = p.opacity * Math.sin(lifeRatio * Math.PI);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.25);
        ctx.lineTo(p.size * 0.75, 0);
        ctx.lineTo(0, p.size * 1.25);
        ctx.lineTo(-p.size * 0.75, 0);
        ctx.closePath();
        ctx.fillStyle   = '#c41230';
        ctx.shadowBlur  = p.size * 1.8;
        ctx.shadowColor = '#c41230';
        ctx.fill();
        ctx.restore();

        return p.life < p.maxLife && p.y < canvas.height + 20;
      });

      while (particlesRef.current.length < 55) {
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

// ─── Animated broken-heart SVG ───────────────────────────────────────────────
function BrokenHeartIcon() {
  return (
    <svg width="52" height="48" viewBox="0 0 52 48" fill="none" aria-hidden="true">
      {/* Left half */}
      <motion.path
        d="M26 44C26 44 3 29.5 3 14C3 7.37 8.37 2 15 2C19.18 2 22.86 4.14 25 7.37"
        stroke="#c41230"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Right half — slightly offset for broken feel */}
      <motion.path
        d="M28 44C28 44 49 29.5 49 14C49 7.37 43.63 2 37 2C32.82 2 29.14 4.14 27 7.37"
        stroke="#8b0a1f"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.65 }}
        transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Crack / break line */}
      <motion.path
        d="M26 44L24 30L28 22L23 14L28 7"
        stroke="#c41230"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 0.9, delay: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FadedScreen() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Deep vignette glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,18,48,0.05) 0%, #0a0a0a 70%)',
        }}
        aria-hidden="true"
      />

      {/* Edge darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Falling ash canvas */}
      <AshCanvas />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-xs text-center flex flex-col items-center mx-auto">

        {/* Eyebrow — sits at the very top of the content block */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-body text-[9px] tracking-[0.42em] uppercase text-crimson mb-7"
        >
          momentsthatneverfade
        </motion.p>

        {/* Broken heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <BrokenHeartIcon />
        </motion.div>

        {/* Hairline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-px mb-8 origin-center"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,18,48,0.5), transparent)' }}
        />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-5xl font-light text-white mb-3 leading-tight"
        >
          This was made with one person in mind.
        </motion.h1>

        {/* Italic accent — emotional exhale after the headline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-2xl sm:text-3xl italic text-gradient-crimson mb-8 leading-snug"
        >
          You were that person.
        </motion.p>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[14px] text-white/50 leading-loose mb-10 max-w-[240px] mx-auto"
        >
          The page has cleared. The thought behind it has not. It is still here, held quietly between you and the person who made it.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-px mb-9 origin-center"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,18,48,0.35), transparent)' }}
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <p className="font-body text-[9px] tracking-[0.35em] uppercase text-white/35">
            Now it lives with you
          </p>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(196,18,48,0.25)',
                '0 0 44px rgba(196,18,48,0.6)',
                '0 0 20px rgba(196,18,48,0.25)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full overflow-hidden"
          >
            <Link
              href="/create"
              transitionTypes={['nav-forward']}
              id="btn-faded-create"
              className="group relative inline-flex items-center justify-center px-14 py-5 bg-crimson text-white font-body text-[12px] font-semibold tracking-[0.22em] uppercase overflow-hidden transition-all duration-500 hover:bg-rose hover:scale-[1.04] active:scale-[0.98] rounded-full"
            >
              <span
                className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 skew-x-[-18deg]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)' }}
                aria-hidden="true"
              />
              <span className="relative z-10">Give someone that feeling</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
