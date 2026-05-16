export default function Loader({ label = 'CHARGEMENT' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1rem', padding: '4rem 1rem',
    }}>
      <div className="cosmic-loader" />
      <span style={{
        color: 'rgba(212,193,154,0.7)',
        fontSize: '0.65rem', letterSpacing: '0.35em',
      }}>{label}…</span>
      <style>{`
        @keyframes cosmic-spin {
          0%   { transform: rotate(0deg) scale(0.8); opacity: 0.5; }
          50%  { transform: rotate(180deg) scale(1.1); opacity: 1; }
          100% { transform: rotate(360deg) scale(0.8); opacity: 0.5; }
        }
        .cosmic-loader {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffd97a 0%, #8a6f3f 70%, transparent 100%);
          box-shadow: 0 0 25px rgba(255,217,122,0.6);
          animation: cosmic-spin 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
