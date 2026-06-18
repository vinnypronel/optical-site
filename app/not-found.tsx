import Link from 'next/link';
import { BUSINESS } from '@/lib/business';

export default function NotFound() {
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
        404 — Page Not Found
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display), serif',
          fontWeight: 400,
          fontSize: 'clamp(40px, 8vw, 88px)',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
        }}
      >
        Out of focus.
      </h1>
      <p style={{ color: 'var(--ink-dim)', maxWidth: '420px', lineHeight: 1.6 }}>
        We couldn&apos;t find that page. It may have moved, or never existed.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            border: '1px solid var(--ink)',
            borderRadius: '999px',
            padding: '12px 28px',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Back to Home
        </Link>
        <a
          href={BUSINESS.phoneHref}
          style={{
            border: '1px solid var(--rule)',
            borderRadius: '999px',
            padding: '12px 28px',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Call {BUSINESS.phone}
        </a>
      </div>
    </main>
  );
}
