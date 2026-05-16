import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  if (index === null || index === undefined) return null;
  const src = resolveMediaUrl(images[index]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(5,3,9,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out',
      animation: 'fade-in 0.2s ease',
    }}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Précédent" style={{
        position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '44px', height: '44px',
        cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit',
        borderRadius: '2px',
      }}>‹</button>

      <img src={src} alt={`Capture ${index + 1}`} style={{
        maxWidth: '90vw', maxHeight: '85vh',
        objectFit: 'contain',
        boxShadow: '0 0 40px rgba(212,193,154,0.3)',
      }} onClick={(e) => e.stopPropagation()} />

      <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Suivant" style={{
        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '44px', height: '44px',
        cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit',
        borderRadius: '2px',
      }}>›</button>

      <button onClick={onClose} aria-label="Fermer" style={{
        position: 'absolute', top: '1rem', right: '1rem',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '40px', height: '40px',
        cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit',
        borderRadius: '2px',
      }}>×</button>

      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(245,239,224,0.7)', fontSize: '0.7rem', letterSpacing: '0.2em',
        background: 'rgba(5,3,9,0.7)', padding: '0.4rem 1rem',
        border: '1px solid rgba(212,193,154,0.2)', borderRadius: '2px',
      }}>
        {index + 1} / {images.length}
      </div>

      <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch('/projects', FALLBACK_PROJECTS);

  const project = useMemo(
    () => (data || []).find(p => p.slug === slug),
    [data, slug],
  );

  const header = useReveal();
  const galleryHook = useReveal(0.05);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (loading && !data) {
    return <PageShell label="03_PROJETS"><Loader /></PageShell>;
  }
  if (!project) {
    return (
      <PageShell label="03_PROJETS">
        <div style={{
          padding: '6rem 1.5rem', textAlign: 'center',
          maxWidth: '600px', margin: '0 auto',
        }}>
          <h1 style={{
            color: 'rgba(245,239,224,0.95)', fontSize: '2rem',
            fontFamily: "'Arial Black',sans-serif",
            marginBottom: '1rem',
          }}>Projet introuvable</h1>
          <p style={{ color: 'rgba(245,239,224,0.6)', marginBottom: '2rem' }}>
            Le projet « {slug} » n'existe pas ou a ete archive.
          </p>
          <Link to="/projets" style={{
            color: '#ffd97a', fontSize: '0.75rem',
            letterSpacing: '0.25em', textDecoration: 'none',
            border: '1px solid rgba(255,217,122,0.4)',
            padding: '0.7rem 1.5rem',
          }}>
            ← VOIR TOUS LES PROJETS
          </Link>
        </div>
      </PageShell>
    );
  }

  const status = STATUS_LABELS[project.status] || 'LIVE';
  const color = STATUS_COLORS[status];
  const cover = resolveMediaUrl(project.coverImage);
  const video = resolveMediaUrl(project.demoVideo);
  const gallery = project.gallery || [];

  const openLightbox = (i) => setLightboxIdx(i);
  const closeLightbox = () => setLightboxIdx(null);
  const prevLightbox = () => setLightboxIdx(i => (i - 1 + gallery.length) % gallery.length);
  const nextLightbox = () => setLightboxIdx(i => (i + 1) % gallery.length);

  return (
    <PageShell label={project.title.toUpperCase()}>
      <article style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: 'clamp(2rem, 6vh, 4rem) clamp(1.5rem, 5vw, 3rem) 4rem',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Breadcrumb */}
        <nav style={{
          marginBottom: '2rem',
          display: 'flex', gap: '0.5rem',
          color: 'rgba(212,193,154,0.5)',
          fontSize: '0.65rem', letterSpacing: '0.2em',
        }}>
          <Link to="/projets" style={{ color: 'inherit', textDecoration: 'none' }}>← PROJETS</Link>
          <span>/</span>
          <span style={{ color: '#d4c19a' }}>{project.title.toUpperCase()}</span>
        </nav>

        {/* Header */}
        <header ref={header.ref} style={{
          marginBottom: '3rem',
          opacity: header.visible ? 1 : 0,
          transform: header.visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease',
        }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
            alignItems: 'center', marginBottom: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.55rem', letterSpacing: '0.25em',
              color, padding: '0.25rem 0.6rem',
              border: `1px solid ${color}`,
              borderRadius: '2px',
            }}>{status}</span>
            {project.year && (
              <span style={{
                color: 'rgba(212,193,154,0.7)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
              }}>{project.year}</span>
            )}
            {project.featured && (
              <span style={{
                color: '#ffd97a',
                fontSize: '0.55rem',
                letterSpacing: '0.25em',
                padding: '0.2rem 0.5rem',
                border: '1px solid rgba(255,217,122,0.4)',
                borderRadius: '2px',
              }}>★ FEATURED</span>
            )}
          </div>

          <h1 style={{
            margin: '0.4rem 0 0.6rem',
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 900, lineHeight: 1,
            fontFamily: "'Arial Black',sans-serif",
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 25px rgba(212,193,154,0.4))',
          }}>
            {project.title}
          </h1>

          {project.subtitle && (
            <p style={{
              color: '#d4c19a',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              letterSpacing: '0.05em',
              marginTop: '0.5rem',
            }}>{project.subtitle}</p>
          )}

          {project.description && (
            <p style={{
              color: 'rgba(245,239,224,0.85)',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              lineHeight: 1.7,
              maxWidth: '700px',
              marginTop: '1.5rem',
            }}>{project.description}</p>
          )}

          {/* Actions */}
          {(project.liveUrl || project.repoUrl) && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
              marginTop: '1.5rem',
            }}>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                  padding: '0.7rem 1.5rem',
                  background: 'linear-gradient(135deg, #d4c19a 0%, #8a6f3f 100%)',
                  color: '#050309', textDecoration: 'none',
                  fontSize: '0.7rem', letterSpacing: '0.25em',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(212,193,154,0.4)',
                }}>
                  VOIR EN LIGNE ↗
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" style={{
                  padding: '0.7rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(212,193,154,0.4)',
                  color: '#d4c19a', textDecoration: 'none',
                  fontSize: '0.7rem', letterSpacing: '0.25em',
                }}>
                  CODE SOURCE ↗
                </a>
              )}
            </div>
          )}

          {/* Tech */}
          {project.techStack && project.techStack.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{
                color: '#ffd97a', fontSize: '0.6rem', letterSpacing: '0.25em',
                marginBottom: '0.6rem',
              }}>&gt; STACK_TECHNIQUE</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {project.techStack.map(t => <TechBadge key={t} variant="accent">{t}</TechBadge>)}
              </div>
            </div>
          )}
        </header>

        {/* Cover image */}
        {cover && (
          <div style={{
            marginBottom: '3rem',
            border: '1px solid rgba(212,193,154,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            background: 'rgba(212,193,154,0.04)',
          }}>
            <img src={cover} alt={project.title} style={{
              width: '100%', height: 'auto', display: 'block',
              maxHeight: '500px', objectFit: 'cover',
            }} />
          </div>
        )}

        {/* Long description */}
        {project.longDescription && (
          <section style={{ marginBottom: '3rem', maxWidth: '750px' }}>
            <h2 style={{
              color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.3em',
              margin: '0 0 1rem',
            }}>&gt; DETAILS</h2>
            <div style={{
              color: 'rgba(245,239,224,0.88)',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              padding: '1.25rem 1.5rem',
              background: 'rgba(15,10,22,0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: '1px solid rgba(212,193,154,0.15)',
              borderRadius: '4px',
            }}>
              {project.longDescription}
            </div>
          </section>
        )}

        {/* Demo video */}
        {video && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.3em',
              margin: '0 0 1rem',
            }}>&gt; DEMO_VIDEO</h2>
            <div style={{
              border: '1px solid rgba(212,193,154,0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              background: '#000',
              boxShadow: '0 0 30px rgba(212,193,154,0.15)',
            }}>
              <video
                src={video}
                controls
                preload="metadata"
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '600px' }}
              />
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section ref={galleryHook.ref} style={{
            marginBottom: '3rem',
            opacity: galleryHook.visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}>
            <h2 style={{
              color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.3em',
              margin: '0 0 1rem',
            }}>&gt; GALERIE ({gallery.length})</h2>
            <div className="project-gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.6rem',
            }}>
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="gallery-thumb"
                  style={{
                    border: '1px solid rgba(212,193,154,0.2)',
                    background: 'rgba(212,193,154,0.04)',
                    padding: 0,
                    cursor: 'zoom-in',
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    borderRadius: '3px',
                    transition: 'all 0.25s',
                  }}>
                  <img
                    src={resolveMediaUrl(img)}
                    alt={`Capture ${i + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Nav back */}
        <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/projets" style={{
            color: 'rgba(212,193,154,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textDecoration: 'none',
          }}>← TOUS LES PROJETS</Link>
          <span style={{ color: 'rgba(212,193,154,0.3)' }}>·</span>
          <Link to="/" style={{
            color: 'rgba(212,193,154,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textDecoration: 'none',
          }}>↑ ACCUEIL</Link>
        </div>
      </article>

      <Lightbox
        images={gallery}
        index={lightboxIdx}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />

      <style>{`
        .gallery-thumb:hover {
          border-color: rgba(255,217,122,0.5) !important;
          box-shadow: 0 0 20px rgba(212,193,154,0.25);
        }
        .gallery-thumb:hover img {
          transform: scale(1.06);
        }
      `}</style>
    </PageShell>
  );
}
