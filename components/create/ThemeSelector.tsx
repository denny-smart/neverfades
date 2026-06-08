'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '@/lib/themes';
import { FadeTheme } from '@/lib/themes/types';

interface ThemeSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <label className="font-body text-xs tracking-[0.2em] uppercase text-ash-300">
        Choose your atmosphere
      </label>

      <div className="grid grid-cols-1 gap-2">
        {themes.map((theme: FadeTheme) => {
          const isSelected = selected === theme.id;
          const isHovered = hovered === theme.id;

          return (
            <motion.button
              key={theme.id}
              type="button"
              id={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              whileTap={{ scale: 0.98 }}
              className="relative w-full text-left overflow-hidden transition-all duration-300"
              style={{
                border: isSelected
                  ? `1px solid ${theme.palette.primary}`
                  : '1px solid #2a2a2a',
              }}
            >
              {/* Theme preview strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                style={{
                  background: isSelected || isHovered
                    ? theme.palette.primary
                    : 'transparent',
                }}
              />

              <div className="flex items-center gap-4 px-4 py-3 pl-5">
                {/* Color swatch */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 transition-transform duration-300"
                  style={{
                    background: theme.previewGradient,
                    boxShadow: isSelected
                      ? `0 0 16px ${theme.palette.primary}60`
                      : 'none',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    border: `1px solid ${theme.palette.primary}40`,
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className="font-display text-base transition-colors duration-200"
                    style={{ color: isSelected ? theme.palette.primary : '#cccccc' }}
                  >
                    {theme.name}
                  </p>
                  <p className="font-body text-xs text-ash-400 mt-0.5">
                    {theme.description}
                  </p>
                </div>

                {/* Selected indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: theme.palette.primary }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Hover glow overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isHovered && !isSelected ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: `linear-gradient(90deg, ${theme.palette.primary}08 0%, transparent 60%)`,
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
