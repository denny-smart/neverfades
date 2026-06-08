'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // initial delay in seconds
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 80,
  delay = 0,
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {displayed}
      {/* Cursor blink */}
      {displayed.length < text.length && started && (
        <span
          className="inline-block w-0.5 h-[1em] ml-0.5 align-middle animate-pulse"
          style={{ background: 'currentColor' }}
          aria-hidden="true"
        />
      )}
    </motion.span>
  );
}
