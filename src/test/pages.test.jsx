import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as api from '../lib/api';
import ProjectDetail from '../components/Pages/ProjectDetail';
import ProjectsPage from '../components/Pages/ProjectsPage';
import SectionProjects from '../components/Sections/SectionProjects';
import SectionContact from '../components/Sections/SectionContact';

// WebGL is not available in jsdom
vi.mock('../components/Scene3D/PersistentScene', () => ({ default: () => null }));

const githubProject = {
  _id: 'p1',
  slug: 'portfolio-3d',
  title: 'Portfolio 3D',
  description: 'Immersive portfolio',
  status: 'published',
  featured: true,
  year: 2025,
  techStack: ['React', 'Three.js'],
  gallery: ['https://raw.githubusercontent.com/kev/p/main/1.png', 'https://raw.githubusercontent.com/kev/p/main/2.png'],
  repoUrl: 'https://github.com/kev/portfolio-3d',
  contentFormat: 'markdown',
  contentHtml: '<h2>Installation</h2><p>Run <code>npm i</code></p>',
  github: {
    fullName: 'kev/portfolio-3d', htmlUrl: 'https://github.com/kev/portfolio-3d', stars: 12, forks: 3,
    pushedAt: '2025-05-01T10:00:00Z', topics: ['threejs', 'portfolio'],
    languages: [{ name: 'JavaScript', bytes: 70, percent: 70 }, { name: 'CSS', bytes: 30, percent: 30 }],
  },
};

const renderAt = (path, element, routePath) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath ?? path} element={element} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProjectDetail', () => {
  let apiGet;
  beforeEach(() => {
    apiGet = vi.spyOn(api, 'apiGet');
  });

  it('fetches the project by slug and renders the README and GitHub stats', async () => {
    apiGet.mockResolvedValue(githubProject);
    renderAt('/projets/portfolio-3d', <ProjectDetail />, '/projets/:slug');
    expect(await screen.findByRole('heading', { name: 'Installation' })).toBeInTheDocument();
    expect(apiGet).toHaveBeenCalledWith('/projects/slug/portfolio-3d');
    expect(screen.getByTestId('project-content')).toContainHTML('<code>npm i</code>');
    const panel = screen.getByRole('region', { name: 'Dépôt GitHub' });
    expect(within(panel).getByText('★ 12')).toBeInTheDocument();
    expect(within(panel).getByText('⑂ 3')).toBeInTheDocument();
    expect(within(panel).getByRole('img', { name: 'JavaScript 70 %, CSS 30 %' })).toBeInTheDocument();
    expect(within(panel).getByText('#threejs')).toBeInTheDocument();
  });

  it('shows "introuvable" on 404', async () => {
    apiGet.mockRejectedValue(Object.assign(new Error('Not found'), { response: { status: 404 } }));
    renderAt('/projets/nope', <ProjectDetail />, '/projets/:slug');
    expect(await screen.findByText('Projet introuvable')).toBeInTheDocument();
  });

  it('uses the bundled fallback when the API is down', async () => {
    apiGet.mockRejectedValue(new Error('Network Error'));
    renderAt('/projets/portfolio-admin', <ProjectDetail />, '/projets/:slug');
    expect(await screen.findByRole('heading', { level: 1, name: 'Portfolio Admin' })).toBeInTheDocument();
  });

  it('keeps plain-text descriptions readable', async () => {
    apiGet.mockResolvedValue({ ...githubProject, github: undefined, contentHtml: '', longDescription: 'Line 1\nLine 2' });
    renderAt('/projets/portfolio-3d', <ProjectDetail />, '/projets/:slug');
    expect(await screen.findByText(/Line 1/)).toBeInTheDocument();
    expect(screen.queryByTestId('project-content')).toBeNull();
  });

  it('opens the lightbox on click only — arrow keys no longer open it', async () => {
    apiGet.mockResolvedValue(githubProject);
    renderAt('/projets/portfolio-3d', <ProjectDetail />, '/projets/:slug');
    await screen.findByRole('heading', { name: 'Installation' });

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByAltText('Capture 1'));
    const dialog = screen.getByRole('dialog', { name: "Galerie d'images" });
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('never shows an empty lightbox for projects without gallery', async () => {
    apiGet.mockResolvedValue({ ...githubProject, gallery: [] });
    renderAt('/projets/portfolio-3d', <ProjectDetail />, '/projets/:slug');
    await screen.findByRole('heading', { name: 'Installation' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('ProjectsPage', () => {
  const projects = [
    { _id: '1', slug: 'old', title: 'Old', status: 'archived', year: 2020, techStack: ['PHP'] },
    { _id: '2', slug: 'main', title: 'Main', status: 'published', featured: true, year: 2025, techStack: ['React'], github: { fullName: 'kev/main', stars: 7 } },
    { _id: '3', slug: 'wip', title: 'Wip', status: 'draft', year: 2025, techStack: ['React', 'Go'] },
  ];

  it('lists projects (featured first) with a light payload and filters them', async () => {
    const apiGet = vi.spyOn(api, 'apiGet').mockResolvedValue(projects);
    renderAt('/projets', <ProjectsPage />);
    const titles = async () => (await screen.findAllByRole('heading', { level: 3 })).map((h) => h.textContent);
    expect(await titles()).toEqual(['Main', 'Wip', 'Old']);
    expect(apiGet).toHaveBeenCalledWith('/projects?summary=true');
    expect(screen.getByText('GITHUB · ★ 7')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'WIP' }));
    expect(await titles()).toEqual(['Wip']);
    await userEvent.click(screen.getByRole('button', { name: /REINITIALISER/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(await titles()).toEqual(['Wip']);
    // the cached API response was not reordered in place
    expect(projects.map((p) => p.slug)).toEqual(['old', 'main', 'wip']);
  });
});

describe('SectionProjects (home)', () => {
  it('shows featured projects first, hides archived ones and links to the full list', async () => {
    vi.spyOn(api, 'apiGet').mockResolvedValue([
      { _id: '1', slug: 'a', title: 'A', order: 0 },
      { _id: '2', slug: 'b', title: 'B', order: 3, featured: true },
      { _id: '3', slug: 'c', title: 'C', order: 1 },
      { _id: '4', slug: 'd', title: 'D', order: 2 },
      { _id: '5', slug: 'e', title: 'E', order: 4 },
      { _id: '6', slug: 'f', title: 'F', status: 'archived', featured: true },
    ]);
    renderAt('/', <SectionProjects />);
    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4));
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['B', 'A', 'C', 'D']);
    expect(screen.getByRole('link', { name: /VOIR TOUS LES PROJETS \(5\)/ })).toHaveAttribute('href', '/projets');
  });
});

describe('SectionContact', () => {
  const fill = async () => {
    await userEvent.type(screen.getByPlaceholderText('Votre identite...'), '  Ada  ');
    await userEvent.type(screen.getByPlaceholderText('contact@galaxy.io'), 'ada@x.dev');
    await userEvent.type(screen.getByPlaceholderText('Transmettez votre signal...'), 'Hello, I have a project for you.');
  };

  it('sends a trimmed message without empty subject', async () => {
    const post = vi.spyOn(api, 'apiPost').mockResolvedValue({});
    render(<SectionContact />);
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /EMETTRE LE SIGNAL/ }));
    expect(post).toHaveBeenCalledWith('/contacts', {
      name: 'Ada', email: 'ada@x.dev', subject: undefined, message: 'Hello, I have a project for you.',
    });
    expect(await screen.findByRole('button', { name: /SIGNAL CAPTE/ })).toBeDisabled();
  });

  it('displays the API validation message', async () => {
    vi.spyOn(api, 'apiPost').mockRejectedValue({ response: { data: { message: ['message must be longer than or equal to 10 characters'] } } });
    render(<SectionContact />);
    await fill();
    await userEvent.click(screen.getByRole('button', { name: /EMETTRE LE SIGNAL/ }));
    expect(await screen.findByText(/message must be longer/)).toBeInTheDocument();
  });
});
