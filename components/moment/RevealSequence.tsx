'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moment } from '../../lib/types';
import { getTheme } from '../../lib/themes';
import LifespanIndicator from './LifespanIndicator';
import AtmosphereLayer from './AtmosphereLayer';
import TypewriterText from '../ui/TypewriterText';

interface RevealSequenceProps {
  moment: Moment;
}

// ─── Step constants ───────────────────────────────────────────────────────
const STEP_SILENCE     = 0; // Black screen — no text
const STEP_INTRO       = 1; // "A moment created for you is unfolding…"
const STEP_NAME        = 2; // Partner nickname typewriter
const STEP_PAUSE       = 3; // Intentional cinematic pause
const STEP_MESSAGE     = 4; // Love message fade-in
const STEP_SIGNATURE   = 5; // Sender name
const STEP_ATMOSPHERE  = 6; // Particle atmosphere activates

export default function RevealSequence({ moment }: RevealSequenceProps) {
  const theme = getTheme(moment.theme_id);
  const { pacing } = theme;

  const [step, setStep] = useState(STEP_SILENCE);
  const [atmosphereActive, setAtmosphereActive] = useState(false);

  // Auto-advance timer engine
  useEffect(() => {
    const stepDelays: Record<number, number> = {
      [STEP_SILENCE]:    1800,                       // silence layer
      [STEP_INTRO]:      3200,                       // intro line
      [STEP_NAME]:       0,                          // typewriter drives advancement
      [STEP_PAUSE]:      pacing.pauseBetweenSteps,   // emotional pause
      [STEP_SIGNATURE]:  2800,                       // signature → atmosphere
    };

    // These steps are driven by callbacks, not timers
    if (
      step === STEP_NAME ||
      step === STEP_MESSAGE ||
      step >= STEP_ATMOSPHERE
    ) return;

    const t = setTimeout(() => setStep((s) => s + 1), stepDelays[step]);
    return () => clearTimeout(t);
  }, [step, pacing.pauseBetweenSteps]);

  // Message reading time — advances to signature automatically
  useEffect(() => {
    if (step !== STEP_MESSAGE) return;
    const words = moment.message.split(' ').length;
    const readMs = Math.max(4500, words * 240);
    const t = setTimeout(() => setStep(STEP_SIGNATURE), readMs);
    return () => clearTimeout(t);
  }, [step, moment.message]);

  // Activate atmosphere shortly after step 6 begins
  useEffect(() => {
    if (step !== STEP_ATMOSPHERE) return;
    const t = setTimeout(() => setAtmosphereActive(true), 800);
    return () => clearTimeout(t);
  }, [step]);

  const fadeIn = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { opacity: 0, transition: { duration: 0.8 } },
  };

  const fadeUp = {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.7 } },
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: theme.background }}
    >
      {/* Atmospheric glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none atmosphere"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.palette.primary}0d 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Canvas particles — activate at step 6 */}
      <AnimatePresence>
        {atmosphereActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
            className="absolute inset-0"
          >
            <AtmosphereLayer
              themeEngine={theme.themeEngine}
              palette={theme.palette}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 1: Silence Layer ────────────────────────────────────────── */}
      <AnimatePresence>
        {step === STEP_SILENCE && (
          <motion.div
            key="silence"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            className="absolute inset-0 bg-void z-20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Persistent lifespan indicator (shown after step 1) ──────────── */}
      {step > STEP_SILENCE && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <LifespanIndicator
            viewCount={moment.view_count}
            maxViews={moment.max_views}
            accentColor={theme.palette.primary}
          />
        </div>
      )}

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-10 pt-20">

        {/* ── Step 2: Emotional intro ── */}
        <AnimatePresence>
          {step >= STEP_INTRO && step <= STEP_PAUSE && (
            <motion.p
              key="intro"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="font-body text-xs tracking-[0.28em] uppercase text-ash-400"
            >
              A moment created for you is unfolding…
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Step 3: Partner name typewriter ── */}
        <AnimatePresence>
          {step >= STEP_NAME && (
            <motion.div
              key="name"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <p
                className="font-body text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: theme.palette.accent }}
              >
                for
              </p>
              <h1
                className="font-display text-6xl sm:text-7xl font-light leading-none"
                style={{ color: theme.palette.primary }}
              >
                <TypewriterText
                  text={moment.partner_name}
                  speed={pacing.typingSpeed}
                  delay={0.3}
                  onComplete={() => {
                    if (step === STEP_NAME) {
                      setTimeout(() => setStep(STEP_PAUSE), 600);
                    }
                  }}
                />
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 4: Cinematic pause — just breathing room (no text) ── */}

        {/* ── Step 5: Message ── */}
        <AnimatePresence>
          {step >= STEP_MESSAGE && (
            <motion.div
              key="message"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <div
                className="w-8 h-px mx-auto mb-8"
                style={{ background: theme.palette.secondary }}
              />
              <blockquote
                className="font-display text-xl sm:text-2xl font-light leading-relaxed text-white/90 italic px-4"
              >
                &ldquo;{moment.message}&rdquo;
              </blockquote>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 6: Sender signature ── */}
        <AnimatePresence>
          {step >= STEP_SIGNATURE && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <div
                className="w-8 h-px mx-auto mb-6"
                style={{ background: theme.palette.primary + '50' }}
              />
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-ash-400 mb-2">
                with love,
              </p>
              <p
                className="font-display text-2xl sm:text-3xl font-light"
                style={{ color: theme.palette.accent }}
              >
                {moment.sender_name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 7: Brand mark fades in ── */}
        <AnimatePresence>
          {step >= STEP_ATMOSPHERE && (
            <motion.p
              key="brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 2, delay: 2 }}
              className="font-body text-[9px] tracking-[0.35em] uppercase text-ash-400 pt-8"
            >
              lovethatneverfades
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
