import { expect, test } from '@playwright/test';
import { apiResponse } from './fixtures.js';

// Du plus petit téléphone courant au grand écran
const WIDTHS = [320, 390, 768, 1024, 1440];

const PAGES = [
  { name: 'accueil', path: '/' },
  { name: 'projets', path: '/projets' },
  { name: 'détail projet', path: '/projets/portfolio-3d' },
  { name: 'expériences', path: '/experiences' },
  { name: 'parcours', path: '/parcours' },
  { name: '404', path: '/page-inexistante' },
];

/**
 * Éléments qui dépassent du viewport sans être dans un conteneur qui défile
 * ou qui les rogne (un tableau défilable dans le README est légitime).
 */
async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || getComputedStyle(el).position === 'fixed') continue;
      let parent = el.parentElement;
      let contained = false;
      while (parent && parent !== document.body) {
        if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowX)) {
          contained = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!contained && r.right > vw + 1) {
        offenders.push(`<${el.tagName.toLowerCase()}> dépasse de ${Math.round(r.right - vw)} px : « ${(el.textContent || '').trim().slice(0, 40)} »`);
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, viewport: vw, offenders: offenders.slice(0, 5) };
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: apiResponse(route.request().url()) }));
  // Images factices : seule leur taille compte ici
  await page.route('**/uploads/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400"><rect width="100%" height="100%" fill="#445"/></svg>',
    }),
  );
});

for (const width of WIDTHS) {
  for (const { name, path } of PAGES) {
    test(`${name} — aucun défilement horizontal à ${width} px`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'load' });
      await page.waitForTimeout(1200); // animations d'apparition et données simulées

      const result = await horizontalOverflow(page);
      expect(result.offenders, result.offenders.join('\n')).toEqual([]);
      expect(result.scrollWidth).toBeLessThanOrEqual(result.viewport);
      expect(errors).toEqual([]);
    });
  }
}

test('le README garde ses tableaux lisibles sur mobile (défilement au lieu de mots coupés)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/projets/portfolio-3d');
  const table = page.locator('.md-content table');
  await expect(table).toBeVisible();
  // L'en-tête « Description » tenait sur plusieurs lignes, lettre par lettre
  const header = table.locator('th', { hasText: 'Description' });
  expect((await header.boundingBox()).height).toBeLessThan(40);
  const scrollable = await table.evaluate((t) => t.scrollWidth > t.clientWidth);
  expect(scrollable).toBe(true);
});

test('un titre de projet long tient sur une ligne dans la barre du haut', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/projets/portfolio-3d');
  const label = page.locator('header span', { hasText: 'PORTFOLIO 3D IMMERSIF' });
  await expect(label).toBeVisible();
  expect((await label.boundingBox()).height).toBeLessThan(24);
});
