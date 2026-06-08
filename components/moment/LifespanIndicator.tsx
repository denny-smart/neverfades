'use client';

import { motion } from 'framer-motion';

interface LifespanIndicatorProps {
  viewCount: number;
  maxViews: number;
  accentColor: string;
}

export default function LifespanIndicator({
  viewCount,
  maxViews,
  accentColor,
}: LifespanIndicatorProps) {
  const remaining = maxViews - viewCount;
  const pct = (viewCount / maxViews) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3"
    >
      {/* Label */}
      <p className="font-body text-xs tracking-[0.25em] uppercase text-ash-400">
        Lifespan
      </p>

      {/* Track */}
      <div className="w-48 h-px bg-charcoal-600 relative overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 h-full origin-left"
          style={{ background: accentColor, width: '100%' }}
        />
      </div>

      {/* Count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="font-display text-sm font-light"
        style={{ color: accentColor }}
      >
        {remaining} / {maxViews}{' '}
        <span className="font-body text-xs text-ash-400 font-normal tracking-wide">
          views remaining
        </span>
      </motion.p>
    </motion.div>
  );
}
