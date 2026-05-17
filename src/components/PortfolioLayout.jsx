import { useEffect, useRef, useState } from 'react';
import PersistentScene    from './Scene3D/PersistentScene';
import SectionHero        from './Sections/SectionHero';
import SectionAbout       from './Sections/SectionAbout';
import SectionSkills      from './Sections/SectionSkills';
import SectionExperience  from './Sections/SectionExperience';
import SectionEducation   from './Sections/SectionEducation';
import SectionProjects    from './Sections/SectionProjects';
import SectionContact     from './Sections/SectionContact';
import GlobalNav          from './GlobalNav';

// SECTIONS drives nav + observer. Each section has its OWN astre in
// PersistentScene — the camera Bezier-travels between all 7 astres.
const SECTIONS = [
  { id: 'hero',       label: 'ACCUEIL',     astreIndex: 0 },
  { id: 'about',      label: 'A PROPOS',    astreIndex: 1 },
  { id: 'skills',     label: 'COMPETENCES', astreIndex: 2 },
  { id: 'experience', label: 'EXPERIENCES', astreIndex: 3 },
  { id: 'education',  label: 'PARCOURS',    astreIndex: 4 },
  { id: 'projects',   label: 'PROJETS',     astreIndex: 5 },
  { id: 'contact',    label: 'CONTACT',     astreIndex: 6 },
];

export default function PortfolioLayout() {
  // Ref shared with PersistentScene (no re-render needed)
  const activeSectionRef = useRef(0);
  // State for nav UI
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    const sections = SECTIONS
      .map(s => ({ ...s, el: document.getElementById(s.id) }))
      .filter(s => s.el);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          const section = sections.find(s => s.el === entry.target);
          if (section) {
            activeSectionRef.current = section.astreIndex;
            setActiveId(section.id);
          }
        }
      });
    }, {
      threshold: [0.4, 0.6, 0.8],
      rootMargin: '-10% 0px -10% 0px',
    });

    sections.forEach(s => observer.observe(s.el));
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
      {/* Persistent 3D scene (Hero / Saturne / Skills / Projects / Contact) */}
      <PersistentScene activeSectionRef={activeSectionRef} />

      {/* Sticky global nav */}
      <GlobalNav sections={SECTIONS} activeId={activeId} onNavigate={scrollTo} />

      {/* Stacked sections */}
      <main style={{ position: 'relative', zIndex: 5 }}>
        <SectionHero       onNavigate={scrollTo} />
        <SectionAbout />
        <SectionSkills />
        <SectionExperience />
        <SectionEducation />
        <SectionProjects />
        <SectionContact />
      </main>

      {/* Global status bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.7rem 2.5rem',
        borderTop: '1px solid rgba(212,193,154,0.07)',
        background: 'rgba(5,3,9,0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ color: 'rgba(212,193,154,0.65)', fontSize: '0.6rem', letterSpacing: '0.25em' }}>
          v2.1.0 <span style={{ color: '#ffd97a', animation: 'blink 1.5s ease-in-out infinite' }}>●</span>
        </span>
        <span style={{ color: 'rgba(245,239,224,0.25)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          {activeId.toUpperCase()}
        </span>
        <span style={{ color: 'rgba(138,111,63,0.7)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>
          THREE.JS r168
        </span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #050309; }

        @media (max-width: 768px) {
          html { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
