import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_EDUCATION } from '../../data/fallbacks';

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

function EducationCard({ edu, delay }) {
  const { ref, visible } = useReveal(0.1);
  const start = fmt(edu.startDate);
  const end   = fmt(edu.endDate) || 'présent';

  return (
    <div ref={ref}
      className="edu-home-card"
      style={{
        padding: '1.4rem 1.5rem',
        background: 'rgba(15,10,22,0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(212,193,154,0.22)',
        borderRadius: '4px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.8s ease ${delay}s, background 0.25s, border-color 0.25s, transform 0.25s`,
      }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem',
        marginBottom: '0.5rem',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: 'rgba(245,239,224,0.96)',
            fontSize: '1rem',
            fontWeight: 700,
          }}>
            {edu.degree}
            {edu.field && (
              <span style={{ color: '#d4c19a', fontWeight: 500 }}> · {edu.field}</span>
            )}
          </h3>
          <p style={{
            margin: '0.2rem 0 0',
            color: '#ffd97a',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
          }}>
            {edu.school}
            {edu.location && <span style={{ color: 'rgba(212,193,154,0.6)' }}> · {edu.location}</span>}
          </p>
        </div>
        <span style={{
          color: 'rgba(212,193,154,0.85)',
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          whiteSpace: 'nowrap',
        }}>
          {start} → {end}
        </span>
      </div>

      {edu.description && (
        <p style={{
          color: 'rgba(245,239,224,0.78)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          margin: '0.4rem 0 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{edu.description}</p>
      )}
    </div>
  );
}

export default function SectionEducation() {
  const header = useReveal();
  const { data, loading } = useFetch('/education', FALLBACK_EDUCATION);

  const items = useMemo(() => {
    return [...(data || [])]
      .sort((a, b) => getYear(b.startDate) - getYear(a.startDate))
      .slice(0, 3);
  }, [data]);

  const total = (data || []).length;

  return (
    <section id="education" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div ref={header.ref} style={{
          maxWidth: '600px', marginLeft: 'auto', marginRight: 0,
          marginBottom: '3rem', textAlign: 'right',
          opacity: header.visible ? 1 : 0,
          transform: header.visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease',
        }}>
          <p style={{
            color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
            margin: '0 0 1rem', opacity: 0.9,
            textShadow: '0 0 14px rgba(255,217,122,0.5)',
          }}>
            05_PARCOURS &lt;
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
            Systeme<br />solaire
          </h2>
          <p style={{
            color: 'rgba(245,239,224,0.78)',
            fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
            lineHeight: 1.7,
            marginTop: '1.5rem',
            marginLeft: 'auto',
            maxWidth: '500px',
          }}>
            Le savoir comme un soleil — chaque planete une etape de
            formation qui orbite autour de la connaissance fondamentale.
          </p>
        </div>

        {loading && !data ? (
          <p style={{ color: 'rgba(212,193,154,0.6)', fontSize: '0.7rem', letterSpacing: '0.3em', textAlign: 'right' }}>
            CHARGEMENT…
          </p>
        ) : items.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <p style={{
              color: 'rgba(245,239,224,0.6)',
              fontSize: '0.85rem',
              padding: '2rem',
              background: 'rgba(15,10,22,0.6)',
              border: '1px dashed rgba(212,193,154,0.2)',
              borderRadius: '4px',
              maxWidth: '500px',
            }}>
              Aucune formation enregistree pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div className="edu-home-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              maxWidth: '780px',
              width: '100%',
              marginLeft: 'auto',
            }}>
              {items.map((edu, i) => (
                <EducationCard key={edu._id || i} edu={edu} delay={i * 0.12} />
              ))}
            </div>

            {total > items.length && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <Link to="/parcours" style={{
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
                  ← EXPLORER LE SYSTEME ({total})
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .edu-home-card:hover {
          background: rgba(20,14,28,0.88) !important;
          border-color: rgba(255,217,122,0.5) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 30px rgba(212,193,154,0.15);
        }
      `}</style>
    </section>
  );
}
