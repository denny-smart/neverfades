'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AtmosphereLayer from '@/components/moment/AtmosphereLayer';
import { getTheme } from '@/lib/themes';

interface StatsState {
  view_count: number;
  max_views: number;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  is_active: boolean;
}

/* ── Icon map by theme ─────────────────────────────────────── */
function ThemeIcon({ id }: { id: string }) {
  const icons: Record<string, string> = {
    'romantic-roses': '🌹',
    'magic-stars':    '✨',
    'love-balloons':  '🎈',
    'sunset-glow':    '🔥',
    'galaxy-romance': '🌌',
    'teddy-love':     '🧸',
    'love-emojis':    '💖',
    'pink-petals':    '🌸',
    'white-petals':    '🤍',
    'golden-petals':  '💛',
  };
  return <span className="text-3xl select-none">{icons[id] ?? '🌹'}</span>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const slug    = searchParams.get('slug') ?? '';
  const themeId = searchParams.get('theme') ?? 'romantic-roses';
  const theme   = getTheme(themeId);

  const momentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/moment/${slug}`
      : `/moment/${slug}`;

  const [stats,  setStats]  = useState<StatsState | null>(null);
  const [copied, setCopied] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    // Trigger staggered content reveal
    const t = setTimeout(() => setReveal(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/moments/${slug}/stats`);
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error('Error fetching moment stats:', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(momentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* fallback */ }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-6 py-14 overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Atmosphere canvas */}
      <AtmosphereLayer themeEngine={theme.themeEngine} palette={theme.palette} />

      {/* Top-left Home button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={reveal ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-8 left-6 sm:left-8 z-20"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-body text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/75 transition-colors duration-300"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
      </motion.div>

      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${theme.palette.primary}18 0%, transparent 65%)`,
        }}
        aria-hidden="true"
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 420 }}>

        {/* ── Brand tag ── */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={reveal ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[9px] tracking-[0.42em] uppercase mb-8"
          style={{ color: theme.palette.primary }}
        >
          lovethatneverfades
        </motion.p>

        {/* ── Theme badge ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={reveal ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background:  'rgba(0,0,0,0.35)',
              border:      `1px solid ${theme.palette.primary}35`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <ThemeIcon id={themeId} />
          </div>
          {/* Orbiting glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 0 0 ${theme.palette.primary}00`,
                `0 0 0 6px ${theme.palette.primary}25`,
                `0 0 0 0 ${theme.palette.primary}00`,
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ── Headline ── */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={reveal ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-5xl font-light text-white text-center mb-3 leading-tight"
        >
          Your moment is sealed.
        </motion.h1>

        {/* ── Sub-copy ── */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={reveal ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-sm text-white/38 leading-relaxed text-center mb-10"
          style={{ maxWidth: 320 }}
        >
          Share this keepsake. It lives for exactly{' '}
          <span className="text-white/70 font-medium">10 views</span>, then it
          fades — but the feeling won&apos;t.
        </motion.p>

        {/* ── Share link capsule ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={reveal ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mb-3"
        >
          <div
            className="flex items-center gap-2 p-1.5 pl-5 rounded-full transition-all duration-400"
            style={{
              background:   'rgba(0,0,0,0.4)',
              border:       `1px solid ${theme.palette.primary}20`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <input
              id="moment-link-input"
              type="text"
              readOnly
              value={momentUrl}
              className="flex-1 bg-transparent text-white/60 font-body text-xs focus:outline-none truncate select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <motion.button
              id="btn-copy-link"
              onClick={handleCopy}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="font-body text-[10px] tracking-[0.28em] uppercase px-5 py-2.5 rounded-full text-white whitespace-nowrap transition-all duration-300 flex-shrink-0"
              style={{
                background: copied ? 'rgba(255,255,255,0.15)' : theme.palette.primary,
                boxShadow:  copied ? 'none' : `0 4px 16px ${theme.palette.primary}40`,
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 3.5L3.8 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    Copy link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Tap to copy hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={reveal ? { opacity: 0.35 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="font-body text-[9px] tracking-wide text-white/35 mb-8"
        >
          Tap the link field to select all
        </motion.p>

        {/* ── Hairline divider ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={reveal ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-px mb-8 origin-left"
          style={{ background: `linear-gradient(90deg, ${theme.palette.primary}40, transparent)` }}
        />

        {/* ── Live analytics panel ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-2xl p-5 mb-8"
            style={{
              background:     'rgba(0,0,0,0.35)',
              border:         `1px solid rgba(255,255,255,0.06)`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-body text-[9px] tracking-[0.28em] uppercase text-white/35">
                Live Analytics
              </span>
              {stats.is_active && stats.view_count < stats.max_views ? (
                <span className="flex items-center gap-1.5 font-body text-[9px] uppercase tracking-widest text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px #34d399' }} />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-body text-[9px] uppercase tracking-widest text-rose-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" style={{ boxShadow: '0 0 8px #ef4444' }} />
                  Faded
                </span>
              )}
            </div>

            {/* Views summary */}
            <p className="font-display text-2xl font-light text-white leading-tight mb-4">
              {stats.is_active && stats.view_count < stats.max_views ? (
                <>
                  Felt{' '}
                  <motion.span
                    key={stats.view_count}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ color: theme.palette.primary }}
                    className="font-medium"
                  >
                    {stats.view_count}
                  </motion.span>{' '}
                  {stats.view_count === 1 ? 'time' : 'times'}
                </>
              ) : (
                <>This moment has <span className="text-white/35 italic">faded</span></>
              )}
            </p>

            {/* Heart gauge */}
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: 10 }).map((_, i) => {
                const isFelt = i < stats.view_count;
                const isLast = i === stats.view_count - 1 && stats.view_count < stats.max_views;
                return (
                  <motion.svg
                    key={i}
                    width="16" height="16"
                    viewBox="0 0 24 24"
                    fill={isFelt ? theme.palette.primary : 'none'}
                    stroke={isFelt ? theme.palette.primary : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1.5"
                    className="transition-colors duration-500"
                    animate={isLast ? { scale: [1, 1.3, 1] } : {}}
                    transition={isLast ? { duration: 1.4, repeat: Infinity, repeatDelay: 2.8 } : {}}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </motion.svg>
                );
              })}
            </div>

            <p className="font-body text-[9px] text-white/25 tracking-wide mb-0">
              {stats.view_count} / {stats.max_views} unique views consumed
            </p>

            {/* Timestamps */}
            {(stats.first_viewed_at || stats.last_viewed_at) && (
              <div className="border-t border-white/5 mt-4 pt-3 space-y-1.5">
                {stats.first_viewed_at && (
                  <div className="flex justify-between font-body text-[9px] text-white/25 tracking-wide">
                    <span>First opened</span>
                    <span className="text-white/40">{new Date(stats.first_viewed_at).toLocaleString()}</span>
                  </div>
                )}
                {stats.last_viewed_at && (
                  <div className="flex justify-between font-body text-[9px] text-white/25 tracking-wide">
                    <span>Last active</span>
                    <span className="text-white/40">{new Date(stats.last_viewed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Fine print ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={reveal ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="font-body text-[9px] text-white/20 italic text-center leading-normal mb-8"
          style={{ maxWidth: 280 }}
        >
          Once opened {stats?.max_views ?? 10} times, the link dissolves permanently. There is no recovery.
        </motion.p>

        {/* ── Create another ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={reveal ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/create"
            id="btn-create-another"
            className="group inline-flex items-center gap-2 font-body text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/70 transition-colors duration-400"
          >
            <span>Create another moment</span>
            <svg
              width="11" height="11" viewBox="0 0 12 12" fill="none"
              className="group-hover:translate-x-1 transition-transform duration-300"
            >
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <SuccessContent />
    </Suspense>
  );
}
