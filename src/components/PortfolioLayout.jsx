import { useEffect, useRef, useState } from 'react';
import PersistentScene from './Scene3D/PersistentScene';
import SectionHero     from './Sections/SectionHero';
import SectionAbout    from './Sections/SectionAbout';
import SectionSkills   from './Sections/SectionSkills';
import SectionProjects from './Sections/SectionProjects';
import SectionContact  from './Sections/SectionContact';
import GlobalNav       from './GlobalNav';

const SECTIONS = [
  { id: 'hero',     index: 0, label: 'ACCUEIL' },
  { id: 'about',    index: 1, label: 'A PROPOS' },
  { id: 'skills',   index: 2, label: 'COMPETENCES' },
  { id: 'projects', index: 3, label: 'PROJETS' },
  { id: 'contact',  index: 4, label: 'CONTACT' },
];

export default function PortfolioLayout() {
  // Ref partagee avec PersistentScene (mise a jour sans re-render)
  const activeSectionRef = useRef(0);
  // State pour la nav UI (re-render OK ici)
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    // Intersection Observer pour detecter quelle section est visible
    const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          const section = SECTIONS.find(s => s.id === entry.target.id);
          if (section) {
            activeSectionRef.current = section.index;
            setActiveId(section.id);
          }
        }
      });
    }, {
      threshold: [0.4, 0.6, 0.8],
      rootMargin: '-10% 0px -10% 0px',
    });

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: '#050309',
      fontFamily: "'Courier New',monospace",
    }}>
      {/* Scene 3D persistante en arriere-plan */}
      <PersistentScene activeSectionRef={activeSectionRef} />

      {/* Navigation globale (sticky) */}
      <GlobalNav sections={SECTIONS} activeId={activeId} onNavigate={scrollTo} />

      {/* Sections empilees */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        <SectionHero    onNavigate={scrollTo} />
        <SectionAbout />
        <SectionSkills />
        <SectionProjects />
        <SectionContact />
      </main>

      {/* Status bar globale */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.7rem 2.5rem',
        borderTop: '1px solid rgba(212,193,154,0.07)',
        background: 'rgba(5,3,9,0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ color: 'rgba(212,193,154,0.65)', fontSize: '0.6rem', letterSpacing: '0.25em' }}>
          SYS:READY <span style={{ color: '#ffd97a', animation: 'blink 1.5s ease-in-out infinite' }}>●</span>
        </span>
        <span style={{ color: 'rgba(245,239,224,0.25)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          SECTION: {activeId.toUpperCase()}
        </span>
        <span style={{ color: 'rgba(138,111,63,0.7)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          THREE.JS r168
        </span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #050309; }

        /* Responsive base */
        @media (max-width: 768px) {
          html { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
