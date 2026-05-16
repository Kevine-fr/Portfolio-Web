import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_ABOUT } from '../../data/fallbacks';

/**
 * Render bio text with **double-asterisk** segments highlighted in gold.
 * Returns an array of React children.
 */
function renderBio(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <span key={i} style={{ color: '#ffd97a' }}>
          {m[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function SectionAbout() {
  const intro = useReveal();
  const tline = useReveal();
  const vals  = useReveal();

  const { data, loading } = useFetch('/about', FALLBACK_ABOUT);

  // Sort by `order` if provided
  const timeline = useMemo(
    () => [...(data?.timeline || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data],
  );
  const values = useMemo(
    () => [...(data?.values || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data],
  );

  const title = data?.title || 'Qui suis-je ?';
  const bio   = data?.bio   || '';

  return (
    <section id="about" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>

      {/* Header section */}
      <div ref={intro.ref} style={{
        maxWidth: '600px', marginBottom: '4rem',
        opacity: intro.visible ? 1 : 0,
        transform: intro.visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease',
      }}>
        <p style={{
          color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
          margin: '0 0 1rem', opacity: 0.85,
        }}>
          &gt; 01_ABOUT
        </p>
        <h2 style={{
          margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(212,193,154,0.4))',
        }}>
          {title}
        </h2>
        <p style={{
          color: 'rgba(245,239,224,0.85)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          lineHeight: 1.75, marginTop: '2rem', maxWidth: '550px',
          whiteSpace: 'pre-wrap',
        }}>
          {renderBio(bio)}
        </p>
      </div>

      {/* Layout 2 colonnes : timeline + valeurs */}
      <div className="about-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(2rem, 5vw, 4rem)',
        maxWidth: '1100px',
        width: '100%',
      }}>

        {/* TIMELINE */}
        {timeline.length > 0 && (
          <div ref={tline.ref} style={{
            opacity: tline.visible ? 1 : 0,
            transform: tline.visible ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 1s ease 0.2s',
          }}>
            <h3 style={{
              color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
              margin: '0 0 2rem', fontWeight: 700,
            }}>
              &gt; PARCOURS.LOG
            </h3>
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{
                position: 'absolute', left: '0.3rem', top: '0.3rem', bottom: '0.3rem',
                width: '1px', background: 'linear-gradient(to bottom, rgba(212,193,154,0.6), transparent)',
              }} />
              {timeline.map((item, i) => (
                <div key={i} style={{
                  position: 'relative', marginBottom: '1.5rem',
                  opacity: tline.visible ? 1 : 0,
                  transform: tline.visible ? 'translateX(0)' : 'translateX(-15px)',
                  transition: `all 0.6s ease ${0.4 + i * 0.12}s`,
                }}>
                  <div style={{
                    position: 'absolute', left: '-1.5rem', top: '0.3rem',
                    width: '11px', height: '11px',
                    borderRadius: '50%', background: '#ffd97a',
                    boxShadow: '0 0 12px #ffd97a',
                    border: '2px solid #050309',
                  }} />
                  <div style={{
                    color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.2em',
                    fontWeight: 700,
                  }}>
                    {item.year}
                  </div>
                  <div style={{
                    color: 'rgba(245,239,224,0.95)', fontSize: '0.95rem',
                    marginTop: '0.3rem', fontWeight: 600,
                  }}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div style={{
                      color: 'rgba(245,239,224,0.65)', fontSize: '0.8rem',
                      marginTop: '0.2rem', lineHeight: 1.5,
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VALEURS */}
        {values.length > 0 && (
          <div ref={vals.ref} style={{
            opacity: vals.visible ? 1 : 0,
            transform: vals.visible ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 1s ease 0.4s',
          }}>
            <h3 style={{
              color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
              margin: '0 0 2rem', fontWeight: 700,
            }}>
              &gt; VALEURS.CFG
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {values.map((v, i) => (
                <div key={i}
                  className="value-card"
                  style={{
                    padding: '1.2rem',
                    background: 'rgba(212,193,154,0.04)',
                    border: '1px solid rgba(212,193,154,0.15)',
                    borderRadius: '4px',
                    opacity: vals.visible ? 1 : 0,
                    transform: vals.visible ? 'translateY(0)' : 'translateY(15px)',
                    transition: `all 0.6s ease ${0.6 + i * 0.1}s, background 0.25s, border-color 0.25s`,
                    cursor: 'default',
                  }}>
                  <div style={{
                    color: '#ffd97a', fontSize: '1.5rem', marginBottom: '0.5rem',
                    textShadow: '0 0 15px rgba(255,217,122,0.5)',
                  }}>{v.icon}</div>
                  <div style={{
                    color: 'rgba(245,239,224,0.95)', fontSize: '0.9rem',
                    letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.4rem',
                  }}>{v.title}</div>
                  {v.description && (
                    <div style={{
                      color: 'rgba(245,239,224,0.65)', fontSize: '0.75rem', lineHeight: 1.5,
                    }}>{v.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .value-card:hover {
          background: rgba(212,193,154,0.08) !important;
          border-color: rgba(255,217,122,0.4) !important;
          transform: translateY(-3px) !important;
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
