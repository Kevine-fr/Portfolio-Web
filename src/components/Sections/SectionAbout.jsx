import { useEffect, useRef, useState } from 'react';

// Hook : revele quand l'element entre dans le viewport
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const TIMELINE = [
  { year: '2021', title: 'Premiere ligne de code', desc: 'Decouverte du HTML/CSS via un site perso.' },
  { year: '2022', title: 'Plongee dans React', desc: 'Premieres applications web interactives.' },
  { year: '2023', title: 'Apprentissage backend', desc: 'Node.js, bases de donnees, architecture API.' },
  { year: '2024', title: 'Specialisation 3D', desc: 'Three.js, WebGL, experiences immersives.' },
  { year: '2025', title: 'Aujourd\'hui', desc: 'Creative developer full-stack.' },
];

const VALUES = [
  { icon: '◆', title: 'Precision',   desc: 'Code propre, performance et accessibilite avant tout.' },
  { icon: '✦', title: 'Curiosite',   desc: 'Veille technologique constante, exploration permanente.' },
  { icon: '◈', title: 'Creativite',  desc: 'Chercher l\'experience qui marque, pas juste l\'utile.' },
  { icon: '✧', title: 'Rigueur',     desc: 'Architecture pensee, tests, documentation.' },
];

export default function SectionAbout() {
  const intro = useReveal();
  const tline = useReveal();
  const vals  = useReveal();

  return (
    <section id="about" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>

      {/* Header section */}
      <div ref={intro.ref} style={{
        maxWidth: '600px', marginBottom: '4rem',
        opacity: intro.visible ? 1 : 0,
        transform: intro.visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease',
      }}>
        <p style={{
          color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.4em',
          margin: '0 0 1rem', opacity: 0.85,
        }}>
          &gt; 01_ABOUT
        </p>
        <h2 style={{
          margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(212,193,154,0.4))',
        }}>
          Qui suis-je ?
        </h2>
        <p style={{
          color: 'rgba(245,239,224,0.85)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          lineHeight: 1.75, marginTop: '2rem', maxWidth: '550px',
        }}>
          Developpeur passionne par la convergence du <span style={{ color: '#ffd97a' }}>design</span>,
          de la <span style={{ color: '#ffd97a' }}>3D</span> et de l&apos;
          <span style={{ color: '#ffd97a' }}>ingenierie logicielle</span>.
          Je construis des interfaces qui marquent — entre rigueur technique et
          imagination visuelle.
        </p>
      </div>

      {/* Layout 2 colonnes : timeline + valeurs */}
      <div className="about-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(2rem, 5vw, 4rem)',
        maxWidth: '1100px',
        width: '100%',
      }}>

        {/* TIMELINE */}
        <div ref={tline.ref} style={{
          opacity: tline.visible ? 1 : 0,
          transform: tline.visible ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'all 1s ease 0.2s',
        }}>
          <h3 style={{
            color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
            margin: '0 0 2rem', fontWeight: 700,
          }}>
            &gt; PARCOURS.LOG
          </h3>
          <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
            {/* Ligne verticale */}
            <div style={{
              position: 'absolute', left: '0.3rem', top: '0.3rem', bottom: '0.3rem',
              width: '1px', background: 'linear-gradient(to bottom, rgba(212,193,154,0.6), transparent)',
            }} />
            {TIMELINE.map((item, i) => (
              <div key={item.year} style={{
                position: 'relative', marginBottom: '1.5rem',
                opacity: tline.visible ? 1 : 0,
                transform: tline.visible ? 'translateX(0)' : 'translateX(-15px)',
                transition: `all 0.6s ease ${0.4 + i * 0.12}s`,
              }}>
                {/* Point sur la ligne */}
                <div style={{
                  position: 'absolute', left: '-1.5rem', top: '0.3rem',
                  width: '11px', height: '11px',
                  borderRadius: '50%', background: '#ffd97a',
                  boxShadow: '0 0 12px #ffd97a',
                  border: '2px solid #050309',
                }} />
                <div style={{
                  color: '#ffd97a', fontSize: '0.7rem', letterSpacing: '0.2em',
                  fontWeight: 700,
                }}>
                  {item.year}
                </div>
                <div style={{
                  color: 'rgba(245,239,224,0.95)', fontSize: '0.95rem',
                  marginTop: '0.3rem', fontWeight: 600,
                }}>
                  {item.title}
                </div>
                <div style={{
                  color: 'rgba(245,239,224,0.65)', fontSize: '0.8rem',
                  marginTop: '0.2rem', lineHeight: 1.5,
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VALEURS */}
        <div ref={vals.ref} style={{
          opacity: vals.visible ? 1 : 0,
          transform: vals.visible ? 'translateX(0)' : 'translateX(30px)',
          transition: 'all 1s ease 0.4s',
        }}>
          <h3 style={{
            color: '#d4c19a', fontSize: '0.7rem', letterSpacing: '0.35em',
            margin: '0 0 2rem', fontWeight: 700,
          }}>
            &gt; VALEURS.CFG
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {VALUES.map((v, i) => (
              <div key={v.title}
                className="value-card"
                style={{
                  padding: '1.2rem',
                  background: 'rgba(212,193,154,0.04)',
                  border: '1px solid rgba(212,193,154,0.15)',
                  borderRadius: '4px',
                  opacity: vals.visible ? 1 : 0,
                  transform: vals.visible ? 'translateY(0)' : 'translateY(15px)',
                  transition: `all 0.6s ease ${0.6 + i * 0.1}s, background 0.25s, border-color 0.25s`,
                  cursor: 'default',
                }}>
                <div style={{
                  color: '#ffd97a', fontSize: '1.5rem', marginBottom: '0.5rem',
                  textShadow: '0 0 15px rgba(255,217,122,0.5)',
                }}>{v.icon}</div>
                <div style={{
                  color: 'rgba(245,239,224,0.95)', fontSize: '0.9rem',
                  letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.4rem',
                }}>{v.title}</div>
                <div style={{
                  color: 'rgba(245,239,224,0.65)', fontSize: '0.75rem', lineHeight: 1.5,
                }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .value-card:hover {
          background: rgba(212,193,154,0.08) !important;
          border-color: rgba(255,217,122,0.4) !important;
          transform: translateY(-3px) !important;
        }

        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
