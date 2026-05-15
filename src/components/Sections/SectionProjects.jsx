import { useEffect, useRef, useState } from 'react';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const PROJECTS = [
  {
    title: 'Stellar Dashboard',
    desc: 'Tableau de bord temps reel pour la visualisation d\'evenements cosmiques.',
    tags: ['React', 'D3.js', 'WebSockets'],
    status: 'LIVE',
  },
  {
    title: 'Nebula Commerce',
    desc: 'Plateforme e-commerce avec scenes 3D produit interactives.',
    tags: ['Next.js', 'Three.js', 'Stripe'],
    status: 'LIVE',
  },
  {
    title: 'Orbit Tracker',
    desc: 'API REST de suivi de satellites avec authentication JWT.',
    tags: ['Node.js', 'MongoDB', 'JWT'],
    status: 'ARCHIVED',
  },
  {
    title: 'Galaxy Forge',
    desc: 'Editeur d\'experiences WebXR pour la VR/AR navigateur.',
    tags: ['WebXR', 'Three.js', 'TypeScript'],
    status: 'WIP',
  },
];

function ProjectCard({ project, delay }) {
  const { ref, visible } = useReveal();
  const statusColor = {
    LIVE:     '#7cc97c',
    WIP:      '#ffd97a',
    ARCHIVED: 'rgba(245,239,224,0.4)',
  };

  return (
    <div ref={ref}
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
      }}>

      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        fontSize: '0.55rem', letterSpacing: '0.2em',
        color: statusColor[project.status],
        padding: '0.2rem 0.5rem',
        border: `1px solid ${statusColor[project.status]}`,
        borderRadius: '2px',
      }}>
        {project.status}
      </div>

      <h3 style={{
        color: 'rgba(245,239,224,0.95)', fontSize: '1.05rem',
        margin: '0 0 0.6rem', fontWeight: 700,
        paddingRight: '4rem',
      }}>
        {project.title}
      </h3>
      <p style={{
        color: 'rgba(245,239,224,0.75)', fontSize: '0.8rem',
        lineHeight: 1.6, margin: '0 0 1rem',
      }}>
        {project.desc}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {project.tags.map(tag => (
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
      </div>
    </div>
  );
}

export default function SectionProjects() {
  const header = useReveal();

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

      <div className="projects-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        maxWidth: '1100px', width: '100%',
      }}>
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.title} project={p} delay={i * 0.1} />
        ))}
      </div>

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
