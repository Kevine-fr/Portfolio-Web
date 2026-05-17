import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { resolveMediaUrl } from '../../lib/api';
import { FALLBACK_PROJECTS } from '../../data/fallbacks';
import PageShell from '../Shared/PageShell';
import Loader from '../Shared/Loader';
import TechBadge from '../Shared/TechBadge';

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

function FilterPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} type="button" style={{
      padding: '0.4rem 0.9rem',
      background: active ? 'rgba(255,217,122,0.15)' : 'rgba(212,193,154,0.04)',
      border: `1px solid ${active ? 'rgba(255,217,122,0.5)' : 'rgba(212,193,154,0.2)'}`,
      color: active ? '#ffd97a' : 'rgba(245,239,224,0.7)',
      fontSize: '0.65rem',
      letterSpacing: '0.15em',
      fontFamily: 'inherit',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderRadius: '2px',
    }}>
      {children}
    </button>
  );
}

function ProjectListItem({ project, index }) {
  const { ref, visible } = useReveal(0.1);
  const status = STATUS_LABELS[project.status] || 'LIVE';
  const color = STATUS_COLORS[status];
  const cover = resolveMediaUrl(project.coverImage);

  return (
    <Link to={`/projets/${project.slug}`}
      ref={ref}
      className="project-list-item"
      style={{
        display: 'grid',
        gridTemplateColumns: cover ? '180px 1fr auto' : '1fr auto',
        gap: '1.5rem',
        alignItems: 'stretch',
        padding: '1.2rem',
        background: 'rgba(15,10,22,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(212,193,154,0.18)',
        borderRadius: '4px',
        textDecoration: 'none',
        color: 'inherit',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(15px)',
        transition: `all 0.6s ease ${index * 0.05}s, background 0.2s, border-color 0.2s, transform 0.2s`,
      }}>
      {cover && (
        <div className="project-list-cover" style={{
          width: '180px',
          height: '110px',
          background: `url(${cover}) center/cover`,
          borderRadius: '3px',
          border: '1px solid rgba(212,193,154,0.2)',
        }} />
      )}

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{
            margin: 0,
            color: 'rgba(245,239,224,0.95)',
            fontSize: '1.05rem',
            fontWeight: 700,
          }}>{project.title}</h3>
          {project.year && (
            <span style={{
              color: 'rgba(212,193,154,0.6)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
            }}>{project.year}</span>
          )}
          {project.featured && (
            <span style={{
              color: '#ffd97a',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              padding: '0.1rem 0.4rem',
              border: '1px solid rgba(255,217,122,0.4)',
              borderRadius: '2px',
            }}>★ FEATURED</span>
          )}
        </div>
        {project.subtitle && (
          <p style={{
            margin: '0.3rem 0 0.5rem',
            color: '#d4c19a',
            fontSize: '0.72rem',
            letterSpacing: '0.05em',
          }}>{project.subtitle}</p>
        )}
        <p style={{
          margin: 0,
          color: 'rgba(245,239,224,0.7)',
          fontSize: '0.8rem',
          lineHeight: 1.55,
        }}>{project.description}</p>

        {project.techStack && project.techStack.length > 0 && (
          <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {project.techStack.slice(0, 6).map(t => <TechBadge key={t}>{t}</TechBadge>)}
            {project.techStack.length > 6 && (
              <span style={{ color: 'rgba(212,193,154,0.5)', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0' }}>
                +{project.techStack.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', justifyContent: 'space-between',
        gap: '0.5rem', minWidth: '70px',
      }}>
        <span style={{
          fontSize: '0.55rem', letterSpacing: '0.2em',
          color, padding: '0.2rem 0.5rem',
          border: `1px solid ${color}`,
          borderRadius: '2px',
        }}>{status}</span>
        <span style={{
          color: 'rgba(212,193,154,0.5)', fontSize: '0.7rem',
          letterSpacing: '0.15em',
        }}>VOIR →</span>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { data, loading } = useFetch('/projects', FALLBACK_PROJECTS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);

  // Derive available filters from data
  const { allTechs, allYears } = useMemo(() => {
    const techs = new Set();
    const years = new Set();
    (data || []).forEach(p => {
      (p.techStack || []).forEach(t => techs.add(t));
      if (p.year) years.add(p.year);
    });
    return {
      allTechs: Array.from(techs).sort(),
      allYears: Array.from(years).sort((a, b) => b - a),
    };
  }, [data]);

  // Apply filters
  const filtered = useMemo(() => {
    let list = data || [];
    if (statusFilter !== 'all')  list = list.filter(p => p.status === statusFilter);
    if (techFilter)              list = list.filter(p => (p.techStack || []).includes(techFilter));
    if (yearFilter)              list = list.filter(p => p.year === yearFilter);
    // Featured first, then by order, then by year desc
    return list.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [data, statusFilter, techFilter, yearFilter]);

  const reset = () => { setStatusFilter('all'); setTechFilter(null); setYearFilter(null); };
  const hasActiveFilters = statusFilter !== 'all' || techFilter || yearFilter;

  return (
    <PageShell label="06_PROJETS" sceneSection={5}>
      <section style={{
        padding: 'clamp(2rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem)',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "'Arial Black',sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px rgba(212,193,154,0.4))',
          }}>
            Tous les projets
          </h1>
          <p style={{
            color: 'rgba(245,239,224,0.7)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            marginTop: '1rem',
            maxWidth: '600px',
          }}>
            Chaque projet est une planete dans ma constellation technique.
            Filtrez par statut, technologie ou annee pour explorer.
          </p>
        </div>

        {/* Filters */}
        {!loading && data && data.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
              marginBottom: '0.8rem', alignItems: 'center',
            }}>
              <span style={{
                color: '#ffd97a', fontSize: '0.6rem', letterSpacing: '0.25em',
                marginRight: '0.5rem',
              }}>&gt; STATUT:</span>
              <FilterPill active={statusFilter === 'all'}       onClick={() => setStatusFilter('all')}>TOUS</FilterPill>
              <FilterPill active={statusFilter === 'published'} onClick={() => setStatusFilter('published')}>LIVE</FilterPill>
              <FilterPill active={statusFilter === 'draft'}     onClick={() => setStatusFilter('draft')}>WIP</FilterPill>
              <FilterPill active={statusFilter === 'archived'}  onClick={() => setStatusFilter('archived')}>ARCHIVED</FilterPill>
            </div>

            {allYears.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                <span style={{
                  color: '#ffd97a', fontSize: '0.6rem', letterSpacing: '0.25em',
                  marginRight: '0.5rem',
                }}>&gt; ANNEE:</span>
                <FilterPill active={!yearFilter} onClick={() => setYearFilter(null)}>TOUTES</FilterPill>
                {allYears.map(y => (
                  <FilterPill key={y} active={yearFilter === y} onClick={() => setYearFilter(y)}>{y}</FilterPill>
                ))}
              </div>
            )}

            {allTechs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{
                  color: '#ffd97a', fontSize: '0.6rem', letterSpacing: '0.25em',
                  marginRight: '0.5rem',
                }}>&gt; TECH:</span>
                <FilterPill active={!techFilter} onClick={() => setTechFilter(null)}>TOUTES</FilterPill>
                {allTechs.map(t => (
                  <FilterPill key={t} active={techFilter === t} onClick={() => setTechFilter(t)}>{t}</FilterPill>
                ))}
              </div>
            )}

            {hasActiveFilters && (
              <button onClick={reset} type="button" style={{
                marginTop: '0.8rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,217,122,0.7)',
                fontSize: '0.6rem',
                letterSpacing: '0.25em',
                cursor: 'pointer',
                padding: '0.3rem 0',
                fontFamily: 'inherit',
              }}>
                ↺ REINITIALISER LES FILTRES
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading && !data ? (
          <Loader />
        ) : !data || data.length === 0 ? (
          <p style={{ color: 'rgba(212,193,154,0.6)' }}>Aucun projet pour le moment.</p>
        ) : filtered.length === 0 ? (
          <p style={{
            color: 'rgba(212,193,154,0.6)', fontSize: '0.85rem',
            padding: '2rem', textAlign: 'center',
            border: '1px dashed rgba(212,193,154,0.2)',
            borderRadius: '4px',
          }}>
            Aucun projet ne correspond aux filtres.
          </p>
        ) : (
          <>
            <p style={{
              color: 'rgba(212,193,154,0.5)',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              marginBottom: '1rem',
            }}>
              {filtered.length} PROJET{filtered.length > 1 ? 'S' : ''} TROUVE{filtered.length > 1 ? 'S' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((p, i) => (
                <ProjectListItem key={p._id || p.slug} project={p} index={i} />
              ))}
            </div>
          </>
        )}
      </section>

      <style>{`
        .project-list-item:hover {
          background: rgba(20,14,28,0.85) !important;
          border-color: rgba(255,217,122,0.45) !important;
          transform: translateX(4px) !important;
          box-shadow: 0 0 25px rgba(212,193,154,0.15);
        }
        @media (max-width: 720px) {
          .project-list-item {
            grid-template-columns: 1fr !important;
          }
          .project-list-cover {
            width: 100% !important;
            height: 160px !important;
          }
        }
      `}</style>
    </PageShell>
  );
}
