import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_EXPERIENCES, FALLBACK_EDUCATION } from '../../data/fallbacks';
import PageShell from '../Shared/PageShell';
import Loader from '../Shared/Loader';
import TechBadge from '../Shared/TechBadge';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getYear(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? 0 : d.getFullYear();
}

function ExperienceItem({ exp, index }) {
  const { ref, visible } = useReveal(0.1);
  const start = fmt(exp.startDate);
  const end   = exp.current ? "aujourd'hui" : fmt(exp.endDate);

  return (
    <div ref={ref} style={{
      position: 'relative',
      paddingLeft: '2rem',
      paddingBottom: '2.5rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-15px)',
      transition: `all 0.6s ease ${index * 0.08}s`,
    }}>
      {/* Bullet on line */}
      <div style={{
        position: 'absolute', left: 0, top: '0.4rem',
        width: '13px', height: '13px',
        borderRadius: '50%',
        background: exp.current ? '#ffd97a' : '#8a6f3f',
        boxShadow: exp.current ? '0 0 14px #ffd97a' : '0 0 8px rgba(212,193,154,0.4)',
        border: '2px solid #050309',
        transform: 'translateX(-50%)',
      }} />

      <div style={{
        background: 'rgba(15,10,22,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(212,193,154,0.15)',
        borderRadius: '4px',
        padding: '1.2rem 1.4rem',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem',
          marginBottom: '0.5rem',
        }}>
          <div>
            <h3 style={{
              margin: 0,
              color: 'rgba(245,239,224,0.95)',
              fontSize: '1rem',
              fontWeight: 700,
            }}>{exp.title}</h3>
            <p style={{
              margin: '0.2rem 0 0',
              color: '#d4c19a',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
            }}>
              {exp.company}
              {exp.location && <span style={{ color: 'rgba(212,193,154,0.6)' }}> · {exp.location}</span>}
            </p>
          </div>
          <span style={{
            color: exp.current ? '#ffd97a' : 'rgba(212,193,154,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            whiteSpace: 'nowrap',
          }}>
            {start} → {end}
          </span>
        </div>

        {exp.description && (
          <p style={{
            color: 'rgba(245,239,224,0.8)',
            fontSize: '0.85rem',
            lineHeight: 1.65,
            margin: '0.5rem 0',
          }}>{exp.description}</p>
        )}

        {exp.achievements && exp.achievements.length > 0 && (
          <ul style={{
            margin: '0.7rem 0 0',
            paddingLeft: '1.2rem',
            color: 'rgba(245,239,224,0.75)',
            fontSize: '0.8rem',
            lineHeight: 1.65,
          }}>
            {exp.achievements.map((a, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{a}</li>)}
          </ul>
        )}

        {exp.techStack && exp.techStack.length > 0 && (
          <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {exp.techStack.map(t => <TechBadge key={t}>{t}</TechBadge>)}
          </div>
        )}
      </div>
    </div>
  );
}

function EducationItem({ edu, index }) {
  const { ref, visible } = useReveal(0.1);
  const start = fmt(edu.startDate);
  const end   = fmt(edu.endDate) || 'présent';

  return (
    <div ref={ref} style={{
      position: 'relative',
      paddingLeft: '2rem',
      paddingBottom: '2.5rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-15px)',
      transition: `all 0.6s ease ${index * 0.08}s`,
    }}>
      <div style={{
        position: 'absolute', left: 0, top: '0.4rem',
        width: '13px', height: '13px',
        borderRadius: '2px',
        background: '#d4c19a',
        boxShadow: '0 0 8px rgba(212,193,154,0.4)',
        border: '2px solid #050309',
        transform: 'translateX(-50%) rotate(45deg)',
      }} />

      <div style={{
        background: 'rgba(15,10,22,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(212,193,154,0.15)',
        borderRadius: '4px',
        padding: '1.2rem 1.4rem',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem',
          marginBottom: '0.5rem',
        }}>
          <div>
            <h3 style={{
              margin: 0,
              color: 'rgba(245,239,224,0.95)',
              fontSize: '1rem',
              fontWeight: 700,
            }}>
              {edu.degree}
              {edu.field && <span style={{ color: '#d4c19a', fontWeight: 500 }}> · {edu.field}</span>}
            </h3>
            <p style={{
              margin: '0.2rem 0 0',
              color: '#d4c19a',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
            }}>
              {edu.school}
              {edu.location && <span style={{ color: 'rgba(212,193,154,0.6)' }}> · {edu.location}</span>}
            </p>
          </div>
          <span style={{
            color: 'rgba(212,193,154,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            whiteSpace: 'nowrap',
          }}>
            {start} → {end}
          </span>
        </div>

        {edu.description && (
          <p style={{
            color: 'rgba(245,239,224,0.78)',
            fontSize: '0.85rem',
            lineHeight: 1.65,
            margin: '0.5rem 0 0',
          }}>{edu.description}</p>
        )}
      </div>
    </div>
  );
}

export default function JourneyPage() {
  const { data: experiences, loading: l1 } = useFetch('/experiences', FALLBACK_EXPERIENCES);
  const { data: education,   loading: l2 } = useFetch('/education',   FALLBACK_EDUCATION);

  const sortedExp = useMemo(() => {
    return [...(experiences || [])].sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return getYear(b.startDate) - getYear(a.startDate);
    });
  }, [experiences]);

  const sortedEdu = useMemo(() => {
    return [...(education || [])].sort((a, b) => getYear(b.startDate) - getYear(a.startDate));
  }, [education]);

  const header = useReveal();

  return (
    <PageShell label="PARCOURS">
      <section style={{
        padding: 'clamp(2rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem)',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <div ref={header.ref} style={{
          marginBottom: '3rem',
          opacity: header.visible ? 1 : 0,
          transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease',
        }}>
          <p style={{
            color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.35em',
            margin: '0 0 1rem',
            textShadow: '0 0 12px rgba(255,217,122,0.5)',
          }}>
            &gt; TRAJECTOIRE
          </p>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1,
            fontFamily: "'Arial Black',sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(212,193,154,0.4))',
          }}>
            Parcours<br />professionnel
          </h1>
          <p style={{
            color: 'rgba(245,239,224,0.75)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            marginTop: '1.5rem',
            maxWidth: '550px',
          }}>
            Etapes d'apprentissage et orbites professionnelles —
            chaque experience une nouvelle galaxie d'expertise.
          </p>
        </div>

        {/* EXPERIENCES */}
        {(l1 && !experiences) ? <Loader label="ANALYSE DES TRAJECTOIRES" /> : (
          sortedExp.length > 0 && (
            <section style={{ marginBottom: '4rem' }}>
              <h2 style={{
                color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.35em',
                margin: '0 0 2rem', fontWeight: 700,
              }}>
                &gt; EXPERIENCES.LOG ({sortedExp.length})
              </h2>
              <div style={{
                position: 'relative',
                paddingLeft: '0.5rem',
              }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute', left: '0.5rem', top: '0.5rem', bottom: '1rem',
                  width: '1px',
                  background: 'linear-gradient(to bottom, rgba(255,217,122,0.6), rgba(212,193,154,0.3), transparent)',
                }} />
                {sortedExp.map((exp, i) => (
                  <ExperienceItem key={exp._id || i} exp={exp} index={i} />
                ))}
              </div>
            </section>
          )
        )}

        {/* EDUCATION */}
        {(l2 && !education) ? null : (
          sortedEdu.length > 0 && (
            <section>
              <h2 style={{
                color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.35em',
                margin: '0 0 2rem', fontWeight: 700,
              }}>
                &gt; FORMATION.CFG ({sortedEdu.length})
              </h2>
              <div style={{
                position: 'relative',
                paddingLeft: '0.5rem',
              }}>
                <div style={{
                  position: 'absolute', left: '0.5rem', top: '0.5rem', bottom: '1rem',
                  width: '1px',
                  background: 'linear-gradient(to bottom, rgba(212,193,154,0.5), transparent)',
                }} />
                {sortedEdu.map((edu, i) => (
                  <EducationItem key={edu._id || i} edu={edu} index={i} />
                ))}
              </div>
            </section>
          )
        )}

        {/* Empty state */}
        {!l1 && !l2 && sortedExp.length === 0 && sortedEdu.length === 0 && (
          <p style={{
            color: 'rgba(212,193,154,0.6)',
            textAlign: 'center',
            padding: '3rem 1rem',
            border: '1px dashed rgba(212,193,154,0.2)',
            borderRadius: '4px',
          }}>
            Le parcours n'a pas encore ete enregistre.
          </p>
        )}
      </section>
    </PageShell>
  );
}
