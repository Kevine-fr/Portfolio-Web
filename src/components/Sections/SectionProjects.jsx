import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { resolveMediaUrl } from '../../lib/api';
import { FALLBACK_PROJECTS } from '../../data/fallbacks';

const STATUS_LABELS = {
  published: 'LIVE',
  draft:     'WIP',
  archived:  'ARCHIVED',
};
const STATUS_COLORS = {
  LIVE:     '#7cc97c',
  WIP:      '#ffd97a',
  ARCHIVED: 'rgba(245,239,224,0.4)',
};

function ProjectCard({ project, delay }) {
  const { ref, visible } = useReveal();
  const status = STATUS_LABELS[project.status] || 'LIVE';
  const color = STATUS_COLORS[status];
  const cover = resolveMediaUrl(project.coverImage);

  return (
    <Link to={`/projets/${project.slug}`}
      ref={ref}
      className="project-card"
      style={{
        padding: '1.5rem',
        background: 'rgba(212,193,154,0.04)',
        border: '1px solid rgba(212,193,154,0.18)',
        borderRadius: '4px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.8s ease ${delay}s, background 0.25s, border-color 0.25s, transform 0.25s`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}>

      {/* Cover image as subtle background if available */}
      {cover && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          filter: 'blur(2px)',
        }} aria-hidden="true" />
      )}

      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        fontSize: '0.55rem', letterSpacing: '0.2em',
        color, padding: '0.2rem 0.5rem',
        border: `1px solid ${color}`,
        borderRadius: '2px',
        background: 'rgba(5,3,9,0.6)',
      }}>
        {status}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          color: 'rgba(245,239,224,0.95)', fontSize: '1.05rem',
          margin: '0 0 0.6rem', fontWeight: 700,
          paddingRight: '4rem',
        }}>
          {project.title}
        </h3>
        {project.subtitle && (
          <p style={{
            color: '#d4c19a', fontSize: '0.7rem',
            letterSpacing: '0.05em',
            margin: '0 0 0.5rem',
          }}>
            {project.subtitle}
          </p>
        )}
        <p style={{
          color: 'rgba(245,239,224,0.75)', fontSize: '0.8rem',
          lineHeight: 1.6, margin: '0 0 1rem',
        }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {(project.techStack || []).slice(0, 4).map(tag => (
            <span key={tag} style={{
              padding: '0.25rem 0.6rem',
              background: 'rgba(212,193,154,0.08)',
              border: '1px solid rgba(212,193,154,0.2)',
              color: '#d4c19a', fontSize: '0.6rem',
              letterSpacing: '0.1em', borderRadius: '2px',
            }}>
              {tag}
            </span>
          ))}
          {(project.techStack || []).length > 4 && (
            <span style={{
              padding: '0.25rem 0.6rem',
              color: 'rgba(212,193,154,0.5)', fontSize: '0.6rem',
              letterSpacing: '0.1em',
            }}>
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SectionProjects() {
  const header = useReveal();
  const { data, loading } = useFetch('/projects', FALLBACK_PROJECTS);

  // On the home page, show featured + published projects only (up to 4)
  const items = useMemo(() => {
    const all = (data || []).filter(p => p.status !== 'archived');
    const featured = all.filter(p => p.featured);
    const rest     = all.filter(p => !p.featured);
    return [...featured, ...rest]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 4);
  }, [data]);

  const total = (data || []).filter(p => p.status !== 'archived').length;

  return (
    <section id="projects" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div ref={header.ref} style={{
        maxWidth: '600px', marginBottom: '3rem',
        opacity: header.visible ? 1 : 0,
        transform: header.visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease',
      }}>
        <p style={{
          color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
          margin: '0 0 1rem', opacity: 0.9,
          textShadow: '0 0 12px rgba(255,217,122,0.5)',
        }}>
          &gt; 03_PROJETS
        </p>
        <h2 style={{
          margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 25px rgba(212,193,154,0.4))',
        }}>
          Systeme<br />stellaire
        </h2>
        <p style={{
          color: 'rgba(245,239,224,0.75)', fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
          lineHeight: 1.7, marginTop: '1.5rem', maxWidth: '500px',
        }}>
          Selection de projets en orbite — chaque entree une planete dans
          ma constellation technique.
        </p>
      </div>

      {loading && !data ? (
        <p style={{ color: 'rgba(212,193,154,0.6)', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
          CHARGEMENT…
        </p>
      ) : items.length === 0 ? (
        <p style={{ color: 'rgba(212,193,154,0.6)', fontSize: '0.85rem' }}>
          Aucun projet pour le moment.
        </p>
      ) : (
        <>
          <div className="projects-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            maxWidth: '1100px', width: '100%',
          }}>
            {items.map((p, i) => (
              <ProjectCard key={p._id || p.slug} project={p} delay={i * 0.1} />
            ))}
          </div>

          {total > items.length && (
            <Link to="/projets" style={{
              alignSelf: 'flex-start',
              marginTop: '2rem',
              padding: '0.7rem 1.5rem',
              border: '1px solid rgba(255,217,122,0.4)',
              color: '#ffd97a',
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              textDecoration: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 0 15px rgba(255,217,122,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,217,122,0.1)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255,217,122,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255,217,122,0.15)';
            }}>
              VOIR TOUS LES PROJETS ({total}) →
            </Link>
          )}
        </>
      )}

      <style>{`
        .project-card:hover {
          background: rgba(212,193,154,0.08) !important;
          border-color: rgba(255,217,122,0.4) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 30px rgba(212,193,154,0.15);
        }
        @media (max-width: 768px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
