import type { Metadata } from 'next';
import CreationForm from '@/components/create/CreationForm';

export const metadata: Metadata = {
  title: 'Create a Moment — NeverFades',
  description: 'Craft a cinematic emotional message that fades after 10 views.',
};

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-void relative overflow-hidden">
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(196,18,48,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-crimson mb-5">
            lovethatneverfades
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-white mb-4">
            Seal your moment
          </h1>
          <p className="font-body text-sm text-ash-300 leading-relaxed">
            A single link. Ten views. One emotion that outlasts both.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-charcoal-600" />
          <div className="w-1 h-1 rounded-full bg-crimson" />
          <div className="flex-1 h-px bg-charcoal-600" />
        </div>

        <CreationForm />
      </div>
    </main>
  );
}
