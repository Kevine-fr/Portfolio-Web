import { describe, expect, it, vi } from 'vitest';
import { resolveMediaUrl } from '../lib/api';
import { byMostRecent, formatDayMonthYear, formatMonthYear, getYear, toTime } from '../lib/dates';
import { languageColor, selectHomeProjects, sortProjects } from '../lib/projects';

describe('resolveMediaUrl', () => {
  it('prefixes uploads with the API origin and keeps absolute URLs', () => {
    expect(resolveMediaUrl('/uploads/a.png')).toBe('http://localhost:3001/uploads/a.png');
    expect(resolveMediaUrl('https://raw.githubusercontent.com/o/r/main/a.png')).toBe('https://raw.githubusercontent.com/o/r/main/a.png');
    expect(resolveMediaUrl('')).toBe('');
    expect(resolveMediaUrl(undefined)).toBe('');
  });
});

describe('dates', () => {
  it('formats in UTC (no off-by-one month in western time zones)', () => {
    expect(formatMonthYear('2024-03-01T00:00:00.000Z')).toBe('mars 2024');
    expect(formatDayMonthYear('2025-01-09T23:00:00Z')).toBe('9 janv. 2025');
    expect(formatMonthYear('nope')).toBe('');
    expect(getYear('2021-06-01')).toBe(2021);
    expect(toTime(null)).toBe(0);
  });

  it('sorts current positions first, then by full start date', () => {
    const list = [
      { title: 'a', startDate: '2023-01-01' },
      { title: 'b', startDate: '2023-09-01' },
      { title: 'c', startDate: '2020-01-01', current: true },
    ];
    expect([...list].sort(byMostRecent).map((x) => x.title)).toEqual(['c', 'b', 'a']);
  });
});

describe('project ordering', () => {
  const projects = [
    { slug: 'a', order: 0, year: 2020 },
    { slug: 'b', order: 5, featured: true },
    { slug: 'c', order: 1, status: 'archived', featured: true },
    { slug: 'd', order: 1, featured: true },
    { slug: 'e', order: 0, year: 2024 },
  ];

  it('puts featured projects first on the home page and hides archived ones', () => {
    expect(selectHomeProjects(projects).map((p) => p.slug)).toEqual(['d', 'b', 'e', 'a']);
    expect(selectHomeProjects(projects, 2)).toHaveLength(2);
    expect(selectHomeProjects(null)).toEqual([]);
  });

  it('never mutates the input array', () => {
    const copy = [...projects];
    sortProjects(projects);
    expect(projects).toEqual(copy);
  });

  it('has colours for common languages', () => {
    expect(languageColor('TypeScript')).toBe('#3178c6');
    expect(languageColor('Brainfuck')).toBe('#d4c19a');
  });
});

describe('version', () => {
  it('reads window.APP_VERSION and keeps only the semver part', async () => {
    vi.resetModules();
    window.APP_VERSION = 'prod-v1.0.19';
    const mod = await import('../lib/version');
    expect(mod.APP_VERSION).toBe('prod-v1.0.19');
    expect(mod.APP_VERSION_DISPLAY).toBe('v1.0.19');
    delete window.APP_VERSION;
    vi.resetModules();
    expect((await import('../lib/version')).APP_VERSION_DISPLAY).toBe('dev');
  });
});
