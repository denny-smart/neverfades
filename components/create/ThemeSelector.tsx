'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@/lib/themes';
import { FadeTheme } from '@/lib/themes/types';
import ThemeMiniCanvas from './ThemeMiniCanvas';

interface ThemeSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

// Map technical IDs to beautiful emotional vibe titles
const VIBE_MAP: Record<string, string> = {
  'romantic-roses': 'Deep Devotion',
  'magic-stars':    'Starry Whispers',
  'love-balloons':  'Floating Dreams',
  'sunset-glow':    'Dusk Affection',
  'galaxy-romance': 'Infinite Echoes',
  'teddy-love':     'Soft Embrace',
  'love-emojis':    'Love Symbols',
  'pink-petals':    'Blush Whisper',
  'white-petals':   'Pure Serenity',
  'golden-petals':  'Gilded Dawn',
};

// Descriptive motion label shown on card
const MOTION_LABEL: Record<string, string> = {
  'romantic-roses': 'falling petals',
  'magic-stars':    'star drift',
  'love-balloons':  'rising balloons',
  'sunset-glow':    'glowing embers',
  'galaxy-romance': 'star drift',
  'teddy-love':     'tumbling bears',
  'love-emojis':    'rising emojis',
  'pink-petals':    'blush flutter',
  'white-petals':   'ivory cascade',
  'golden-petals':  'golden flutter',
};

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full" style={{ maxWidth: 480 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {themes.map((theme: FadeTheme) => {
          const isSelected = selected === theme.id;
          const isHovered  = hovered === theme.id;
          const vibeName   = VIBE_MAP[theme.id]   || theme.name;
          const motionLbl  = MOTION_LABEL[theme.id] || theme.themeEngine.motionBehavior;

          return (
            <motion.button
              key={theme.id}
              type="button"
              id={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              className="relative rounded-2xl w-full text-left overflow-hidden backdrop-blur-sm cursor-pointer"
              style={{
                background:  isSelected
                  ? `linear-gradient(145deg, ${theme.palette.primary}14 0%, rgba(0,0,0,0.4) 100%)`
                  : 'rgba(0,0,0,0.28)',
                border:      `1px solid ${isSelected ? theme.palette.primary : 'rgba(255,255,255,0.06)'}`,
                boxShadow:   isSelected
                  ? `0 0 28px ${theme.palette.primary}22, inset 0 0 12px ${theme.palette.primary}08`
                  : 'none',
                transition:  'all 0.4s ease',
              }}
            >
              {/* Live mini-canvas particle preview */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{ opacity: isSelected ? 0.22 : isHovered ? 0.14 : 0.07, transition: 'opacity 0.5s ease' }}
              >
                <ThemeMiniCanvas
                  motionBehavior={theme.themeEngine.motionBehavior as 'fall' | 'drift' | 'float' | 'pulse'}
                  particleShape={theme.themeEngine.particleShape}
                  primary={theme.palette.primary}
                  accent={theme.palette.accent}
                />
              </div>

              {/* Card content */}
              <div className="relative z-10 p-5">
                {/* Top row: colour dot + motion type */}
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    animate={isSelected ? {
                      boxShadow: [
                        `0 0 4px ${theme.palette.primary}`,
                        `0 0 12px ${theme.palette.primary}`,
                        `0 0 4px ${theme.palette.primary}`,
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: theme.palette.primary }}
                  />
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-white/25">
                    {motionLbl}
                  </span>
                </div>

                {/* Vibe name */}
                <h3
                  className="font-display text-xl font-light mb-1 transition-colors duration-400"
                  style={{ color: isSelected ? theme.palette.accent : '#fff' }}
                >
                  {vibeName}
                </h3>

                {/* Description */}
                <p className="font-body text-[11px] text-white/35 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{ background: theme.palette.primary }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 3.5L3.8 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
