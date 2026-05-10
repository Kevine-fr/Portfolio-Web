import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ─── Hook typing ─────────────────────────────────────────────────────────────
function useTyping(texts, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = texts[textIndex];
    let t;
    if (!deleting && charIndex < cur.length)        t = setTimeout(() => setCharIndex(c => c + 1), speed);
    else if (!deleting && charIndex === cur.length) t = setTimeout(() => setDeleting(true), 2200);
    else if (deleting && charIndex > 0)             t = setTimeout(() => setCharIndex(c => c - 1), speed / 2);
    else { setDeleting(false); setTextIndex(i => (i + 1) % texts.length); }
    setDisplayed(cur.slice(0, charIndex));
    return () => clearTimeout(t);
  }, [charIndex, deleting, textIndex, texts, speed]);
  return displayed;
}

const ROLES     = ['Developpeur Full-Stack','Architecte Cloud','Passionne 3D & WebGL','Creative Developer'];
const NAV_ITEMS = ['A propos','Projets','Competences','Contact'];

// ─── PALETTE OR NOIR / OR PALE ───────────────────────────────────────────────
const COLORS = {
  bg:           0x050309,
  bgHex:       '#050309',
  goldPale:     0xd4c19a,    // or pale luxe (accent principal)
  goldPaleHex: '#d4c19a',
  goldDeep:     0x8a6f3f,    // or fonce (accent secondaire)
  goldDeepHex: '#8a6f3f',
  blackMetal:   0x0a0810,    // metal sombre (base du chrome noir)
  whiteHex:    '#f5efe0',    // blanc creme legerement chaud
};

// ─── Texture etoile ──────────────────────────────────────────────────────────
function makeStarTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0,    'rgba(255,250,240,1)');
  g.addColorStop(0.18, 'rgba(245,238,220,0.95)');
  g.addColorStop(0.5,  'rgba(212,193,154,0.4)');
  g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ─── Cubemap procedural — nebuleuse or noir ──────────────────────────────────
// Cle pour CHROME MIROIR : faces tres CONTRASTEES (zones noires + zones lumineuses)
// C'est ce contraste qui fait que les reflets sont LISIBLES sur la surface metallique
function makeEnvironmentMap() {
  const size = 512;  // plus haute resolution = reflets plus nets
  const faces = [];

  // Palette : noir profond -> or fonce -> or pale
  const colors = [
    ['#020108', '#1a1208', '#8a6f3f'],  // +X or fonce
    ['#020108', '#0a0805', '#3a2f1f'],  // -X tres sombre
    ['#020108', '#2a1f10', '#d4c19a'],  // +Y haut clair (la lumiere vient du haut)
    ['#000000', '#050308', '#0a0810'],  // -Y bas tres noir
    ['#020108', '#1a0f05', '#a08555'],  // +Z or chaud
    ['#020108', '#0a0608', '#1a1410'],  // -Z sombre
  ];

  colors.forEach(([c1, c2, c3], faceIdx) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');

    // Gradient radial pour des highlights organiques
    const g = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.5, size * 0.9);
    g.addColorStop(0,   c3);
    g.addColorStop(0.4, c2);
    g.addColorStop(1,   c1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // Highlights blancs concentres = reflets brillants sur le chrome noir
    if (faceIdx === 2) {  // face top : zone tres lumineuse pour simuler lumiere zenithale
      const hl = ctx.createRadialGradient(size * 0.5, size * 0.35, 0, size * 0.5, size * 0.35, size * 0.4);
      hl.addColorStop(0,   'rgba(245,238,220,0.9)');
      hl.addColorStop(0.5, 'rgba(212,193,154,0.3)');
      hl.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = hl;
      ctx.fillRect(0, 0, size, size);
    }

    // Etoiles dans les reflets
    ctx.fillStyle = 'rgba(245,238,220,0.95)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.5 + 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    faces.push(cv);
  });

  const tex = new THREE.CubeTexture(faces);
  tex.needsUpdate = true;
  return tex;
}

// ─── Galaxie ─────────────────────────────────────────────────────────────────
function makeGalaxy(starTex) {
  const N = 9000;
  const ARMS = 4;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);

  // Etoiles palette or/blanc creme (cohérent avec le theme luxe)
  const palette = [
    [1.0,  0.97, 0.88],   // blanc creme
    [0.95, 0.92, 0.82],   // blanc dore
    [1.0,  0.88, 0.65],   // jaune dore
    [0.83, 0.65, 0.35],   // or chaud (rare)
    [0.85, 0.92, 1.0],    // bleu-blanc (contraste rare)
  ];

  for (let i = 0; i < N; i++) {
    const isFar = Math.random() < 0.4;
    if (isFar) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 26 + Math.random() * 22;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      pos[i*3+2] = r * Math.cos(phi);
    } else {
      const arm    = i % ARMS;
      const t      = Math.random();
      const radius = Math.pow(t, 0.55) * 16;
      const angle  = (arm / ARMS) * Math.PI * 2 + t * Math.PI * 3 + (Math.random() - 0.5) * 0.45;
      const spread = (Math.random() - 0.5) * radius * 0.18;
      pos[i*3]   = Math.cos(angle) * radius + spread;
      pos[i*3+1] = (Math.random() - 0.5) * 1.4;
      pos[i*3+2] = Math.sin(angle) * radius + spread;
    }

    const r = Math.random();
    let c;
    if      (r < 0.04) c = palette[4];                                  // bleu-blanc rare
    else if (r < 0.10) c = palette[3];                                  // or chaud
    else               c = palette[Math.floor(Math.random() * 3)];

    const bright = 0.4 + Math.random() * 0.6;
    col[i*3]   = c[0] * bright;
    col[i*3+1] = c[1] * bright;
    col[i*3+2] = c[2] * bright;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.15, vertexColors: true, map: starTex,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 1.0,
  });
  return new THREE.Points(geo, mat);
}

// ─── Composant ───────────────────────────────────────────────────────────────
export default function HeroScene({ onNavigate }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [mouse,  setMouse]  = useState({ x: '0.00', y: '0.00' });
  const role = useTyping(ROLES, 80);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COLORS.bg, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 1.2, 8.5);

    const envMap = makeEnvironmentMap();
    scene.environment = envMap;

    // ── Lumieres : palette or/blanc ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1a1410, 0.3));   // ambient tres faible

    // Key light : or pale, intense (creates main highlights)
    const keyLight = new THREE.PointLight(COLORS.goldPale, 3.0, 30);
    keyLight.position.set(5, 4, 5);
    scene.add(keyLight);

    // Fill light : or fonce, lateral
    const fillLight = new THREE.PointLight(COLORS.goldDeep, 1.5, 28);
    fillLight.position.set(-5, -1, 4);
    scene.add(fillLight);

    // Rim light : blanc froid pour contour metallique
    const rimLight = new THREE.PointLight(0xeef4ff, 1.2, 25);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // ── Galaxie ──────────────────────────────────────────────────────────────
    const starTex = makeStarTexture();
    const galaxy  = makeGalaxy(starTex);
    scene.add(galaxy);

    // ── TORUS KNOT METAL NOIR PRINCIPAL ──────────────────────────────────────
    // Cle du metal noir pro :
    //   - color tres sombre (presque noir)
    //   - metalness 1.0 (100% metal)
    //   - roughness 0 (miroir parfait, pas vitre)
    //   - envMapIntensity eleve = reflets bien visibles
    const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.42, 300, 40, 2, 3);  // segments+ pour nettete
    const chromeKnot = new THREE.Mesh(
      knotGeo,
      new THREE.MeshStandardMaterial({
        color:           COLORS.blackMetal,
        metalness:       1.0,
        roughness:       0.0,        // 0 = miroir parfait (pas verre)
        envMap:          envMap,
        envMapIntensity: 2.2,        // augmente = reflets plus prononces
      })
    );
    chromeKnot.position.x = 2;
    scene.add(chromeKnot);

    // Sphere or pale en orbite (plus chaude)
    const chromeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 64, 64),
      new THREE.MeshStandardMaterial({
        color:           0x6a5530,    // teinte or fonce sur surface
        metalness:       1.0,
        roughness:       0.05,
        envMap:          envMap,
        envMapIntensity: 1.8,
      })
    );
    scene.add(chromeSphere);

    // Dodecaedre noir metal angulaire
    const chromeDodec = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.MeshStandardMaterial({
        color:           COLORS.blackMetal,
        metalness:       1.0,
        roughness:       0.1,
        envMap:          envMap,
        envMapIntensity: 1.6,
      })
    );
    scene.add(chromeDodec);

    // ── Anneaux orbitaux ─────────────────────────────────────────────────────
    const ringColors = [COLORS.goldPale, COLORS.goldDeep, 0xeef4ff];
    const rings = [3.0, 3.7, 4.5].map((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({
          color: ringColors[i],
          transparent: true,
          opacity: i === 2 ? 0.2 : 0.5,
        })
      );
      ring.rotation.x = Math.PI / (2.2 + i * 0.55);
      ring.rotation.z = i * 0.5;
      ring.position.x = 2;
      scene.add(ring);
      return ring;
    });

    scene.fog = new THREE.FogExp2(COLORS.bg, 0.024);

    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x: mx.toFixed(2), y: my.toFixed(2) });
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      galaxy.rotation.y = t * 0.022;

      chromeKnot.rotation.x = t * 0.28;
      chromeKnot.rotation.y = t * 0.38;

      chromeSphere.position.x = 2 + Math.cos(t * 0.6) * 3.2;
      chromeSphere.position.y = Math.sin(t * 0.6) * 0.8;
      chromeSphere.position.z = Math.sin(t * 0.6) * 3.2;
      chromeSphere.rotation.y = t * 0.5;

      chromeDodec.position.x = 2 + Math.cos(t * 0.4 + Math.PI) * 4;
      chromeDodec.position.y = 1.5 + Math.sin(t * 0.7) * 0.5;
      chromeDodec.position.z = Math.sin(t * 0.4 + Math.PI) * 4;
      chromeDodec.rotation.x = t * 0.6;
      chromeDodec.rotation.y = t * 0.8;

      rings.forEach((ring, i) => {
        ring.rotation.z += 0.0018 * (i % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.001;
      });

      // Lumieres en mouvement = reflets dynamiques sur le metal noir
      keyLight.position.x  = Math.cos(t * 0.4) * 7;
      keyLight.position.z  = Math.sin(t * 0.4) * 7;
      fillLight.position.x = Math.cos(t * 0.3 + Math.PI) * 5;
      fillLight.position.z = Math.sin(t * 0.3 + Math.PI) * 5;

      camera.position.x += (mx * 1.3 - camera.position.x) * 0.025;
      camera.position.y += (1.2 + my * 0.8 - camera.position.y) * 0.025;
      camera.lookAt(2, 0, 0);

      renderer.render(scene, camera);
    };
    animate();
    setTimeout(() => setLoaded(true), 300);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      starTex.dispose();
      envMap.dispose();
    };
  }, []);

  return (
    <div style={{ position:'relative', width:'100%', height:'100vh', background: COLORS.bgHex, overflow:'hidden', fontFamily:"'Courier New',monospace" }}>

      <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, display:'block' }} />

      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2,
        background:`radial-gradient(ellipse at center, transparent 30%, rgba(5,3,9,0.75) 100%)` }} />

      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2,
        backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)' }} />

      {/* Nav */}
      <nav style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, display:'flex',
        alignItems:'center', justifyContent:'space-between', padding:'1.2rem 2.5rem',
        borderBottom:`1px solid rgba(212,193,154,0.12)`, background:'rgba(5,3,9,0.6)', backdropFilter:'blur(12px)' }}>
        <span style={{ color: COLORS.goldPaleHex, fontSize:'0.7rem', letterSpacing:'0.35em' }}>[ PORTFOLIO.SYS ]</span>
        <div style={{ display:'flex', gap:'2rem' }}>
          {NAV_ITEMS.map(item => (
            <span key={item} onClick={() => onNavigate?.(item.toLowerCase())}
              style={{ color:'rgba(245,239,224,0.42)', fontSize:'0.7rem', letterSpacing:'0.18em', cursor:'pointer', transition:'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = COLORS.goldPaleHex}
              onMouseLeave={e => e.target.style.color = 'rgba(245,239,224,0.42)'}>
              {item}
            </span>
          ))}
        </div>
      </nav>

      {/* Hero text */}
      <div style={{ position:'absolute', inset:0, zIndex:5, display:'flex', flexDirection:'column',
        justifyContent:'center', padding:'0 3rem', maxWidth:'560px',
        opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(14px)',
        transition:'opacity 1s ease, transform 1s ease' }}>

        <p style={{ color: COLORS.goldPaleHex, fontSize:'0.68rem', letterSpacing:'0.4em', margin:'0 0 1.2rem', opacity:0.75 }}>
          &gt; INIT_PORTFOLIO_v2.0...
        </p>

        <h1 style={{ margin:0, fontSize:'clamp(3rem,7vw,5.8rem)', fontWeight:900, lineHeight:0.95,
          fontFamily:"'Arial Black',sans-serif", letterSpacing:'-0.03em',
          background:'linear-gradient(180deg, #f5efe0 0%, #d4c19a 60%, #8a6f3f 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          filter:`drop-shadow(0 0 30px rgba(212,193,154,0.35))` }}>
          JOHN<br />
          <span style={{ background:'linear-gradient(180deg, #d4c19a 0%, #8a6f3f 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>DOE</span>
        </h1>

        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', height:'1.8rem', margin:'1.4rem 0 0.2rem' }}>
          <span style={{ color: COLORS.goldDeepHex, fontWeight:700 }}>//</span>
          <span style={{ color:'rgba(245,239,224,0.88)', fontSize:'0.9rem', letterSpacing:'0.05em' }}>{role}</span>
          <span style={{ color: COLORS.goldPaleHex, animation:'blink 0.9s step-end infinite' }}>_</span>
        </div>

        <p style={{ color:'rgba(245,239,224,0.45)', fontSize:'0.78rem', margin:'1.2rem 0 2rem', lineHeight:1.85, maxWidth:'360px' }}>
          Experiences web immersives a la croisee du design, de la 3D et de l&apos;ingenierie logicielle.
        </p>

        <div style={{ display:'flex', gap:'0.8rem' }}>
          <button onClick={() => onNavigate?.('projets')}
            style={{ padding:'0.7rem 1.6rem', background:'transparent', border:`1px solid ${COLORS.goldPaleHex}`,
              color: COLORS.goldPaleHex, cursor:'pointer', fontSize:'0.68rem', letterSpacing:'0.2em',
              fontFamily:"'Courier New',monospace", transition:'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(212,193,154,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            [ VOIR PROJETS ]
          </button>
          <button style={{ padding:'0.7rem 1.6rem',
            background:'linear-gradient(135deg,#d4c19a 0%,#8a6f3f 100%)',
            border:'none', color: COLORS.bgHex, cursor:'pointer', fontWeight:700,
            fontSize:'0.68rem', letterSpacing:'0.2em', fontFamily:"'Courier New',monospace",
            boxShadow:'0 0 18px rgba(212,193,154,0.35)' }}>
            TELECHARGER CV
          </button>
        </div>

        <div style={{ display:'flex', gap:'2.5rem', marginTop:'2.5rem',
          borderTop:'1px solid rgba(245,239,224,0.08)', paddingTop:'1.5rem' }}>
          {[['3+','ANS XP'],['20+','PROJETS'],['12+','TECHNOS']].map(([v,l]) => (
            <div key={l}>
              <div style={{ color: COLORS.goldPaleHex, fontSize:'1.5rem', fontWeight:900,
                textShadow:`0 0 12px rgba(212,193,154,0.45)` }}>{v}</div>
              <div style={{ color:'rgba(245,239,224,0.28)', fontSize:'0.6rem', letterSpacing:'0.2em', marginTop:'0.2rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:'absolute', right:'2.5rem', top:'50%', transform:'translateY(-50%)',
        zIndex:5, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.6rem', opacity:0.45 }}>
        <span style={{ writingMode:'vertical-rl', color:'rgba(212,193,154,0.7)', fontSize:'0.58rem', letterSpacing:'0.3em' }}>SCROLL TO EXPLORE</span>
        <div style={{ width:'1px', height:'80px', background:'linear-gradient(to bottom,rgba(212,193,154,0.7),transparent)' }} />
      </div>

      {/* Status bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:10, display:'flex',
        alignItems:'center', justifyContent:'space-between', padding:'0.7rem 2.5rem',
        borderTop:'1px solid rgba(212,193,154,0.07)', background:'rgba(5,3,9,0.65)' }}>
        <span style={{ color:'rgba(212,193,154,0.55)', fontSize:'0.6rem', letterSpacing:'0.25em' }}>SYS:READY</span>
        <span style={{ color:'rgba(245,239,224,0.14)', fontSize:'0.6rem' }}>X:{mouse.x} Y:{mouse.y}</span>
        <span style={{ color:'rgba(138,111,63,0.7)', fontSize:'0.6rem', letterSpacing:'0.2em' }}>THREE.JS r168</span>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}