import { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { resolveMediaUrl } from '../../lib/api';
import { FALLBACK_ABOUT } from '../../data/fallbacks';

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

function useCounter(target, duration = 2000, startDelay = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.floor(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick); else setValue(target);
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);
    return () => { clearTimeout(t0); cancelAnimationFrame(raf); };
  }, [target, duration, startDelay]);
  return value;
}

function useGlitch(intervalMs = 7000) {
  const [glitching, setGlitching] = useState(false);
  useEffect(() => {
    const trigger = () => { setGlitching(true); setTimeout(() => setGlitching(false), 250); };
    const i = setInterval(trigger, intervalMs + Math.random() * 3000);
    return () => clearInterval(i);
  }, [intervalMs]);
  return glitching;
}

const ROLES = ['Developpeur Full-Stack','Architecte Cloud','Passionne 3D & WebGL','Creative Developer'];

export default function SectionHero({ onNavigate }) {
  const [loaded, setLoaded] = useState(false);
  const role = useTyping(ROLES, 80);
  const glitching = useGlitch(7000);
  const xp     = useCounter(3,  1500, 800);
  const proj   = useCounter(20, 2000, 1000);
  const techno = useCounter(12, 1800, 1200);

  // CV download from About endpoint
  const { data: about } = useFetch('/about', FALLBACK_ABOUT);
  const cvHref = resolveMediaUrl(about?.cvUrl);
  const cvFilename = about?.cvFilename || (about?.cvUrl ? 'CV.pdf' : '');

  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '0 clamp(1.5rem, 5vw, 3rem)',
      paddingTop: '5rem',
    }}>
      {/* Scanline qui balaye */}
      <div className="hero-scan-sweep" />

      <div style={{
        maxWidth: '600px', width: '100%',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(14px)',
        transition: 'all 1s ease',
      }}>

        <p style={{
          color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
          margin: '0 0 1.2rem', opacity: 0.85,
          transform: loaded ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'all 0.8s ease 0.2s',
        }}>
          &gt; PORTFOLIO_v2.1.0
        </p>

        <h1
          className={glitching ? 'hero-glitch' : ''}
          style={{
            margin: 0, fontSize: 'clamp(2.8rem,7vw,5.8rem)', fontWeight: 900, lineHeight: 0.95,
            fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(212,193,154,0.5))',
        }}>
          Kevine<br />
          <span style={{ background: 'linear-gradient(180deg, #d4c19a 0%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DIANTOUADI</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', height: '1.8rem', margin: '1.4rem 0 0.2rem' }}>
          <span style={{ color: '#8a6f3f', fontWeight: 700 }}>//</span>
          <span style={{ color: 'rgba(245,239,224,0.95)', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', letterSpacing: '0.05em' }}>{role}</span>
          <span style={{ color: '#ffd97a', animation: 'blink 0.9s step-end infinite' }}>_</span>
        </div>

        <p style={{
          color: 'rgba(245,239,224,0.75)',
          fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
          margin: '1.2rem 0 2rem', lineHeight: 1.7, maxWidth: '430px',
        }}>
          Experiences web immersives a la croisee du design, de la 3D
          et de l&apos;ingenierie logicielle.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate?.('projects')}
            className="hero-btn-outline"
            style={{
              padding: '0.8rem 1.6rem', background: 'transparent', border: '1px solid #d4c19a',
              color: '#d4c19a', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.2em',
              fontFamily: "'Courier New',monospace", position: 'relative', overflow: 'hidden',
            }}>
            VOIR PROJETS
          </button>
          {cvHref && (
            <a
              href={cvHref}
              download={cvFilename}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-solid"
              style={{
                padding: '0.8rem 1.6rem',
                background: 'linear-gradient(135deg,#d4c19a 0%,#8a6f3f 100%)',
                border: 'none', color: '#050309', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.7rem', letterSpacing: '0.2em', fontFamily: "'Courier New',monospace",
                boxShadow: '0 0 18px rgba(212,193,154,0.45)', position: 'relative', overflow: 'hidden',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}>
              TELECHARGER CV ↓
            </a>
          )}
        </div>

        <div style={{
          display: 'flex', gap: 'clamp(1.5rem, 4vw, 2.5rem)', marginTop: '2.5rem',
          borderTop: '1px solid rgba(245,239,224,0.12)', paddingTop: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {[[xp,'ANS XP'],[proj,'PROJETS'],[techno,'TECHNOS']].map(([v,l]) => (
            <div key={l}>
              <div style={{
                color: '#ffd97a', fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', fontWeight: 900,
                textShadow: '0 0 12px rgba(255,217,122,0.6)',
              }}>{v}+</div>
              <div style={{
                color: 'rgba(245,239,224,0.55)', fontSize: '0.6rem',
                letterSpacing: '0.2em', marginTop: '0.3rem',
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator (desktop only) */}
      <div className="scroll-indicator" style={{
        position: 'absolute', right: '2.5rem', top: '50%',
        transform: 'translateY(-50%)', zIndex: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.6rem', opacity: 0.55,
      }}>
        <span style={{
          writingMode: 'vertical-rl', color: 'rgba(212,193,154,0.85)',
          fontSize: '0.6rem', letterSpacing: '0.3em',
        }}>SCROLLER POUR EXPLORER</span>
        <div className="hero-scroll-line" />
      </div>

      <style>{`
        @keyframes scanSweep {
          0%   { top: -10%; opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.5; }
          100% { top: 110%; opacity: 0; }
        }
        .hero-scan-sweep {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,217,122,0.6), transparent);
          z-index: 4; pointer-events: none;
          animation: scanSweep 8s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(255,217,122,0.3);
        }

        @keyframes glitchAnim {
          0%   { transform: translate(0); }
          20%  { transform: translate(-2px, 1px); filter: drop-shadow(2px 0 0 #ffd97a) drop-shadow(-2px 0 0 #8a6f3f); }
          40%  { transform: translate(2px, -1px); filter: drop-shadow(-2px 0 0 #ffd97a) drop-shadow(2px 0 0 #8a6f3f); }
          60%  { transform: translate(-1px, 0); }
          80%  { transform: translate(1px, 0); }
          100% { transform: translate(0); filter: drop-shadow(0 0 30px rgba(212,193,154,0.5)); }
        }
        .hero-glitch { animation: glitchAnim 0.25s steps(5) !important; }

        .hero-btn-outline::before, .hero-btn-solid::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: left 0.6s ease;
        }
        .hero-btn-outline:hover::before, .hero-btn-solid:hover::before { left: 100%; }
        .hero-btn-outline:hover { background: rgba(212,193,154,0.1) !important; }
        .hero-btn-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 25px rgba(212,193,154,0.6) !important;
        }
        .hero-btn-solid { transition: all 0.3s ease !important; }

        @keyframes scrollPulse {
          0%,100% { background-position: 0 -80px; }
          50%     { background-position: 0 0; }
        }
        .hero-scroll-line {
          width: 1px; height: 80px;
          background: linear-gradient(to bottom, rgba(212,193,154,0.85) 0%, rgba(212,193,154,0.85) 50%, transparent 50%, transparent 100%);
          background-size: 100% 160px;
          animation: scrollPulse 2.5s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .scroll-indicator { display: none !important; }
        }
      `}</style>
    </section>
  );
}
