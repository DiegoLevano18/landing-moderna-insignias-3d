// Recorrido 3D: una insignia que se arma capa por capa siguiendo el scroll.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const INK = 0x14161a;
const BONE = 0xf2eee6;
const BRASS = 0xb08d57;

type Finish = 'mate' | 'dorado' | 'holo';
const FINISHES: Record<Finish, { color: number; metalness: number; roughness: number; iridescence: number }> = {
  mate: { color: BRASS, metalness: 0, roughness: 0.82, iridescence: 0 },
  dorado: { color: BRASS, metalness: 1, roughness: 0.3, iridescence: 0 },
  holo: { color: BONE, metalness: 0.85, roughness: 0.2, iridescence: 1 },
};

function shield(s: number) {
  const p = new THREE.Shape();
  const t = 1.2 * s;
  const r = 0.18 * s;
  p.moveTo(-s + r, t);
  p.lineTo(s - r, t);
  p.quadraticCurveTo(s, t, s, t - r);
  p.lineTo(s, -0.15 * s);
  p.bezierCurveTo(s, -0.85 * s, 0.45 * s, -1.15 * s, 0, -1.4 * s);
  p.bezierCurveTo(-0.45 * s, -1.15 * s, -s, -0.85 * s, -s, -0.15 * s);
  p.lineTo(-s, t - r);
  p.quadraticCurveTo(-s, t, -s + r, t);
  return p;
}

const extrude = (shape: THREE.Shape, depth: number, bevel = 0) =>
  new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 28,
  });

/** Trama tejida para dar relieve a las bases textiles. */
function weave(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, size, size);
  const n = 8;
  const q = size / n;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      g.fillStyle = (x + y) % 2 ? '#b8b8b8' : '#484848';
      g.fillRect(x * q + 1, y * q + 1, q - 2, q - 2);
    }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Cara impresa de la insignia: fondo y nombre. */
function face() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 666;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1b1e23';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#f2eee6';
  g.textAlign = 'center';
  g.font = '700 86px "Barlow Condensed", "Arial Narrow", sans-serif';
  if ('letterSpacing' in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '14px';
  g.fillText('MARQA', c.width / 2 + 7, 500);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Las UV de ExtrudeGeometry son las coordenadas de la forma: se llevan al rango 0..1.
  tex.repeat.set(1 / 2, 1 / 2.6);
  tex.offset.set(0.5, 0.5);
  return tex;
}

export function initStory(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('.stage')!;
  const canvas = stage.querySelector('canvas')!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const key = new THREE.DirectionalLight(BONE, 2.4);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(BRASS, 1.6);
  rim.position.set(-5, 1, -3);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  const bump = weave();
  bump.repeat.set(7, 7);
  const lineMat = new THREE.LineBasicMaterial({ color: BRASS, transparent: true });
  const finishMat = () => new THREE.MeshPhysicalMaterial({ ...FINISHES.dorado, iridescenceIOR: 2.1, iridescenceThicknessRange: [180, 620] });

  const mats = {
    film: new THREE.MeshStandardMaterial({ color: BONE, roughness: 0.35 }),
    base: new THREE.MeshStandardMaterial({ color: INK, roughness: 0.95, bumpMap: bump, bumpScale: 1.5 }),
    field: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, map: face() }),
    border: finishMat(),
    emblem: finishMat(),
  };
  document.fonts?.ready.then(() => {
    mats.field.map?.dispose();
    mats.field.map = face();
  });

  const ring = new THREE.Shape().absarc(0, 0, 0.46, 0, Math.PI * 2, false);
  ring.holes.push(new THREE.Path().absarc(0, 0, 0.29, 0, Math.PI * 2, true));
  const tail = new THREE.Shape([
    new THREE.Vector2(0.1, -0.14),
    new THREE.Vector2(0.28, -0.14),
    new THREE.Vector2(0.6, -0.6),
    new THREE.Vector2(0.42, -0.6),
  ]);
  const frame = shield(1);
  frame.holes.push(shield(0.88));

  // [material, geometrías, z armada, z desarmada, opacidad máxima]
  const defs: [keyof typeof mats, THREE.BufferGeometry[], number, number, number][] = [
    ['film', [extrude(shield(1.07), 0.012)], -0.03, -1.5, 0.3],
    ['base', [extrude(shield(1), 0.08)], 0, -0.75, 1],
    ['field', [extrude(shield(0.9), 0.03)], 0.08, 0, 1],
    ['border', [extrude(frame, 0.07, 0.015)], 0.085, 0.75, 1],
    ['emblem', [extrude(ring, 0.08, 0.02), extrude(tail, 0.08, 0.02)], 0.125, 1.5, 1],
  ];

  const badge = new THREE.Group();
  const layers = defs.map(([name, geos, z0, z1, max]) => {
    const g = new THREE.Group();
    for (const geo of geos) {
      const mesh = new THREE.Mesh(geo, mats[name]);
      if (name === 'emblem') mesh.position.y = 0.28;
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineMat));
      g.add(mesh);
    }
    badge.add(g);
    return { g, mat: mats[name], z0, z1, max };
  });

  const rig = new THREE.Group();
  rig.add(badge);
  scene.add(rig);

  // Lote terminado: copias de la pieza armada.
  const lot = new THREE.Group();
  layers.forEach((l) => (l.g.position.z = l.z0));
  [
    [-1.7, 0.5, -1.4], [1.7, 0.5, -1.4], [-3.1, -0.3, -2.8], [3.1, -0.3, -2.8], [0, 1.5, -3], [-1.5, -1.6, -2.2], [1.5, -1.6, -2.2],
  ].forEach(([x, y, z]) => {
    const copy = badge.clone();
    copy.userData.home = new THREE.Vector3(x, y, z);
    lot.add(copy);
  });
  rig.add(lot);

  // Prenda: un retazo de tela sobre el que se plancha la insignia.
  const clothBump = weave();
  clothBump.repeat.set(26, 32);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 5.6),
    new THREE.MeshStandardMaterial({ color: BONE, emissive: BONE, emissiveIntensity: 0.3, roughness: 1, bumpMap: clothBump, bumpScale: 0.6, transparent: true }),
  );
  cloth.position.z = -0.06;
  badge.add(cloth);

  const s = { x: 1, scale: 1, rotX: -0.12, rotY: -0.5, explode: 0, lines: 0, r0: 1, r1: 1, r2: 1, r3: 1, r4: 1, cloth: 0, lot: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut', duration: 1 },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });
  tl.to(s, { x: -1, rotY: 0.15, rotX: 0, lines: 1, r0: 0, r1: 0, r2: 0, r3: 0, r4: 0 }, 0) // diseño
    .to(s, { x: 1, rotY: 0.9, rotX: -0.28, explode: 1, lines: 0.45, r0: 1, r1: 1 }, 1) // base
    .to(s, { x: -1, rotY: -0.9, r2: 1 }, 2) // color
    .to(s, { x: 1, rotY: 0.75, r3: 1, r4: 1, lines: 0 }, 3) // relieve
    .to(s, { x: -1, rotY: -0.45, rotX: -0.08, explode: 0, scale: 1.12 }, 4) // acabado
    .to(s, { x: 1, rotY: 0.3, rotX: -0.18, scale: 0.62, cloth: 1 }, 5) // planchado
    .to(s, { x: -1, rotY: -0.25, rotX: -0.1, cloth: 0, lot: 1, scale: 0.72 }, 6); // entrega

  function setFinish(name: Finish) {
    const f = FINISHES[name];
    const c = new THREE.Color(f.color);
    for (const m of [mats.border, mats.emblem]) {
      gsap.to(m, { metalness: f.metalness, roughness: f.roughness, iridescence: f.iridescence, duration: 0.6 });
      gsap.to(m.color, { r: c.r, g: c.g, b: c.b, duration: 0.6 });
    }
  }
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-finish]');
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      setFinish(b.dataset.finish as Finish);
    }),
  );

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let wide = true;
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = w > 860;
    camera.position.z = wide ? 9.5 : 16;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  const reveal = () => [s.r0, s.r1, s.r2, s.r3, s.r4];
  function frameTick(t: number) {
    const time = t / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    rig.position.set(wide ? s.x * 2.1 : 0, wide ? 0 : 2.1, 0);
    rig.scale.setScalar(s.scale);
    badge.rotation.set(s.rotX + pointer.y * 0.12, s.rotY + pointer.x * 0.2 + Math.sin(time * 0.6) * 0.07, 0);
    badge.position.y = Math.sin(time * 0.9) * 0.04;

    const r = reveal();
    layers.forEach((l, i) => {
      l.g.position.z = THREE.MathUtils.lerp(l.z0, l.z1, s.explode);
      const o = THREE.MathUtils.clamp(r[i], 0, 1) * l.max;
      l.mat.opacity = o;
      l.mat.transparent = o < 1;
      l.mat.depthWrite = o > 0.5;
      l.mat.visible = o > 0.01;
    });
    lineMat.opacity = s.lines;
    lineMat.visible = s.lines > 0.01;

    (cloth.material as THREE.MeshStandardMaterial).opacity = s.cloth;
    cloth.visible = s.cloth > 0.01;

    lot.visible = s.lot > 0.01;
    lot.children.forEach((c, i) => {
      const k = THREE.MathUtils.clamp(s.lot * 1.6 - i * 0.08, 0, 1);
      c.position.copy(c.userData.home as THREE.Vector3).multiplyScalar(k);
      c.scale.setScalar(k);
      c.rotation.copy(badge.rotation);
    });

    renderer.render(scene, camera);
  }

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);
  renderer.setAnimationLoop((t) => visible && frameTick(t));
  frameTick(0);
  stage.classList.add('is-live');
}
