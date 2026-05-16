export default function TechBadge({ children, variant = 'default' }) {
  const palettes = {
    default: {
      bg: 'rgba(212,193,154,0.08)',
      border: 'rgba(212,193,154,0.2)',
      color: '#d4c19a',
    },
    accent: {
      bg: 'rgba(255,217,122,0.1)',
      border: 'rgba(255,217,122,0.35)',
      color: '#ffd97a',
    },
  };
  const p = palettes[variant] || palettes.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      background: p.bg,
      border: `1px solid ${p.border}`,
      color: p.color,
      fontSize: '0.6rem',
      letterSpacing: '0.1em',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}
