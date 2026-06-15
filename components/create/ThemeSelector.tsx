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

/* ─── Human-readable theme metadata ─────────────────────────────────────── */
export interface ThemeMeta {
  label: string;        // Clear display name users immediately understand
  emoji: string;        // Visual icon for instant recognition
  mood: string;         // One-liner that describes the feeling
  tags: string[];       // Short mood chips (2–3)
}

export const THEME_META: Record<string, ThemeMeta> = {
  'romantic-roses': {
    label: 'Red Roses',
    emoji: '🌹',
    mood: 'Crimson petals drifting through the air',
    tags: ['Romantic', 'Passionate', 'Classic'],
  },
  'magic-stars': {
    label: 'Starry Night',
    emoji: '✨',
    mood: 'A constellation written just for you',
    tags: ['Dreamy', 'Magical', 'Soft'],
  },
  'love-balloons': {
    label: 'Balloons',
    emoji: '🎈',
    mood: 'Heart-shaped balloons floating skyward',
    tags: ['Playful', 'Joyful', 'Light'],
  },
  'sunset-glow': {
    label: 'Sunset Embers',
    emoji: '🌅',
    mood: 'Warm glowing embers at the edge of night',
    tags: ['Warm', 'Intense', 'Passionate'],
  },
  'galaxy-romance': {
    label: 'Galaxy',
    emoji: '🌌',
    mood: 'Lost in the cosmos, found in you',
    tags: ['Cosmic', 'Deep', 'Ethereal'],
  },
  'teddy-love': {
    label: 'Teddy Bears',
    emoji: '🧸',
    mood: 'Cute love bears tumbling through the air',
    tags: ['Cute', 'Sweet', 'Cozy'],
  },
  'love-emojis': {
    label: 'Love Emojis',
    emoji: '💖',
    mood: 'Hearts and love symbols rising up',
    tags: ['Fun', 'Expressive', 'Modern'],
  },
  'pink-petals': {
    label: 'Pink Petals',
    emoji: '🌸',
    mood: 'A soft blizzard of blush-pink petals',
    tags: ['Gentle', 'Feminine', 'Dreamy'],
  },
  'white-petals': {
    label: 'White Petals',
    emoji: '🤍',
    mood: 'Pure white petals in a silent cascade',
    tags: ['Pure', 'Elegant', 'Calm'],
  },
  'golden-petals': {
    label: 'Golden Petals',
    emoji: '🌼',
    mood: 'Gold petals catching the last warm light',
    tags: ['Luxurious', 'Warm', 'Radiant'],
  },
  'money-flow': {
    label: 'Money Rain',
    emoji: '💸',
    mood: 'Neon bills raining through the night',
    tags: ['Bold', 'Celebratory', 'Neon'],
  },
  'birthday-celebration': {
    label: 'Birthday Bash',
    emoji: '🎂',
    mood: 'Vibrant balloons rising with birthday wishes',
    tags: ['Festive', 'Fun', 'Colorful'],
  },
};

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full" style={{ maxWidth: 520 }}>

      {/* Selected theme summary pill */}
      <AnimatePresence mode="wait">
        {selected && (() => {
          const meta = THEME_META[selected];
          const theme = themes.find(t => t.id === selected);
          if (!meta || !theme) return null;
          return (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl border"
              style={{
                background: `linear-gradient(135deg, ${theme.palette.primary}18 0%, rgba(0,0,0,0.4) 100%)`,
                borderColor: `${theme.palette.primary}35`,
                boxShadow: `0 0 20px ${theme.palette.primary}15`,
              }}
            >
              <span className="text-xl leading-none">{meta.emoji}</span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className="font-display text-sm font-light leading-none"
                  style={{ color: theme.palette.accent }}
                >
                  {meta.label}
                </span>
                <span className="font-body text-[10px] text-white/40 truncate leading-snug">
                  {meta.mood}
                </span>
              </div>
              <motion.div
                className="ml-auto w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: theme.palette.primary }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 2.8L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Theme grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {themes.map((theme: FadeTheme) => {
          const meta      = THEME_META[theme.id] ?? { label: theme.name, emoji: '🎨', mood: theme.description, tags: [] };
          const isSelected = selected === theme.id;
          const isHovered  = hovered === theme.id;

          return (
            <motion.button
              key={theme.id}
              type="button"
              id={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl w-full text-left overflow-hidden cursor-pointer"
              style={{
                background: isSelected
                  ? `linear-gradient(145deg, ${theme.palette.primary}18 0%, rgba(0,0,0,0.45) 100%)`
                  : 'rgba(255,255,255,0.035)',
                border:    `1px solid ${isSelected ? theme.palette.primary + '60' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected
                  ? `0 0 24px ${theme.palette.primary}22, inset 0 0 10px ${theme.palette.primary}08`
                  : isHovered ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.35s ease',
              }}
            >
              {/* Live particle preview (background) */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{
                  opacity: isSelected ? 0.28 : isHovered ? 0.16 : 0.07,
                  transition: 'opacity 0.5s ease',
                }}
              >
                <ThemeMiniCanvas
                  motionBehavior={theme.themeEngine.motionBehavior as 'fall' | 'drift' | 'float' | 'pulse'}
                  particleShape={theme.themeEngine.particleShape}
                  primary={theme.palette.primary}
                  accent={theme.palette.accent}
                />
              </div>

              {/* Card content */}
              <div className="relative z-10 p-4 flex items-start gap-3">

                {/* Emoji icon box */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg leading-none"
                  style={{
                    background: `${theme.palette.primary}18`,
                    border: `1px solid ${theme.palette.primary}25`,
                  }}
                >
                  {meta.emoji}
                </div>

                {/* Text block */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Name + colour swatch */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-display text-base font-light leading-tight transition-colors duration-300"
                      style={{ color: isSelected ? theme.palette.accent : '#fff' }}
                    >
                      {meta.label}
                    </span>
                    {/* Colour dot */}
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      animate={isSelected ? {
                        boxShadow: [
                          `0 0 3px ${theme.palette.primary}`,
                          `0 0 9px ${theme.palette.primary}`,
                          `0 0 3px ${theme.palette.primary}`,
                        ],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ background: theme.palette.primary }}
                    />
                  </div>

                  {/* Mood description */}
                  <p className="font-body text-[10px] text-white/38 leading-relaxed mb-2 line-clamp-1">
                    {meta.mood}
                  </p>

                  {/* Tag chips */}
                  <div className="flex flex-wrap gap-1">
                    {meta.tags.map(tag => (
                      <span
                        key={tag}
                        className="font-body text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: isSelected ? `${theme.palette.primary}22` : 'rgba(255,255,255,0.06)',
                          color: isSelected ? theme.palette.accent : 'rgba(255,255,255,0.35)',
                          border: `1px solid ${isSelected ? theme.palette.primary + '30' : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: theme.palette.primary }}
                    >
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.2L3.4 5.8L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Helper note */}
      <p className="font-body text-[9px] tracking-[0.2em] uppercase text-white/20 text-center mt-4">
        Tap a theme to preview its atmosphere
      </p>
    </div>
  );
}
