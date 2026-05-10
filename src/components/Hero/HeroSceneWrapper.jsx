import { useEffect, useState, lazy, Suspense } from 'react';
import HeroSceneFallback from './HeroSceneFallback';

// Lazy-loading : Three.js (~600 KB) n'est telecharge QUE si WebGL est dispo
const HeroScene = lazy(() => import('./HeroScene'));

/**
 * Detecte le support WebGL en creant un canvas test.
 * Resultat: true si WebGL fonctionne, false sinon.
 */
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) return false;

    // Test supplementaire : verifier que le contexte n'est pas "perdu"
    // (cas Chrome avec hardware acceleration desactivee)
    const isLost = gl.isContextLost && gl.isContextLost();
    return !isLost;
  } catch (e) {
    return false;
  }
}

/**
 * Detecte si l'utilisateur prefere les animations reduites
 * (accessibilite, preference systeme)
 */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Wrapper intelligent : choisit entre HeroScene (3D) et HeroSceneFallback (CSS).
 * Detection au mount, basculement transparent.
 */
export default function HeroSceneWrapper(props) {
  const [mode, setMode] = useState('detecting'); // 'detecting' | '3d' | 'fallback'

  useEffect(() => {
    // Si l'utilisateur veut des animations reduites, on passe en fallback
    if (prefersReducedMotion()) {
      setMode('fallback');
      return;
    }

    // Sinon on teste WebGL
    const webglOk = detectWebGL();
    setMode(webglOk ? '3d' : 'fallback');
  }, []);

  // Pendant la detection : ecran de chargement minimal (evite le flash)
  if (mode === 'detecting') {
    return (
      <div style={{
        width: '100%', height: '100vh',
        background: '#050309',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: '#d4c19a', fontFamily: "'Courier New',monospace",
          fontSize: '0.7rem', letterSpacing: '0.4em', opacity: 0.5,
        }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (mode === 'fallback') {
    return <HeroSceneFallback {...props} />;
  }

  // mode === '3d'
  return (
    <Suspense fallback={<HeroSceneFallback {...props} />}>
      <HeroScene {...props} />
    </Suspense>
  );
}
