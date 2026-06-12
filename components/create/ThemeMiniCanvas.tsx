'use client';

import { useEffect, useRef } from 'react';

interface ThemeMiniCanvasProps {
  motionBehavior: 'fall' | 'drift' | 'float' | 'pulse';
  particleShape: string;
  primary: string;
  accent: string;
}

interface MiniParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  phase: number;
  color: string;
}

const MAX_PARTICLES = 9;

function createMiniParticle(
  w: number,
  h: number,
  behavior: string,
  colors: string[]
): MiniParticle {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const life = Math.random() * 180;
  const maxLife = 180 + Math.random() * 120;

  switch (behavior) {
    case 'fall':
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: Math.random() * 0.4 + 0.25,
        size: Math.random() * 4.5 + 3,
        opacity: Math.random() * 0.45 + 0.2,
        life,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
        color,
      };
    case 'drift':
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: Math.random() * 0.25 + 0.08,
        size: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.7 + 0.3,
        life,
        maxLife,
        rotation: 0,
        rotationSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        color,
      };
    case 'float':
      return {
        x: Math.random() * w,
        y: h + 10 + Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.35 + 0.18),
        size: Math.random() * 7.5 + 6,
        opacity: Math.random() * 0.35 + 0.25,
        life,
        maxLife: maxLife + 100,
        rotation: (Math.random() - 0.5) * 0.1,
        rotationSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        color,
      };
    case 'pulse':
    default:
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.18 + 0.08),
        size: Math.random() * 3.75 + 1.5,
        opacity: Math.random() * 0.55 + 0.2,
        life,
        maxLife,
        rotation: 0,
        rotationSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        color,
      };
  }
}

function drawMiniParticle(
  ctx: CanvasRenderingContext2D,
  p: MiniParticle,
  shape: string
) {
  const lifeRatio = p.life / p.maxLife;
  const alpha = p.opacity * Math.sin(lifeRatio * Math.PI);
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = p.color;

  switch (shape) {
    case 'petal': {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size * 0.9, p.size * 0.3, 0, p.size * 1.1);
      ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.3, -p.size * 0.8, -p.size * 0.8, 0, -p.size);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'star': {
      const twinkle = 0.5 + 0.5 * Math.sin(p.life * 0.06 + p.phase);
      ctx.globalAlpha = Math.max(0, alpha * twinkle);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'balloon': {
      ctx.translate(p.x, p.y);
      const sway = Math.sin(p.life * 0.04 + p.phase) * 0.08;
      ctx.rotate(sway);
      // Balloon body
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.75, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Knot
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.1, p.size);
      ctx.lineTo(p.size * 0.1, p.size);
      ctx.lineTo(0, p.size * 1.15);
      ctx.closePath();
      ctx.fill();
      // String
      ctx.globalAlpha = Math.max(0, alpha * 0.35);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, p.size * 1.15);
      const strX = Math.sin(p.life * 0.04 + p.phase) * p.size;
      ctx.quadraticCurveTo(strX * 0.3, p.size * 1.8, strX * 0.2, p.size * 2.5);
      ctx.stroke();
      break;
    }
    case 'bear': {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      const s = p.size;
      const bodyColor = p.color;
      // Inlined helper or direct color representation
      const innerColor = 'rgba(244, 192, 160, 0.85)';
      const darkColor = 'rgba(59, 31, 10, 0.9)';

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

      // Right eye
      ctx.beginPath();
      ctx.arc(s * 0.32, -s * 0.18, s * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();

      // Nose
      ctx.beginPath();
      ctx.ellipse(0, s * 0.2, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = darkColor;
      ctx.fill();

      break;
    }
    case 'emoji': {
      const EMOJIS = ['❤️', '💕', '💖', '💗', '😍', '💋', '🌸', '💝', '🥰', '✨'];
      const emojiIndex = Math.floor(p.phase * EMOJIS.length / (Math.PI * 2)) % EMOJIS.length;
      const emoji = EMOJIS[Math.abs(emojiIndex)];

      ctx.font = `${p.size * 2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, p.x, p.y);
      break;
    }
    case 'money': {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      const w = p.size * 2.4;
      const h = p.size * 1.3;

      // Base note background
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = p.size * 0.08;
      ctx.beginPath();
      ctx.rect(-w / 2 + p.size * 0.1, -h / 2 + p.size * 0.1, w - p.size * 0.2, h - p.size * 0.2);
      ctx.stroke();

      // Center decorative circle/oval
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.22, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Central Dollar Sign
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${p.size * 0.8}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);

      break;
    }
    case 'ember': {
      const pulse = 0.7 + 0.3 * Math.sin(p.life * 0.07 + p.phase);
      ctx.globalAlpha = Math.max(0, alpha * pulse);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export default function ThemeMiniCanvas({
  motionBehavior,
  particleShape,
  primary,
  accent,
}: ThemeMiniCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<MiniParticle[]>([]);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.offsetWidth || 200;
    const h = canvas.offsetHeight || 80;
    canvas.width = w;
    canvas.height = h;

    const colors = [primary, accent];
    particlesRef.current = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particlesRef.current.push(createMiniParticle(w, h, motionBehavior, colors));
    }

    const FRAME_INTERVAL = 1000 / 30; // 30fps cap

    const animate = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(animate);

      // Throttle to 30fps
      if (timestamp - lastFrameRef.current < FRAME_INTERVAL) return;
      lastFrameRef.current = timestamp;

      ctx.clearRect(0, 0, w, h);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.025 + p.phase) * 0.25;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        drawMiniParticle(ctx, p, particleShape);

        const isOut = p.vy > 0 ? p.y > h + 15 : p.y < -15;
        return p.life < p.maxLife && !isOut;
      });

      while (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(createMiniParticle(w, h, motionBehavior, colors));
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [motionBehavior, particleShape, primary, accent]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
