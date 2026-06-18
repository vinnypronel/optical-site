export default function Loading() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <span
        style={{
          fontFamily: 'var(--font-display), serif',
          fontSize: '22px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      >
        Avenue <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Eyewear</em>
      </span>
    </main>
  );
}
