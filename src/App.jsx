import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioLayout from './components/PortfolioLayout';
import Loader from './components/Shared/Loader';

// Secondary pages are loaded on demand: the home page no longer downloads
// the code of every route up front.
const ProjectsPage    = lazy(() => import('./components/Pages/ProjectsPage'));
const ProjectDetail   = lazy(() => import('./components/Pages/ProjectDetail'));
const ExperiencesPage = lazy(() => import('./components/Pages/ExperiencesPage'));
const ParcoursPage    = lazy(() => import('./components/Pages/ParcoursPage'));
const NotFound        = lazy(() => import('./components/Pages/NotFound'));
const NavigationPage  = lazy(() => import('./components/Pages/NavigationPage'));

function RouteFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#050309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"              element={<PortfolioLayout />} />
          <Route path="/projets"       element={<ProjectsPage />} />
          <Route path="/projets/:slug" element={<ProjectDetail />} />
          <Route path="/experiences"   element={<ExperiencesPage />} />
          <Route path="/parcours"      element={<ParcoursPage />} />
          <Route path="/naviguer"      element={<NavigationPage />} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
