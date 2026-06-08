export default function MomentLoading() {
  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center gap-8 relative overflow-hidden px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 58% 46% at 50% 48%, rgba(196,18,48,0.08) 0%, rgba(196,18,48,0.025) 42%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-70"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(196,18,48,0.22), rgba(255,255,255,0.12), rgba(196,18,48,0.22), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-7 text-center">
        <div className="moment-loader-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-body text-[10px] tracking-[0.38em] uppercase text-ash-400">
            A moment is unfolding...
          </p>
          <p className="font-display text-sm text-white/20 italic font-light">
            Something was created just for you
          </p>
        </div>
      </div>
    </main>
  );
}
