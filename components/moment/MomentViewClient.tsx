'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Moment } from '../../lib/types';
import RevealSequence from './RevealSequence';
import FadedScreen from './FadedScreen';
import { motion, AnimatePresence } from 'framer-motion';

// ── Session helpers ────────────────────────────────────────────────────────
const SESSION_KEY = 'nf_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    // Generate RFC-4122 v4 UUID
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── Extended Moment type to accommodate analytics fields ──
interface MomentWithAnalytics extends Moment {
  first_viewed_at?: string | null;
  last_viewed_at?: string | null;
}

interface MomentViewClientProps {
  slug: string;
  initialMoment: MomentWithAnalytics | null;
  initialFaded: boolean;
}

const ENGAGEMENT_MIN_MS = 3000; // Must be on page ≥3 seconds before view is counted

export default function MomentViewClient({
  slug,
  initialMoment,
  initialFaded,
}: MomentViewClientProps) {
  const [moment, setMoment] = useState<MomentWithAnalytics | null>(initialMoment);
  const [faded, setFaded] = useState(initialFaded);
  const [loading, setLoading] = useState(!initialFaded);
  const [error, setError] = useState('');
  const mountTimeRef = useRef<number>(Date.now());
  const hasRecordedRef = useRef(false);

  const recordView = useCallback(async () => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Enforce minimum engagement time
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = ENGAGEMENT_MIN_MS - elapsed;
    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining));
    }

    try {
      const res = await fetch(`/api/moments/${slug}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await res.json();

      if (res.status === 404) {
        setError('This moment does not exist.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Could not load this moment. Please try again.');
        setLoading(false);
        return;
      }

      if (data.faded) {
        setFaded(true);
        setLoading(false);
        return;
      }

      if (!data.moment) {
        setError('Could not load this moment. Please try again.');
        setLoading(false);
        return;
      }

      setMoment(data.moment);
      setFaded(false);
      setLoading(false);
    } catch {
      setError('Could not load this moment. Please try again.');
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (initialFaded) {
      setLoading(false);
      return;
    }
    recordView();
  }, [recordView, initialFaded]);

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center"
        >
          <div className="w-5 h-5 border border-crimson/30 border-t-crimson rounded-full animate-spin mx-auto mb-6" />
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-ash-400">
            A moment is unfolding…
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-3xl mb-6">🌑</p>
          <h1 className="font-display text-2xl text-white mb-3 font-light">
            Moment not found
          </h1>
          <p className="font-body text-sm text-ash-400">{error}</p>
        </div>
      </div>
    );
  }

  // ─── Faded state ─────────────────────────────────────────────────────────
  if (faded || !moment) {
    return <FadedScreen />;
  }

  // ─── Reveal ──────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <RevealSequence moment={moment} />
    </AnimatePresence>
  );
}
