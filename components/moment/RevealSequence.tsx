'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moment } from '../../lib/types';
import { getTheme } from '../../lib/themes';
import LifespanIndicator from './LifespanIndicator';
import AtmosphereLayer from './AtmosphereLayer';
import TypewriterText from '../ui/TypewriterText';
import { getMessageEmoji } from '../../lib/messageEmoji';

interface RevealSequenceProps {
  moment: Moment;
}

// ─── Step constants ───────────────────────────────────────────────────────
const STEP_SILENCE     = 0; // Black screen — no text
const STEP_INTRO       = 1; // "A moment created for you is unfolding…"
const STEP_NAME        = 2; // Partner nickname typewriter
const STEP_PAUSE       = 3; // Intentional cinematic pause
const STEP_MESSAGE     = 4; // Love message line-by-line reveal
const STEP_SIGNATURE   = 5; // Sender signature
const STEP_ATMOSPHERE  = 6; // Canvas atmosphere + final branding

export default function RevealSequence({ moment }: RevealSequenceProps) {
  const theme = getTheme(moment.theme_id);
  const { pacing } = theme;

  // Derive a context-sensitive emoji from the message text
  const signatureEmoji = getMessageEmoji(moment.message, moment.sender_name);

  const [step, setStep] = useState(STEP_SILENCE);

  // Split message into dynamic lines based on sentence boundaries
  const lines = useMemo(() => {
    return moment.message
      .split('\n')
      .reduce<string[]>((acc, paragraph) => {
        const sentences = paragraph
          .match(/[^.!?]+[.!?]?/g)
          ?.map(s => s.trim())
          .filter(Boolean) || [paragraph];
        return [...acc, ...sentences];
      }, [])
      .filter(Boolean);
  }, [moment.message]);

  // Step advancement timer engine
  useEffect(() => {
    const stepDelays: Record<number, number> = {
      [STEP_SILENCE]:    700,                           // initial silence
      [STEP_INTRO]:      1600,                          // intro message
      [STEP_NAME]:       0,                             // typewriter callbacks advance this
      [STEP_PAUSE]:      Math.min(pacing.pauseBetweenSteps, 800), // capped pause
      [STEP_SIGNATURE]:  2000,                          // signature view before branding
    };

    if (
      step === STEP_NAME ||
      step === STEP_MESSAGE ||
      step >= STEP_ATMOSPHERE
    ) return;

    const t = setTimeout(() => setStep((s) => s + 1), stepDelays[step]);
    return () => clearTimeout(t);
  }, [step, pacing.pauseBetweenSteps]);

  // Message line reveal pacing
  useEffect(() => {
    if (step !== STEP_MESSAGE) return;

    const totalLines = lines.length;
    const revealTimeMs = (totalLines - 1) * 700 + 600;  // snappy stagger
    const readingDelayMs = Math.max(1400, (lines[totalLines - 1]?.split(' ').length ?? 5) * 150);
    const totalDuration = revealTimeMs + readingDelayMs;

    const t = setTimeout(() => setStep(STEP_SIGNATURE), totalDuration);
    return () => clearTimeout(t);
  }, [step, lines]);

  const fadeIn = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { opacity: 0, transition: { duration: 0.4 } },
  };

  const introVariants = {
    hidden: {
      opacity: 0,
      scale: 0.96,
      filter: 'blur(10px)',
      letterSpacing: '0.18em',
    },
    visible: {
      opacity: 0.85,
      scale: 1,
      filter: 'blur(0px)',
      letterSpacing: '0.3em',
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    },
    exit: {
      opacity: 0,
      scale: 1.04,
      filter: 'blur(8px)',
      letterSpacing: '0.36em',
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    }
  };

  const fadeUp = {
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { opacity: 0, y: -8, transition: { duration: 0.35 } },
  };

  // Staggered lines variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.55,
        delayChildren: 0.1,
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } 
    }
  };

  // Signature transition variants
  const signatureVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      filter: 'blur(6px)' 
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{ background: theme.background }}
    >
      {/* Soft atmospheric gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.palette.primary}0a 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Particle Atmosphere canvas */}
      <AnimatePresence>
        {step > STEP_SILENCE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step === STEP_ATMOSPHERE ? 1 : 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0"
          >
            <AtmosphereLayer
              themeEngine={theme.themeEngine}
              palette={theme.palette}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Initial Silence Layer */}
      <AnimatePresence>
        {step === STEP_SILENCE && (
          <motion.div
            key="silence"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0 bg-void z-20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Lifespan Indicator */}
      <AnimatePresence>
        {step > STEP_SILENCE && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
          >
            <LifespanIndicator
              viewCount={moment.view_count}
              maxViews={moment.max_views}
              accentColor={theme.palette.primary}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Content */}
      <motion.div layout className="relative z-10 max-w-xl w-full text-center flex flex-col items-center justify-center">

        {/* Step 2: Emotional Intro */}
        <AnimatePresence>
          {step >= STEP_INTRO && step <= STEP_PAUSE && (
            <motion.p
              key="intro"
              variants={introVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="font-body text-xs uppercase text-ash-200 mb-8"
            >
              A moment created for you is unfolding…
            </motion.p>
          )}
        </AnimatePresence>

        {/* Step 3: Recipient Typewriter */}
        <AnimatePresence>
          {step >= STEP_NAME && (
            <motion.div
              key="name"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              {step < STEP_MESSAGE && (
                <p
                  className="font-body text-[10px] tracking-[0.3em] uppercase mb-4"
                  style={{ color: theme.palette.accent }}
                >
                  for
                </p>
              )}
              <motion.h1
                className="font-display text-5xl sm:text-6xl font-light leading-none tracking-tight"
                style={{ color: theme.palette.primary }}
                animate={{
                  textShadow: [
                    `0 0 12px ${theme.palette.primary}18`,
                    `0 0 28px ${theme.palette.primary}45`,
                    `0 0 12px ${theme.palette.primary}18`
                  ],
                  y: step >= STEP_MESSAGE ? [0, -3, 0] : 0
                }}
                transition={{
                  textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <TypewriterText
                  text={moment.partner_name}
                  speed={Math.min(pacing.typingSpeed, 50)}
                  delay={0.1}
                  onComplete={() => {
                    if (step === STEP_NAME) {
                      setTimeout(() => setStep(STEP_PAUSE), 250);
                    }
                  }}
                />
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic vertical connector line 1 */}
        {step >= STEP_MESSAGE && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 0.35 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-px my-6"
            style={{ background: `linear-gradient(to bottom, ${theme.palette.primary}, transparent)` }}
          />
        )}

        {/* Step 5: Love Message (Emotional breathing container) */}
        <AnimatePresence>
          {step >= STEP_MESSAGE && (
            <motion.div
              layout
              key="message-container"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="px-2 w-full"
            >
              <motion.div
                className="relative p-8 sm:p-10 rounded-2xl bg-void/35 backdrop-blur-lg border max-w-md mx-auto shadow-2xl overflow-hidden"
                animate={{
                  scale: [1, 1.012, 1],
                  opacity: [0.97, 1, 0.97],
                  boxShadow: [
                    `0 0 20px ${theme.palette.primary}08`,
                    `0 0 40px ${theme.palette.primary}15`,
                    `0 0 20px ${theme.palette.primary}08`
                  ],
                  borderColor: [
                    `rgba(255, 255, 255, 0.03)`,
                    `${theme.palette.primary}18`,
                    `rgba(255, 255, 255, 0.03)`
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5 text-center"
                >
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      variants={lineVariants}
                      className="font-display text-xl sm:text-2xl font-light leading-relaxed text-white/95"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic vertical connector line 2 */}
        {step >= STEP_SIGNATURE && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 0.25 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="w-px my-6"
            style={{ background: `linear-gradient(to bottom, transparent, ${theme.palette.primary})` }}
          />
        )}

        {/* Step 6: Sender Signature */}
        <AnimatePresence>
          {step >= STEP_SIGNATURE && (
            <motion.div
              layout
              key="signature"
              variants={signatureVariants}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <p className="font-body text-[10px] tracking-[0.35em] uppercase text-ash-200 mb-2">
                {theme.signOff}
              </p>
              <motion.p
                className="font-display text-2xl sm:text-3xl font-light tracking-wide inline-flex items-center gap-2"
                style={{ color: theme.palette.accent }}
                animate={{
                  textShadow: [
                    `0 0 8px ${theme.palette.accent}15`,
                    `0 0 24px ${theme.palette.accent}45`,
                    `0 0 8px ${theme.palette.accent}15`
                  ],
                  y: [0, 3, 0]
                }}
                transition={{
                  textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
              >
                — {moment.sender_name} <span>{signatureEmoji}</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 7: Final Branding */}
        <AnimatePresence>
          {step >= STEP_ATMOSPHERE && (
            <motion.p
              layout
              key="brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-[9px] tracking-[0.38em] uppercase text-ash-200 pt-10 w-full"
            >
              {theme.brandFooter}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
