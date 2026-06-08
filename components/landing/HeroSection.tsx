'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import RoseLineArt from './RoseLineArt';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-void px-6">
      {/* Atmospheric radial glow */}
      <div
        className="atmosphere absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(196,18,48,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Animated rose art (centered, behind text) */}
      <RoseLineArt />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-body text-xs tracking-[0.3em] uppercase text-crimson mb-8"
        >
          lovethatneverfades
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
          transition={{ duration: 1.2, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-base sm:text-lg text-ash-300 font-light leading-relaxed mb-14 max-w-md mx-auto"
        >
          For a love that never does.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/create"
            id="cta-ignite"
            className="group relative inline-flex items-center justify-center min-w-[220px] px-8 py-4 bg-crimson text-white font-body text-sm font-medium tracking-widest uppercase overflow-hidden transition-all duration-500 hover:bg-rose glow-crimson"
          >
            <span className="relative z-10">Ignite a Moment</span>
            <span
              className="absolute inset-0 bg-rose translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"
              aria-hidden="true"
            />
          </Link>

          <Link
            href="/create?mode=surprise"
            id="cta-surprise"
            className="inline-flex items-center justify-center min-w-[220px] px-8 py-4 border border-charcoal-600 text-ash-200 font-body text-sm font-medium tracking-widest uppercase hover:border-crimson hover:text-white transition-all duration-500"
          >
            Create a Surprise
          </Link>
        </motion.div>

        {/* Scarcity hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.2 }}
          className="font-body text-xs text-ash-400 mt-10 tracking-wide"
        >
          Each link fades after 10 views. No exceptions.
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #0a0a0a, transparent)',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
