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
    case 'fall': { // Flower petals (falling downwards with wind drift)
      const depth = Math.random() * 1.0 + 0.5; // depth: 0.5 (far) to 1.5 (close)
      
      // Significantly larger size for money notes to make them readable and premium
      const baseSize = config.particleShape === 'money' ? (Math.random() * 15 + 16) : (Math.random() * 9 + 6);
      const size = baseSize * depth;
      
      const vy = (Math.random() * 0.5 + 0.3) * depth;
      const vx = (Math.random() - 0.5) * 0.2 * depth;

      // Ensure money notes fall all the way to the bottom by dynamically calculating required maxLife
      const particleMaxLife = config.particleShape === 'money'
        ? (canvas.height + 70) / vy
        : maxLife;

      const isMoney = config.particleShape === 'money';

      return {
        x: Math.random() * canvas.width,
        y: -30,
        vx,
        vy,
        size,
        opacity: (Math.random() * 0.45 + 0.15) * (depth / 1.5),
        life: 0,
        maxLife: particleMaxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02 * (1 / depth),
        color,
        depth,
        windPhase: Math.random() * Math.PI * 2,
        windFreq: Math.random() * 0.015 + 0.005,
        windAmp: Math.random() * 1.8 + 0.6,
        pitchPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        pitchSpeed: isMoney ? Math.random() * 0.03 + 0.015 : undefined,
        rollPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        rollSpeed: isMoney ? Math.random() * 0.02 + 0.01 : undefined,
        swayPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        swayFreq: isMoney ? Math.random() * 0.01 + 0.005 : undefined,
        swayAmp: isMoney ? Math.random() * 1.5 + 1.0 : undefined,
      };
    }

    case 'drift': { // Twinkling stars or drifted cosmic elements
      const depth = Math.random() * 0.8 + 0.4;
      const size = (Math.random() * 4.5 + 1.8) * depth;
      const vy = (Math.random() * 0.35 + 0.1) * depth;
      const vx = (Math.random() - 0.5) * 0.25 * depth;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() < 0.4 ? -10 : Math.random() * canvas.height,
        vx,
        vy,
        size,
        opacity: (Math.random() * 0.8 + 0.2) * (depth / 1.2),
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
      const size = (Math.random() * 16.5 + 13.5) * depth;
      const vy = -(Math.random() * 0.35 + 0.2) * depth;
      const vx = (Math.random() - 0.5) * 0.15 * depth;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 40,
        vx,
        vy,
        size,
        opacity: (Math.random() * 0.4 + 0.35) * (depth / 1.4),
        life: 0,
        maxLife: maxLife + 250, // extra lifespan to cross full height
        rotation: (Math.random() - 0.5) * 0.15,
        color,
        depth,
        swayFreq: Math.random() * 0.016 + 0.008,
        swayAmp: Math.random() * 2.2 + 0.8,
        pulsePhase: Math.random() * Math.PI * 2, // string sway helper
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
      const bodyColor  = p.color;
      const innerColor = hexToRgba('#f4c0a0', 0.85);
      const darkColor  = hexToRgba('#3b1f0a', 0.9);

      // Shadow glow
      ctx.shadowBlur  = s * 1.4 * glowMult;
      ctx.shadowColor = p.color;

      // Left ear
      ctx.beginPath();
      ctx.arc(-s * 0.72, -s * 0.82, s * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
      // Left ear inner
      ctx.beginPath();
      ctx.arc(-s * 0.72, -s * 0.82, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = innerColor;
      ctx.fill();

      // Right ear
      ctx.beginPath();
      ctx.arc(s * 0.72, -s * 0.82, s * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();
      // Right ear inner
      ctx.beginPath();
      ctx.arc(s * 0.72, -s * 0.82, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = innerColor;
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();

      // Muzzle
      ctx.beginPath();
      ctx.ellipse(0, s * 0.32, s * 0.48, s * 0.34, 0, 0, Math.PI * 2);
      ctx.fillStyle = innerColor;
      ctx.fill();

      // Left eye
      ctx.beginPath();
      ctx.arc(-s * 0.32, -s * 0.18, s * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();
      // Left eye shine
      ctx.beginPath();
      ctx.arc(-s * 0.27, -s * 0.22, s * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.arc(s * 0.32, -s * 0.18, s * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();
      // Right eye shine
      ctx.beginPath();
      ctx.arc(s * 0.37, -s * 0.22, s * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();

      // Nose
      ctx.beginPath();
      ctx.ellipse(0, s * 0.2, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(0, s * 0.28, s * 0.2, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = 'round';
      ctx.stroke();

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
    const MAX = DENSITY_MAP[themeEngine.particleDensity];
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
      if (themeEngine.particleShape === 'money' && themeEngine.motionBehavior === 'fall') {
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
          if (themeEngine.particleShape === 'money' && p.swayPhase !== undefined && p.swayFreq !== undefined && p.swayAmp !== undefined) {
            // Elegant aerodynamic leaf-fall glide for banknotes
            p.x += p.vx + Math.sin(p.life * p.swayFreq + p.swayPhase) * p.swayAmp * p.depth * 0.7;
            p.y += p.vy * (1 + 0.15 * Math.sin(p.life * p.swayFreq * 2 + p.swayPhase));
          } else {
            p.x += p.vx + Math.sin(p.life * p.windFreq + p.windPhase) * p.windAmp * 0.15;
            p.y += p.vy;
          }
        } else if (themeEngine.motionBehavior === 'float' && p.swayFreq !== undefined && p.swayAmp !== undefined) {
          // Floating spring sway (balloons)
          p.x += p.vx + Math.sin(p.life * p.swayFreq) * p.swayAmp * 0.12;
          p.y += p.vy;
          p.rotation = Math.sin(p.life * p.swayFreq * 0.7) * 0.12; // tilt oscillation
        } else if (themeEngine.motionBehavior === 'drift' && p.windPhase !== undefined && p.windFreq !== undefined && p.windAmp !== undefined) {
          // Subtle drifting wave
          p.x += p.vx + Math.cos(p.life * p.windFreq + p.windPhase) * p.windAmp * 0.08;
          p.y += p.vy;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.rotation !== undefined && p.rotationSpeed !== undefined && themeEngine.motionBehavior !== 'float') {
          if (themeEngine.particleShape === 'money') {
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
