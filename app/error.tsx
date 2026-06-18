'use client';

import { useEffect } from 'react';
import { BUSINESS } from '@/lib/business';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        gap: '20px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans), sans-serif',
          fontSize: '11px',
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}
      >
        Something went wrong
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display), serif',
          fontWeight: 400,
          fontSize: 'clamp(36px, 7vw, 72px)',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
        }}
      >
        A momentary blur.
      </h1>
      <p style={{ color: 'var(--ink-dim)', maxWidth: '420px', lineHeight: 1.6 }}>
        Please try again. If it persists, reach us directly at {BUSINESS.phone}.
      </p>
      <button
        onClick={reset}
        style={{
          border: '1px solid var(--ink)',
          borderRadius: '999px',
          padding: '12px 28px',
          fontSize: '12px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </main>
  );
}
