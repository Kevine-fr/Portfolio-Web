import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Le 18/11/2026, nginx a publié 1.30.7 (stable) et 1.31.9 (mainline) contre
// dix failles, dont NGINX2Root (CVE-2026-123007). L'image servait
// « nginx:alpine » : une étiquette flottante, qui ne dit pas quelle version
// tourne et ne protège pas une image bâtie avant le correctif.
const MINIMUM = { '1.30': '1.30.7', '1.31': '1.31.9' };

const comparer = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

export function nginxSur(etiquette) {
  const version = /^(\d+)\.(\d+)\.(\d+)/.exec(etiquette)?.[0];
  if (!version) return false;
  const branche = version.split('.').slice(0, 2).join('.');
  if (MINIMUM[branche]) return comparer(version, MINIMUM[branche]) >= 0;
  return comparer(version, '1.32.0') >= 0;
}

describe('image nginx', () => {
  it('reconnaît les étiquettes flottantes ou antérieures au correctif', () => {
    for (const e of ['alpine', 'stable-alpine', '1.30-alpine', '1.30.6-alpine', '1.31.8', '1.28.3-alpine']) {
      expect(nginxSur(e), e).toBe(false);
    }
    for (const e of ['1.30.7-alpine', '1.30.10-alpine', '1.31.9', '1.32.0-alpine']) {
      expect(nginxSur(e), e).toBe(true);
    }
  });

  it('Dockerfile.prod et la CI servent une version corrigée et figée', () => {
    for (const fichier of ['Dockerfile.prod', '.github/workflows/ci.yml']) {
      // Les commentaires sont ignorés : ils citent l'ancienne étiquette.
      const code = readFileSync(fichier, 'utf8').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
      const etiquettes = [...code.matchAll(/\bnginx:(\S+)/g)].map((m) => m[1]);
      expect(etiquettes.length, fichier).toBeGreaterThan(0);
      for (const e of etiquettes) expect(nginxSur(e), `${fichier} : nginx:${e}`).toBe(true);
    }
  });
});
