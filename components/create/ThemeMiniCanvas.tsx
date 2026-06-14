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
  pitchPhase?: number;
  pitchSpeed?: number;
  rollPhase?: number;
  rollSpeed?: number;
  swayPhase?: number;
  swayFreq?: number;
  swayAmp?: number;
  wishIndex?: number;
}

const MAX_PARTICLES = 9;

function createMiniParticle(
  w: number,
  h: number,
  behavior: string,
  shape: string,
  colors: string[]
): MiniParticle {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const life = Math.random() * 180;
  const maxLife = 180 + Math.random() * 120;

  switch (behavior) {
    case 'fall': {
      const vy = Math.random() * 0.4 + 0.25;
      const baseSize = shape === 'money' ? (Math.random() * 8 + 8) : (Math.random() * 4.5 + 3);
      
      const particleMaxLife = shape === 'money' ? (h + 30) / vy : (180 + Math.random() * 120);
      const startY = Math.random() * h;
      const startLife = shape === 'money' ? ((startY + 15) / (h + 30)) * particleMaxLife : life;
      const isMoney = shape === 'money';

      return {
        x: Math.random() * w,
        y: startY,
        vx: (Math.random() - 0.5) * 0.25,
        vy,
        size: baseSize,
        opacity: Math.random() * 0.45 + 0.2,
        life: startLife,
        maxLife: particleMaxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
        color,
        pitchPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        pitchSpeed: isMoney ? Math.random() * 0.04 + 0.02 : undefined,
        rollPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        rollSpeed: isMoney ? Math.random() * 0.03 + 0.015 : undefined,
        swayPhase: isMoney ? Math.random() * Math.PI * 2 : undefined,
        swayFreq: isMoney ? Math.random() * 0.015 + 0.01 : undefined,
        swayAmp: isMoney ? Math.random() * 0.8 + 0.5 : undefined,
      };
    }
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
        size: shape === 'birthday-balloon' ? (Math.random() * 10 + 12) : (Math.random() * 7.5 + 6),
        opacity: Math.random() * 0.35 + 0.25,
        life,
        maxLife: maxLife + 100,
        rotation: (Math.random() - 0.5) * 0.1,
        rotationSpeed: 0,
        phase: Math.random() * Math.PI * 2,
        color,
        wishIndex: shape === 'birthday-balloon' ? Math.floor(Math.random() * 8) : undefined,
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
    case 'birthday-balloon': {
      const MINI_PALETTE = [
        { hex: '#ff4daa', r: 255, g: 77,  b: 170 },
        { hex: '#ffe135', r: 255, g: 225, b: 53  },
        { hex: '#00e5ff', r: 0,   g: 229, b: 255 },
        { hex: '#b4ff3c', r: 180, g: 255, b: 60  },
        { hex: '#ff7c4d', r: 255, g: 124, b: 77  },
        { hex: '#c84dff', r: 200, g: 77,  b: 255 },
      ];
      const MINI_WISHES = [
        'Happy\nBDay!', 'Make a\nWish!', 'Cheers!', 'You\nRock!',
        'Hip Hip!', 'Hooray!', 'Yay! 🎈', 'Woohoo!',
      ];
      const bpal = MINI_PALETTE[(p.wishIndex ?? 0) % MINI_PALETTE.length];
      const { r: br, g: bg, b: bb } = bpal;
      const wish = MINI_WISHES[(p.wishIndex ?? 0) % MINI_WISHES.length];
      const wishLines = wish.split('\n');

      ctx.translate(p.x, p.y);
      const bdSway = Math.sin(p.life * 0.04 + p.phase) * 0.09;
      ctx.rotate(bdSway);

      // Balloon body path helper
      const miniBalloonPath = () => {
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.12);
        ctx.bezierCurveTo( p.size * 1.2, -p.size * 1.12,  p.size * 1.35,  p.size * 0.14, 0,  p.size * 1.05);
        ctx.bezierCurveTo(-p.size * 1.35,  p.size * 0.14, -p.size * 1.2, -p.size * 1.12, 0, -p.size * 1.12);
        ctx.closePath();
      };

      // Gradient fill
      const bodyGrad = ctx.createRadialGradient(
        -p.size * 0.28, -p.size * 0.5, p.size * 0.02,
         p.size * 0.05,  p.size * 0.1,  p.size * 1.5
      );
      const lighter = `rgba(${Math.min(255,br+75)},${Math.min(255,bg+75)},${Math.min(255,bb+75)},0.96)`;
      const darker  = `rgba(${Math.max(0,br-50)},${Math.max(0,bg-50)},${Math.max(0,bb-50)},0.52)`;
      bodyGrad.addColorStop(0,    lighter);
      bodyGrad.addColorStop(0.4,  `rgba(${br},${bg},${bb},0.88)`);
      bodyGrad.addColorStop(1,    darker);
      ctx.fillStyle = bodyGrad;
      miniBalloonPath();
      ctx.fill();

      // Outline
      miniBalloonPath();
      ctx.strokeStyle = `rgba(${br},${bg},${bb},0.5)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Primary gloss
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.3, -p.size * 0.5, p.size * 0.22, p.size * 0.34, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fill();

      // Specular dot
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.17, -p.size * 0.7, p.size * 0.075, p.size * 0.11, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();

      // Wish text with stroke outline
      // Optical centre of balloon body is ~-size*0.12, not y=0
      const textCY = -p.size * 0.12;
      const fs = Math.max(4, p.size * 0.25);
      const lh = fs * 1.25;
      const totalH = (wishLines.length - 1) * lh;
      ctx.font = `800 ${fs}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.lineWidth = fs * 0.26;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(${Math.max(0,br-100)},${Math.max(0,bg-100)},${Math.max(0,bb-100)},0.65)`;
      wishLines.forEach((ln, i) => ctx.strokeText(ln, 0, textCY - totalH / 2 + i * lh));
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      wishLines.forEach((ln, i) => ctx.fillText(ln, 0, textCY - totalH / 2 + i * lh));

      // Knot
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.12, p.size * 1.05);
      ctx.quadraticCurveTo(-p.size * 0.18, p.size * 1.14, 0, p.size * 1.22);
      ctx.quadraticCurveTo( p.size * 0.18, p.size * 1.14, p.size * 0.12, p.size * 1.05);
      ctx.closePath();
      ctx.fillStyle = `rgba(${Math.max(0,br-30)},${Math.max(0,bg-30)},${Math.max(0,bb-30)},0.92)`;
      ctx.fill();

      // S-curve string
      ctx.globalAlpha = Math.max(0, alpha * 0.44);
      const bStrSway = Math.sin(p.life * 0.038 + p.phase) * p.size * 0.95;
      const bSLen = p.size * 2.9;
      ctx.beginPath();
      ctx.moveTo(0, p.size * 1.22);
      ctx.bezierCurveTo(
         bStrSway * 0.92, p.size * 1.22 + bSLen * 0.30,
        -bStrSway * 0.72, p.size * 1.22 + bSLen * 0.65,
         bStrSway * 0.26, p.size * 1.22 + bSLen
      );
      ctx.strokeStyle = `rgba(${br},${bg},${bb},0.5)`;
      ctx.lineWidth = 0.6;
      ctx.lineCap = 'round';
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

      ctx.globalAlpha = Math.max(0, alpha * (0.2 + 0.8 * flipFactor));

      const w = p.size * 2.6;
      const h = p.size * 1.35;
      const rx = p.size * 0.1;
      const pad = p.size * 0.16;

      const miniRoundedPath = () => {
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

      // Bill base gradient
      const bg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      bg.addColorStop(0,    p.color + 'a0');
      bg.addColorStop(0.45, p.color + 'e0');
      bg.addColorStop(1,    p.color + '88');
      ctx.fillStyle = bg;
      miniRoundedPath();
      ctx.fill();

      // Dark inner field
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.rect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2);
      ctx.fill();

      // Outer border
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth   = p.size * 0.07;
      miniRoundedPath();
      ctx.stroke();

      // Inner border
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth   = p.size * 0.035;
      ctx.beginPath();
      ctx.rect(-w / 2 + pad, -h / 2 + pad, w - pad * 2, h - pad * 2);
      ctx.stroke();

      // Shimmer
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

      // Dollar Sign
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.font = `900 ${p.size}px monospace`;
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
      particlesRef.current.push(createMiniParticle(w, h, motionBehavior, particleShape, colors));
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
        if (particleShape === 'money' && p.swayPhase !== undefined && p.swayFreq !== undefined && p.swayAmp !== undefined) {
          p.x += p.vx + Math.sin(p.life * p.swayFreq + p.swayPhase) * p.swayAmp;
          p.y += p.vy * (1 + 0.15 * Math.sin(p.life * p.swayFreq * 2 + p.swayPhase));
          p.rotation += p.rotationSpeed * 0.4;
        } else {
          p.x += p.vx + Math.sin(p.life * 0.025 + p.phase) * 0.25;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
        }

        drawMiniParticle(ctx, p, particleShape);

        const isOut = p.vy > 0 ? p.y > h + 15 : p.y < -15;
        return p.life < p.maxLife && !isOut;
      });

      while (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push(createMiniParticle(w, h, motionBehavior, particleShape, colors));
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
