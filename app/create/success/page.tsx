'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface StatsState {
  view_count: number;
  max_views: number;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  is_active: boolean;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') ?? '';
  const momentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/moment/${slug}`
      : `/moment/${slug}`;

  const [stats, setStats] = useState<StatsState | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/moments/${slug}/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching moment stats:', err);
      }
    };

    fetchStats();
    // Poll stats every 10 seconds for real-time analytics updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(momentUrl);
    } catch {
      // fallback: select the input
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196,18,48,0.07) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Icon */}
          <div className="text-4xl mb-6">🌹</div>

          <p className="font-body text-xs tracking-[0.3em] uppercase text-crimson mb-4">
            lovethatneverfades
          </p>

          <h1 className="font-display text-4xl sm:text-5xl font-light text-white mb-4">
            Your moment is sealed.
          </h1>

          <p className="font-body text-sm text-ash-300 leading-relaxed mb-8">
            Share this link. It will exist for exactly{' '}
            <span className="text-white">10 views</span>. Then it fades — but
            the feeling won't.
          </p>
        </motion.div>

        {/* Link box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-stretch border border-charcoal-600 overflow-hidden">
            <input
              id="moment-link-input"
              type="text"
              readOnly
              value={momentUrl}
              className="flex-1 bg-charcoal-800 text-ash-200 font-body text-xs px-4 py-3 focus:outline-none truncate"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              id="btn-copy-link"
              onClick={handleCopy}
              className="bg-crimson text-white font-body text-xs tracking-widest uppercase px-5 hover:bg-rose transition-colors duration-300 whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </motion.div>

        {/* Live Analytics Layer */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="border border-charcoal-700 bg-charcoal-900/50 p-6 mb-8 text-left space-y-4 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(196,18,48,0.12), transparent 70%)',
              }}
            />
            <div className="flex justify-between items-center">
              <span className="font-body text-[10px] tracking-[0.2em] text-ash-400 uppercase font-semibold">
                Live Analytics
              </span>
              {stats.is_active && stats.view_count < stats.max_views ? (
                <span className="flex items-center gap-1.5 text-[9px] text-emerald-500 uppercase tracking-widest font-body font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[9px] text-crimson uppercase tracking-widest font-body font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                  Faded
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="font-display text-xl sm:text-2xl font-light text-white leading-tight">
                {stats.is_active && stats.view_count < stats.max_views ? (
                  <>
                    This moment was felt{' '}
                    <span className="text-crimson font-medium">
                      {stats.view_count}
                    </span>{' '}
                    times ❤️
                  </>
                ) : (
                  <>
                    This moment has{' '}
                    <span className="text-ash-400 italic">faded</span> 🖤
                  </>
                )}
              </p>
              <p className="font-body text-[10px] text-ash-400 tracking-wide">
                Limit: {stats.max_views} unique session views
              </p>
            </div>

            {(stats.first_viewed_at || stats.last_viewed_at) && (
              <div className="pt-3 border-t border-charcoal-800 space-y-1.5 text-[10px] font-body text-ash-400 tracking-wide">
                {stats.first_viewed_at && (
                  <div className="flex justify-between">
                    <span>First opened</span>
                    <span className="text-ash-200">
                      {new Date(stats.first_viewed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {stats.last_viewed_at && (
                  <div className="flex justify-between">
                    <span>Last active</span>
                    <span className="text-ash-200">
                      {new Date(stats.last_viewed_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Scarcity reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="border border-charcoal-700 p-4 mb-8"
        >
          <p className="font-body text-xs text-ash-400 leading-relaxed">
            ⚠️ Once opened 10 times, this link is gone forever. There is no
            recovery.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Link
            href="/create"
            id="btn-create-another"
            className="font-body text-xs tracking-widest uppercase text-ash-400 hover:text-crimson transition-colors duration-300"
          >
            Create another moment →
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
