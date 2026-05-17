import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const EXTRA_LINKS = [
  { to: '/projets',     label: 'PROJETS' },
  { to: '/experiences', label: 'EXPERIENCES' },
  { to: '/parcours',    label: 'FORMATION' },
];

export default function GlobalNav({ sections, activeId, onNavigate }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      setScrollProgress(Math.min(scrolled, 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 2.5rem',
        borderBottom: '1px solid rgba(212,193,154,0.12)',
        background: 'rgba(5,3,9,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <span
          className="hero-pulse-glow"
          onClick={() => onNavigate('hero')}
          style={{
            color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
            cursor: 'pointer',
          }}>
          PORTFOLIO
        </span>

        {/* Desktop nav — anchor sections + extra route links */}
        <div className="nav-desktop" style={{ display: 'flex', gap: '1.6rem', alignItems: 'center' }}>
          {sections
            .slice(1)
            .filter(s => s.id !== 'experience' && s.id !== 'education')
            .map(s => {
            const active = s.id === activeId;
            return (
              <span
                key={s.id}
                className="hero-nav-item"
                onClick={() => onNavigate(s.id)}
                style={{
                  color: active ? '#ffd97a' : 'rgba(245,239,224,0.55)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  position: 'relative',
                  textShadow: active ? '0 0 12px rgba(255,217,122,0.6)' : 'none',
                }}>
                {s.label}
                {active && <span style={{
                  position: 'absolute', bottom: '-6px', left: 0, right: 0,
                  height: '1px', background: '#ffd97a',
                  boxShadow: '0 0 8px #ffd97a',
                }} />}
              </span>
            );
          })}

          {/* Visual separator */}
          <span style={{
            width: '1px', height: '14px',
            background: 'rgba(212,193,154,0.25)',
          }} />

          {EXTRA_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="hero-nav-item"
              style={{
                color: 'rgba(212,193,154,0.7)',
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}>
              {link.label}↗
            </Link>
          ))}
        </div>

        {/* Mobile burger */}
        <button
          className="nav-burger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          style={{
            display: 'none',
            background: 'transparent', border: '1px solid #d4c19a',
            color: '#d4c19a', padding: '0.4rem 0.8rem',
            fontSize: '0.7rem', cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.2em',
          }}>
          {mobileOpen ? '×' : '☰'}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 19,
          background: 'rgba(5,3,9,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem',
        }}>
          {sections.slice(1).map(s => {
            const active = s.id === activeId;
            return (
              <span key={s.id}
                onClick={() => { onNavigate(s.id); setMobileOpen(false); }}
                style={{
                  color: active ? '#ffd97a' : 'rgba(245,239,224,0.7)',
                  fontSize: '1.1rem', letterSpacing: '0.3em',
                  cursor: 'pointer',
                  textShadow: active ? '0 0 15px rgba(255,217,122,0.6)' : 'none',
                }}>
                {s.label}
              </span>
            );
          })}

          <span style={{
            width: '40px', height: '1px',
            background: 'rgba(212,193,154,0.3)',
            margin: '0.5rem 0',
          }} />

          {EXTRA_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'rgba(212,193,154,0.85)',
                fontSize: '0.95rem', letterSpacing: '0.3em',
                textDecoration: 'none',
              }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Barre de progression du scroll */}
      <div style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        height: '1px', zIndex: 20, background: 'rgba(212,193,154,0.08)',
      }}>
        <div style={{
          height: '100%',
          width: `${scrollProgress * 100}%`,
          background: 'linear-gradient(90deg, #d4c19a, #ffd97a)',
          boxShadow: '0 0 10px #ffd97a',
          transition: 'width 0.1s linear',
        }} />
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%,100% { text-shadow: 0 0 8px rgba(212,193,154,0.3); }
          50%     { text-shadow: 0 0 18px rgba(255,217,122,0.7); }
        }
        .hero-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }

        .hero-nav-item:hover {
          color: #d4c19a !important;
        }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: block !important; }
        }
      `}</style>
    </>
  );
}
