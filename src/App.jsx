import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioLayout  from './components/PortfolioLayout';
import ProjectsPage     from './components/Pages/ProjectsPage';
import ProjectDetail    from './components/Pages/ProjectDetail';
import ExperiencesPage  from './components/Pages/ExperiencesPage';
import ParcoursPage     from './components/Pages/ParcoursPage';
import NotFound         from './components/Pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<PortfolioLayout />} />
        <Route path="/projets"       element={<ProjectsPage />} />
        <Route path="/projets/:slug" element={<ProjectDetail />} />
        <Route path="/experiences"   element={<ExperiencesPage />} />
        <Route path="/parcours"      element={<ParcoursPage />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
