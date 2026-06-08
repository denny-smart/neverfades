'use client';

import { useState, useEffect, useMemo } from 'react';
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
const STEP_MESSAGE     = 4; // Love message line-by-line reveal
const STEP_SIGNATURE   = 5; // Sender signature
const STEP_ATMOSPHERE  = 6; // Canvas atmosphere + final branding

export default function RevealSequence({ moment }: RevealSequenceProps) {
  const theme = getTheme(moment.theme_id);
  const { pacing } = theme;

  const [step, setStep] = useState(STEP_SILENCE);
  const [atmosphereActive, setAtmosphereActive] = useState(false);

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
      [STEP_SILENCE]:    1800,                       // initial silence
      [STEP_INTRO]:      3200,                       // intro message
      [STEP_NAME]:       0,                          // typewriter callbacks advance this
      [STEP_PAUSE]:      pacing.pauseBetweenSteps,   // emotional pause
      [STEP_SIGNATURE]:  3200,                       // signature view before branding
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
    const revealTimeMs = (totalLines - 1) * 1600 + 1400; // staggered anim duration
    const readingDelayMs = Math.max(3000, lines[totalLines - 1]?.split(' ').length * 320 || 3000);
    const totalDuration = revealTimeMs + readingDelayMs;

    const t = setTimeout(() => setStep(STEP_SIGNATURE), totalDuration);
    return () => clearTimeout(t);
  }, [step, lines]);

  // Trigger ambient background elements
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

  // Staggered lines variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 1.6,
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const } 
    }
  };

  // Signature transition variants
  const signatureVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9, 
      filter: 'blur(8px)' 
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 2.0,
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
        {atmosphereActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
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
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            className="absolute inset-0 bg-void z-20"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Lifespan Indicator */}
      {step > STEP_SILENCE && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <LifespanIndicator
            viewCount={moment.view_count}
            maxViews={moment.max_views}
            accentColor={theme.palette.primary}
          />
        </div>
      )}

      {/* Central Content */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-10">

        {/* Step 2: Emotional Intro */}
        <AnimatePresence>
          {step >= STEP_INTRO && step <= STEP_PAUSE && (
            <motion.p
              key="intro"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="font-body text-xs tracking-[0.3em] uppercase text-ash-400"
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
              className={step >= STEP_MESSAGE ? "mb-6" : ""}
            >
              {step < STEP_MESSAGE && (
                <p
                  className="font-body text-[10px] tracking-[0.3em] uppercase mb-4"
                  style={{ color: theme.palette.accent }}
                >
                  for
                </p>
              )}
              <h1
                className="font-display text-5xl sm:text-6xl font-light leading-none tracking-tight"
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

        {/* Step 5: Love Message (Emotional breathing container) */}
        <AnimatePresence>
          {step >= STEP_MESSAGE && (
            <motion.div
              key="message-container"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="px-2"
            >
              <div
                className="w-12 h-px mx-auto mb-8 opacity-45"
                style={{ background: theme.palette.secondary }}
              />
              
              <motion.div
                className="relative p-8 sm:p-10 rounded-2xl bg-void/30 backdrop-blur-lg border max-w-xl mx-auto shadow-2xl overflow-hidden"
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
                  className="space-y-5 text-left"
                >
                  {lines.map((line, i) => (
                    <motion.p
                      key={i}
                      variants={lineVariants}
                      className="font-display text-lg sm:text-xl font-light leading-relaxed text-white/95"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 6: Sender Signature */}
        <AnimatePresence>
          {step >= STEP_SIGNATURE && (
            <motion.div
              key="signature"
              variants={signatureVariants}
              initial="hidden"
              animate="visible"
              className="pt-6"
            >
              <div
                className="w-12 h-px mx-auto mb-6 opacity-30"
                style={{ background: theme.palette.primary }}
              />
              <p className="font-body text-[10px] tracking-[0.35em] uppercase text-ash-400 mb-2">
                with love,
              </p>
              <motion.p
                className="font-display text-2xl sm:text-3xl font-light tracking-wide inline-flex items-center gap-2"
                style={{ color: theme.palette.accent }}
                animate={{
                  textShadow: [
                    `0 0 8px ${theme.palette.accent}15`,
                    `0 0 24px ${theme.palette.accent}45`,
                    `0 0 8px ${theme.palette.accent}15`
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                — {moment.sender_name} <span className="text-rose-600">❤️</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 7: Final Branding */}
        <AnimatePresence>
          {step >= STEP_ATMOSPHERE && (
            <motion.p
              key="brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2.2, delay: 2.2 }}
              className="font-body text-[9px] tracking-[0.38em] uppercase text-ash-400 pt-8"
            >
              lovethatneverfades
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
