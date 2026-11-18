import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch, peekCache } from '../../hooks/useFetch';
import { formatDayMonthYear } from '../../lib/dates';
import { languageColor } from '../../lib/projects';
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

export function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const open = index !== null && index !== undefined && images.length > 0;

  // Only listen while open: the arrow keys used to OPEN the lightbox (and an
  // empty black overlay on projects without gallery) from anywhere on the page.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  const src = resolveMediaUrl(images[index]);

  return (
    <div onClick={onClose} role="dialog" aria-modal="true" aria-label="Galerie d'images" style={{
      position: 'fixed', inset: 0, zIndex: 50,
      width: '100vw', height: '100dvh',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: 'rgba(5,3,9,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 3.5rem)',
      paddingLeft: 'calc(env(safe-area-inset-left) + 3.75rem)',
      paddingRight: 'calc(env(safe-area-inset-right) + 3.75rem)',
      cursor: 'zoom-out',
      animation: 'fade-in 0.2s ease',
    }}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Précédent" style={{
        position: 'absolute', left: 'calc(env(safe-area-inset-left) + 0.5rem)', top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '44px', height: '44px',
        cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit',
        borderRadius: '2px', flexShrink: 0,
      }}>‹</button>

      <img src={src} alt={`Capture ${index + 1}`} style={{
        maxWidth: '100%', maxHeight: '100%',
        objectFit: 'contain',
        boxShadow: '0 0 40px rgba(212,193,154,0.3)',
      }} onClick={(e) => e.stopPropagation()} />

      <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Suivant" style={{
        position: 'absolute', right: 'calc(env(safe-area-inset-right) + 0.5rem)', top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '44px', height: '44px',
        cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit',
        borderRadius: '2px', flexShrink: 0,
      }}>›</button>

      <button onClick={onClose} aria-label="Fermer" style={{
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top) + 0.75rem)',
        right: 'calc(env(safe-area-inset-right) + 0.75rem)',
        background: 'rgba(212,193,154,0.1)', border: '1px solid rgba(212,193,154,0.3)',
        color: '#d4c19a', width: '40px', height: '40px',
        cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit',
        borderRadius: '2px',
      }}>×</button>

      <div style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
        left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(245,239,224,0.7)', fontSize: '0.7rem', letterSpacing: '0.2em',
        background: 'rgba(5,3,9,0.7)', padding: '0.4rem 1rem',
        border: '1px solid rgba(212,193,154,0.2)', borderRadius: '2px',
        whiteSpace: 'nowrap',
      }}>
        {index + 1} / {images.length}
      </div>

      <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

function GithubPanel({ github }) {
  const languages = (github.languages || []).filter((l) => l.percent > 0);
  const updated = formatDayMonthYear(github.pushedAt);
  return (
    <section aria-label="Dépôt GitHub" style={{
      marginBottom: '3rem',
      padding: '1.25rem 1.5rem',
      background: 'rgba(15,10,22,0.65)',
      border: '1px solid rgba(212,193,154,0.15)',
      borderRadius: '4px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.3em', margin: 0 }}>&gt; GITHUB</h2>
        <a href={github.htmlUrl} target="_blank" rel="noopener noreferrer" style={{
          color: '#d4c19a', fontSize: '0.65rem', letterSpacing: '0.2em', textDecoration: 'none',
        }}>{github.fullName} ↗</a>
      </div>
      <p style={{
        display: 'flex', flexWrap: 'wrap', gap: '1.25rem', margin: '0.9rem 0 0',
        color: 'rgba(245,239,224,0.75)', fontSize: '0.75rem', letterSpacing: '0.08em',
      }}>
        <span title="Étoiles">★ {github.stars ?? 0}</span>
        <span title="Forks">⑂ {github.forks ?? 0}</span>
        {updated && <span>MIS À JOUR LE {updated.toUpperCase()}</span>}
      </p>
      {languages.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div role="img" aria-label={languages.map((l) => `${l.name} ${l.percent} %`).join(', ')} style={{
            display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden',
            background: 'rgba(212,193,154,0.1)',
          }}>
            {languages.map((l) => (
              <span key={l.name} style={{ width: `${l.percent}%`, background: languageColor(l.name) }} />
            ))}
          </div>
          <ul style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', listStyle: 'none',
            padding: 0, margin: '0.6rem 0 0', color: 'rgba(245,239,224,0.7)', fontSize: '0.68rem',
          }}>
            {languages.map((l) => (
              <li key={l.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: languageColor(l.name) }} />
                {l.name} <span style={{ color: 'rgba(212,193,154,0.55)' }}>{l.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {github.topics?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.9rem' }}>
          {github.topics.map((t) => <TechBadge key={t}>#{t}</TechBadge>)}
        </div>
      )}
    </section>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  // Dedicated endpoint: the page used to download every project (with their
  // full content) to display a single one.
  const { data: detail, loading, error } = useFetch(`/projects/slug/${encodeURIComponent(slug)}`);
  const notFound = error?.response?.status === 404;

  const project = useMemo(() => {
    if (detail) return detail;
    if (notFound) return null;
    // While loading: summary already fetched by the listing; offline: bundled fallback
    const fromList = (peekCache('/projects?summary=true') || []).find((p) => p.slug === slug);
    if (fromList) return fromList;
    return error ? FALLBACK_PROJECTS.find((p) => p.slug === slug) || null : null;
  }, [detail, notFound, error, slug]);

  const header = useReveal();
  const galleryHook = useReveal(0.05);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const galleryLength = project?.gallery?.length ?? 0;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevLightbox = useCallback(
    () => setLightboxIdx((i) => (i === null || !galleryLength ? null : (i - 1 + galleryLength) % galleryLength)),
    [galleryLength],
  );
  const nextLightbox = useCallback(
    () => setLightboxIdx((i) => (i === null || !galleryLength ? null : (i + 1) % galleryLength)),
    [galleryLength],
  );

  // Reset the lightbox when navigating to another project
  useEffect(() => setLightboxIdx(null), [slug]);

  if (!project && loading) {
    return <PageShell label="06_PROJETS" sceneSection={5}><Loader /></PageShell>;
  }
  if (!project) {
    return (
      <PageShell label="06_PROJETS" sceneSection={5}>
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

  return (
    <PageShell label={project.title.toUpperCase()} sceneSection={5}>
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
              }}>&gt; STACK TECHNIQUE</p>
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

        {/* Repository stats (projects synced from GitHub) */}
        {project.github && <GithubPanel github={project.github} />}

        {/* Long description: README / markdown rendered (and sanitized) by the API */}
        {project.contentHtml ? (
          <section style={{ marginBottom: '3rem', maxWidth: '850px' }}>
            <h2 style={{
              color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.3em',
              margin: '0 0 1rem',
            }}>&gt; {project.github ? 'README' : 'DETAILS'}</h2>
            <div
              className="md-content"
              data-testid="project-content"
              dangerouslySetInnerHTML={{ __html: project.contentHtml }}
            />
          </section>
        ) : project.longDescription && (
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
        .md-content {
          color: rgba(245,239,224,0.88);
          font-size: 0.95rem;
          line-height: 1.8;
          padding: 1.25rem 1.5rem;
          background: rgba(15,10,22,0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(212,193,154,0.15);
          border-radius: 4px;
          overflow-wrap: anywhere;
        }
        .md-content > :first-child { margin-top: 0; }
        .md-content > :last-child { margin-bottom: 0; }
        .md-content h1, .md-content h2, .md-content h3, .md-content h4 {
          color: #f5efe0; font-family: 'Arial Black', sans-serif; line-height: 1.25;
          margin: 1.8em 0 0.6em; letter-spacing: -0.01em;
        }
        .md-content h1 { font-size: 1.6rem; }
        .md-content h2 { font-size: 1.3rem; border-bottom: 1px solid rgba(212,193,154,0.15); padding-bottom: 0.3em; }
        .md-content h3 { font-size: 1.1rem; }
        .md-content p, .md-content ul, .md-content ol, .md-content blockquote, .md-content table, .md-content pre { margin: 0 0 1em; }
        .md-content ul, .md-content ol { padding-left: 1.4em; }
        .md-content li + li { margin-top: 0.25em; }
        .md-content a { color: #ffd97a; text-decoration: underline; text-underline-offset: 3px; }
        .md-content strong { color: #f5efe0; }
        .md-content img { max-width: 100%; height: auto; border-radius: 3px; vertical-align: middle; }
        .md-content p[align="center"], .md-content div[align="center"], .md-content h1[align="center"] { text-align: center; }
        .md-content code {
          font-family: 'Courier New', monospace; font-size: 0.85em;
          background: rgba(212,193,154,0.1); padding: 0.15em 0.4em; border-radius: 3px;
        }
        .md-content pre {
          background: rgba(5,3,9,0.85); border: 1px solid rgba(212,193,154,0.15);
          padding: 1rem; border-radius: 4px; overflow-x: auto; line-height: 1.5;
        }
        .md-content pre code { background: none; padding: 0; font-size: 0.82rem; }
        .md-content blockquote {
          border-left: 3px solid rgba(255,217,122,0.5); padding: 0.2em 1em;
          color: rgba(245,239,224,0.7); background: rgba(212,193,154,0.04);
        }
        .md-content table { border-collapse: collapse; display: block; overflow-x: auto; max-width: 100%; }
        .md-content th, .md-content td { border: 1px solid rgba(212,193,154,0.2); padding: 0.4em 0.8em; }
        .md-content th { background: rgba(212,193,154,0.08); color: #f5efe0; }
        .md-content hr { border: none; border-top: 1px solid rgba(212,193,154,0.2); margin: 2em 0; }
        .md-content details { margin: 0 0 1em; }
        .md-content summary { cursor: pointer; color: #d4c19a; }
        @media (max-width: 600px) { .md-content { padding: 1rem; font-size: 0.9rem; } }
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
