'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ThemeSelector from './ThemeSelector';
import { themes } from '@/lib/themes';

interface FormState {
  partner_name: string;
  sender_name: string;
  message: string;
  theme_id: string;
}

type FormStep = 'recipient' | 'sender' | 'message' | 'theme' | 'confirm';

const STEPS: FormStep[] = ['recipient', 'sender', 'message', 'theme', 'confirm'];
const MAX_MESSAGE = 500;

export default function CreationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    partner_name: '',
    sender_name: '',
    message: '',
    theme_id: 'romantic-roses',
  });

  const [formStep, setFormStep] = useState<FormStep>('recipient');
  const [submitState, setSubmitState] = useState<'form' | 'submitting' | 'error'>('form');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, message: value }));

    // Auto-expand textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const isNextDisabled = () => {
    if (formStep === 'recipient') return form.partner_name.trim().length === 0;
    if (formStep === 'sender') return form.sender_name.trim().length === 0;
    if (formStep === 'message') return form.message.trim().length === 0;
    return false;
  };

  const handleNext = () => {
    const idx = STEPS.indexOf(formStep);
    if (idx < STEPS.length - 1) {
      setFormStep(STEPS[idx + 1]);
    }
  };

  const handleBack = () => {
    const idx = STEPS.indexOf(formStep);
    if (idx > 0) {
      setFormStep(STEPS[idx - 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isNextDisabled()) {
        handleNext();
      }
    }
  };

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Trigger phone vibration if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    setSubmitState('submitting');
    setError('');

    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSubmitState('error');
        return;
      }

      router.push(`/create/success?slug=${data.slug}`);
    } catch {
      setError('Could not reach the server. Please try again.');
      setSubmitState('error');
    }
  };

  // Framer Motion transition variants for builder steps
  const stepVariants = {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, x: -25, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-6, 6, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Delicate Horizontal Progress Indicator */}
      <div className="flex justify-between items-center gap-2 mb-10 max-w-xs mx-auto">
        {STEPS.map((s, idx) => {
          const isCompleted = STEPS.indexOf(formStep) > idx;
          const isActive = formStep === s;
          return (
            <div key={s} className="flex-1 h-1 relative bg-charcoal-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-crimson"
                initial={{ width: 0 }}
                animate={{ width: isActive || isCompleted ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          );
        })}
      </div>

      {/* Multi-step Builder Form Canvas */}
      <form onSubmit={handleRelease} noValidate>
        <AnimatePresence mode="wait">
          {formStep === 'recipient' && (
            <motion.div
              key="recipient"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-light text-white tracking-wide">
                Who is this moment for?
              </h2>
              <div className="relative max-w-sm mx-auto">
                <input
                  type="text"
                  name="partner_name"
                  value={form.partner_name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Their name or nickname"
                  maxLength={50}
                  autoFocus
                  required
                  className="w-full bg-transparent border-b border-charcoal-700 text-center font-display text-3xl font-light py-3 text-white focus:outline-none focus:border-crimson focus:shadow-[0_4px_24px_rgba(196,12,48,0.1)] transition-all duration-500 placeholder:text-charcoal-600"
                />
              </div>
            </motion.div>
          )}

          {formStep === 'sender' && (
            <motion.div
              key="sender"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-light text-white tracking-wide">
                Who is sending this moment?
              </h2>
              <div className="relative max-w-sm mx-auto">
                <input
                  type="text"
                  name="sender_name"
                  value={form.sender_name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Your name"
                  maxLength={50}
                  autoFocus
                  required
                  className="w-full bg-transparent border-b border-charcoal-700 text-center font-display text-3xl font-light py-3 text-white focus:outline-none focus:border-crimson focus:shadow-[0_4px_24px_rgba(196,12,48,0.1)] transition-all duration-500 placeholder:text-charcoal-600"
                />
              </div>
            </motion.div>
          )}

          {formStep === 'message' && (
            <motion.div
              key="message"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="font-display text-2xl sm:text-3xl font-light text-white tracking-wide">
                  Write what your heart means to say…
                </h2>
              </div>
              <div className="relative p-6 sm:p-8 rounded-2xl bg-charcoal-950/20 border border-charcoal-900 backdrop-blur-md shadow-2xl focus-within:border-crimson/40 focus-within:shadow-[0_0_32px_rgba(196,12,48,0.06)] transition-all duration-500">
                <textarea
                  name="message"
                  ref={textareaRef}
                  value={form.message}
                  onChange={handleMessageChange}
                  placeholder="Write your message on this love canvas…"
                  maxLength={MAX_MESSAGE}
                  autoFocus
                  required
                  className="w-full bg-transparent text-white font-display text-xl sm:text-2xl font-light leading-relaxed placeholder:text-charcoal-600 focus:outline-none resize-none min-h-[140px]"
                />
                
                <div className="flex justify-between items-center mt-4 text-[10px] tracking-wider text-ash-500 font-body uppercase">
                  <span>Love Canvas</span>
                  <span>{form.message.length} / {MAX_MESSAGE}</span>
                </div>
              </div>
            </motion.div>
          )}

          {formStep === 'theme' && (
            <motion.div
              key="theme"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ThemeSelector
                selected={form.theme_id}
                onChange={(id) => setForm((prev) => ({ ...prev, theme_id: id }))}
              />
            </motion.div>
          )}

          {formStep === 'confirm' && (
            <motion.div
              key="confirm"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 text-center"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-light text-white tracking-wide">
                Ready to seal this moment?
              </h2>
              
              <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-950/25 border border-charcoal-900/60 backdrop-blur-md max-w-sm mx-auto space-y-6 text-left shadow-xl">
                <p className="font-body text-[10px] tracking-[0.25em] text-ash-500 uppercase text-center border-b border-charcoal-800 pb-3">
                  Keepsake Summary
                </p>
                <div className="space-y-1">
                  <span className="font-body text-[10px] tracking-wider text-ash-500 uppercase">For</span>
                  <p className="font-display text-xl text-white font-light">{form.partner_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-body text-[10px] tracking-wider text-ash-500 uppercase">From</span>
                  <p className="font-display text-lg text-white font-light">{form.sender_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-body text-[10px] tracking-wider text-ash-500 uppercase">Atmosphere</span>
                  <p className="font-display text-base text-crimson font-light">
                    {themes.find((t) => t.id === form.theme_id)?.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Builder Step Controls */}
        <div className="flex justify-between items-center gap-4 mt-10">
          {formStep !== 'recipient' ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitState === 'submitting'}
              className="px-6 py-3 border border-charcoal-700/60 text-ash-300 font-body text-xs tracking-widest uppercase hover:text-white hover:border-ash-400 transition-all duration-300 disabled:opacity-30"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {formStep !== 'confirm' ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="px-8 py-3 bg-charcoal-800 text-white font-body text-xs tracking-widest uppercase hover:bg-charcoal-700 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <motion.button
              id="btn-create-moment"
              type="submit"
              disabled={submitState === 'submitting'}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-crimson text-white font-body text-xs tracking-widest uppercase overflow-hidden transition-all duration-500 hover:bg-rose disabled:opacity-50 disabled:cursor-not-allowed"
              animate={{
                boxShadow: [
                  '0 0 12px rgba(196,12,48,0.25)',
                  '0 0 28px rgba(196,12,48,0.55)',
                  '0 0 12px rgba(196,12,48,0.25)'
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <AnimatePresence mode="wait">
                {submitState === 'submitting' ? (
                  <motion.span
                    key="releasing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sealing Keepsake…
                  </motion.span>
                ) : (
                  <motion.span
                    key="release"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Release this moment
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </form>

      {/* Submission Errors */}
      <AnimatePresence>
        {submitState === 'error' && error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-body text-sm text-rose-500 text-center mt-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
