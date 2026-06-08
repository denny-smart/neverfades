'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;    // ms per character
  delay?: number;    // initial delay in seconds
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 45,
  delay = 0,
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started,   setStarted]   = useState(false);
  // Stable ref so the typing interval doesn't close over a stale callback
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Initial delay before typing begins
  useEffect(() => {
    if (delay === 0) { setStarted(true); return; }
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  // Character-by-character reveal
  useEffect(() => {
    if (!started) return;

    setDisplayed('');           // reset when text/started changes
    let idx = 0;

    const tick = () => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx < text.length) {
        handle = setTimeout(tick, speed);
      } else {
        onCompleteRef.current?.();
      }
    };

    let handle = setTimeout(tick, speed);
    return () => clearTimeout(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, text, speed]);

  const typing = displayed.length < text.length;

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {displayed}

      {/* Blinking caret — shown only while still typing */}
      {typing && started && (
        <motion.span
          className="inline-block w-[2px] h-[0.85em] ml-[2px] align-middle rounded-[1px]"
          style={{ background: 'currentColor', verticalAlign: '-0.05em' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
    </motion.span>
  );
}
