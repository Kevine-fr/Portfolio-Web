import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_EXPERIENCES } from '../../data/fallbacks';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function fmt(d) {
  if (!d) return '';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '';
  return `${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}
function getYear(d) {
  if (!d) return 0;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? 0 : x.getFullYear();
}

function ExperienceCard({ exp, delay }) {
  const { ref, visible } = useReveal(0.1);
  const start = fmt(exp.startDate);
  const end   = exp.current ? "aujourd'hui" : fmt(exp.endDate);

  return (
    <div ref={ref}
      className="exp-home-card"
      style={{
        padding: '1.4rem 1.5rem',
        background: 'rgba(15,10,22,0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,217,122,0.18)',
        borderRadius: '4px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.8s ease ${delay}s, background 0.25s, border-color 0.25s, transform 0.25s`,
        position: 'relative',
      }}>
      {exp.current && (
        <div style={{
          position: 'absolute', top: '0.8rem', right: '0.8rem',
          fontSize: '0.55rem', letterSpacing: '0.2em',
          color: '#7cc97c',
          padding: '0.2rem 0.5rem',
          border: '1px solid rgba(124,201,124,0.5)',
          borderRadius: '2px',
          background: 'rgba(5,3,9,0.6)',
        }}>
          EN_COURS ●
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem',
        marginBottom: '0.5rem', paddingRight: exp.current ? '5rem' : 0,
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: 'rgba(245,239,224,0.96)',
            fontSize: '1rem',
            fontWeight: 700,
          }}>{exp.title}</h3>
          <p style={{
            margin: '0.2rem 0 0',
            color: '#ffd97a',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
          }}>
            {exp.company}
            {exp.location && <span style={{ color: 'rgba(212,193,154,0.6)' }}> · {exp.location}</span>}
          </p>
        </div>
        <span style={{
          color: exp.current ? '#ffd97a' : 'rgba(212,193,154,0.7)',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          whiteSpace: 'nowrap',
        }}>
          {start} → {end}
        </span>
      </div>

      {exp.description && (
        <p style={{
          color: 'rgba(245,239,224,0.78)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          margin: '0.4rem 0 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{exp.description}</p>
      )}

      {exp.techStack && exp.techStack.length > 0 && (
        <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {exp.techStack.slice(0, 5).map(t => (
            <span key={t} style={{
              padding: '0.18rem 0.5rem',
              background: 'rgba(255,217,122,0.08)',
              border: '1px solid rgba(255,217,122,0.25)',
              color: '#ffd97a',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              borderRadius: '2px',
            }}>{t}</span>
          ))}
          {exp.techStack.length > 5 && (
            <span style={{
              padding: '0.18rem 0.4rem',
              color: 'rgba(212,193,154,0.5)',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
            }}>+{exp.techStack.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function SectionExperience() {
  const header = useReveal();
  const { data, loading } = useFetch('/experiences', FALLBACK_EXPERIENCES);

  // Latest first: current jobs on top, then by start date desc
  const items = useMemo(() => {
    return [...(data || [])]
      .sort((a, b) => {
        if (a.current !== b.current) return a.current ? -1 : 1;
        return getYear(b.startDate) - getYear(a.startDate);
      })
      .slice(0, 3);
  }, [data]);

  const total = (data || []).length;

  return (
    <section id="experience" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div ref={header.ref} style={{
          maxWidth: '600px', marginBottom: '3rem',
          opacity: header.visible ? 1 : 0,
          transform: header.visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease',
        }}>
          <p style={{
            color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
            margin: '0 0 1rem', opacity: 0.9,
            textShadow: '0 0 14px rgba(255,217,122,0.6)',
          }}>
            &gt; 04_EXPERIENCES
          </p>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1,
            fontFamily: "'Arial Black',sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px rgba(212,193,154,0.4))',
          }}>
            Danse<br />orbitale
          </h2>
          <p style={{
            color: 'rgba(245,239,224,0.78)',
            fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
            lineHeight: 1.7,
            marginTop: '1.5rem',
            maxWidth: '500px',
          }}>
            Chaque mission, une planete en orbite. Trois corps en
            mouvement perpetuel — un equilibre qui se construit, se
            maintient, mais jamais ne se fige.
          </p>
        </div>

        {loading && !data ? (
          <p style={{ color: 'rgba(212,193,154,0.6)', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
            CHARGEMENT…
          </p>
        ) : items.length === 0 ? (
          <p style={{
            color: 'rgba(245,239,224,0.6)',
            fontSize: '0.85rem',
            padding: '2rem',
            background: 'rgba(15,10,22,0.6)',
            border: '1px dashed rgba(212,193,154,0.2)',
            borderRadius: '4px',
            maxWidth: '500px',
          }}>
            Aucune experience enregistree pour le moment.
          </p>
        ) : (
          <>
            <div className="exp-home-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              maxWidth: '780px',
              width: '100%',
            }}>
              {items.map((exp, i) => (
                <ExperienceCard key={exp._id || i} exp={exp} delay={i * 0.12} />
              ))}
            </div>

            {total > items.length && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <Link to="/experiences" style={{
                  alignSelf: 'flex-start',
                  marginTop: '2rem',
                  padding: '0.8rem 1.6rem',
                  border: '1px solid rgba(255,217,122,0.45)',
                  color: '#ffd97a',
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  boxShadow: '0 0 20px rgba(255,217,122,0.18)',
                  background: 'rgba(5,3,9,0.5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,217,122,0.12)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255,217,122,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(5,3,9,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255,217,122,0.18)';
                }}>
                  EXPLORER TOUTES LES ORBITES ({total}) →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .exp-home-card:hover {
          background: rgba(20,14,28,0.88) !important;
          border-color: rgba(255,217,122,0.5) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 30px rgba(255,217,122,0.15);
        }
      `}</style>
    </section>
  );
}
