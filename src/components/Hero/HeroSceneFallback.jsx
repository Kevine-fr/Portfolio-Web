import { useEffect, useState } from 'react';

// ─── Hook typing (identique a HeroScene) ─────────────────────────────────────
function useTyping(texts, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = texts[textIndex];
    let t;
    if (!deleting && charIndex < cur.length)        t = setTimeout(() => setCharIndex(c => c + 1), speed);
    else if (!deleting && charIndex === cur.length) t = setTimeout(() => setDeleting(true), 2200);
    else if (deleting && charIndex > 0)             t = setTimeout(() => setCharIndex(c => c - 1), speed / 2);
    else { setDeleting(false); setTextIndex(i => (i + 1) % texts.length); }
    setDisplayed(cur.slice(0, charIndex));
    return () => clearTimeout(t);
  }, [charIndex, deleting, textIndex, texts, speed]);
  return displayed;
}

const ROLES     = ['Developpeur Full-Stack','Architecte Cloud','Passionne 3D & WebGL','Creative Developer'];
const NAV_ITEMS = ['A propos','Projets','Competences','Contact'];

// ─── Genere une nappe d'etoiles SVG (legere, pas de WebGL) ───────────────────
function generateStars(count, seed = 1) {
  // Pseudo-random deterministe pour eviter le flash entre rendus
  let s = seed;
  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x:    random() * 100,
    y:    random() * 100,
    size: 0.5 + random() * 1.8,
    opacity: 0.3 + random() * 0.7,
    delay: random() * 5,
    color: random() < 0.85
      ? '#f5efe0'                  // creme (majorite)
      : random() < 0.5 ? '#d4c19a' // or pale
                       : '#a8c0d8',// bleu pale
  }));
}

const STARS_CLOSE = generateStars(80, 1);
const STARS_FAR   = generateStars(150, 42);

export default function HeroSceneFallback({ onNavigate }) {
  const [loaded, setLoaded] = useState(false);
  const role = useTyping(ROLES, 80);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh',
      background: '#050309', overflow: 'hidden',
      fontFamily: "'Courier New',monospace",
    }}>

      {/* Couche 1 : nebuleuse animee (gradient en mouvement) */}
      <div className="hero-nebula" style={{
        position: 'absolute', inset: '-20%', zIndex: 1,
        background: `
          radial-gradient(ellipse 60% 40% at 30% 50%, rgba(138,111,63,0.18), transparent 60%),
          radial-gradient(ellipse 50% 35% at 70% 40%, rgba(212,193,154,0.12), transparent 65%),
          radial-gradient(ellipse 70% 50% at 50% 70%, rgba(74,55,30,0.15), transparent 70%)
        `,
        filter: 'blur(40px)',
      }} />

      {/* Couche 2 : etoiles lointaines (animation de scintillement) */}
      <svg style={{ position: 'absolute', inset: 0, zIndex: 2 }} width="100%" height="100%">
        {STARS_FAR.map(s => (
          <circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`} r={s.size * 0.6}
            fill={s.color}
            opacity={s.opacity * 0.6}
            style={{ animation: `twinkle 4s ${s.delay}s infinite ease-in-out` }}
          />
        ))}
      </svg>

      {/* Couche 3 : etoiles proches plus brillantes */}
      <svg style={{ position: 'absolute', inset: 0, zIndex: 3 }} width="100%" height="100%">
        {STARS_CLOSE.map(s => (
          <circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`} r={s.size}
            fill={s.color}
            opacity={s.opacity}
            style={{
              animation: `twinkle 3s ${s.delay}s infinite ease-in-out`,
              filter: `drop-shadow(0 0 ${s.size * 2}px ${s.color})`,
            }}
          />
        ))}
      </svg>

      {/* Couche 4 : objet central CSS — torus simule en gradients radiaux */}
      <div style={{
        position: 'absolute',
        right: '15%', top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: 'min(450px, 40vw)',
        height: 'min(450px, 40vw)',
        animation: 'float 6s ease-in-out infinite',
      }}>
        {/* Anneaux orbitaux */}
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />

        {/* Sphere or noir au centre */}
        <div style={{
          position: 'absolute', inset: '25%',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 25%, #d4c19a 0%, #8a6f3f 15%, #0a0810 55%, #050309 100%)
          `,
          boxShadow: `
            inset -20px -20px 60px rgba(0,0,0,0.8),
            inset 15px 15px 40px rgba(212,193,154,0.15),
            0 0 80px rgba(212,193,154,0.2)
          `,
          animation: 'rotate 20s linear infinite',
        }} />
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,3,9,0.75) 100%)',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem',
        borderBottom: '1px solid rgba(212,193,154,0.12)', background: 'rgba(5,3,9,0.6)',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em' }}>[ PORTFOLIO ]</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {NAV_ITEMS.map(item => (
            <span key={item} onClick={() => onNavigate?.(item.toLowerCase())}
              style={{ color: 'rgba(245,239,224,0.42)', fontSize: '0.7rem', letterSpacing: '0.18em', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = '#d4c19a'}
              onMouseLeave={e => e.target.style.color = 'rgba(245,239,224,0.42)'}>
              {item}
            </span>
          ))}
        </div>
      </nav>

      {/* Hero text — IDENTIQUE a la version 3D */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 3rem', maxWidth: '560px',
        opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 1s ease, transform 1s ease',
      }}>

        <p style={{ color: '#d4c19a', fontSize: '0.68rem', letterSpacing: '0.4em', margin: '0 0 1.2rem', opacity: 0.75 }}>
          &gt; INIT_PORTFOLIO_v2.0...
        </p>

        <h1 style={{
          margin: 0, fontSize: 'clamp(3rem,7vw,5.8rem)', fontWeight: 900, lineHeight: 0.95,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.03em',
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(212,193,154,0.35))',
        }}>
          KEVINE<br />
          <span style={{
            background: 'linear-gradient(180deg, #d4c19a 0%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FRAY</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', height: '1.8rem', margin: '1.4rem 0 0.2rem' }}>
          <span style={{ color: '#8a6f3f', fontWeight: 700 }}>//</span>
          <span style={{ color: 'rgba(245,239,224,0.88)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{role}</span>
          <span style={{ color: '#d4c19a', animation: 'blink 0.9s step-end infinite' }}>_</span>
        </div>

        <p style={{ color: 'rgba(245,239,224,0.45)', fontSize: '0.78rem', margin: '1.2rem 0 2rem', lineHeight: 1.85, maxWidth: '360px' }}>
          Experiences web immersives a la croisee du design, de la 3D et de l&apos;ingenierie logicielle.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={() => onNavigate?.('projets')}
            style={{
              padding: '0.7rem 1.6rem', background: 'transparent', border: '1px solid #d4c19a',
              color: '#d4c19a', cursor: 'pointer', fontSize: '0.68rem', letterSpacing: '0.2em',
              fontFamily: "'Courier New',monospace",
            }}>
            [ VOIR PROJETS ]
          </button>
          <button style={{
            padding: '0.7rem 1.6rem',
            background: 'linear-gradient(135deg,#d4c19a 0%,#8a6f3f 100%)',
            border: 'none', color: '#050309', cursor: 'pointer', fontWeight: 700,
            fontSize: '0.68rem', letterSpacing: '0.2em', fontFamily: "'Courier New',monospace",
            boxShadow: '0 0 18px rgba(212,193,154,0.35)',
          }}>
            TELECHARGER CV
          </button>
        </div>

        <div style={{
          display: 'flex', gap: '2.5rem', marginTop: '2.5rem',
          borderTop: '1px solid rgba(245,239,224,0.08)', paddingTop: '1.5rem',
        }}>
          {[['3+', 'ANS XP'], ['20+', 'PROJETS'], ['12+', 'TECHNOS']].map(([v, l]) => (
            <div key={l}>
              <div style={{ color: '#d4c19a', fontSize: '1.5rem', fontWeight: 900, textShadow: '0 0 12px rgba(212,193,154,0.45)' }}>{v}</div>
              <div style={{ color: 'rgba(245,239,224,0.28)', fontSize: '0.6rem', letterSpacing: '0.2em', marginTop: '0.2rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', right: '2.5rem', top: '50%', transform: 'translateY(-50%)',
        zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', opacity: 0.45,
      }}>
        <span style={{ writingMode: 'vertical-rl', color: 'rgba(212,193,154,0.7)', fontSize: '0.58rem', letterSpacing: '0.3em' }}>SCROLL TO EXPLORE</span>
        <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom,rgba(212,193,154,0.7),transparent)' }} />
      </div>

      {/* Status bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 2.5rem',
        borderTop: '1px solid rgba(212,193,154,0.07)', background: 'rgba(5,3,9,0.65)',
      }}>
        <span style={{ color: 'rgba(212,193,154,0.55)', fontSize: '0.6rem', letterSpacing: '0.25em' }}>SYS:READY · LITE MODE</span>
        <span style={{ color: 'rgba(245,239,224,0.14)', fontSize: '0.6rem' }}>CSS RENDERER</span>
        <span style={{ color: 'rgba(138,111,63,0.7)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>FALLBACK v1.0</span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        @keyframes twinkle {
          0%,100% { opacity: var(--o, 1); transform: scale(1); }
          50%     { opacity: 0.2; transform: scale(0.7); }
        }

        @keyframes float {
          0%,100% { transform: translateY(-50%) translateX(0); }
          50%     { transform: translateY(-50%) translateX(-15px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes spin-ring {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to   { transform: rotateX(75deg) rotateZ(360deg); }
        }

        .ring {
          position: absolute;
          left: 50%; top: 50%;
          border-radius: 50%;
          border: 1px solid;
          transform-style: preserve-3d;
        }

        .ring-1 {
          width: 105%; height: 105%;
          margin-left: -52.5%; margin-top: -52.5%;
          border-color: rgba(212,193,154,0.45);
          animation: spin-ring 12s linear infinite;
        }
        .ring-2 {
          width: 130%; height: 130%;
          margin-left: -65%; margin-top: -65%;
          border-color: rgba(138,111,63,0.35);
          animation: spin-ring 18s linear infinite reverse;
        }
        .ring-3 {
          width: 160%; height: 160%;
          margin-left: -80%; margin-top: -80%;
          border-color: rgba(245,239,224,0.18);
          animation: spin-ring 25s linear infinite;
        }

        .hero-nebula {
          animation: float 20s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
