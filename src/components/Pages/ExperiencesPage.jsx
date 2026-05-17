import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_EXPERIENCES } from '../../data/fallbacks';
import PageShell from '../Shared/PageShell';
import Loader from '../Shared/Loader';
import TechBadge from '../Shared/TechBadge';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function fmt(d) {
  if (!d) return '';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '' : `${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
}
function getYear(d) {
  if (!d) return 0;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? 0 : x.getFullYear();
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
      <div style={{
        position: 'absolute', left: 0, top: '0.6rem',
        width: '13px', height: '13px',
        borderRadius: '50%',
        background: exp.current ? '#ffd97a' : '#ffaf5c',
        boxShadow: exp.current
          ? '0 0 16px #ffd97a, 0 0 4px #fff'
          : '0 0 10px rgba(255,175,92,0.6)',
        border: '2px solid #06030f',
        transform: 'translateX(-50%)',
      }} />

      <div style={{
        background: 'rgba(15,10,22,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,217,122,0.2)',
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
              color: 'rgba(245,239,224,0.96)',
              fontSize: '1rem',
              fontWeight: 700,
            }}>{exp.title}</h3>
            <p style={{
              margin: '0.2rem 0 0',
              color: '#ffd97a',
              fontSize: '0.78rem',
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
            color: 'rgba(245,239,224,0.82)',
            fontSize: '0.85rem',
            lineHeight: 1.65,
            margin: '0.5rem 0',
          }}>{exp.description}</p>
        )}

        {exp.achievements && exp.achievements.length > 0 && (
          <ul style={{
            margin: '0.7rem 0 0',
            paddingLeft: '1.2rem',
            color: 'rgba(245,239,224,0.78)',
            fontSize: '0.82rem',
            lineHeight: 1.65,
          }}>
            {exp.achievements.map((a, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{a}</li>)}
          </ul>
        )}

        {exp.techStack && exp.techStack.length > 0 && (
          <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {exp.techStack.map(t => <TechBadge key={t} variant="accent">{t}</TechBadge>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExperiencesPage() {
  const { data, loading } = useFetch('/experiences', FALLBACK_EXPERIENCES);

  const sorted = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return getYear(b.startDate) - getYear(a.startDate);
    });
  }, [data]);

  const header = useReveal();

  return (
    <PageShell label="EXPERIENCES" sceneSection={3}>
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
            textShadow: '0 0 12px rgba(255,217,122,0.6)',
          }}>
            &gt; 04_EXPERIENCES
          </p>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1,
            fontFamily: "'Arial Black',sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px rgba(212,193,154,0.45))',
          }}>
            Danse<br />orbitale
          </h1>
          <p style={{
            color: 'rgba(245,239,224,0.78)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            marginTop: '1.5rem',
            maxWidth: '600px',
          }}>
            Trois corps en orbite perpetuelle — chaque planete une mission,
            chaque trajectoire une chronologie professionnelle.
          </p>
        </div>

        {loading && !data ? (
          <Loader label="ANALYSE DES TRAJECTOIRES" />
        ) : sorted.length === 0 ? (
          <p style={{
            color: 'rgba(212,193,154,0.6)',
            textAlign: 'center',
            padding: '3rem 1rem',
            border: '1px dashed rgba(212,193,154,0.2)',
            background: 'rgba(15,10,22,0.7)',
            backdropFilter: 'blur(6px)',
            borderRadius: '4px',
          }}>
            Aucune experience enregistree pour le moment.
          </p>
        ) : (
          <>
            <p style={{
              color: 'rgba(255,217,122,0.65)',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              marginBottom: '2rem',
            }}>
              {sorted.length} ORBITE{sorted.length > 1 ? 'S' : ''} ACTIVE{sorted.length > 1 ? 'S' : ''}
            </p>
            <div style={{
              position: 'relative',
              paddingLeft: '0.5rem',
            }}>
              <div style={{
                position: 'absolute', left: '0.5rem', top: '0.6rem', bottom: '1rem',
                width: '1px',
                background: 'linear-gradient(to bottom, rgba(255,217,122,0.7), rgba(255,175,92,0.3), transparent)',
              }} />
              {sorted.map((exp, i) => (
                <ExperienceItem key={exp._id || i} exp={exp} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}
