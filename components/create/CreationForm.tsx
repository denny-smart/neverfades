'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ThemeSelector, { THEME_META } from './ThemeSelector';
import { themes, getTheme } from '@/lib/themes';

interface CreationFormProps {
  activeThemeId: string;
  onThemeChange: (id: string) => void;
}

interface FormState {
  partner_name: string;
  sender_name: string;
  message: string;
  theme_id: string;
}

type FormStep = 'recipient' | 'sender' | 'message' | 'theme' | 'confirm';
const STEPS: FormStep[] = ['recipient', 'sender', 'message', 'theme', 'confirm'];
const MAX_MESSAGE = 500;

const STEP_LABELS: Record<FormStep, string> = {
  recipient: 'Who receives this?',
  sender:    'Who is sending?',
  message:   'Love Canvas',
  theme:     'Choose the vibe',
  confirm:   'Seal it forever',
};

export default function CreationForm({ activeThemeId, onThemeChange }: CreationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    partner_name: '',
    sender_name:  '',
    message:      '',
    theme_id:     activeThemeId,
  });
  const [formStep,    setFormStep]    = useState<FormStep>('recipient');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error,       setError]       = useState('');
  const [shaking,     setShaking]     = useState(false);
  const [focused,     setFocused]     = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [aiVibe, setAiVibe] = useState('romantic');
  const [aiKeywords, setAiKeywords] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  const generateAiMessage = async () => {
    if (generating) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: form.partner_name,
          senderName: form.sender_name,
          vibe: aiVibe,
          keywords: aiKeywords,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate message.');
        return;
      }
      if (data.text) {
        setForm((prev) => ({ ...prev, message: data.text }));
        setShowAiHelper(false);
        setTimeout(() => {
          const el = textareaRef.current;
          if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }
        }, 100);
      }
    } catch {
      setError('Connection to AI assistant failed.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (activeThemeId !== form.theme_id) {
      setForm(p => ({ ...p, theme_id: activeThemeId }));
    }
  }, [activeThemeId, form.theme_id]);

  const theme     = getTheme(form.theme_id);
  const stepIndex = STEPS.indexOf(formStep);

  const isDisabled = () => {
    if (formStep === 'recipient') return !form.partner_name.trim();
    if (formStep === 'sender')    return !form.sender_name.trim();
    if (formStep === 'message')   return !form.message.trim();
    return false;
  };

  const next = () => stepIndex < STEPS.length - 1 && setFormStep(STEPS[stepIndex + 1]);
  const back = () => stepIndex > 0 && setFormStep(STEPS[stepIndex - 1]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); if (!isDisabled()) next(); }
  };

  const onTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, message: e.target.value }));
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShaking(true); setTimeout(() => setShaking(false), 420);
    navigator.vibrate?.([30, 50, 30]);
    setSubmitState('submitting'); setError('');
    try {
      const res  = await fetch('/api/moments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setSubmitState('error'); return; }
      router.push(`/create/success?slug=${data.slug}&theme=${form.theme_id}`, {
        transitionTypes: ['nav-forward'],
      });
    } catch { setError('Could not reach the server.'); setSubmitState('error'); }
  };

  const stepV = {
    initial: { opacity: 0, y: 12  },
    animate: { opacity: 1, y: 0,  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  /* ─── shared input underline style ─── */
  const underlineInput =
    'w-full bg-transparent border-b text-center font-display text-3xl sm:text-4xl font-light text-white py-3 focus:outline-none placeholder:text-white/18 transition-all duration-300';

  /* ─── primary pill button style ─── */
  const pillStyle = (disabled = false): React.CSSProperties => ({
    backgroundColor: disabled ? 'rgba(255,255,255,0.07)' : theme.palette.primary,
    boxShadow:       disabled ? 'none' : `0 6px 22px ${theme.palette.primary}45`,
    color:           '#fff',
    transition:      'all 0.3s ease',
  });

  return (
    <motion.div
      animate={shaking ? { x: [-5, 5, -4, 4, 0] } : {}}
      transition={{ duration: 0.35 }}
      className="w-full flex flex-col items-center gap-10"
    >
      {/* ── Progress dots + step label ── */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done   = stepIndex > i;
            const active = formStep === s;
            return (
              <motion.div
                key={s}
                animate={{ width: active ? 36 : 10 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="h-2 rounded-full"
                style={{
                  backgroundColor: done || active ? theme.palette.primary : 'rgba(255,255,255,0.12)',
                  boxShadow: active ? `0 0 14px ${theme.palette.primary}` : 'none',
                }}
              />
            );
          })}
        </div>
        <p
          className="font-body text-[9px] tracking-[0.3em] uppercase transition-colors duration-700"
          style={{ color: theme.palette.primary }}
        >
          {STEP_LABELS[formStep]}
        </p>
      </div>

      {/* ── Step content ── */}
      <form
        onSubmit={submit}
        noValidate
        className="w-full flex flex-col items-center gap-8"
      >
        <AnimatePresence mode="wait">

          {/* Step 1 — Recipient */}
          {formStep === 'recipient' && (
            <motion.div key="recipient" variants={stepV} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center gap-7 w-full text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                Who is this moment for?
              </h2>
              <div className="relative w-full" style={{ maxWidth: 340 }}>
                <input
                  type="text" name="partner_name"
                  value={form.partner_name} onChange={e => setForm(p => ({ ...p, partner_name: e.target.value }))}
                  onKeyDown={onKey} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="Their name" maxLength={50} autoFocus required
                  className={underlineInput}
                  style={{ borderColor: focused ? theme.palette.primary : 'rgba(255,255,255,0.12)' }}
                />
                {/* Glow on focus */}
                {focused && (
                  <motion.div
                    layoutId="input-glow"
                    className="absolute -bottom-px left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${theme.palette.primary}, transparent)` }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Sender */}
          {formStep === 'sender' && (
            <motion.div key="sender" variants={stepV} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center gap-7 w-full text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                Who is sending this moment?
              </h2>
              <div className="relative w-full" style={{ maxWidth: 340 }}>
                <input
                  type="text" name="sender_name"
                  value={form.sender_name} onChange={e => setForm(p => ({ ...p, sender_name: e.target.value }))}
                  onKeyDown={onKey} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="Your name" maxLength={50} autoFocus required
                  className={underlineInput}
                  style={{ borderColor: focused ? theme.palette.primary : 'rgba(255,255,255,0.12)' }}
                />
                {focused && (
                  <motion.div
                    layoutId="input-glow"
                    className="absolute -bottom-px left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${theme.palette.primary}, transparent)` }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3 — Message */}
          {formStep === 'message' && (
            <motion.div key="message" variants={stepV} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center gap-5 w-full text-center"
            >
              <div className="text-center">
                <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight mb-2">
                  Write what your heart says…
                </h2>
                <p className="font-body text-[9px] text-white/30 tracking-wider">
                  Type manually or use our AI assistant to weave your emotions.
                </p>
              </div>

              {/* AI generator toggle */}
              <div className="flex justify-center mb-1">
                <button
                  type="button"
                  onClick={() => setShowAiHelper(!showAiHelper)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full border font-body text-[10px] uppercase tracking-widest transition-all duration-300"
                  style={{
                    background: showAiHelper ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: showAiHelper ? `${theme.palette.primary}50` : 'rgba(255,255,255,0.08)',
                    color: showAiHelper ? '#fff' : 'rgba(255,255,255,0.6)',
                    boxShadow: showAiHelper ? `0 0 15px ${theme.palette.primary}20` : 'none',
                  }}
                >
                  <span>✨ {showAiHelper ? 'Close AI Assistant' : 'Assist with AI'}</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showAiHelper && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full overflow-hidden flex flex-col gap-4 p-5 rounded-2xl border backdrop-blur-md text-left"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      borderColor: `${theme.palette.primary}25`,
                      maxWidth: 440,
                      boxShadow: `0 0 35px ${theme.palette.primary}12`,
                    }}
                  >
                    <div className="flex flex-col gap-2 w-full">
                      <span className="font-body text-[8px] tracking-[0.2em] uppercase text-white/40">Select Vibe</span>
                      <div className="grid grid-cols-4 gap-2 w-full">
                        {['romantic', 'poetic', 'playful', 'deep'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={(e) => { e.preventDefault(); setAiVibe(v); }}
                            className="py-3 rounded-full font-body text-[9px] uppercase tracking-wider transition-all duration-300 border"
                            style={{
                              backgroundColor: aiVibe === v ? theme.palette.primary : 'rgba(255,255,255,0.04)',
                              borderColor: aiVibe === v ? theme.palette.primary : 'rgba(255,255,255,0.08)',
                              color: aiVibe === v ? '#fff' : 'rgba(255,255,255,0.5)',
                              boxShadow: aiVibe === v ? `0 2px 8px ${theme.palette.primary}35` : 'none',
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <span className="font-body text-[8px] tracking-[0.2em] uppercase text-white/40">Memory Prompt / Keywords</span>
                      <input
                        type="text"
                        placeholder="e.g. coffee on a rainy night, first gaze, smile"
                        value={aiKeywords}
                        onChange={(e) => setAiKeywords(e.target.value)}
                        className="w-full bg-transparent border-b text-white font-body text-xs py-2 focus:outline-none placeholder:text-white/20 transition-all duration-300"
                        style={{
                          borderColor: focused ? theme.palette.primary : 'rgba(255,255,255,0.12)',
                        }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={generating}
                      onClick={(e) => { e.preventDefault(); generateAiMessage(); }}
                      className="w-full py-4 rounded-full font-body text-[10px] uppercase tracking-[0.25em] text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: theme.palette.primary,
                        boxShadow: `0 4px 16px ${theme.palette.primary}35`,
                      }}
                    >
                      {generating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Weaving emotions…
                        </>
                      ) : (
                        'Generate Beautiful Message'
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="relative w-full rounded-2xl border backdrop-blur-sm px-6 pt-6 pb-4 transition-all duration-400"
                style={{
                  background:   'rgba(0,0,0,0.25)',
                  borderColor:  `${theme.palette.primary}20`,
                  maxWidth:     440,
                  boxShadow:    `0 0 30px ${theme.palette.primary}10`,
                }}
              >
                <textarea
                  ref={textareaRef}
                  name="message"
                  value={form.message}
                  onChange={onTextarea}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Your love letter starts here…"
                  maxLength={MAX_MESSAGE}
                  autoFocus required
                  style={{
                    lineHeight: '1.9rem',
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.9rem - 1px), rgba(255,255,255,0.04) calc(1.9rem - 1px), rgba(255,255,255,0.04) 1.9rem)',
                    backgroundSize: '100% 1.9rem',
                  }}
                  className="w-full bg-transparent text-white font-display text-xl font-light placeholder:text-white/18 focus:outline-none resize-none min-h-[133px]"
                />
                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2">
                  <span className="font-body text-[9px] tracking-[0.25em] uppercase text-white/25">Love Canvas</span>
                  <span className="font-body text-[9px] text-white/25">{form.message.length} / {MAX_MESSAGE}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Theme */}
          {formStep === 'theme' && (
            <motion.div key="theme" variants={stepV} initial="initial" animate="animate" exit="exit"
              className="w-full"
            >
              <div className="text-center mb-6">
                <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                  Choose the emotional vibe
                </h2>
              </div>
              <ThemeSelector
                selected={form.theme_id}
                onChange={id => { onThemeChange(id); setForm(p => ({ ...p, theme_id: id })); }}
              />
            </motion.div>
          )}

          {/* Step 5 — Confirm */}
          {formStep === 'confirm' && (
            <motion.div key="confirm" variants={stepV} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center gap-6 w-full text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-light text-white leading-tight">
                Ready to seal this?
              </h2>

              {/* Keepsake summary card */}
              <div
                className="w-full rounded-2xl border backdrop-blur-md px-7 py-6 flex flex-col items-center gap-5 relative overflow-hidden"
                style={{
                  background:  'rgba(0,0,0,0.30)',
                  borderColor: `${theme.palette.primary}22`,
                  maxWidth:    360,
                  boxShadow:   `0 0 40px ${theme.palette.primary}12`,
                }}
              >
                <p className="font-body text-[9px] tracking-[0.35em] uppercase text-white/28 w-full text-center border-b border-white/5 pb-4">
                  Keepsake Summary
                </p>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-body text-[8px] tracking-[0.3em] uppercase text-white/28">For</span>
                  <p className="font-display text-2xl text-white font-light">{form.partner_name}</p>
                </div>

                <motion.svg
                  width="20" height="20" viewBox="0 0 24 24"
                  fill={theme.palette.primary}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: `drop-shadow(0 0 8px ${theme.palette.primary})` }}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </motion.svg>

                <div className="flex flex-col items-center gap-1">
                  <span className="font-body text-[8px] tracking-[0.3em] uppercase text-white/28">From</span>
                  <p className="font-display text-xl text-white font-light">{form.sender_name}</p>
                </div>

                <div className="w-full border-t border-white/5 pt-4 flex flex-col items-center gap-1">
                  <span className="font-body text-[8px] tracking-[0.3em] uppercase text-white/28">Atmosphere</span>
                  <p className="font-display text-base font-light flex items-center gap-1.5" style={{ color: theme.palette.accent }}>
                    <span className="text-base leading-none">{THEME_META[form.theme_id]?.emoji ?? '🎨'}</span>
                    {THEME_META[form.theme_id]?.label ?? themes.find(t => t.id === form.theme_id)?.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Primary action — centered pill, auto-width on desktop, wider on mobile */}
          {formStep !== 'confirm' ? (
            <motion.button
              type="button"
              onClick={next}
              disabled={isDisabled()}
              whileHover={!isDisabled() ? { scale: 1.04 } : {}}
              whileTap={!isDisabled() ? { scale: 0.97 } : {}}
              className="px-14 py-4 rounded-full font-body text-[11px] tracking-[0.3em] uppercase disabled:cursor-not-allowed transition-opacity duration-300"
              style={pillStyle(isDisabled())}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button
              id="btn-create-moment"
              type="submit"
              disabled={submitState === 'submitting'}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-14 py-4 rounded-full font-body text-[11px] tracking-[0.3em] uppercase disabled:cursor-not-allowed"
              style={pillStyle(submitState === 'submitting')}
            >
              <AnimatePresence mode="wait">
                {submitState === 'submitting' ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sealing keepsake…
                  </motion.span>
                ) : (
                  <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Release this moment
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Back — ghost text link, only when not on first step */}
          {formStep !== 'recipient' && (
            <button
              type="button"
              onClick={back}
              disabled={submitState === 'submitting'}
              className="font-body text-[9px] tracking-[0.25em] uppercase text-white/28 hover:text-white/55 transition-colors duration-300 disabled:opacity-20 py-1"
            >
              ← Back
            </button>
          )}
        </div>
      </form>

      {/* Error message */}
      <AnimatePresence>
        {submitState === 'error' && error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-body text-xs text-rose-400 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
