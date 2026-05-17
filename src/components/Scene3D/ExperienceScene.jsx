import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Orbital choreography scene.
 *
 * Three planets in eternal motion — no central star. Two form a tight
 * "binary" pair rotating around their common barycenter; a third, larger
 * planet circles them on a tilted plane. Distances are mathematically
 * constrained so they NEVER touch.
 *
 * Visual language matches PersistentScene: solid MeshStandardMaterial,
 * golden palette, additive starfield background.
 */
export default function ExperienceScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer / Scene / Camera ──────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0, 0);

    // ── Procedural glow texture ────────────────────────────────────────
    const makeGlowTex = () => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.15, 'rgba(255,255,255,0.85)');
      g.addColorStop(0.4,  'rgba(255,255,255,0.35)');
      g.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      return t;
    };
    const glowTex = makeGlowTex();

    // ── Lights ─────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x4a3a2a, 0.55);
    scene.add(ambient);

    // Key light — warm gold, comes from above-front
    const key = new THREE.DirectionalLight(0xfff4d6, 1.5);
    key.position.set(4, 6, 5);
    scene.add(key);

    // Fill — cool blue from opposite side for sci-fi rim feel
    const fill = new THREE.DirectionalLight(0x6090c8, 0.4);
    fill.position.set(-5, -3, -4);
    scene.add(fill);

    // Soft warm fill below
    const bottom = new THREE.DirectionalLight(0xd4a060, 0.25);
    bottom.position.set(0, -5, 2);
    scene.add(bottom);

    // ── Planet definitions ─────────────────────────────────────────────
    // Binary pair: A and B orbit their barycenter on the XZ plane.
    // C is a third, larger planet on a tilted wider orbit.
    const BINARY_SEPARATION = 1.1;  // half-distance from barycenter (each planet sits at this radius)
    const OUTER_RADIUS      = 4.0;  // distance of C from origin

    // Planet A — warm gold
    const planetA = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 40, 40),
      new THREE.MeshStandardMaterial({
        color: 0xd4c19a,
        emissive: 0x3a2810,
        roughness: 0.55,
        metalness: 0.25,
      }),
    );
    scene.add(planetA);

    // Planet B — cooler bronze
    const planetB = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 40, 40),
      new THREE.MeshStandardMaterial({
        color: 0x8a6f3f,
        emissive: 0x1a1004,
        roughness: 0.7,
        metalness: 0.15,
      }),
    );
    scene.add(planetB);

    // Planet C — larger amber giant
    const planetC = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 48, 48),
      new THREE.MeshStandardMaterial({
        color: 0xc89868,
        emissive: 0x2a1808,
        roughness: 0.85,
        metalness: 0.05,
      }),
    );
    scene.add(planetC);

    // Subtle equatorial ring on the giant
    const giantRing = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.95, 64),
      new THREE.MeshBasicMaterial({
        color: 0xb89868,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    giantRing.rotation.x = Math.PI / 2.4;
    planetC.add(giantRing);

    // Faint glow halo around the giant
    const cHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xd4a060,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    cHalo.scale.set(2.4, 2.4, 1);
    planetC.add(cHalo);

    // ── Orbital trail visualization (very faint) ───────────────────────
    // Binary orbit trail — flat ring on XZ plane
    const binaryTrail = new THREE.Mesh(
      new THREE.RingGeometry(BINARY_SEPARATION - 0.005, BINARY_SEPARATION + 0.005, 192),
      new THREE.MeshBasicMaterial({
        color: 0xffd97a,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    binaryTrail.rotation.x = Math.PI / 2;
    scene.add(binaryTrail);

    // Outer orbit trail — tilted
    const outerOrbitPivot = new THREE.Object3D();
    outerOrbitPivot.rotation.z = 0.35;
    outerOrbitPivot.rotation.x = 0.1;
    const outerTrail = new THREE.Mesh(
      new THREE.RingGeometry(OUTER_RADIUS - 0.008, OUTER_RADIUS + 0.008, 192),
      new THREE.MeshBasicMaterial({
        color: 0xd4c19a,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    outerTrail.rotation.x = Math.PI / 2;
    outerOrbitPivot.add(outerTrail);
    scene.add(outerOrbitPivot);

    // ── Background starfield ───────────────────────────────────────────
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 40 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i3 + 2] = r * Math.cos(phi);

      const tinge = Math.random();
      if (tinge < 0.7) {
        starColors[i3]     = 0.95;
        starColors[i3 + 1] = 0.92;
        starColors[i3 + 2] = 0.85;
      } else if (tinge < 0.9) {
        starColors[i3]     = 1.0;
        starColors[i3 + 1] = 0.85;
        starColors[i3 + 2] = 0.55;
      } else {
        starColors[i3]     = 0.75;
        starColors[i3 + 1] = 0.85;
        starColors[i3 + 2] = 1.0;
      }
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeom, new THREE.PointsMaterial({
      size: 0.08,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }));
    scene.add(stars);

    // ── Resize ─────────────────────────────────────────────────────────
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Pause when offscreen ───────────────────────────────────────────
    let running = true;
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    }, { threshold: 0.01 });
    io.observe(canvas);

    // ── Animation loop ─────────────────────────────────────────────────
    // Choreography:
    //   - Binary (A & B): always diametrically opposite. Phase angle θ_bin.
    //   - Outer (C): single planet on the tilted outer ring. Phase angle θ_out.
    // Min distance binary↔outer = OUTER_RADIUS - BINARY_SEPARATION = 2.9
    // Sum of largest radii = 0.55 + 0.95 (ring) = 1.5 → they never touch.
    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running || document.hidden) return;

      const t  = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);

      // Binary dance — A and B on opposite sides of barycenter
      const binPhase = t * 0.55;
      const ax =  Math.cos(binPhase) * BINARY_SEPARATION;
      const az =  Math.sin(binPhase) * BINARY_SEPARATION;
      planetA.position.set( ax, 0,  az);
      planetB.position.set(-ax, 0, -az);
      planetA.rotation.y += dt * 1.4;
      planetB.rotation.y += dt * 1.2;

      // Outer planet — circles the binary on the tilted plane
      // Compute position in local XZ then transform by the orbit pivot's rotations
      const outPhase = t * 0.18 + 1.7;
      const localPos = new THREE.Vector3(
        Math.cos(outPhase) * OUTER_RADIUS,
        0,
        Math.sin(outPhase) * OUTER_RADIUS,
      );
      // Apply pivot tilt
      localPos.applyEuler(outerOrbitPivot.rotation);
      planetC.position.copy(localPos);
      planetC.rotation.y += dt * 0.6;

      // Slow camera orbit for parallax
      const camR = 9;
      const camAng = t * 0.05;
      camera.position.x = Math.sin(camAng) * camR * 0.3;
      camera.position.y = 2.5 + Math.sin(t * 0.1) * 0.3;
      camera.position.z = Math.cos(camAng) * camR * 0.95;
      camera.lookAt(0, 0, 0);

      stars.rotation.y -= dt * 0.005;

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();

      [planetA, planetB, planetC].forEach(p => {
        p.geometry.dispose();
        p.material.dispose();
        p.children.forEach(c => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      });

      binaryTrail.geometry.dispose();
      binaryTrail.material.dispose();
      outerTrail.geometry.dispose();
      outerTrail.material.dispose();

      stars.geometry.dispose();
      stars.material.dispose();
      glowTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
