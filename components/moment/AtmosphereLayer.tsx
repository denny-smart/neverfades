'use client';

import { useEffect, useRef } from 'react';
import { ThemeEngineConfig } from '../../lib/themes/types';

interface AtmosphereLayerProps {
  themeEngine: ThemeEngineConfig;
  palette: { primary: string; secondary: string; accent: string };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
  color: string;
  pulsePhase?: number;
  depth: number;
  windPhase?: number;
  windFreq?: number;
  windAmp?: number;
  swayFreq?: number;
  swayAmp?: number;
  pitchPhase?: number;
  pitchSpeed?: number;
  rollPhase?: number;
  rollSpeed?: number;
  swayPhase?: number;
  wishIndex?: number;
}

const DENSITY_MAP = { low: 20, medium: 45, high: 75 };

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function createParticle(
  canvas: HTMLCanvasElement,
  config: ThemeEngineConfig,
  colors: string[]
): Particle {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const { motionBehavior } = config;

  const baseLife = config.emotionalIntensity === 'deep' ? 450 : config.emotionalIntensity === 'medium' ? 300 : 200;
  const maxLife = Math.random() * baseLife + 150;

  switch (motionBehavior) {
    case 'fall': { // Flower petals / money notes / galaxy emojis falling downwards
      const depth = Math.random() * 1.0 + 0.5; // depth: 0.5 (far) to 1.5 (close)

      const isMoney      = config.particleShape === 'money';
      const isGalaxyEmoji = config.particleShape === 'galaxy-emoji';

      // Size: money & emoji need bigger bases so they’re legible
      const baseSize = isMoney
        ? (Math.random() * 15 + 16)
        : isGalaxyEmoji
          ? (Math.random() * 5 + 8)   // 8–13 → font = size*2.4 = 19–31px
          : (Math.random() * 9 + 6);
      const size = baseSize * depth;

      const vy = (Math.random() * 0.5 + 0.3) * depth;
      const vx = (Math.random() - 0.5) * 0.2 * depth;

      // Both money and galaxy-emoji must fall all the way to the bottom
      const particleMaxLife = (isMoney || isGalaxyEmoji)
        ? (canvas.height + 70) / vy
        : maxLife;

      const needs3DFlip = isMoney || isGalaxyEmoji;

      return {
        x: Math.random() * canvas.width,
        y: -30,
        vx,
        vy,
        size,
        opacity: isGalaxyEmoji
          ? (Math.random() * 0.4 + 0.6) * (depth / 1.5)  // boosted floor for emoji visibility
          : (Math.random() * 0.45 + 0.15) * (depth / 1.5),
        life: 0,
        maxLife: particleMaxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02 * (1 / depth),
        color,
        depth,
        windPhase: Math.random() * Math.PI * 2,
        windFreq: Math.random() * 0.015 + 0.005,
        windAmp: Math.random() * 1.8 + 0.6,
        // Pitch/roll/sway shared by money AND galaxy-emoji for 3-D tumble + aerodynamic glide
        pitchPhase: needs3DFlip ? Math.random() * Math.PI * 2 : undefined,
        pitchSpeed: needs3DFlip ? Math.random() * 0.03 + 0.015 : undefined,
        rollPhase:  needs3DFlip ? Math.random() * Math.PI * 2 : undefined,
        rollSpeed:  needs3DFlip ? Math.random() * 0.02 + 0.01  : undefined,
        swayPhase:  needs3DFlip ? Math.random() * Math.PI * 2 : undefined,
        swayFreq:   needs3DFlip ? Math.random() * 0.01 + 0.005 : undefined,
        swayAmp:    needs3DFlip ? Math.random() * 1.5 + 1.0    : undefined,
      };
    }

    case 'drift': { // Twinkling stars or drifted cosmic elements
      const depth = Math.random() * 0.8 + 0.4;
      // Galaxy-emoji particles need a larger base size so emojis are legible
      const isGalaxyEmoji = config.particleShape === 'galaxy-emoji';
      const rawSize = isGalaxyEmoji
        ? (Math.random() * 8 + 8) * depth   // 8–16 → rendered at size*2.4 = 19–38px
        : (Math.random() * 4.5 + 1.8) * depth;
      const size = rawSize;
      const vy = (Math.random() * 0.35 + 0.1) * depth;
      const vx = (Math.random() - 0.5) * 0.25 * depth;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() < 0.4 ? -10 : Math.random() * canvas.height,
        vx,
        vy,
        size,
        opacity: isGalaxyEmoji
          ? (Math.random() * 0.5 + 0.55) * (depth / 1.2)  // floor raised for visibility
          : (Math.random() * 0.8 + 0.2) * (depth / 1.2),
        life: 0,
        maxLife,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
        depth,
        windPhase: Math.random() * Math.PI * 2,
        windFreq: Math.random() * 0.01 + 0.005,
        windAmp: Math.random() * 1.0 + 0.2,
      };
    }

    case 'float': { // Balloons (physics-based float upwards)
      const depth = Math.random() * 0.8 + 0.6; // depth: 0.6 to 1.4
      const isBday = config.particleShape === 'birthday-balloon';
      const isMobile = canvas.width < 768;
      const sizeMult = isMobile ? 0.7 : 1.0; // 30% smaller on mobile

      // Birthday balloons are bigger so the text is legible
      const baseSize = isBday ? (Math.random() * 22 + 24) : (Math.random() * 16.5 + 13.5);
      const size = baseSize * depth * sizeMult;
      // Birthday balloons have a wider speed range for natural staggering
      const vyBase = isBday ? (Math.random() * 0.45 + 0.18) : (Math.random() * 0.35 + 0.2);
      const vy = -vyBase * depth;
      const vx = (Math.random() - 0.5) * (isBday ? 0.22 : 0.15) * depth;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 40,
        vx,
        vy,
        size,
        opacity: (Math.random() * 0.45 + 0.40) * (depth / 1.4),
        life: 0,
        maxLife: maxLife + 300, // extra lifespan to cross full height
        rotation: (Math.random() - 0.5) * 0.12,
        color,
        depth,
        swayFreq: Math.random() * 0.018 + 0.007,
        swayAmp: isBday ? (Math.random() * 3.8 + 1.8) : (Math.random() * 2.2 + 0.8),
        pulsePhase: Math.random() * Math.PI * 2, // string sway helper
        wishIndex: isBday ? Math.floor(Math.random() * 8) : undefined,
      };
    }

    case 'pulse':
    default: { // Soft breathing embers or bubbles
      const depth = Math.random() * 0.9 + 0.4;
      const size = (Math.random() * 6 + 2.25) * depth;
      const vy = -(Math.random() * 0.25 + 0.1) * depth;
      const vx = (Math.random() - 0.5) * 0.15 * depth;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx,
        vy,
        size,
        opacity: (Math.random() * 0.65 + 0.15) * (depth / 1.3),
        life: 0,
        maxLife,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
        depth,
      };
    }
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  config: ThemeEngineConfig,
  glowMult: number
) {
  const { particleShape, motionBehavior } = config;
  const lifeRatio = p.life / p.maxLife;

  switch (particleShape) {
    case 'petal': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.globalAlpha = Math.max(0, p.opacity * (1 - lifeRatio));
      
      // Beautiful organic rose petal shape (curved curves)
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.85, p.size * 0.95, p.size * 0.35, 0, p.size * 1.15);
      ctx.bezierCurveTo(-p.size * 0.95, p.size * 0.35, -p.size * 0.85, -p.size * 0.85, 0, -p.size);
      ctx.closePath();
      
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.size * 0.55 * glowMult;
      ctx.shadowColor = p.color;
      ctx.fill();
      
      // Detailed curve inside the petal for texture
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.45);
      ctx.quadraticCurveTo(p.size * 0.12, 0, 0, p.size * 0.55);
      ctx.strokeStyle = hexToRgba('#ffffff', 0.12);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'star': {
      const twinkle = p.pulsePhase !== undefined
        ? Math.sin(p.life * 0.045 + p.pulsePhase)
        : 1;
      const alpha = p.opacity * Math.sin(lifeRatio * Math.PI) * (0.55 + 0.45 * twinkle);
      
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.size * 2 * glowMult;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'balloon': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.globalAlpha = Math.max(0, p.opacity * (1 - lifeRatio));
      
      // Physics-based balloon drawing (wider top, tapered bottom)
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.1);
      ctx.bezierCurveTo(p.size * 1.15, -p.size * 1.1, p.size * 1.25, p.size * 0.25, 0, p.size * 1.05);
      ctx.bezierCurveTo(-p.size * 1.25, p.size * 0.25, -p.size * 1.15, -p.size * 1.1, 0, -p.size * 1.1);
      ctx.closePath();
      
      ctx.fillStyle = hexToRgba(p.color, 0.42);
      ctx.shadowBlur = p.size * 0.85 * glowMult;
      ctx.shadowColor = p.color;
      ctx.fill();
      
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Reflection gloss
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.32, -p.size * 0.42, p.size * 0.22, p.size * 0.38, Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fill();

      // Balloon knot
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.1, p.size * 1.05);
      ctx.lineTo(p.size * 0.1, p.size * 1.05);
      ctx.lineTo(0, p.size * 1.2);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      // Realistic quadratic Bezier string sway
      ctx.beginPath();
      ctx.moveTo(0, p.size * 1.2);
      const stringSway = Math.sin(p.life * 0.038 + (p.pulsePhase || 0)) * (p.size * 0.9);
      const stringLen = p.size * 2.3;
      ctx.quadraticCurveTo(stringSway, p.size * 1.8, stringSway * 0.4, p.size * 1.2 + stringLen);
      ctx.strokeStyle = hexToRgba(p.color, 0.32);
      ctx.lineWidth = 0.65;
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'birthday-balloon': {
      // 6-color vivid palette — each balloon gets a distinct hue
      const BDAY_PALETTE = [
        { hex: '#ff4daa', r: 255, g: 77,  b: 170 }, // Coral Pink
        { hex: '#ffe135', r: 255, g: 225, b: 53  }, // Electric Gold
        { hex: '#00e5ff', r: 0,   g: 229, b: 255 }, // Neon Cyan
        { hex: '#b4ff3c', r: 180, g: 255, b: 60  }, // Lime Green
        { hex: '#ff7c4d', r: 255, g: 124, b: 77  }, // Tangerine
        { hex: '#c84dff', r: 200, g: 77,  b: 255 }, // Electric Violet
      ];
      const BDAY_WISHES = [
        'Happy\nBirthday!',
        'Make a\nWish! \uD83C\uDF1F',
        'Cheers\nto You!',
        'You\nRock! \uD83C\uDF89',
        'Hip Hip\nHooray!',
        'Many More\nYears! \uD83C\uDF88',
        "It's Your\nDay! \u2728",
        'Celebrate\nBig! \uD83E\uDD73',
      ];

      const bpal = BDAY_PALETTE[(p.wishIndex ?? 0) % BDAY_PALETTE.length];
      const { r: br, g: bg, b: bb } = bpal;
      const wish = BDAY_WISHES[(p.wishIndex ?? 0) % BDAY_WISHES.length];
      const lines = wish.split('\n');
      const s = p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);

      // ── Opacity: sin bell-curve + graceful entry fade-in ─────────
      const entryFade = Math.min(1, p.life / 55);
      const fadeAlpha = Math.max(0, p.opacity * Math.sin(lifeRatio * Math.PI) * entryFade);
      ctx.globalAlpha = fadeAlpha;

      // ── Breathing scale — each balloon pulses at its own rate ─────
      const breathFreq  = 0.020 + ((p.wishIndex ?? 0) % 6) * 0.0018;
      const breathScale = 1 + 0.026 * Math.sin(p.life * breathFreq + (p.pulsePhase ?? 0) * 0.4);
      ctx.scale(breathScale, breathScale);

      // Reusable balloon body path
      const balloonPath = () => {
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.15);
        ctx.bezierCurveTo( s * 1.22, -s * 1.15,  s * 1.38,  s * 0.14, 0,  s * 1.05);
        ctx.bezierCurveTo(-s * 1.38,  s * 0.14, -s * 1.22, -s * 1.15, 0, -s * 1.15);
        ctx.closePath();
      };

      // ── Outer glow ────────────────────────────────────────────
      ctx.shadowBlur = s * 2.5 * glowMult;
      ctx.shadowColor = bpal.hex;
      balloonPath();

      // ── Rich radial gradient body ─────────────────────────────
      const lighter = `rgba(${Math.min(255,br+75)},${Math.min(255,bg+75)},${Math.min(255,bb+75)},0.96)`;
      const mid     = `rgba(${br},${bg},${bb},0.88)`;
      const darker  = `rgba(${Math.max(0,br-50)},${Math.max(0,bg-50)},${Math.max(0,bb-50)},0.52)`;
      const bodyGrad = ctx.createRadialGradient(
        -s * 0.3, -s * 0.52, s * 0.02,
         s * 0.05, s * 0.1,  s * 1.6
      );
      bodyGrad.addColorStop(0,    lighter);
      bodyGrad.addColorStop(0.38, mid);
      bodyGrad.addColorStop(1,    darker);
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Outline ───────────────────────────────────────────────
      balloonPath();
      ctx.strokeStyle = `rgba(${br},${bg},${bb},0.5)`;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // ── Primary gloss highlight (upper-left ellipse) ──────────
      ctx.beginPath();
      ctx.ellipse(-s * 0.33, -s * 0.53, s * 0.27, s * 0.41, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fill();

      // ── Bright specular spot (upper) ──────────────────────────
      ctx.beginPath();
      ctx.ellipse(-s * 0.18, -s * 0.74, s * 0.09, s * 0.13, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();

      // ── Faint bottom glint ────────────────────────────────────
      ctx.beginPath();
      ctx.ellipse(s * 0.24, s * 0.65, s * 0.15, s * 0.07, Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fill();

      // ── Rotating shimmer sweep (iridescent light stripe) ──────
      const shimAngle = p.life * 0.018 + (p.pulsePhase ?? 0);
      const sx1 = Math.cos(shimAngle) * s * 1.05;
      const sy1 = Math.sin(shimAngle) * s * 1.35;
      const shimGrad = ctx.createLinearGradient(-sx1 * 0.6, -sy1 * 0.6, sx1 * 0.6, sy1 * 0.6);
      shimGrad.addColorStop(0,    'rgba(255,255,255,0)');
      shimGrad.addColorStop(0.42, 'rgba(255,255,255,0)');
      shimGrad.addColorStop(0.50, 'rgba(255,255,255,0.14)');
      shimGrad.addColorStop(0.58, 'rgba(255,255,255,0)');
      shimGrad.addColorStop(1,    'rgba(255,255,255,0)');
      balloonPath();
      ctx.fillStyle = shimGrad;
      ctx.fill();

      // ── Decorative sparkle dots on surface ───────────────────
      [
        { x:  s * 0.56, y: -s * 0.58, r: s * 0.055 },
        { x: -s * 0.63, y:  s * 0.07, r: s * 0.040 },
        { x:  s * 0.28, y:  s * 0.52, r: s * 0.033 },
      ].forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
      });

      // ── Birthday wish text ────────────────────────────────────
      // Balloon body spans -s*1.15 (top) → +s*1.05 (bottom).
      // Area centroid (where shape is widest) sits at ≈ -s*0.25, not y=0.
      const textCY   = -s * 0.25;
      const fontSize = Math.max(9, s * 0.28);
      const lineH    = fontSize * 1.25;
      const totalH   = (lines.length - 1) * lineH;
      ctx.font        = `800 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      // Dark stroke outline for legibility on any balloon color
      ctx.lineWidth   = fontSize * 0.28;
      ctx.lineJoin    = 'round';
      ctx.strokeStyle = `rgba(${Math.max(0,br-100)},${Math.max(0,bg-100)},${Math.max(0,bb-100)},0.7)`;
      lines.forEach((ln, i) => ctx.strokeText(ln, 0, textCY - totalH / 2 + i * lineH));
      ctx.fillStyle   = 'rgba(255,255,255,0.97)';
      lines.forEach((ln, i) => ctx.fillText(ln, 0, textCY - totalH / 2 + i * lineH));

      // ── Knot (smooth quadratic shape) ────────────────────────
      ctx.beginPath();
      ctx.moveTo(-s * 0.13, s * 1.06);
      ctx.quadraticCurveTo(-s * 0.20, s * 1.16, 0, s * 1.26);
      ctx.quadraticCurveTo( s * 0.20, s * 1.16, s * 0.13, s * 1.06);
      ctx.closePath();
      ctx.fillStyle = `rgba(${Math.max(0,br-30)},${Math.max(0,bg-30)},${Math.max(0,bb-30)},0.92)`;
      ctx.fill();

      // ── S-curve string (velocity-influenced) ─────────────────
      // String root reacts to balloon's lateral velocity — feels physically tethered
      const velPush    = (p.vx ?? 0) * 14;
      const naturalOsc = Math.sin(p.life * 0.038 + (p.pulsePhase ?? 0));
      const swayT      = naturalOsc + velPush * 0.22;
      const swayAmt    = swayT * s * 1.25;
      const sLen       = s * 3.6;
      ctx.beginPath();
      ctx.moveTo(0, s * 1.26);
      ctx.bezierCurveTo(
         swayAmt * 0.95, s * 1.26 + sLen * 0.30,
        -swayAmt * 0.75, s * 1.26 + sLen * 0.65,
         swayAmt * 0.28, s * 1.26 + sLen
      );
      ctx.strokeStyle = `rgba(${br},${bg},${bb},0.45)`;
      ctx.lineWidth   = 0.85;
      ctx.lineCap     = 'round';
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'ember': {
      const pulse = p.pulsePhase !== undefined
        ? 0.72 + 0.28 * Math.sin(p.life * 0.05 + p.pulsePhase)
        : 1;
      const fadeAlpha = p.opacity * Math.sin(lifeRatio * Math.PI) * pulse;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fadeAlpha);
      
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.8);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'bear': {
      const fadeAlpha = p.opacity * (1 - lifeRatio);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.globalAlpha = Math.max(0, fadeAlpha);

      const s = p.size;
      // Red bears — body is crimson, belly is a lighter rosy pink
      const bodyColor  = p.color;                          // crimson/red from palette
      const bellyColor = hexToRgba('#ff8fa8', 0.90);       // warm rosy pink belly
      const darkColor  = hexToRgba('#1a0008', 0.95);       // near-black for features
      const heartColor = '#ff2255';                        // vivid red heart on chest

      // Strong crimson shadow glow — makes bears pop against dark bg
      ctx.shadowBlur  = s * 2.8 * glowMult;
      ctx.shadowColor = p.color;

      // ── Left ear ──────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(-s * 0.72, -s * 0.82, s * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
      // inner
      ctx.beginPath();
      ctx.arc(-s * 0.72, -s * 0.82, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = bellyColor;
      ctx.fill();

      // ── Right ear ─────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(s * 0.72, -s * 0.82, s * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
      // inner
      ctx.beginPath();
      ctx.arc(s * 0.72, -s * 0.82, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = bellyColor;
      ctx.fill();

      // ── Head ──────────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();

      // ── Muzzle ────────────────────────────────────────────────
      ctx.beginPath();
      ctx.ellipse(0, s * 0.32, s * 0.50, s * 0.36, 0, 0, Math.PI * 2);
      ctx.fillStyle = bellyColor;
      ctx.fill();

      // ── Left eye ──────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(-s * 0.32, -s * 0.18, s * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();
      // shine
      ctx.beginPath();
      ctx.arc(-s * 0.26, -s * 0.24, s * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();

      // ── Right eye ─────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(s * 0.32, -s * 0.18, s * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();
      // shine
      ctx.beginPath();
      ctx.arc(s * 0.38, -s * 0.24, s * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();

      // ── Nose ──────────────────────────────────────────────────
      ctx.beginPath();
      ctx.ellipse(0, s * 0.18, s * 0.15, s * 0.11, 0, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();

      // ── Smile ─────────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(0, s * 0.26, s * 0.22, 0.18, Math.PI - 0.18);
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = s * 0.08;
      ctx.lineCap = 'round';
      ctx.stroke();

      // ── Love heart on forehead ────────────────────────────────
      // Tiny glowing heart centred just above the nose bridge
      {
        const hx = 0;
        const hy = -s * 0.52;   // between eyes — upper face
        const hr = s * 0.18;    // heart half-width

        ctx.shadowBlur  = s * 1.6;
        ctx.shadowColor = heartColor;

        // Heart = two arcs + V point
        ctx.beginPath();
        ctx.moveTo(hx, hy + hr * 0.55);
        ctx.bezierCurveTo(hx - hr * 1.05, hy - hr * 0.6,  hx - hr * 2.1, hy + hr * 0.4,  hx, hy + hr * 1.8);
        ctx.bezierCurveTo(hx + hr * 2.1,  hy + hr * 0.4,  hx + hr * 1.05, hy - hr * 0.6, hx, hy + hr * 0.55);
        ctx.closePath();
        ctx.fillStyle = heartColor;
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      ctx.restore();
      break;
    }

    case 'emoji': {
      const EMOJIS = ['❤️', '💕', '💖', '💗', '😍', '💋', '🌸', '💝', '🥰', '✨'];
      // Each particle gets a stable emoji via its windPhase seed
      const emojiIndex = Math.floor((p.windPhase ?? 0) * EMOJIS.length / (Math.PI * 2)) % EMOJIS.length;
      const emoji = EMOJIS[Math.abs(emojiIndex)];

      const fadeAlpha = p.opacity * Math.sin(lifeRatio * Math.PI);
      const pulse     = p.pulsePhase !== undefined
        ? 0.88 + 0.12 * Math.sin(p.life * 0.055 + p.pulsePhase)
        : 1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, fadeAlpha * pulse);
      ctx.font = `${p.size * 2}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, p.x, p.y);
      ctx.restore();
      break;
    }

    case 'money': {
      const fadeAlpha = p.opacity * (1 - lifeRatio);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);

      // Simulating 3D flipping (pitch and roll)
      let flipFactor = 1;
      if (p.pitchPhase !== undefined && p.pitchSpeed !== undefined) {
        const pitch = p.life * p.pitchSpeed + p.pitchPhase;
        const scaleY = Math.sin(pitch);
        
        const roll = p.life * (p.rollSpeed ?? 0.02) + (p.rollPhase ?? 0);
        const scaleX = Math.cos(roll);
        
        ctx.scale(scaleX, scaleY);
        flipFactor = Math.abs(scaleY);
      }

      const displayAlpha = fadeAlpha * (0.2 + 0.8 * flipFactor);
      ctx.globalAlpha = Math.max(0, displayAlpha);

      const w = p.size * 2.6;
      const h = p.size * 1.35;
      const rx = p.size * 0.1;
      const pad = p.size * 0.16;

      // ── Clipping path (rounded rect) ──────────────────────────
      const roundedPath = () => {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + rx, -h / 2);
        ctx.lineTo( w / 2 - rx, -h / 2);
        ctx.arcTo(  w / 2, -h / 2,  w / 2, -h / 2 + rx, rx);
        ctx.lineTo( w / 2,  h / 2 - rx);
        ctx.arcTo(  w / 2,  h / 2,  w / 2 - rx,  h / 2, rx);
        ctx.lineTo(-w / 2 + rx,  h / 2);
        ctx.arcTo(-w / 2,  h / 2, -w / 2,  h / 2 - rx, rx);
        ctx.lineTo(-w / 2, -h / 2 + rx);
        ctx.arcTo(-w / 2, -h / 2, -w / 2 + rx, -h / 2, rx);
        ctx.closePath();
      };

      // ── Outer neon glow ───────────────────────────────────────
      ctx.shadowBlur  = p.size * (1.5 + 1.5 * flipFactor) * glowMult;
      ctx.shadowColor = p.color;

      // ── Bill base gradient ────────────────────────────────────
      const baseGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      baseGrad.addColorStop(0,    hexToRgba(p.color, 0.6));
      baseGrad.addColorStop(0.45, hexToRgba(p.color, 0.88));
      baseGrad.addColorStop(1,    hexToRgba(p.color, 0.5));
      ctx.fillStyle = baseGrad;
      roundedPath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // ── Dark inner field ──────────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.rect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2);
      ctx.fill();

      // ── Outer border ──────────────────────────────────────────
      ctx.strokeStyle = hexToRgba('#ffffff', 0.65);
      ctx.lineWidth   = p.size * 0.07;
      roundedPath();
      ctx.stroke();

      // ── Inner border ──────────────────────────────────────────
      ctx.strokeStyle = hexToRgba('#ffffff', 0.22);
      ctx.lineWidth   = p.size * 0.035;
      ctx.beginPath();
      ctx.rect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2);
      ctx.stroke();

      // ── Horizontal rule lines (banknote engrave feel) ─────────
      ctx.strokeStyle = hexToRgba('#ffffff', 0.12);
      ctx.lineWidth   = p.size * 0.025;
      const ruleX1 = -w / 2 + pad * 1.8;
      const ruleX2 =  w / 2 - pad * 1.8;
      ctx.beginPath(); ctx.moveTo(ruleX1, -h * 0.2); ctx.lineTo(ruleX2, -h * 0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ruleX1,  h * 0.2); ctx.lineTo(ruleX2,  h * 0.2); ctx.stroke();

      // ── Radial centre glow ────────────────────────────────────
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.85);
      cg.addColorStop(0, hexToRgba('#ffffff', 0.25));
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.28, h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Diagonal holographic shimmer ──────────────────────────
      const shimmerOffset = Math.sin(p.life * 0.03 + (p.pitchPhase ?? 0)) * 0.5;
      const sg = ctx.createLinearGradient(-w * 0.45, -h * 0.5, w * 0.45, h * 0.5);
      sg.addColorStop(0,    'rgba(255,255,255,0)');
      sg.addColorStop(Math.max(0, 0.2 + shimmerOffset), 'rgba(255,255,255,0)');
      sg.addColorStop(Math.max(0, Math.min(1, 0.5 + shimmerOffset)), `rgba(255,255,255,${0.25 + 0.15 * flipFactor})`);
      sg.addColorStop(Math.min(1, 0.8 + shimmerOffset), 'rgba(255,255,255,0)');
      sg.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.fill();

      // ── Central $ with inner glow ─────────────────────────────
      ctx.shadowBlur  = p.size * 1.8;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle   = 'rgba(255,255,255,0.97)';
      ctx.font        = `900 ${p.size}px monospace`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);
      ctx.shadowBlur = 0;

      // ── Corner $ marks ────────────────────────────────────────
      ctx.fillStyle = hexToRgba('#ffffff', 0.5);
      ctx.font      = `bold ${p.size * 0.42}px monospace`;
      ctx.fillText('$', -w / 2 + pad * 1.3, -h / 2 + pad * 1.3);
      ctx.fillText('$',  w / 2 - pad * 1.3,  h / 2 - pad * 1.3);

      ctx.restore();
      break;
    }

    case 'galaxy-emoji': {
      const GALAXY_EMOJIS = ['🌙', '⭐', '💫', '✨', '🌟', '💜', '🪐', '🌌', '💙', '🌠'];
      // windPhase is a stable per-particle seed (0 – 2π)
      const seed = p.windPhase ?? 0;
      // 50/50 split: lower half of 0–2π → emoji, upper half → glowing dot
      const isEmoji = seed < Math.PI;

      const fadeAlpha = p.opacity * (1 - lifeRatio);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);

      // ── 3-D pitch / roll flip — exact same mechanics as money ────────────
      let flipFactor = 1;
      if (p.pitchPhase !== undefined && p.pitchSpeed !== undefined) {
        const pitch  = p.life * p.pitchSpeed + p.pitchPhase;
        const scaleY = Math.sin(pitch);
        const roll   = p.life * (p.rollSpeed ?? 0.02) + (p.rollPhase ?? 0);
        const scaleX = Math.cos(roll);
        ctx.scale(scaleX, scaleY);
        flipFactor = Math.abs(scaleY);
      }

      // Alpha: visible at face-on, semi-transparent at edge-on (just like money)
      const displayAlpha = fadeAlpha * (0.25 + 0.75 * flipFactor);
      ctx.globalAlpha = Math.max(0, displayAlpha);

      if (isEmoji) {
        const idx   = Math.floor((seed / Math.PI) * GALAXY_EMOJIS.length) % GALAXY_EMOJIS.length;
        const emoji = GALAXY_EMOJIS[Math.abs(idx)];
        const fontSize = p.size * 2.4;
        ctx.font          = `${fontSize}px serif`;
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        // Two-pass render: blurred glow + crisp top (same premium technique as money)
        ctx.shadowBlur  = p.size * 4 * glowMult;
        ctx.shadowColor = p.color;
        ctx.fillText(emoji, 0, 0); // glow pass
        ctx.shadowBlur = 0;
        ctx.fillText(emoji, 0, 0); // crisp pass
      } else {
        // Glowing dot companion particle
        ctx.shadowBlur  = p.size * 2.5 * glowMult;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    case 'circle':
    default: {
      const fadeAlpha = p.opacity * Math.sin(lifeRatio * Math.PI);
      ctx.save();
      ctx.globalAlpha = Math.max(0, fadeAlpha);
      ctx.shadowBlur = p.size * 1.8 * glowMult;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
      break;
    }
  }

  // Draw pulse motionBehavior ring
  if (motionBehavior === 'pulse' && p.pulsePhase !== undefined) {
    const ring = 0.5 + 0.5 * Math.sin(p.life * 0.045 + p.pulsePhase);
    const ringAlpha = ring * p.opacity * 0.18 * (1 - lifeRatio);
    ctx.save();
    ctx.globalAlpha = Math.max(0, ringAlpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (2.2 + ring * 2.8), 0, Math.PI * 2);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 0.55;
    ctx.stroke();
    ctx.restore();
  }
}

export default function AtmosphereLayer({
  themeEngine,
  palette,
}: AtmosphereLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = [palette.primary, palette.secondary, palette.accent];
    const baseMax = DENSITY_MAP[themeEngine.particleDensity];
    // Reduce density by 40% on mobile to avoid overcrowding
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const MAX = isMobile ? Math.floor(baseMax * 0.6) : baseMax;
    const glowMult = themeEngine.emotionalIntensity === 'deep' ? 3.8 : themeEngine.emotionalIntensity === 'medium' ? 2.4 : 1.3;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Populate particles with random initial life to prevent sudden bursts
    for (let i = 0; i < MAX; i++) {
      const p = createParticle(canvas, themeEngine, colors);
      // Stagger position first, then align life proportionally to its starting Y coordinate
      p.y = Math.random() * canvas.height;
      const needsLifeStagger = (themeEngine.particleShape === 'money' || themeEngine.particleShape === 'galaxy-emoji') && themeEngine.motionBehavior === 'fall';
      if (needsLifeStagger) {
        p.life = ((p.y + 30) / (canvas.height + 70)) * p.maxLife;
      } else {
        p.life = Math.random() * p.maxLife;
      }
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        
        // Update horizontal position using organic wind sines or spring-sways
        if (themeEngine.motionBehavior === 'fall' && p.windPhase !== undefined && p.windFreq !== undefined && p.windAmp !== undefined) {
          if ((themeEngine.particleShape === 'money' || themeEngine.particleShape === 'galaxy-emoji') && p.swayPhase !== undefined && p.swayFreq !== undefined && p.swayAmp !== undefined) {
            // Aerodynamic leaf-fall glide (shared by money and galaxy-emoji)
            p.x += p.vx + Math.sin(p.life * p.swayFreq + p.swayPhase) * p.swayAmp * p.depth * 0.7;
            p.y += p.vy * (1 + 0.15 * Math.sin(p.life * p.swayFreq * 2 + p.swayPhase));
          } else {
            p.x += p.vx + Math.sin(p.life * p.windFreq + p.windPhase) * p.windAmp * 0.15;
            p.y += p.vy;
          }
        } else if (themeEngine.motionBehavior === 'float' && p.swayFreq !== undefined && p.swayAmp !== undefined) {
          const isBdayBalloon = themeEngine.particleShape === 'birthday-balloon';
          if (isBdayBalloon) {
            // ① Primary lazy ocean-sway
            const primarySway   = Math.sin(p.life * p.swayFreq) * p.swayAmp * 0.22;
            // ② Secondary counter-drift at golden-ratio offset frequency → figure-8 path
            const secondarySway = Math.cos(p.life * p.swayFreq * 0.45 + (p.pulsePhase ?? 0)) * p.swayAmp * 0.09;
            // ③ Micro air-current jitter — high-freq, tiny amp
            const jitter        = Math.sin(p.life * p.swayFreq * 3.7 + (p.pulsePhase ?? 0) * 1.8) * 0.18;
            p.x += p.vx + primarySway + secondarySway + jitter;
            // Sway-coupled vertical oscillation: balloon slows at horizontal extremes
            p.y += p.vy * (0.97 + 0.06 * Math.cos(p.life * p.swayFreq * 1.15));
            // Per-balloon desynchronised tilt using pulsePhase as rotation seed
            p.rotation = Math.sin(p.life * p.swayFreq * 0.72 + (p.pulsePhase ?? 0) * 0.55) * 0.17;
          } else {
            p.x += p.vx + Math.sin(p.life * p.swayFreq) * p.swayAmp * 0.12;
            p.y += p.vy;
            p.rotation = Math.sin(p.life * p.swayFreq * 0.7) * 0.12;
          }
        } else if (themeEngine.motionBehavior === 'drift' && p.windPhase !== undefined && p.windFreq !== undefined && p.windAmp !== undefined) {
          // Subtle drifting wave
          p.x += p.vx + Math.cos(p.life * p.windFreq + p.windPhase) * p.windAmp * 0.08;
          p.y += p.vy;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.rotation !== undefined && p.rotationSpeed !== undefined && themeEngine.motionBehavior !== 'float') {
          if (themeEngine.particleShape === 'money' || themeEngine.particleShape === 'galaxy-emoji') {
            p.rotation += p.rotationSpeed * 0.4;
          } else {
            p.rotation += p.rotationSpeed;
          }
        }

        drawParticle(ctx, p, themeEngine, glowMult);
        
        // boundary check
        const isOut = p.vy > 0 
          ? p.y > canvas.height + 40 // falling
          : p.y < -40;               // floating

        return p.life < p.maxLife && !isOut;
      });

      while (particlesRef.current.length < MAX) {
        particlesRef.current.push(createParticle(canvas, themeEngine, colors));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, [themeEngine, palette]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
