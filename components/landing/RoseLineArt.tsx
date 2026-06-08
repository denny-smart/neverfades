'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function RoseLineArt() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    // Trigger animation via CSS after mount
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 4s cubic-bezier(0.16, 1, 0.3, 1)';
      path.style.strokeDashoffset = '0';
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
    >
      <svg
        viewBox="0 0 400 500"
        width="340"
        height="420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-[0.12]"
        aria-hidden="true"
      >
        {/* Stem */}
        <path
          d="M200 480 C200 480 200 300 200 240"
          stroke="#e8184f"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Leaves */}
        <path
          d="M200 380 C180 360 140 355 130 340 C150 330 185 340 200 360"
          stroke="#e8184f"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 320 C220 300 260 295 270 280 C250 270 215 280 200 300"
          stroke="#e8184f"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Rose bloom — outer petals */}
        <path
          ref={pathRef}
          d="
            M200 240
            C200 240 185 220 175 200 C165 180 170 155 185 150
            C190 148 196 150 200 155
            C204 150 210 148 215 150
            C230 155 235 180 225 200 C215 220 200 240 200 240 Z

            M200 240
            C200 240 220 225 235 210 C250 195 252 170 240 160
            C236 156 230 155 225 158
            C220 148 215 150 215 150
            C230 155 235 180 225 200 C215 220 200 240 200 240 Z

            M200 240
            C200 240 180 225 165 210 C150 195 148 170 160 160
            C164 156 170 155 175 158
            C180 148 185 150 185 150
            C170 155 165 180 175 200 C185 220 200 240 200 240 Z

            M200 240
            C200 240 205 215 215 200 C225 185 230 162 220 152
            C215 148 210 150 207 155
            C204 150 200 155 200 240 Z

            M200 240
            C200 240 195 215 185 200 C175 185 170 162 180 152
            C185 148 190 150 193 155
            C196 150 200 155 200 240 Z

            M200 215 C200 215 210 205 213 195 C216 185 210 175 205 172
            C202 170 200 172 200 215 Z
            M200 215 C200 215 190 205 187 195 C184 185 190 175 195 172
            C198 170 200 172 200 215 Z
          "
          stroke="#e8184f"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="rose-path"
        />
        {/* Center */}
        <circle cx="200" cy="185" r="8" stroke="#e8184f" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="200" cy="185" r="3" fill="#e8184f" opacity="0.4" />
      </svg>
    </motion.div>
  );
}
