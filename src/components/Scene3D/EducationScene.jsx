import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Solar system 3D scene.
 *
 * A central golden star + 4 orbiting planets on their own inclined orbital planes.
 * Each planet has its own rotation, color, and orbital speed.
 * One planet sports thin Saturn-like rings.
 *
 * Visual language matches PersistentScene: solid MeshStandardMaterial objects,
 * proper lighting (PointLight at sun + ambient), additive starfield background.
 */
export default function EducationScene() {
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
    camera.position.set(0, 3.5, 9);
    camera.lookAt(0, 0, 0);

    // ── Helper : procedural radial glow sprite texture ─────────────────
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
    const ambient = new THREE.AmbientLight(0x3a2e4a, 0.45);
    scene.add(ambient);

    // Main illumination from the sun's position
    const sunLight = new THREE.PointLight(0xfff4d6, 2.2, 40, 1.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Subtle rim light for definition on the dark sides
    const rim = new THREE.DirectionalLight(0xd4c19a, 0.25);
    rim.position.set(-5, 4, -3);
    scene.add(rim);

    // ── Central star (sun) ─────────────────────────────────────────────
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd97a }),
    );
    scene.add(sun);

    // Bright halo via sprite
    const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffd97a,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sunHalo.scale.set(2.5, 2.5, 1);
    scene.add(sunHalo);

    // Wider faint halo
    const sunHaloOuter = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xd4c19a,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sunHaloOuter.scale.set(5.5, 5.5, 1);
    scene.add(sunHaloOuter);

    // ── Planets ────────────────────────────────────────────────────────
    // Each on its own tilted orbital plane (via a pivot Object3D).
    // The planet itself sits at distance `radius` along +X inside the pivot,
    // so rotating the pivot around Y traces the orbit.
    const PLANETS = [
      {
        name: 'inner',
        radius: 1.5,
        size: 0.16,
        color: 0xc99060,         // warm rocky
        emissive: 0x2a1810,
        speed: 0.55,
        selfSpin: 1.8,
        tilt: 0.06,
        nodeAngle: 0.0,          // rotation around Z (orbital plane tilt)
      },
      {
        name: 'ocean',
        radius: 2.6,
        size: 0.24,
        color: 0x4a78bc,         // ocean blue
        emissive: 0x081020,
        speed: 0.36,
        selfSpin: 1.3,
        tilt: -0.08,
        nodeAngle: 0.4,
      },
      {
        name: 'ringed',
        radius: 4.2,
        size: 0.36,
        color: 0xd4a06a,         // saturn-like amber
        emissive: 0x2a1a08,
        speed: 0.22,
        selfSpin: 0.9,
        tilt: 0.15,
        nodeAngle: -0.3,
        hasRings: true,
      },
      {
        name: 'outer',
        radius: 5.8,
        size: 0.20,
        color: 0x8a6fb8,         // distant violet
        emissive: 0x140a20,
        speed: 0.12,
        selfSpin: 0.7,
        tilt: 0.18,
        nodeAngle: 0.7,
      },
    ];

    const planetSystems = PLANETS.map(p => {
      // Pivot defines the orbital plane orientation (parent of orbit + planet)
      const pivot = new THREE.Object3D();
      pivot.rotation.x = p.tilt;
      pivot.rotation.z = p.nodeAngle * 0.3;

      // Planet mesh
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 36, 36),
        new THREE.MeshStandardMaterial({
          color: p.color,
          emissive: p.emissive,
          roughness: 0.85,
          metalness: 0.05,
        }),
      );
      mesh.position.x = p.radius;
      // Random initial orbital position so they don't all line up
      const initialAngle = Math.random() * Math.PI * 2;
      const orbitContainer = new THREE.Object3D();
      orbitContainer.rotation.y = initialAngle;
      orbitContainer.add(mesh);
      pivot.add(orbitContainer);

      // Faint orbital ring (thin glowing line)
      const orbitRing = new THREE.Mesh(
        new THREE.RingGeometry(p.radius - 0.008, p.radius + 0.008, 192),
        new THREE.MeshBasicMaterial({
          color: 0xd4c19a,
          transparent: true,
          opacity: 0.10,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      orbitRing.rotation.x = Math.PI / 2;
      pivot.add(orbitRing);

      // Saturn-like rings on planet 3
      if (p.hasRings) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(p.size * 1.5, p.size * 2.3, 64),
          new THREE.MeshBasicMaterial({
            color: 0xc8a878,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        ring.rotation.x = Math.PI / 2.3;
        mesh.add(ring);

        // Outer fainter ring
        const ringOuter = new THREE.Mesh(
          new THREE.RingGeometry(p.size * 2.4, p.size * 2.7, 64),
          new THREE.MeshBasicMaterial({
            color: 0xa88858,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        ringOuter.rotation.x = Math.PI / 2.3;
        mesh.add(ringOuter);
      }

      scene.add(pivot);
      return { ...p, pivot, orbitContainer, mesh };
    });

    // ── Background starfield ───────────────────────────────────────────
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Distributed on a far sphere
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
    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running || document.hidden) return;

      const t  = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);

      // Sun gentle pulse
      const sunPulse = 1 + Math.sin(t * 0.8) * 0.04;
      sun.scale.setScalar(sunPulse);
      sunHalo.scale.set(2.5 * sunPulse, 2.5 * sunPulse, 1);
      sunHaloOuter.material.opacity = 0.25 + Math.sin(t * 0.5) * 0.05;

      // Planets : orbit + self-spin
      planetSystems.forEach((p) => {
        p.orbitContainer.rotation.y += dt * p.speed;
        p.mesh.rotation.y          += dt * p.selfSpin;
      });

      // Slow camera orbit for parallax / depth
      const camRadius = 9;
      const camAngle = t * 0.04;
      camera.position.x = Math.sin(camAngle) * camRadius * 0.25;
      camera.position.y = 3.5 + Math.sin(t * 0.12) * 0.4;
      camera.position.z = Math.cos(camAngle) * camRadius * 0.95;
      camera.lookAt(0, 0, 0);

      // Background stars VERY slow drift
      stars.rotation.y -= dt * 0.005;

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();

      // Dispose everything
      sun.geometry.dispose();
      sun.material.dispose();
      sunHalo.material.dispose();
      sunHaloOuter.material.dispose();

      planetSystems.forEach((p) => {
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        p.mesh.children.forEach(c => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
        p.pivot.children.forEach(c => {
          if (c instanceof THREE.Mesh) {
            c.geometry.dispose();
            c.material.dispose();
          }
        });
      });

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
