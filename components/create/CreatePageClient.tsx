'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreationForm from '@/components/create/CreationForm';
import AtmosphereLayer from '@/components/moment/AtmosphereLayer';
import { getTheme } from '@/lib/themes';
import { motion } from 'framer-motion';

export default function CreatePageClient() {
  const [activeThemeId, setActiveThemeId] = useState('romantic-roses');
  const theme = getTheme(activeThemeId);

  return (
    <div
      className="min-h-screen w-full relative flex flex-col overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: theme.background }}
    >
      {/* Full-screen particle atmosphere */}
      <AtmosphereLayer themeEngine={theme.themeEngine} palette={theme.palette} />

      {/* Top-left Home button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-8 left-6 sm:left-8 z-20"
      >
        <Link
          href="/"
          transitionTypes={['nav-back']}
          className="flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/75 transition-colors duration-300"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
      </motion.div>

      {/* Radial vignette glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${theme.palette.primary}12 0%, transparent 65%)`,
        }}
        aria-hidden="true"
      />

      {/* Top branding bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center pt-10 pb-0"
      >
        <p
          className="font-body text-[9px] tracking-[0.4em] uppercase transition-colors duration-1000"
          style={{ color: theme.palette.primary }}
        >
          lovethatneverfades
        </p>
      </motion.div>

      {/* Centered floating content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
          style={{ maxWidth: '480px' }}
        >
          {/* Page headline — fades to background feel */}
          <div className="text-center mb-10">
            <h1 className="font-display text-5xl sm:text-6xl font-light text-white leading-tight tracking-wide mb-3">
              Seal your moment
            </h1>
            <p className="font-body text-xs text-white/35 tracking-wide">
              A single link. Ten views. One emotion that outlasts both.
            </p>
          </div>

          {/* Hairline divider */}
          <div className="flex items-center w-full gap-4 mb-10" style={{ maxWidth: '320px' }}>
            <div className="flex-1 h-px" style={{ background: `${theme.palette.primary}30` }} />
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: theme.palette.primary,
                boxShadow: `0 0 12px ${theme.palette.primary}, 0 0 4px ${theme.palette.primary}`,
              }}
            />
            <div className="flex-1 h-px" style={{ background: `${theme.palette.primary}30` }} />
          </div>

          {/* Form steps — float on the atmosphere */}
          <CreationForm activeThemeId={activeThemeId} onThemeChange={setActiveThemeId} />
        </motion.div>
      </div>
    </div>
  );
}
