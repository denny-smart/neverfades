'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import RoseLineArt from './RoseLineArt';
import AtmosphereLayer from '../moment/AtmosphereLayer';
import { useState, useEffect } from 'react';

// Subtle crimson atmosphere for the landing page
const HERO_THEME_ENGINE = {
  particleDensity: 'low' as const,
  motionBehavior:  'fall' as const,
  backgroundLayer: 'gradient' as const,
  emotionalIntensity: 'soft' as const,
  particleShape:   'petal' as const,
};

const HERO_PALETTE = {
  primary:   '#c41230',
  secondary: '#8b0a1f',
  accent:    '#e8184f',
};

export default function HeroSection() {
  const [showAtmosphere, setShowAtmosphere] = useState(false);

  // Delay atmosphere so it doesn't compete with the initial page-load FCP
  useEffect(() => {
    const t = setTimeout(() => setShowAtmosphere(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-void px-6">

      {/* Live particle atmosphere (delayed for performance) */}
      <AnimatePresence>
        {showAtmosphere && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <AtmosphereLayer themeEngine={HERO_THEME_ENGINE} palette={HERO_PALETTE} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric radial glow */}
      <div
        className="atmosphere absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,18,48,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Vignette edges */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(10,10,10,0.7) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Animated rose art (centered, behind text) */}
      <RoseLineArt />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-xs tracking-[0.3em] uppercase text-crimson mb-8"
        >
          momentsthatneverfade
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.1] text-white mb-6"
        >
          Create a digital moment
          <br />
          <span className="text-gradient-crimson italic">that fades.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-base sm:text-lg text-ash-300 font-light leading-relaxed mb-16 max-w-md mx-auto"
        >
          For a love that never does.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-5"
        >
          {/* Pulsing button wrapper */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(196,18,48,0.25)',
                '0 0 45px rgba(196,18,48,0.55)',
                '0 0 20px rgba(196,18,48,0.25)',
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full"
          >
            <Link
              href="/create"
              transitionTypes={['nav-forward']}
              id="cta-ignite"
              className="group relative inline-flex items-center justify-center px-16 py-6 bg-crimson text-white font-body text-sm tracking-[0.25em] uppercase overflow-hidden transition-all duration-500 hover:bg-rose hover:scale-[1.03] rounded-full"
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 skew-x-[-20deg]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                }}
                aria-hidden="true"
              />
              <span className="relative z-10 flex items-center gap-3">
                <span>Ignite a Moment</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="opacity-80 group-hover:translate-x-1 transition-transform duration-300"
                  aria-hidden="true"
                >
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>

          {/* Scarcity micro-label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="font-body text-[10px] tracking-[0.25em] uppercase text-ash-500"
          >
            Each link fades after 3 views. No exceptions.
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, #0a0a0a, transparent)',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
