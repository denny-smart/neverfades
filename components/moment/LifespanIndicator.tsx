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
      className="flex flex-col items-center gap-3 select-none"
    >
      {/* Label */}
      <p className="font-body text-[10px] tracking-[0.35em] uppercase text-ash-400">
        Lifespan
      </p>

      {/* Track with Glow and Handle */}
      <div className="w-48 h-[2px] bg-charcoal-800 rounded-full relative overflow-visible">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}40, ${accentColor})`,
            boxShadow: `0 0 10px ${accentColor}`
          }}
        />
        {/* Glow indicator handle dot */}
        <motion.div
          initial={{ left: 0, opacity: 0 }}
          animate={{ left: `${pct}%`, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{
            background: '#ffffff',
            boxShadow: `0 0 8px #ffffff, 0 0 4px ${accentColor}`
          }}
        />
      </div>

      {/* Count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="font-body text-[10px] tracking-[0.2em] uppercase font-light"
        style={{ color: accentColor }}
      >
        {remaining} / {maxViews}{' '}
        <span className="text-ash-400 font-normal lowercase tracking-wide">
          views remaining before fading
        </span>
      </motion.p>
    </motion.div>
  );
}
