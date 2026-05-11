// ─── Design tokens centralises (palette + utilitaires) ───────────────────────
export const COLORS = {
  bg:           0x050309,
  bgHex:       '#050309',
  goldPale:     0xd4c19a,
  goldPaleHex: '#d4c19a',
  goldDeep:     0x8a6f3f,
  goldDeepHex: '#8a6f3f',
  goldGlow:     0xffd97a,
  goldGlowHex: '#ffd97a',
  blackMetal:   0x050309,
  whiteHex:    '#f5efe0',
  // Couleurs specifiques sections
  blueWhite:    0xc8e8ff,    // naine blanche (contact)
  blueWhiteHex:'#c8e8ff',
  accretion:    0xff8c42,    // disque trou noir (projets)
};

// Niveaux d'opacite pour TEXTE - remontes pour lisibilite recruteur
export const TEXT_OPACITY = {
  primary:   0.95,
  secondary: 0.75,
  tertiary:  0.6,
  ghost:     0.42,
};

// Detection performance
export function getPerformanceTier() {
  if (typeof navigator === 'undefined') return 'high';
  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) return 'low';
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      if (/Intel/i.test(renderer) && !/Iris|Arc/i.test(renderer)) return 'medium';
    }
  }
  return 'high';
}

// Easing
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Detection mobile pour responsive logic
export const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;
