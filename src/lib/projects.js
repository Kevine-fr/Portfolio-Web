/** Home page selection: non-archived, featured first, then admin order (stable). */
export function selectHomeProjects(data, max = 4) {
  return sortProjects((data || []).filter((p) => p.status !== 'archived')).slice(0, max);
}

/** Featured first, then by `order`, then most recent year — never mutates the input. */
export function sortProjects(list) {
  return (list || [])
    .map((p, i) => ({ p, i }))
    .sort((a, b) =>
      (b.p.featured === true) - (a.p.featured === true)
      || (a.p.order ?? 0) - (b.p.order ?? 0)
      || (b.p.year ?? 0) - (a.p.year ?? 0)
      || a.i - b.i)
    .map(({ p }) => p);
}

/** Linguist colours for the most common languages (fallback: portfolio gold). */
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', SCSS: '#c6538c',
  Vue: '#41b883', Svelte: '#ff3e00', Python: '#3572A5', Go: '#00ADD8', Java: '#b07219', Kotlin: '#A97BFF',
  PHP: '#4F5D95', Ruby: '#701516', Rust: '#dea584', 'C#': '#178600', 'C++': '#f34b7d', C: '#555555',
  Shell: '#89e051', Dockerfile: '#384d54', GLSL: '#5686a5', Dart: '#00B4AB', Swift: '#F05138',
};
export function languageColor(name) {
  return LANGUAGE_COLORS[name] || '#d4c19a';
}
