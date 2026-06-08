'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@/lib/themes';
import { FadeTheme } from '@/lib/themes/types';

interface ThemeSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

// Map technical IDs to beautiful emotional vibe titles
const VIBE_MAP: Record<string, string> = {
  'romantic-roses': 'Deep Devotion',
  'magic-stars': 'Starry Whispers',
  'love-balloons': 'Floating Dreams',
  'sunset-glow': 'Dusk Affection',
  'galaxy-romance': 'Infinite Echoes'
};

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <label className="font-body text-xs tracking-[0.25em] uppercase text-ash-400">
          Select the Emotional Vibe
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme: FadeTheme) => {
          const isSelected = selected === theme.id;
          const isHovered = hovered === theme.id;
          const vibeName = VIBE_MAP[theme.id] || theme.name;

          return (
            <motion.button
              key={theme.id}
              type="button"
              id={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl w-full text-left overflow-hidden bg-charcoal-900/30 border backdrop-blur-sm p-5 transition-all duration-500 cursor-pointer"
              style={{
                borderColor: isSelected
                  ? theme.palette.primary
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isSelected
                  ? `0 0 24px ${theme.palette.primary}20`
                  : 'none'
              }}
            >
              {/* Emotion Vibe Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: theme.palette.primary,
                    boxShadow: `0 0 8px ${theme.palette.primary}`
                  }}
                />
                
                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-ash-500">
                  {theme.themeEngine.motionBehavior}
                </span>
              </div>

              {/* Title & Description */}
              <div className="relative z-10 space-y-1 mb-8">
                <h3
                  className="font-display text-lg font-light transition-colors duration-300"
                  style={{ color: isSelected ? theme.palette.accent : '#ffffff' }}
                >
                  {vibeName}
                </h3>
                <p className="font-body text-xs text-ash-400 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Animated Background Motion Preview */}
              <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
                <motion.div
                  className="w-full h-full"
                  animate={
                    isSelected || isHovered
                      ? {
                          background: [
                            `radial-gradient(circle at 20% 20%, ${theme.palette.primary} 0%, transparent 60%)`,
                            `radial-gradient(circle at 80% 80%, ${theme.palette.secondary} 0%, transparent 60%)`,
                            `radial-gradient(circle at 20% 20%, ${theme.palette.primary} 0%, transparent 60%)`
                          ]
                        }
                      : {
                          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 80%)`
                        }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>

              {/* Selected indicator overlay glow */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                    style={{
                      borderColor: theme.palette.primary,
                      boxShadow: `inset 0 0 12px ${theme.palette.primary}15`
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Ambient Glow for Selection/Hover */}
              <motion.div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: theme.palette.accent,
                  opacity: isSelected ? 0.22 : isHovered ? 0.12 : 0
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
