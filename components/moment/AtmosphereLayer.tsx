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
}

const DENSITY_MAP = { low: 25, medium: 50, high: 80 };

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

  const baseLife = config.emotionalIntensity === 'deep' ? 400 : config.emotionalIntensity === 'medium' ? 280 : 180;
  const maxLife = Math.random() * baseLife + 150;

  switch (motionBehavior) {
    case 'fall':
      return {
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.8 + 0.4,
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.6 + 0.2,
        life: 0,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        color,
      };

    case 'drift':
      return {
        x: Math.random() * canvas.width,
        y: Math.random() < 0.5 ? -10 : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.4 + 0.1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.9 + 0.1,
        life: 0,
        maxLife,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
      };

    case 'float':
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 0.6 + 0.3),
        size: Math.random() * 16 + 10,
        opacity: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife,
        rotation: Math.random() * 0.4 - 0.2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        color,
      };

    case 'pulse':
    default:
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(Math.random() * 0.3 + 0.1),
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.7 + 0.1,
        life: 0,
        maxLife,
        pulsePhase: Math.random() * Math.PI * 2,
        color,
      };
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  config: ThemeEngineConfig
) {
  const { particleShape, motionBehavior, emotionalIntensity } = config;
  const lifeRatio = p.life / p.maxLife;
  const glowMult = emotionalIntensity === 'deep' ? 4 : emotionalIntensity === 'medium' ? 2.5 : 1.5;

  switch (particleShape) {
    case 'petal': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.globalAlpha = p.opacity * (1 - lifeRatio);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'star': {
      const twinkle = p.pulsePhase !== undefined
        ? Math.sin(p.life * 0.04 + p.pulsePhase)
        : 1;
      const alpha = p.opacity * Math.sin(lifeRatio * Math.PI) * (0.6 + 0.4 * twinkle);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.size * glowMult;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'balloon': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation ?? 0);
      ctx.globalAlpha = p.opacity * (1 - lifeRatio);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.75, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, 0.4);
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p.size);
      ctx.lineTo(0, p.size + 14);
      ctx.strokeStyle = hexToRgba(p.color, 0.3);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'ember': {
      const pulse = p.pulsePhase !== undefined
        ? 0.7 + 0.3 * Math.sin(p.life * 0.06 + p.pulsePhase)
        : 1;
      const fadeAlpha = p.opacity * Math.sin(lifeRatio * Math.PI) * pulse;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fadeAlpha);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'circle':
    default: {
      const fadeAlpha = p.opacity * Math.sin(lifeRatio * Math.PI);
      ctx.save();
      ctx.globalAlpha = Math.max(0, fadeAlpha);
      ctx.shadowBlur = p.size * glowMult;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
      break;
    }
  }

  // Pulse motionBehavior: extra soft glow pulse ring
  if (motionBehavior === 'pulse' && p.pulsePhase !== undefined) {
    const ring = 0.5 + 0.5 * Math.sin(p.life * 0.05 + p.pulsePhase);
    const ringAlpha = ring * p.opacity * 0.2 * (1 - lifeRatio);
    ctx.save();
    ctx.globalAlpha = Math.max(0, ringAlpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (2 + ring * 3), 0, Math.PI * 2);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 0.5;
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed particles staggered so they don't all spawn at once
    for (let i = 0; i < MAX; i++) {
      const p = createParticle(canvas, themeEngine, colors);
      p.life = Math.random() * p.maxLife;
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        drawParticle(ctx, p, themeEngine);
        return p.life < p.maxLife;
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
      className="atmosphere-canvas"
      aria-hidden="true"
    />
  );
}
