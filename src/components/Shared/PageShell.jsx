import { useRef } from 'react';
import { Link } from 'react-router-dom';
import PersistentScene from '../Scene3D/PersistentScene';
import { APP_VERSION_DISPLAY } from '../../lib/version';

/**
 * Wrapper used by all non-home pages.
 * Embeds the same PersistentScene as the home page with the camera frozen
 * on a chosen astre (default = 1 = About/Saturne).
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.label]        - small label shown in topbar (e.g. "03_PROJETS")
 * @param {number} [props.sceneSection] - 0=Hero, 1=About, 2=Skills, 3=Experience,
 *                                        4=Education, 5=Projects, 6=Contact
 */
export default function PageShell({ children, label, sceneSection = 1 }) {
  // Constant ref → PersistentScene's animate() always reads the same index
  // and never triggers a Bezier camera travel.
  const frozenRef = useRef(sceneSection);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050309',
      color: 'rgba(245,239,224,0.9)',
      fontFamily: "'Courier New', monospace",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <PersistentScene activeSectionRef={frozenRef} />

      {/* Soft veil for content readability */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 2,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,3,9,0.55) 80%)',
      }} />

      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 25,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem clamp(1.5rem, 5vw, 2.5rem)',
        borderBottom: '1px solid rgba(212,193,154,0.12)',
        background: 'rgba(5,3,9,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <Link to="/" className="hero-pulse-glow" style={{
          color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
          textDecoration: 'none',
        }}>
          ← PORTFOLIO
        </Link>
        {label && (
          <span style={{
            color: '#ffd97a', fontSize: '0.65rem', letterSpacing: '0.3em',
            textShadow: '0 0 12px rgba(255,217,122,0.5)',
          }}>
            &gt; {label}
          </span>
        )}
      </header>

      {/* Page content — must sit above the scene */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 5,
        marginTop: '4rem',
        padding: '2rem clamp(1.5rem, 5vw, 2.5rem)',
        borderTop: '1px solid rgba(212,193,154,0.1)',
        background: 'rgba(5,3,9,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <span style={{ color: 'rgba(212,193,154,0.55)', fontSize: '0.6rem', letterSpacing: '0.25em' }}>
          {APP_VERSION_DISPLAY} <span style={{ color: '#ffd97a' }}>●</span>
        </span>
        <Link to="/" style={{
          color: 'rgba(245,239,224,0.55)', fontSize: '0.6rem',
          letterSpacing: '0.25em', textDecoration: 'none',
        }}>
          ACCUEIL ↺
        </Link>
      </footer>

      <style>{`
        @keyframes pulseGlow {
          0%,100% { text-shadow: 0 0 8px rgba(212,193,154,0.3); }
          50%     { text-shadow: 0 0 18px rgba(255,217,122,0.7); }
        }
        .hero-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }

        body { margin: 0; background: #050309; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
