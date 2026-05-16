import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useReveal } from '../../hooks/useReveal';
import { FALLBACK_SKILLS } from '../../data/fallbacks';

const CATEGORY_LABELS = {
  frontend: 'FRONTEND',
  backend:  'BACKEND',
  tools:    'DEVOPS',
  design:   'DESIGN',
  other:    'AUTRE',
};
const CATEGORY_ORDER = ['frontend', 'backend', 'tools', 'design', 'other'];

function SkillBar({ name, level, delay, visible }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{
          color: 'rgba(245,239,224,0.9)', fontSize: '0.78rem',
          letterSpacing: '0.05em',
        }}>{name}</span>
        <span style={{
          color: '#ffd97a', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.05em',
        }}>{visible ? `${level}%` : '0%'}</span>
      </div>
      <div style={{
        height: '4px', background: 'rgba(212,193,154,0.1)',
        borderRadius: '2px', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: visible ? `${level}%` : '0%',
          background: 'linear-gradient(90deg, #8a6f3f, #d4c19a, #ffd97a)',
          boxShadow: '0 0 8px rgba(255,217,122,0.6)',
          transition: `width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`,
          borderRadius: '2px',
        }} />
      </div>
    </div>
  );
}

function SkillCategory({ category, items, baseDelay }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref}
      className="skill-category"
      style={{
        padding: '1.5rem',
        background: 'rgba(212,193,154,0.04)',
        border: '1px solid rgba(212,193,154,0.15)',
        borderRadius: '4px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.8s ease ${baseDelay}s, background 0.25s, border-color 0.25s`,
      }}>
      <h3 style={{
        color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
        margin: '0 0 1.5rem', fontWeight: 700,
        textShadow: '0 0 12px rgba(255,217,122,0.5)',
      }}>
        &gt; {CATEGORY_LABELS[category] || category.toUpperCase()}
      </h3>
      {items.map((item, i) => (
        <SkillBar
          key={item._id || item.name}
          name={item.name}
          level={item.level}
          delay={baseDelay + 0.2 + i * 0.1}
          visible={visible}
        />
      ))}
    </div>
  );
}

export default function SectionSkills() {
  const header = useReveal();
  const { data, loading } = useFetch('/skills', FALLBACK_SKILLS);

  // Group skills by category, keep only visible, sort by order then level desc
  const grouped = useMemo(() => {
    const visible = (data || []).filter(s => s.visible !== false);
    const g = {};
    for (const cat of CATEGORY_ORDER) g[cat] = [];
    visible.forEach(s => {
      const cat = CATEGORY_ORDER.includes(s.category) ? s.category : 'other';
      g[cat].push(s);
    });
    Object.values(g).forEach(arr =>
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.level - a.level),
    );
    return g;
  }, [data]);

  const populatedCategories = CATEGORY_ORDER.filter(cat => grouped[cat].length > 0);

  return (
    <section id="skills" style={{
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
          margin: '0 0 1rem', opacity: 0.85,
        }}>
          &gt; 02_COMPETENCES
        </p>
        <h2 style={{
          margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(212,193,154,0.4))',
        }}>
          Constellation<br />de competences
        </h2>
        <p style={{
          color: 'rgba(245,239,224,0.75)', fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
          lineHeight: 1.7, marginTop: '1.5rem', maxWidth: '480px',
        }}>
          Chaque etoile une expertise. Chaque ligne une connexion entre les domaines.
        </p>
      </div>

      {loading && !data ? (
        <p style={{ color: 'rgba(212,193,154,0.6)', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
          CHARGEMENT…
        </p>
      ) : (
        <div className="skills-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          maxWidth: '1100px', width: '100%',
        }}>
          {populatedCategories.map((cat, i) => (
            <SkillCategory
              key={cat}
              category={cat}
              items={grouped[cat]}
              baseDelay={0.1 * i}
            />
          ))}
        </div>
      )}

      <style>{`
        .skill-category:hover {
          background: rgba(212,193,154,0.07) !important;
          border-color: rgba(255,217,122,0.35) !important;
        }
        @media (max-width: 768px) {
          .skills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
