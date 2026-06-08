'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ThemeSelector from './ThemeSelector';

interface FormState {
  partner_name: string;
  sender_name: string;
  message: string;
  theme_id: string;
}

const MAX_MESSAGE = 500;

export default function CreationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    partner_name: '',
    sender_name: '',
    message: '',
    theme_id: 'romantic-roses',
  });
  const [step, setStep] = useState<'form' | 'submitting' | 'error'>('form');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
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
        setStep('error');
        return;
      }

      router.push(`/create/success?slug=${data.slug}`);
    } catch {
      setError('Could not reach the server. Please try again.');
      setStep('error');
    }
  };

  const inputClass =
    'w-full bg-charcoal-800 border border-charcoal-600 text-white font-body text-sm px-4 py-3 focus:outline-none focus:border-crimson transition-colors duration-300 placeholder:text-ash-400';

  const labelClass =
    'font-body text-xs tracking-[0.2em] uppercase text-ash-300 mb-1.5 block';

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
      noValidate
    >
      {/* Partner Nickname */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <label htmlFor="partner_name" className={labelClass}>
          Their name or nickname
        </label>
        <input
          id="partner_name"
          name="partner_name"
          type="text"
          required
          maxLength={60}
          placeholder="The one who will receive this"
          value={form.partner_name}
          onChange={handleChange}
          className={inputClass}
        />
      </motion.div>

      {/* Sender Name */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <label htmlFor="sender_name" className={labelClass}>
          Your name
        </label>
        <input
          id="sender_name"
          name="sender_name"
          type="text"
          required
          maxLength={60}
          placeholder="Sign your moment"
          value={form.sender_name}
          onChange={handleChange}
          className={inputClass}
        />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex justify-between items-end mb-1.5">
          <label htmlFor="message" className={labelClass}>
            Your message
          </label>
          <span className="font-body text-xs text-ash-400">
            {form.message.length}/{MAX_MESSAGE}
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          ref={textareaRef}
          required
          maxLength={MAX_MESSAGE}
          rows={5}
          placeholder="Write what your heart means to say…"
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <ThemeSelector
          selected={form.theme_id}
          onChange={(id) => setForm((prev) => ({ ...prev, theme_id: id }))}
        />
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {step === 'error' && error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-body text-sm text-rose-light"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <button
          id="btn-create-moment"
          type="submit"
          disabled={step === 'submitting'}
          className="group relative w-full py-4 bg-crimson text-white font-body text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:bg-rose glow-crimson disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {step === 'submitting' ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your moment…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Seal this Moment
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <p className="font-body text-xs text-ash-400 text-center mt-4">
          This link will exist for exactly 10 views.
        </p>
      </motion.div>
    </motion.form>
  );
}
