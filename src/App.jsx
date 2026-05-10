import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HeroSceneWrapper from './components/Hero/HeroSceneWrapper';

export default function App() {
  const handleNavigate = (section) => {
    console.log('[Nav] →', section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <main>
              <section id="hero">
                <HeroSceneWrapper onNavigate={handleNavigate} />
              </section>

              {/* Sections a venir :
                  <section id="projets"><ProjectsPage /></section>
                  <section id="competences"><SkillsPage /></section>
                  <section id="contact"><ContactPage /></section>
              */}
            </main>
          }
        />

        {/* Routes admin a venir (etape 5)
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
        */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}