import * as THREE from './three.module.min.js';

// ---------- утилиты ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const $ = (id) => document.getElementById(id);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const fmtTime = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

// ---------- темы ----------
const THEMES = [
  { name: 'Лето', sky: 0x9ad6ff, grass: '#86cc6c', park: '#74c35c', road: '#4b505e', walk: '#dcd6c8', plaza: '#e9e1cf', concrete: '#bdb6a8', line: '#ffffff', hemi: [0xffffff, 0x7d8f6a, 1.5], sun: [0xfff0d8, 1.7],
    tree: [0x4fae4a, 0x3d9840, 0x66c25a], build: [0xf3e6cf, 0xeab39f, 0xa9c9ea, 0xf5d57c, 0xcab9ea, 0xe3e3e3, 0x9fd9c4], roof: [0xd8574a, 0x5f6f86, 0x925b3c, 0x3e8f7a], glass: 0x4f77a6 },
  { name: 'Осень', sky: 0xbfd9ee, grass: '#b7b865', park: '#a8ac58', road: '#4a4a52', walk: '#d8d0c0', plaza: '#e6dccb', concrete: '#b8b0a2', line: '#fff6e0', hemi: [0xfff4e6, 0x8a7a5a, 1.45], sun: [0xffe2b8, 1.6],
    tree: [0xe0782f, 0xd94f2b, 0xf2b134, 0xb8862a], build: [0xefe0c8, 0xd99a7a, 0xb4c4d8, 0xe8c173, 0xbfae9e, 0xdadada], roof: [0x8e3b2f, 0x4d5a6b, 0x6e4a2e], glass: 0x5a6f8a },
  { name: 'Закат', sky: 0xffb08a, grass: '#8fbf6a', park: '#7fb45c', road: '#4d4760', walk: '#e2cfc2', plaza: '#ecd8c6', concrete: '#bfae9f', line: '#fff0e6', hemi: [0xffd6c2, 0x6a5a7a, 1.35], sun: [0xffb27a, 1.8],
    tree: [0x5aa04a, 0x478a45, 0x72b057], build: [0xf6dcc4, 0xe9a38f, 0xb5b5e3, 0xf2c77a, 0xd5a8d0, 0xe8d8d8], roof: [0xb8443c, 0x5a4f78, 0x8a4e3a], glass: 0x6b5d9a },
  { name: 'Зима', sky: 0xcfe3f2, grass: '#eef3f8', park: '#e3ecf3', road: '#555b66', walk: '#d2d8df', plaza: '#e1e6ec', concrete: '#c5cbd2', line: '#ffffff', hemi: [0xffffff, 0x9aa8b8, 1.55], sun: [0xf2f6ff, 1.5],
    tree: [0x2f6f4f, 0x3a7a5c, 0xf4f8fb], build: [0xe8e2d8, 0xc98f86, 0x9fb6cf, 0xe6cf92, 0xb9b1d0, 0xd8dde3], roof: [0xf6f9fc, 0xeef3f8, 0xdfe7ee], glass: 0x4d6a8c, snow: true },
  { name: 'Весна', sky: 0xa9e4ff, grass: '#93d67a', park: '#83cc6c', road: '#4b5160', walk: '#e2dccf', plaza: '#efe7d6', concrete: '#c2bcae', line: '#ffffff', hemi: [0xffffff, 0x7d9a70, 1.5], sun: [0xfff6e6, 1.65],
    tree: [0xf4a7c8, 0xf7c2d8, 0x6cc25c, 0xe98fb8], build: [0xf7ecd6, 0xf1b8a8, 0xb3d6f2, 0xf8df8c, 0xd3c4f0, 0xeaeaea, 0xa8e3cf], roof: [0xe0685c, 0x6a7fa0, 0x5aa38c], glass: 0x5b86b8 },
  { name: 'Ночь', sky: 0x243056, grass: '#3f6a4c', park: '#386246', road: '#2c3040', walk: '#6f7488', plaza: '#7a7f93', concrete: '#5f6474', line: '#e8e2b0', hemi: [0x8fa0ff, 0x2a2440, 1.35], sun: [0xc8d0ff, 1.0],
    tree: [0x2e6b4a, 0x28604a, 0x3a7a55], build: [0x7a7fa8, 0x8a6f8f, 0x5f7aa0, 0x9a8a70, 0x6f6a90], roof: [0x3a3550, 0x2f3a50, 0x4a3040], glass: 0xffd36b, night: true },
];

// ---------- геометрия: сборка деталей в один меш с цветами вершин ----------
const U = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  cyl20: new THREE.CylinderGeometry(1, 1, 1, 20),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  ico: new THREE.IcosahedronGeometry(1, 0),
  dodeca: new THREE.DodecahedronGeometry(1, 0),
  oct: new THREE.OctahedronGeometry(1, 0),
};
const _e = new THREE.Euler(), _qq = new THREE.Quaternion(), _vv = new THREE.Vector3(), _ss = new THREE.Vector3(), _col = new THREE.Color();

class Parts {
  constructor() { this.p = []; }
  add(g, c, x, y, z, rx, ry, rz, sx, sy, sz) {
    const m = new THREE.Matrix4().compose(_vv.set(x, y, z), _qq.setFromEuler(_e.set(rx, ry, rz)), _ss.set(sx, sy, sz));
    this.p.push({ g, c, m }); return this;
  }
  box(w, h, d, c, x = 0, y = 0, z = 0, ry = 0) { return this.add(U.box, c, x, y + h / 2, z, 0, ry, 0, w, h, d); }
  cyl(r, h, c, x = 0, y = 0, z = 0, g = U.cyl8) { return this.add(g, c, x, y + h / 2, z, 0, 0, 0, r, h, r); }
  cone(r, h, c, x = 0, y = 0, z = 0, g = U.cone6, ry = 0) { return this.add(g, c, x, y + h / 2, z, 0, ry, 0, r, h, r); }
  ball(r, c, x = 0, y = 0, z = 0, sy = 1, g = U.ico) { return this.add(g, c, x, y, z, 0, 0, 0, r, r * sy, r); }
  wheel(r, w, c, x, y, z) { return this.add(U.cyl8, c, x, y, z, 0, 0, Math.PI / 2, r, w, r); }
  build() {
    let total = 0; const list = [];
    for (const p of this.p) {
      const g = p.g.index ? p.g.toNonIndexed() : p.g.clone();
      g.applyMatrix4(p.m); list.push([g, p.c]); total += g.attributes.position.count;
    }
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
    let o = 0;
    for (const [g, c] of list) {
      const n = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      _col.set(c);
      for (let i = 0; i < n; i++) { const k = (o + i) * 3; col[k] = _col.r; col[k + 1] = _col.g; col[k + 2] = _col.b; }
      o += n; g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeBoundingSphere();
    return geo;
  }
}

// ---------- типы объектов ----------
const SKIN = [0xf1c7a3, 0xd9a37e, 0xa8714f, 0x7a4e33];
const SHIRT = [0xe94f4f, 0x3f7fe0, 0xf2b52c, 0x39b36b, 0x9b59d0, 0xff8a3d, 0x2cc0c8, 0xf5f5f5];
const CARC = [0xe84a4a, 0x3a78d8, 0xf5f5f5, 0x2d2f3a, 0x46b56a, 0xf2a93b, 0x8a5ad6, 0x9aa3ad];
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// cached: одинаковая геометрия → инстансинг
const TYPES = {
  person: { name: 'Прохожий', build(v, th) {
    const p = new Parts();
    p.box(0.16, 0.8, 0.22, 0x2c3350, -0.1).box(0.16, 0.8, 0.22, 0x2c3350, 0.1)
      .box(0.5, 0.62, 0.28, SHIRT[v % SHIRT.length], 0, 0.78)
      .box(0.3, 0.32, 0.3, SKIN[(v >> 3) % 4], 0, 1.4)
      .box(0.32, 0.08, 0.32, [0x2a1e14, 0x5a3a20, 0xe6c35a][v % 3], 0, 1.72);
    return { p, w: 0.5, d: 0.3, h: 1.8, fit: 0.3 };
  } },
  cone: { name: 'Конус', build() { const p = new Parts(); p.box(0.55, 0.06, 0.55, 0xff6a1f).cone(0.24, 0.7, 0xff7a2a, 0, 0.06).cyl(0.16, 0.12, 0xffffff, 0, 0.32); return { p, w: 0.55, d: 0.55, h: 0.76, fit: 0.3 }; } },
  hydrant: { name: 'Гидрант', build() { const p = new Parts(); p.cyl(0.2, 0.62, 0xd9312b).ball(0.2, 0xd9312b, 0, 0.64).box(0.52, 0.12, 0.12, 0xb8231f, 0, 0.36); return { p, w: 0.5, d: 0.4, h: 0.84, fit: 0.3 }; } },
  trash: { name: 'Урна', build() { const p = new Parts(); p.cyl(0.3, 0.8, 0x3f7a58).cyl(0.33, 0.08, 0x2e5c42, 0, 0.8); return { p, w: 0.66, d: 0.66, h: 0.88, fit: 0.35 }; } },
  mailbox: { name: 'Почтовый ящик', build() { const p = new Parts(); p.box(0.1, 0.8, 0.1, 0x333a44).box(0.5, 0.45, 0.4, 0x2f6fd0, 0, 0.8); return { p, w: 0.5, d: 0.4, h: 1.25, fit: 0.3 }; } },
  bench: { name: 'Скамейка', build() {
    const p = new Parts();
    p.box(0.12, 0.42, 0.5, 0x3a3d45, -0.65).box(0.12, 0.42, 0.5, 0x3a3d45, 0.65)
      .box(1.6, 0.1, 0.52, 0xa8693b, 0, 0.42).box(1.6, 0.44, 0.08, 0xa8693b, 0, 0.5, -0.24);
    return { p, w: 1.6, d: 0.55, h: 0.95, fit: 0.72 };
  } },
  lamp: { name: 'Фонарь', build(v, th) {
    const p = new Parts();
    p.cyl(0.24, 0.2, 0x2e323c).cyl(0.08, 3.9, 0x3a3f4b).box(0.1, 0.1, 0.9, 0x3a3f4b, 0, 3.8, 0.4)
      .box(0.36, 0.16, 0.5, th.night ? 0xfff0a0 : 0xf5f0d8, 0, 3.66, 0.8);
    return { p, w: 0.5, d: 0.5, h: 4, fit: 0.35 };
  } },
  bush: { name: 'Куст', build(v, th) { const p = new Parts(); const c = th.snow ? 0xe8eef4 : th.tree[v % th.tree.length]; p.ball(0.7, c, 0, 0.5, 0, 0.75, U.dodeca); return { p, w: 1.3, d: 1.3, h: 1, fit: 0.6 }; } },
  tree: { name: 'Дерево', build(v, th) {
    const p = new Parts(); const c = th.tree[v % th.tree.length];
    p.cyl(0.2, 1.6, 0x7a5132, 0, 0, 0, U.cyl6).ball(1.15, c, 0, 2.5, 0, 1, U.ico).ball(0.75, c, 0.3, 3.3, 0.1, 1, U.ico);
    if (th.snow) p.ball(0.8, 0xf6f9fc, 0.1, 3.55, 0, 0.5, U.ico);
    return { p, w: 2.3, d: 2.3, h: 4, fit: 1.05 };
  } },
  pine: { name: 'Ёлка', build(v, th) {
    const p = new Parts(); const c = th.snow ? 0x2c6a4c : 0x2f7d4f;
    p.cyl(0.18, 0.8, 0x6b4428, 0, 0, 0, U.cyl6).cone(1.2, 2, c, 0, 0.7).cone(0.9, 1.7, c, 0, 1.8).cone(0.6, 1.4, th.snow ? 0xf2f6fa : c, 0, 2.8);
    return { p, w: 2.3, d: 2.3, h: 4.2, fit: 1.0 };
  } },
  car: { name: 'Машина', build(v) {
    const p = new Parts(); const c = CARC[v % CARC.length];
    p.box(1.7, 0.62, 3.6, c, 0, 0.3).box(1.46, 0.56, 1.9, 0x2b3a52, 0, 0.92, -0.15).box(1.5, 0.08, 1.8, c, 0, 1.48, -0.15)
      .box(1.3, 0.12, 0.05, 0xfff4c0, 0, 0.62, 1.8).box(1.3, 0.12, 0.05, 0xd83030, 0, 0.62, -1.8);
    for (const [x, z] of [[-0.8, 1.15], [0.8, 1.15], [-0.8, -1.15], [0.8, -1.15]]) p.wheel(0.34, 0.26, 0x1c1c22, x, 0.34, z);
    return { p, w: 1.8, d: 3.6, h: 1.55, fit: 1.62 };
  } },
  taxi: { name: 'Такси', build() {
    const p = TYPES.car.build(0).p; p.p[0].c = 0xf6c21c; p.p[2].c = 0xf6c21c; p.box(0.6, 0.22, 0.3, 0x222222, 0, 1.52, -0.15);
    return { p, w: 1.8, d: 3.6, h: 1.75, fit: 1.62 };
  } },
  police: { name: 'Полиция', build() {
    const p = new Parts();
    p.box(1.75, 0.64, 3.8, 0xf5f7fa, 0, 0.3).box(1.77, 0.3, 1.6, 0x2356c9, 0, 0.45, 0.1).box(1.5, 0.56, 2, 0x2b3a52, 0, 0.94, -0.15).box(1.52, 0.08, 1.9, 0xf5f7fa, 0, 1.5, -0.15)
      .box(0.5, 0.22, 0.34, 0xe53030, -0.28, 1.58, -0.1).box(0.5, 0.22, 0.34, 0x2f6af0, 0.28, 1.58, -0.1);
    for (const [x, z] of [[-0.8, 1.2], [0.8, 1.2], [-0.8, -1.2], [0.8, -1.2]]) p.wheel(0.34, 0.26, 0x1c1c22, x, 0.34, z);
    return { p, w: 1.8, d: 3.8, h: 1.8, fit: 1.7 };
  } },
  icecream: { name: 'Фургон с мороженым', build() {
    const p = new Parts();
    p.box(2, 2.1, 4.6, 0xfbe3ee, 0, 0.35).box(2.02, 0.5, 4.62, 0xf07aa8, 0, 0.9).box(1.9, 0.9, 0.05, 0x2b3a52, 0, 1.4, 2.31)
      .box(0.05, 0.8, 1.8, 0x2b3a52, 1.0, 1.4, -0.4).cone(0.45, 1, 0xf2c16b, 0, 2.45, -0.8, U.cone6).ball(0.5, 0xff9ec2, 0, 3.55, -0.8, 1, U.dodeca);
    for (const [x, z] of [[-0.9, 1.5], [0.9, 1.5], [-0.9, -1.5], [0.9, -1.5]]) p.wheel(0.4, 0.3, 0x1c1c22, x, 0.4, z);
    return { p, w: 2.1, d: 4.6, h: 4, fit: 2.1 };
  } },
  bus: { name: 'Автобус', build(v) {
    const p = new Parts(); const c = [0xf5b82e, 0xe0453f, 0x2f8f6b][v % 3];
    p.box(2.4, 2.5, 8.6, c, 0, 0.45).box(2.44, 0.85, 7.4, 0x24324a, 0, 1.6, -0.4).box(2.2, 1.2, 0.05, 0x24324a, 0, 1.4, 4.31).box(2.3, 0.14, 8.4, 0xf2f2f2, 0, 2.95);
    for (const [x, z] of [[-1.1, 2.8], [1.1, 2.8], [-1.1, -2.8], [1.1, -2.8]]) p.wheel(0.5, 0.34, 0x1c1c22, x, 0.5, z);
    return { p, w: 2.5, d: 8.6, h: 3.1, fit: 3.7 };
  } },
  truck: { name: 'Грузовик', build(v) {
    const p = new Parts(); const c = [0x3a78d8, 0xe0453f, 0x4aa36a, 0xf2a93b][v % 4];
    p.box(2.3, 2.1, 2, c, 0, 0.45, 2.6).box(2.1, 0.8, 0.05, 0x24324a, 0, 1.6, 3.61).box(2.4, 2.8, 5, 0xe9e9ee, 0, 0.55, -0.9).box(2.42, 0.4, 5.02, c, 0, 2.6, -0.9);
    for (const [x, z] of [[-1.05, 2.6], [1.05, 2.6], [-1.05, -1.2], [1.05, -1.2], [-1.05, -2.6], [1.05, -2.6]]) p.wheel(0.48, 0.32, 0x1c1c22, x, 0.48, z);
    return { p, w: 2.5, d: 7.2, h: 3.4, fit: 3.2 };
  } },
  firetruck: { name: 'Пожарная машина', build() {
    const p = new Parts();
    p.box(2.4, 2.3, 7.4, 0xd9302b, 0, 0.45).box(2.2, 0.8, 0.05, 0x24324a, 0, 1.8, 3.71).box(2.42, 0.2, 7.42, 0xf2f2f2, 0, 1.1)
      .box(0.7, 0.18, 6.4, 0xc9cdd4, -0.4, 2.8, -0.6).box(0.7, 0.18, 6.4, 0xc9cdd4, 0.4, 2.8, -0.6)
      .box(0.8, 0.25, 0.35, 0x2f6af0, 0, 2.75, 2.9);
    for (let i = -2.2; i <= 1; i += 0.8) p.box(0.9, 0.08, 0.12, 0xc9cdd4, 0, 2.9, i);
    for (const [x, z] of [[-1.1, 2.4], [1.1, 2.4], [-1.1, -2.4], [1.1, -2.4]]) p.wheel(0.5, 0.34, 0x1c1c22, x, 0.5, z);
    return { p, w: 2.5, d: 7.4, h: 3.2, fit: 3.3 };
  } },
  container: { name: 'Контейнер', build(v) {
    const p = new Parts(); const c = [0xd9502e, 0x2f78c4, 0x3f9a5a, 0xe8b22f, 0x8a4ab0][v % 5];
    p.box(2.5, 2.6, 6, c);
    for (let z = -2.6; z <= 2.6; z += 0.65) p.box(2.56, 2.4, 0.12, c === 0xe8b22f ? 0xc9941c : 0x000000 + (c & 0xdcdcdc), 0, 0.1, z);
    return { p, w: 2.5, d: 6, h: 2.6, fit: 2.9 };
  } },
  kiosk: { name: 'Киоск', build(v, th) {
    const p = new Parts(); const c = [0x2f9ad0, 0xe0453f, 0x39b36b][v % 3];
    p.box(2.6, 2.4, 2.4, 0xf2ece0).box(2.2, 1, 0.05, 0x2b3a52, 0, 1, 1.21);
    for (let i = 0; i < 5; i++) p.box(0.56, 0.12, 1, i % 2 ? 0xffffff : c, -1.12 + i * 0.56, 2.25, 1.55);
    p.box(2.8, 0.25, 2.6, c, 0, 2.4);
    return { p, w: 2.8, d: 2.9, h: 2.65, fit: 1.9 };
  } },
  busstop: { name: 'Остановка', build() {
    const p = new Parts();
    p.box(0.1, 2.4, 0.1, 0x3a3f4b, -1.5, 0, -0.5).box(0.1, 2.4, 0.1, 0x3a3f4b, 1.5, 0, -0.5).box(3.2, 1.6, 0.06, 0x9ec9e8, 0, 0.6, -0.55)
      .box(3.4, 0.12, 1.5, 0x3a78d8, 0, 2.4, -0.1).box(2.4, 0.1, 0.45, 0xa8693b, 0, 0.45, -0.3);
    return { p, w: 3.4, d: 1.5, h: 2.55, fit: 1.9 };
  } },
  fountain: { name: 'Фонтан', build(v, th) {
    const p = new Parts(); const water = th.snow ? 0xcfe6f5 : 0x4fb6e8;
    p.cyl(3, 0.7, 0xd4cfc4, 0, 0, 0, U.cyl20).cyl(2.65, 0.72, water, 0, 0.02, 0, U.cyl20).cyl(0.45, 2, 0xc8c2b6, 0, 0, 0, U.cyl8)
      .cyl(1.2, 0.3, 0xd4cfc4, 0, 1.9, 0, U.cyl12).cyl(1.0, 0.32, water, 0, 1.92, 0, U.cyl12).cyl(0.18, 1.4, 0xaee3fa, 0, 2.1, 0, U.cyl6);
    return { p, w: 6, d: 6, h: 3.5, fit: 2.85 };
  } },
  statue: { name: 'Памятник', build() {
    const p = new Parts(); const b = 0x5f9a86;
    p.box(3, 0.5, 3, 0xbdb6a8).box(2.2, 2, 2.2, 0xd2cbbd, 0, 0.5).box(0.35, 1.3, 0.4, b, -0.25, 2.5).box(0.35, 1.3, 0.4, b, 0.25, 2.5)
      .box(1, 1.4, 0.6, b, 0, 3.8).box(0.5, 0.55, 0.5, b, 0, 5.2).box(0.3, 1.5, 0.3, b, 0.62, 5).box(0.3, 1.2, 0.3, b, -0.62, 3.9);
    return { p, w: 3, d: 3, h: 6.5, fit: 2.4 };
  } },
  watertower: { name: 'Водонапорная башня', build() {
    const p = new Parts();
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) p.box(0.3, 7, 0.3, 0x6b6f7a, x, 0, z);
    p.box(3.5, 0.2, 0.2, 0x6b6f7a, 0, 3.5, -1.6).box(3.5, 0.2, 0.2, 0x6b6f7a, 0, 3.5, 1.6)
      .cyl(2.5, 3.4, 0xd8dde3, 0, 7, 0, U.cyl12).cyl(2.52, 0.4, 0xe0453f, 0, 8.4, 0, U.cyl12).cone(2.7, 1.6, 0x8f96a3, 0, 10.4, 0, U.cone6);
    return { p, w: 5, d: 5, h: 12, fit: 2.6 };
  } },
};

const ROUND = new Set(['tree', 'pine', 'bush', 'fountain', 'watertower', 'cone', 'hydrant', 'trash', 'lamp']);

// уникальные здания
function makeHouse(rng, th) {
  const w = 5 + rng() * 1.6, d = 5 + rng() * 1.6, h = 2.8 + rng() * 1.6;
  const wall = pick(rng, th.build), roof = pick(rng, th.roof);
  const p = new Parts();
  p.box(w, h, d, wall).box(1, 1.8, 0.1, 0x6b4a32, 0, 0, d / 2 + 0.02);
  for (const x of [-w / 3, w / 3]) p.box(1, 0.9, 0.08, th.night ? th.glass : 0x9fd2f0, x, h * 0.45, d / 2 + 0.03);
  p.add(U.cone4, roof, 0, h + 1.1, 0, 0, Math.PI / 4, 0, (w / 2 + 0.5) * 1.414, 2.2, (d / 2 + 0.5) * 1.414);
  p.box(0.6, 1.4, 0.6, 0x8a5a44, w / 4, h + 0.6, -d / 5);
  return { p, w, d, h: h + 2.2, fit: Math.max(w, d) / 2 * 0.9, name: 'Дом', type: 'house' };
}
function makeShop(rng, th) {
  const w = 6.5 + rng() * 1.5, d = 6 + rng(), h = 4 + rng() * 2;
  const wall = pick(rng, th.build), aw = pick(rng, [0xe0453f, 0x2f9ad0, 0x39b36b, 0xf2a93b]);
  const p = new Parts();
  p.box(w, h, d, wall).box(w - 1, 1.8, 0.1, th.night ? th.glass : 0x7fb8dc, 0, 0.3, d / 2 + 0.02);
  const n = 6; for (let i = 0; i < n; i++) p.box(w / n, 0.14, 1.3, i % 2 ? 0xffffff : aw, -w / 2 + w / n * (i + 0.5), 2.4, d / 2 + 0.6);
  p.box(w * 0.6, 0.7, 0.12, aw, 0, h - 1.1, d / 2 + 0.03).box(w + 0.2, 0.3, d + 0.2, 0xdcd6ca, 0, h);
  return { p, w, d, h: h + 0.3, fit: Math.max(w, d) / 2 * 0.9, name: 'Магазин', type: 'shop' };
}
function makeTower(rng, th, big) {
  const w = big ? 10 + rng() * 2 : 7.5 + rng() * 2.5, d = big ? 10 + rng() * 2 : 7.5 + rng() * 2.5;
  const h = big ? 28 + rng() * 22 : 10 + rng() * 12;
  const wall = pick(rng, th.build), glass = th.glass;
  const p = new Parts();
  const tiers = big ? (rng() < 0.6 ? 3 : 2) : 1;
  let cw = w, cd = d, y = 0;
  for (let t = 0; t < tiers; t++) {
    const th_ = t === tiers - 1 ? h - y : h * (t === 0 ? 0.55 : 0.3);
    p.box(cw, th_, cd, wall, 0, y);
    for (let fy = y + 1.4; fy < y + th_ - 1; fy += 3) p.box(cw + 0.08, 1.3, cd + 0.08, glass, 0, fy);
    y += th_; p.box(cw + 0.3, 0.3, cd + 0.3, 0xcfcac0, 0, y - 0.1);
    cw *= 0.75; cd *= 0.75;
  }
  if (big) p.cyl(0.15, 5, 0xb0b4bc, 0, y).ball(0.3, 0xe0453f, 0, y + 5);
  else p.box(2, 1.2, 2, 0x9aa0aa, w / 5, y);
  return { p, w, d, h: y + (big ? 5 : 1.2), fit: Math.max(w, d) / 2 * 0.9, name: big ? 'Небоскрёб' : 'Офис', type: big ? 'skyscraper' : 'office' };
}

// ---------- уровни ----------
const REQ_POOL = [
  ['bus', 1], ['icecream', 1], ['police', 2], ['fountain', 2], ['firetruck', 3], ['statue', 4],
  ['house', 6], ['truck', 7], ['watertower', 9], ['office', 13], ['skyscraper', 22],
];
const TYPE_NAME = { bus: 'Автобус', icecream: 'Фургон с мороженым', police: 'Полиция', fountain: 'Фонтан', firetruck: 'Пожарная машина', statue: 'Памятник', house: 'Дом', truck: 'Грузовик', watertower: 'Водонапорная башня', office: 'Офис', skyscraper: 'Небоскрёб' };

const starCut = (cfg) => [Math.ceil(cfg.time * 0.2), Math.ceil(cfg.time * 0.4)]; // сколько секунд должно остаться для 2 и 3 звёзд
const starsFor = (cfg, left) => { const [c2, c3] = starCut(cfg); return left >= c3 ? 3 : left >= c2 ? 2 : 1; };

function levelConfig(n) {
  const rng = mulberry32(n * 7919 + 13);
  const superHard = n % 10 === 0;
  const hard = !superHard && n % 5 === 0;
  const G = Math.min(7, 4 + Math.floor((n - 1) / 20));
  const theme = THEMES[Math.floor((n - 1) / 5) % THEMES.length];
  let target = Math.round(30 + n * 3.4);
  let time = 90 + (G - 4) * 8;
  if (hard) { target = Math.round(target * 1.35); time = Math.round(time * 0.85); }
  if (superHard) { target = Math.round(target * 1.7); time = Math.round(time * 0.76); }
  const reqCount = n <= 2 ? 1 : superHard ? 3 : 2;
  const unlocked = REQ_POOL.filter((r) => r[1] <= n).map((r) => r[0]);
  const req = [];
  if (superHard || hard) req.push(unlocked[unlocked.length - 1]);
  while (req.length < reqCount) {
    // чаще берём свежие, крупные
    const i = Math.floor(Math.pow(rng(), 0.6) * unlocked.length);
    const t = unlocked[i];
    if (!req.includes(t) || unlocked.length < reqCount) req.push(t);
  }
  return { n, rng, G, theme, target, time, req, hard, superHard };
}

// ---------- рендер ----------
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true, powerPreference: 'high-performance' });
const isMobile = matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 900);
const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 1.5);
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(-0.5, 1, 0.35);
scene.add(hemi, sun);
const MAT = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 62 : 50; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// дыра: трафарет вырезает землю, внутри — стенки
const hole = new THREE.Group();
const holeStencil = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
  colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
}));
holeStencil.position.y = 0.02; holeStencil.renderOrder = -10;
const wallGeo = new THREE.CylinderGeometry(1, 1, 14, 64, 10, true);
{ const c = new Float32Array(wallGeo.attributes.position.count * 3); const pa = wallGeo.attributes.position;
  // у кромки стенка чуть светлее, ниже уходит в черноту: видно, что это шахта, а не пятно
  for (let i = 0; i < pa.count; i++) { const k = Math.exp(-(7 - pa.getY(i)) * 0.55); c.set([0.045 * k, 0.02 * k, 0.09 * k], i * 3); }
  wallGeo.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
const holeWall = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
holeWall.position.y = -7;
const holeBottom = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000 }));
holeBottom.position.y = -13.9;
const holeRim = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 72).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff5a4e }));
holeRim.position.y = 0.04;
const inner = new THREE.Group(); inner.add(holeWall, holeBottom);
hole.add(holeStencil, inner, holeRim);
scene.add(hole);

const arrowGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.9), new THREE.Vector3(-0.6, 0, 0.4), new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(0, 0, -0.9), new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(0.6, 0, 0.4)]);
arrowGeo.computeVertexNormals();
const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xffc233, side: THREE.DoubleSide }));
arrow.position.y = 0.08; scene.add(arrow);

const beaconGeo = new THREE.OctahedronGeometry(1, 0);
const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffc233 });

// ---------- состояние мира ----------
let world = null; // { objects, batches, meshes, S, cfg, ... }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _p = new THREE.Vector3(), _ax = new THREE.Vector3();
const ONE = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Vector3(0, 0, 0), UP = new THREE.Vector3(0, 1, 0);

const WHITE = new THREE.Color(1, 1, 1);
function objQuat(o, q) {
  q.setFromAxisAngle(UP, o.rot);
  if (o.tilt) { _ax.set(o.ax, 0, o.az); if (_ax.lengthSq() > 1e-6) { _ax.normalize(); _q2.setFromAxisAngle(_ax, o.tilt); q.premultiply(_q2); } }
  return q;
}
// затемнение в глубине дыры
function setDark(o, f) {
  if (Math.abs(o.dark - f) < 0.02 && f !== 1) return;
  o.dark = f;
  _col.setScalar(f);
  if (o.batch) { o.batch.setColorAt(o.idx, _col); o.batch.instanceColor.needsUpdate = true; }
  else if (o.mesh) {
    if (f < 1 && o.mesh.material === MAT) o.mesh.material = MAT.clone();
    if (o.mesh.material !== MAT) o.mesh.material.color.setScalar(f);
  }
}
function writeMatrix(o) {
  objQuat(o, _q);
  _p.set(o.x, o.y, o.z);
  _m.compose(_p, _q, o.dead ? ZERO : ONE);
  if (o.batch) { o.batch.setMatrixAt(o.idx, _m); o.batch.instanceMatrix.needsUpdate = true; }
  else { o.mesh.matrix.copy(_m); o.mesh.matrixWorldNeedsUpdate = true; }
}

function disposeWorld() {
  if (!world) return;
  for (const obj of world.nodes) { scene.remove(obj); obj.geometry?.dispose(); if (obj.material && obj.material !== MAT && obj.material !== beaconMat) { obj.material.map?.dispose(); obj.material.dispose(); } if (obj.isInstancedMesh) obj.dispose(); }
  world = null;
}

function buildWorld(cfg) {
  disposeWorld();
  const { rng, G, theme: th } = cfg;
  const B = 30, W = 9, SW = 3;
  const S = G * B + (G + 1) * W;
  const half = S / 2;
  const roadC = (j) => -half + W / 2 + j * (B + W);
  const blockX = (i) => -half + W + i * (B + W);

  scene.background = new THREE.Color(th.sky);
  scene.fog = new THREE.Fog(th.sky, 80, 260);
  hemi.color.set(th.hemi[0]); hemi.groundColor.set(th.hemi[1]); hemi.intensity = th.hemi[2];
  sun.color.set(th.sun[0]); sun.intensity = th.sun[1];

  const specs = [];
  const uniq = [];
  const spawn = (type, v, x, z, rot = 0, move = null) => specs.push({ type, key: type + ':' + v, v, x, z, rot, move });
  const spawnU = (def, x, z, rot = 0) => uniq.push({ def, x, z, rot });

  // типы кварталов
  const blocks = [];
  const n = cfg.n;
  const weights = { downtown: 1 + n / 25, residential: 3 - Math.min(2, n / 40), commercial: 2, park: 1.6, industrial: 0.8 + n / 60 };
  const wsum = Object.values(weights).reduce((a, b) => a + b, 0);
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    let r = rng() * wsum, t = 'residential';
    for (const k in weights) { r -= weights[k]; if (r <= 0) { t = k; break; } }
    blocks.push({ i, j, t, x0: blockX(i), z0: blockX(j) });
  }
  // гарантируем кварталы под обязательные предметы
  const needBlock = { fountain: 'park', statue: 'park', watertower: 'industrial', house: 'residential', office: 'downtown', skyscraper: 'downtown' };
  const shuffled = blocks.slice().sort(() => rng() - 0.5);
  let si = 0;
  const forced = {};
  for (const t of cfg.req) {
    const bt = needBlock[t]; if (!bt) continue;
    const b = shuffled[si++ % shuffled.length]; b.t = bt; if (t === 'statue') b.statue = true; if (t === 'fountain') b.fountain = true;
    forced[t] = true;
  }
  const hasDown = blocks.some((b) => b.t === 'downtown');

  const nTree = th.tree.length;
  for (const b of blocks) {
    const ax = b.x0 + SW, az = b.z0 + SW, IN = B - SW * 2; // внутренняя часть
    const rects = [];
    const free = (x, z, w, d) => rects.every((r) => Math.abs(r.x - x) > (r.w + w) / 2 + 0.4 || Math.abs(r.z - z) > (r.d + d) / 2 + 0.4);
    const tryPut = (w, d, fn, tries = 12) => {
      for (let k = 0; k < tries; k++) {
        const x = ax + w / 2 + 0.5 + rng() * (IN - w - 1), z = az + d / 2 + 0.5 + rng() * (IN - d - 1);
        if (free(x, z, w, d)) { rects.push({ x, z, w, d }); fn(x, z); return true; }
      }
      return false;
    };
    const cx = ax + IN / 2, cz = az + IN / 2;
    const walkers = (cnt, x1, z1, x2, z2) => {
      for (let k = 0; k < cnt; k++) {
        const x = x1 + rng() * (x2 - x1), z = z1 + rng() * (z2 - z1); const a = rng() * Math.PI * 2;
        spawn('person', Math.floor(rng() * 32), x, z, a, { kind: 'walk', sp: 0.9 + rng() * 0.8, a, bx1: x1, bz1: z1, bx2: x2, bz2: z2, t: rng() * 4 });
      }
    };

    if (b.t === 'downtown') {
      const lot = (IN - 1.5) / 2;
      for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++) {
        const x = ax + lot / 2 + a * (lot + 1.5), z = az + lot / 2 + c * (lot + 1.5);
        const big = rng() < 0.45 + Math.min(0.3, n / 150);
        const def = makeTower(rng, th, big);
        spawnU(def, x, z, c === 0 ? Math.PI : 0);
      }
      walkers(3 + Math.floor(rng() * 3), ax, az, ax + IN, az + IN);
      if (rng() < 0.5) spawn('kiosk', Math.floor(rng() * 3), cx, cz, Math.floor(rng() * 4) * Math.PI / 2);
    } else if (b.t === 'residential') {
      const lot = IN / 3;
      for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) {
        const x = ax + lot / 2 + a * lot, z = az + lot / 2 + c * lot;
        const r = rng();
        if (r < 0.62 || (forced.house && a === 1 && c === 1)) {
          spawnU(makeHouse(rng, th), x, z, c === 0 ? Math.PI : c === 2 ? 0 : a === 0 ? -Math.PI / 2 : a === 2 ? Math.PI / 2 : Math.floor(rng() * 4) * Math.PI / 2);
          if (rng() < 0.5) spawn('bush', Math.floor(rng() * nTree), x + lot / 2 - 0.9, z + lot / 2 - 0.9);
        } else if (r < 0.8) {
          spawn('tree', Math.floor(rng() * nTree), x - 1.2, z - 1); spawn('bush', Math.floor(rng() * nTree), x + 1.4, z + 1.2);
          spawn('car', Math.floor(rng() * 8), x + 1, z - 0.5, rng() < 0.5 ? 0 : Math.PI / 2);
        } else {
          spawn(th.snow ? 'pine' : 'tree', Math.floor(rng() * nTree), x - 1.3, z - 1.3); spawn(th.snow ? 'pine' : 'tree', Math.floor(rng() * nTree), x + 1.3, z + 1.3);
          spawn('bench', 0, x + 1.3, z - 1.6, Math.floor(rng() * 4) * Math.PI / 2);
        }
      }
      walkers(1 + Math.floor(rng() * 3), ax, az, ax + IN, az + IN);
    } else if (b.t === 'commercial') {
      for (let k = 0; k < 3; k++) {
        const x = ax + 4 + k * 8;
        const s1 = makeShop(rng, th); spawnU(s1, x, az + 3.6, Math.PI); rects.push({ x, z: az + 3.6, w: 7.5, d: 7 });
        const s2 = makeShop(rng, th); spawnU(s2, x, az + IN - 3.6, 0); rects.push({ x, z: az + IN - 3.6, w: 7.5, d: 7 });
      }
      tryPut(2.8, 2.9, (x, z) => spawn('kiosk', Math.floor(rng() * 3), x, z, Math.floor(rng() * 4) * Math.PI / 2));
      for (let k = 0; k < 4; k++) tryPut(1.6, 0.6, (x, z) => spawn('bench', 0, x, z, Math.floor(rng() * 4) * Math.PI / 2));
      for (let k = 0; k < 3; k++) tryPut(0.7, 0.7, (x, z) => spawn('trash', 0, x, z));
      for (let k = 0; k < 3; k++) tryPut(1.2, 1.2, (x, z) => spawn('bush', Math.floor(rng() * nTree), x, z));
      if (rng() < 0.35 && !cfg.req.includes('icecream')) tryPut(2.2, 4.6, (x, z) => spawn('icecream', 0, x, z, Math.PI / 2));
      walkers(6 + Math.floor(rng() * 6), ax + 1, az + 8, ax + IN - 1, az + IN - 8);
    } else if (b.t === 'park') {
      const center = b.statue ? 'statue' : b.fountain ? 'fountain' : rng() < 0.6 ? 'fountain' : 'statue';
      spawn(center, 0, cx, cz, rng() * 6); rects.push({ x: cx, z: cz, w: 6.5, d: 6.5 });
      for (let k = 0; k < 14; k++) tryPut(2.3, 2.3, (x, z) => spawn(th.snow && rng() < 0.5 ? 'pine' : 'tree', Math.floor(rng() * nTree), x, z, rng() * 6));
      for (let k = 0; k < 5; k++) tryPut(1.6, 0.6, (x, z) => spawn('bench', 0, x, z, Math.floor(rng() * 4) * Math.PI / 2));
      for (let k = 0; k < 6; k++) tryPut(1.3, 1.3, (x, z) => spawn('bush', Math.floor(rng() * nTree), x, z));
      for (let k = 0; k < 3; k++) tryPut(0.6, 0.6, (x, z) => spawn('lamp', 0, x, z, Math.floor(rng() * 4) * Math.PI / 2));
      walkers(6 + Math.floor(rng() * 6), ax + 1, az + 1, ax + IN - 1, az + IN - 1);
    } else {
      spawn('watertower', 0, ax + 4, az + 4, 0); rects.push({ x: ax + 4, z: az + 4, w: 5.5, d: 5.5 });
      for (let k = 0; k < 9; k++) tryPut(2.6, 6.2, (x, z) => spawn('container', Math.floor(rng() * 5), x, z, rng() < 0.2 ? Math.PI : 0));
      for (let k = 0; k < 2; k++) tryPut(2.6, 7.3, (x, z) => spawn('truck', Math.floor(rng() * 4), x, z, 0));
      for (let k = 0; k < 6; k++) tryPut(0.6, 0.6, (x, z) => spawn('cone', 0, x, z, rng() * 6));
      walkers(2 + Math.floor(rng() * 3), ax + 1, az + 1, ax + IN - 1, az + IN - 1);
    }

    // тротуар по периметру квартала
    const edge = [
      [b.x0 + 1, b.z0 + 1.2, b.x0 + B - 1, b.z0 + 1.2, Math.PI], [b.x0 + 1, b.z0 + B - 1.2, b.x0 + B - 1, b.z0 + B - 1.2, 0],
      [b.x0 + 1.2, b.z0 + 1, b.x0 + 1.2, b.z0 + B - 1, -Math.PI / 2], [b.x0 + B - 1.2, b.z0 + 1, b.x0 + B - 1.2, b.z0 + B - 1, Math.PI / 2],
    ];
    for (const [x1, z1, x2, z2, face] of edge) {
      for (let t = 0.14; t < 1; t += 0.36) spawn('lamp', 0, lerp(x1, x2, t), lerp(z1, z2, t), face);
      const extra = rng();
      const t = 0.3 + rng() * 0.4;
      if (extra < 0.3) spawn('hydrant', 0, lerp(x1, x2, t), lerp(z1, z2, t));
      else if (extra < 0.55) spawn('trash', 0, lerp(x1, x2, t), lerp(z1, z2, t));
      else if (extra < 0.7) spawn('mailbox', 0, lerp(x1, x2, t), lerp(z1, z2, t), face);
      else if (extra < 0.85) spawn('tree', Math.floor(rng() * nTree), lerp(x1, x2, t), lerp(z1, z2, t));
      const horiz = z1 === z2;
      const cnt = Math.floor(rng() * 3) + 1;
      for (let k = 0; k < cnt; k++) {
        const tt = rng(); const x = lerp(x1, x2, tt), z = lerp(z1, z2, tt);
        const dir = rng() < 0.5 ? 1 : -1;
        spawn('person', Math.floor(rng() * 32), x, z, 0, { kind: 'side', sp: (1 + rng() * 0.8) * dir, horiz, a1: horiz ? x1 : z1, a2: horiz ? x2 : z2, t: 0 });
      }
    }
  }

  // транспорт на дорогах
  const vehiclePool = ['car', 'car', 'car', 'car', 'taxi', 'car', 'police', 'truck', 'bus', 'car', 'taxi', 'icecream'];
  const lanes = [];
  for (let j = 0; j <= G; j++) for (const s of [-1, 1]) { lanes.push({ vert: true, rc: roadC(j), c: roadC(j) + s * 2.2, dir: s }); lanes.push({ vert: false, rc: roadC(j), c: roadC(j) - s * 2.2, dir: s }); }
  const addVehicle = (type, lane, pos) => {
    const v = type === 'car' ? Math.floor(rng() * 8) : Math.floor(rng() * 4);
    const sp = (type === 'bus' || type === 'truck' || type === 'firetruck' ? 4.5 : 6) + rng() * 2;
    const rot = lane.vert ? (lane.dir > 0 ? 0 : Math.PI) : (lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    const x = lane.vert ? lane.c : pos, z = lane.vert ? pos : lane.c;
    spawn(type, v, x, z, rot, { kind: 'drive', vert: lane.vert, sp: sp * lane.dir, rc: lane.rc, off: lane.c - lane.rc });
  };
  for (const lane of lanes) {
    const cnt = Math.max(1, Math.round(S / 45 * (0.5 + rng() * 0.7)));
    const step = S / cnt;
    for (let k = 0; k < cnt; k++) {
      let type = pick(rng, vehiclePool);
      if (cfg.req.includes(type)) type = 'car';
      addVehicle(type, lane, -half + step * k + rng() * step * 0.6);
    }
  }
  for (const t of cfg.req) if (['bus', 'icecream', 'police', 'firetruck', 'truck'].includes(t)) addVehicle(t, pick(rng, lanes), -half + rng() * S);
  // остановки у дорог
  for (let k = 0; k < G; k++) { const lane = pick(rng, lanes.filter((l) => l.vert && Math.abs(l.rc) < half - W)); spawn('busstop', 0, lane.c + (lane.dir > 0 ? 3.3 : -3.3) * (lane.c > roadC(0) + 1 ? 1 : 1) + (lane.dir > 0 ? 0.2 : -0.2), -half + W + rng() * (S - 2 * W), lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2); }

  // --- создание мешей ---
  const nodes = [];
  const counts = {};
  for (const s of specs) counts[s.key] = (counts[s.key] || 0) + 1;
  const batches = {};
  const defs = {};
  for (const key in counts) {
    const [type, v] = key.split(':');
    const d = TYPES[type].build(+v, th);
    const geo = d.p.build();
    defs[key] = { ...d, type, name: TYPES[type].name };
    const im = new THREE.InstancedMesh(geo, MAT, counts[key]);
    im.frustumCulled = false; im.count = 0; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    batches[key] = im; nodes.push(im); scene.add(im);
  }
  const objects = [];
  const mk = (def, x, z, rot) => {
    // габариты для столкновений с краем дыры: у круглых (крона, клумба) коробка уже
    const cs = ROUND.has(def.type) ? 0.72 : 1;
    const hw = def.w / 2 * cs, hd = def.d / 2 * cs, h = def.h;
    const upright = h >= Math.max(hw, hd) * 2 * 0.9;
    // какой радиус дыры нужен: высокое падает стоя, длинное — носом вниз
    const need = upright ? Math.hypot(hw, hd) : Math.max(Math.hypot(Math.min(hw, hd), h / 2), Math.max(hw, hd) * 0.6);
    return { x, y: 0, z, rot, tilt: 0, ax: 0, az: 0, w: def.w, d: def.d, h, hw, hd, upright, need, ext: Math.hypot(hw, hd), fit: def.fit, name: def.name, type: def.type,
      gain: 0.42 * Math.max(def.fit, 0.3) ** 2 * (def.h > 8 ? 1.25 : 1), state: 0, vy: 0, w0: 0, dark: 1, dead: false, move: null, req: false, beacon: null, wob: 0 };
  };
  for (const s of specs) {
    const def = defs[s.key]; const o = mk(def, s.x, s.z, s.rot);
    o.move = s.move; o.batch = batches[s.key]; o.idx = o.batch.count++;
    o.batch.setColorAt(o.idx, WHITE);
    objects.push(o); writeMatrix(o);
  }
  for (const u of uniq) {
    const geo = u.def.p.build(); const mesh = new THREE.Mesh(geo, MAT); mesh.matrixAutoUpdate = false;
    scene.add(mesh); nodes.push(mesh);
    const o = mk(u.def, u.x, u.z, u.rot); o.mesh = mesh; objects.push(o); writeMatrix(o);
  }

  // обязательные
  const reqs = [];
  const startX = roadC(Math.floor(G / 2)), startZ = roadC(Math.floor(G / 2));
  for (const t of cfg.req) {
    let cands = objects.filter((o) => o.type === t && !o.req);
    if (!cands.length) continue;
    // предпочитаем не у самого старта
    cands.sort((a, b) => Math.hypot(b.x - startX, b.z - startZ) - Math.hypot(a.x - startX, a.z - startZ));
    const o = cands[Math.floor(rng() * Math.min(cands.length, Math.max(1, Math.ceil(cands.length * 0.6))))];
    o.req = true;
    const bc = new THREE.Mesh(beaconGeo, beaconMat); bc.scale.set(0.9, 1.4, 0.9); scene.add(bc); nodes.push(bc); o.beacon = bc;
    reqs.push({ o, name: o.name, done: false });
  }

  // земля
  const ppu = Math.min(10, Math.floor(2048 / S * 100) / 100);
  const cv = document.createElement('canvas'); cv.width = cv.height = Math.ceil(S * ppu);
  const ctx = cv.getContext('2d');
  const X = (x) => (x + half) * ppu;
  ctx.fillStyle = th.grass; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = th.road;
  for (let j = 0; j <= G; j++) { ctx.fillRect(X(roadC(j) - W / 2), 0, W * ppu, cv.height); ctx.fillRect(0, X(roadC(j) - W / 2), cv.width, W * ppu); }
  ctx.strokeStyle = th.line; ctx.lineWidth = Math.max(1, 0.25 * ppu); ctx.setLineDash([2 * ppu, 2 * ppu]);
  for (let j = 0; j <= G; j++) {
    for (let i = 0; i < G; i++) {
      const a = X(blockX(i)) + ppu, bb = X(blockX(i) + B) - ppu;
      ctx.beginPath(); ctx.moveTo(X(roadC(j)), a); ctx.lineTo(X(roadC(j)), bb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a, X(roadC(j))); ctx.lineTo(bb, X(roadC(j))); ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  // зебры
  ctx.fillStyle = th.line; ctx.globalAlpha = 0.85;
  for (let j = 0; j <= G; j++) for (let k = 0; k <= G; k++) {
    const cx = roadC(j), cz = roadC(k);
    for (let s = -3; s <= 3; s += 1.2) {
      ctx.fillRect(X(cx + s - 0.35), X(cz - W / 2 - 2.2), 0.7 * ppu, 1.8 * ppu);
      ctx.fillRect(X(cx + s - 0.35), X(cz + W / 2 + 0.4), 0.7 * ppu, 1.8 * ppu);
      ctx.fillRect(X(cx - W / 2 - 2.2), X(cz + s - 0.35), 1.8 * ppu, 0.7 * ppu);
      ctx.fillRect(X(cx + W / 2 + 0.4), X(cz + s - 0.35), 1.8 * ppu, 0.7 * ppu);
    }
  }
  ctx.globalAlpha = 1;
  for (const b of blocks) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(X(b.x0) - 1, X(b.z0) - 1, B * ppu + 2, B * ppu + 2);
    ctx.fillStyle = th.walk; ctx.fillRect(X(b.x0), X(b.z0), B * ppu, B * ppu);
    const inC = { downtown: th.plaza, residential: th.grass, commercial: th.plaza, park: th.park, industrial: th.concrete }[b.t];
    ctx.fillStyle = inC; ctx.fillRect(X(b.x0 + SW), X(b.z0 + SW), (B - SW * 2) * ppu, (B - SW * 2) * ppu);
    if (b.t === 'park') {
      ctx.fillStyle = th.walk; const c = b.x0 + B / 2, d = b.z0 + B / 2;
      ctx.fillRect(X(c - 1), X(b.z0 + SW), 2 * ppu, (B - SW * 2) * ppu); ctx.fillRect(X(b.x0 + SW), X(d - 1), (B - SW * 2) * ppu, 2 * ppu);
      ctx.beginPath(); ctx.arc(X(c), X(d), 5 * ppu, 0, Math.PI * 2); ctx.fill();
    }
    if (b.t === 'downtown' || b.t === 'commercial') {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
      for (let s = SW; s < B - SW; s += 2) { ctx.beginPath(); ctx.moveTo(X(b.x0 + s), X(b.z0 + SW)); ctx.lineTo(X(b.x0 + s), X(b.z0 + B - SW)); ctx.stroke(); }
    }
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const stencilGround = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.KeepStencilOp };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(S, S).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tex, ...stencilGround }));
  ground.renderOrder = -5; scene.add(ground); nodes.push(ground);
  // за картой вода, по краю бетонное ограждение в красно-белую полоску
  const water = th.night ? 0x1d3350 : th.snow ? 0xcfe3ef : 0x49a9dc;
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(S * 6, S * 6).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: water, ...stencilGround }));
  outer.position.y = -1.6; outer.renderOrder = -6; scene.add(outer); nodes.push(outer);
  {
    const p = new Parts(), T = 0.8, H = 1.1, E = half + T / 2, earth = 0x8a6a4a;
    for (const [sx, sz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const along = sx === 0; // стенка вдоль оси x
      // обрыв к воде
      p.box(along ? S + 2 * T : 2.4, 2.2, along ? 2.4 : S + 2 * T, earth, sx * (half + 1.2), -2.2, sz * (half + 1.2));
      const n = Math.round((S + 2 * T) / 2.2), seg = (S + 2 * T) / n;
      for (let i = 0; i < n; i++) {
        const t = -half - T + seg * (i + 0.5), c = i % 2 ? 0xf4f1ea : 0xe0453f;
        p.box(along ? seg : T, H, along ? T : seg, c, along ? t : sx * E, 0, along ? sz * E : t);
      }
      p.box(along ? S + 2 * T : T + 0.1, 0.14, along ? T + 0.1 : S + 2 * T, 0xcfcac0, sx * E, H, sz * E);
    }
    const fence = new THREE.Mesh(p.build(), MAT); scene.add(fence); nodes.push(fence);
  }
  scene.fog.color.set(th.sky);

  cfg.target = Math.min(cfg.target, Math.floor(objects.length * 0.45));
  world = { cfg, objects, nodes, S, half, reqs, startX, startZ, batches, hasDown };
}

// ---------- игрок и игра ----------
const R0 = 1.3, RMAX = 17;
const game = {
  state: 'menu', x: 0, z: 0, R: R0, Rt: R0, R2: R0 * R0, time: 0, eaten: 0, paused: false, t: 0, pulse: 0,
};
const input = { jx: 0, jy: 0, active: false, keys: {} };

function resetPlayer() {
  game.x = world.startX; game.z = world.startZ; game.R = game.Rt = R0; game.R2 = R0 * R0; game.eaten = 0; game.time = world.cfg.time; game.pulse = 0;
  camPos.set(game.x, 60, game.z + 50);
}

// ---------- звук ----------
let actx = null, muted = false;
try { muted = localStorage.getItem('hole.muted') === '1'; } catch {}
function audio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } if (actx?.state === 'suspended') actx.resume(); return actx; }
let lastBlip = 0;
function tone(freq, dur = 0.12, type = 'sine', vol = 0.15, delay = 0) {
  if (muted || !actx) return;
  const t = actx.currentTime + delay; const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
}
function blip(fit) { const now = performance.now(); if (now - lastBlip < 45) return; lastBlip = now; tone(900 / (0.7 + fit * 0.6) + Math.random() * 60, 0.1 + fit * 0.04, 'triangle', 0.12); }

// ---------- HUD ----------
const hud = { stars: $('hud-stars'), timer: $('hud-timer'), level: $('hud-level'), bar: $('hud-bar-fill'), count: $('hud-count'), req: $('hud-req') };
let lastHud = {};
function buildReqChips() {
  hud.req.innerHTML = '';
  for (const r of world.reqs) { const el = document.createElement('span'); el.className = 'chip'; el.textContent = r.name; r.el = el; hud.req.appendChild(el); }
}
function updateHud() {
  const t = fmtTime(game.time);
  if (lastHud.t !== t) {
    hud.timer.textContent = t; hud.timer.classList.toggle('low', game.time <= 10); lastHud.t = t;
    const st = starsFor(world.cfg, Math.ceil(game.time));
    if (lastHud.st !== st) { [...hud.stars.children].forEach((s, i) => s.classList.toggle('on', i < st)); lastHud.st = st; }
  }
  if (lastHud.e !== game.eaten) {
    const tg = world.cfg.target; hud.count.textContent = Math.min(game.eaten, tg) + ' / ' + tg;
    hud.bar.style.transform = `scaleX(${Math.min(1, game.eaten / tg)})`; lastHud.e = game.eaten;
  }
}

// ---------- ввод ----------
const joy = $('joy'), joyKnob = $('joy-knob');
let ptr = null;
canvas.addEventListener('pointerdown', (e) => {
  if (game.state !== 'play') return; audio();
  ptr = { id: e.pointerId, ox: e.clientX, oy: e.clientY }; input.active = true; input.jx = input.jy = 0;
  joy.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; joy.classList.add('on'); joyKnob.style.transform = 'translate(0,0)';
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!ptr || e.pointerId !== ptr.id) return;
  let dx = e.clientX - ptr.ox, dy = e.clientY - ptr.oy; const L = Math.hypot(dx, dy), M = 55;
  if (L > M) { // джойстик едет за пальцем
    ptr.ox += dx - dx / L * M; ptr.oy += dy - dy / L * M; dx = dx / L * M; dy = dy / L * M;
    joy.style.transform = `translate(${ptr.ox}px, ${ptr.oy}px)`;
  }
  input.jx = dx / M; input.jy = dy / M; joyKnob.style.transform = `translate(${dx * 0.6}px, ${dy * 0.6}px)`;
});
const endPtr = (e) => { if (ptr && e.pointerId === ptr.id) { ptr = null; input.active = false; input.jx = input.jy = 0; joy.classList.remove('on'); } };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
addEventListener('keydown', (e) => {
  input.keys[e.code] = true;
  if ((e.code === 'Escape' || e.code === 'KeyP') && (game.state === 'play' || game.state === 'pause')) togglePause();
  if (game.state === 'play') audio();
});
addEventListener('keyup', (e) => { input.keys[e.code] = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') togglePause(true); });

// ---------- цикл ----------
const camPos = new THREE.Vector3(0, 60, 50), camLook = new THREE.Vector3();
let last = performance.now(), menuAng = 0;

// ---------- край дыры: предмет не может уйти под землю за окружностью ----------
const _cw = Array.from({ length: 8 }, () => new THREE.Vector3());
const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
const viol = { v: 0, dx: 0, dz: 0, lift: 0, top: 0 };
const angDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

// v — на сколько самая дальняя подземная точка вылезла за край, lift — на сколько поднять, чтобы углы вышли из земли
function checkRim(o, hx, hz, Rr) {
  objQuat(o, _q);
  for (let i = 0; i < 8; i++) {
    _cw[i].set(i & 1 ? o.hw : -o.hw, i & 2 ? o.h : 0, i & 4 ? o.hd : -o.hd).applyQuaternion(_q);
    _cw[i].x += o.x; _cw[i].y += o.y; _cw[i].z += o.z;
  }
  let v = 0, dx = 0, dz = 0, lift = 0, top = -1e9;
  const test = (x, z) => {
    const ex = x - hx, ez = z - hz, r = Math.hypot(ex, ez) || 1e-6, e = r - Rr;
    if (e > v) { v = e; dx = ex / r; dz = ez / r; }
    return e > 0;
  };
  for (const c of _cw) {
    if (c.y > top) top = c.y;
    if (c.y < 0 && test(c.x, c.z) && -c.y > lift) lift = -c.y;
  }
  for (const [a, b] of EDGES) {
    const A = _cw[a], B = _cw[b];
    if ((A.y < 0) !== (B.y < 0)) { const t = A.y / (A.y - B.y); test(A.x + (B.x - A.x) * t, A.z + (B.z - A.z) * t); }
  }
  viol.v = v; viol.dx = dx; viol.dz = dz; viol.lift = lift; viol.top = top;
  return viol;
}

function startFall(o, hx, hz) {
  let ux = hx - o.x, uz = hz - o.z; const L = Math.hypot(ux, uz);
  if (L < 0.05) { ux = Math.sin(o.rot); uz = Math.cos(o.rot); } else { ux /= L; uz /= L; }
  o.state = 1; o.vy = 0; o.w0 = 0; o.fallT = 0; o.move = null;
  // наклон верхушкой к центру дыры
  o.ax = uz; o.az = -ux;
  // длинное разворачиваем вдоль направления к центру, чтобы оно ушло носом вниз
  if (!o.upright) {
    const base = o.hw > o.hd ? Math.atan2(-uz, ux) : Math.atan2(ux, uz);
    o.yawT = Math.abs(angDiff(base, o.rot)) < Math.PI / 2 ? base : base + Math.PI;
  } else o.yawT = o.rot;
  if (o.beacon) o.beacon.visible = false;
}

function fallStep(o, dt, hx, hz, R) {
  o.fallT += dt;
  // если застрял на краю дольше 4 с — край понемногу «уступает»
  const Rr = R * 1.08 + Math.max(0, o.fallT - 4) * 2;
  // высокое падает почти стоя, длинное переворачивается носом вниз
  const tmax = o.upright ? clamp((Rr - o.need) / (o.h * 0.5), 0, 0.07) : Math.PI / 2;
  o.w0 = Math.min(o.w0 + dt * (o.upright ? 0.6 : 6), o.upright ? 0.3 : 3.2);
  o.tilt = Math.min(tmax, o.tilt + o.w0 * dt);
  o.rot += angDiff(o.yawT, o.rot) * (1 - Math.exp(-dt * 7));
  // центр масс тянется к центру дыры
  objQuat(o, _q); _vv.set(0, o.upright ? 0 : o.h / 2, 0).applyQuaternion(_q);
  const k = 1 - Math.exp(-dt * 4);
  o.x += (hx - o.x - _vv.x) * k; o.z += (hz - o.z - _vv.z) * k;
  o.vy -= (30 + o.h) * dt; o.y += o.vy * dt;
  for (let it = 0; it < 10; it++) {
    const c = checkRim(o, hx, hz, Rr);
    if (c.v <= 0.002) break;
    if (it < 3) { o.x -= c.dx * c.v; o.z -= c.dz * c.v; }
    else { o.y += Math.max(c.lift, c.v * 0.5, 0.04); if (o.vy < 0) o.vy = 0; }
  }
  const top = checkRim(o, hx, hz, Rr).top;
  objQuat(o, _q); _vv.set(0, o.h / 2, 0).applyQuaternion(_q);
  o.cx = o.x + _vv.x; o.cz = o.z + _vv.z;
  const cy = o.y + _vv.y;
  setDark(o, clamp(1 + cy / (1.5 + R * 0.9), 0, 1));
  return top;
}

function step(dt) {
  const o_ = world.objects;
  const playing = game.state === 'play';
  game.t += dt;

  // движение дыры
  if (playing) {
    let mx = input.jx, mz = input.jy;
    const k = input.keys;
    if (k.KeyW || k.ArrowUp) mz -= 1; if (k.KeyS || k.ArrowDown) mz += 1; if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
    const L = Math.hypot(mx, mz); if (L > 1) { mx /= L; mz /= L; }
    const sp = 8.5 + game.R * 1.1;
    // край дыры упирается в ограждение карты
    const lim = world.half - Math.min(game.R, world.half * 0.5) - 0.2;
    game.x = clamp(game.x + mx * sp * dt, -lim, lim);
    game.z = clamp(game.z + mz * sp * dt, -lim, lim);
    game.time -= dt;
  }
  game.R = lerp(game.R, game.Rt, 1 - Math.exp(-dt * 6));
  game.pulse = Math.max(0, game.pulse - dt * 3);
  const R = game.R, hx = game.x, hz = game.z;

  for (let i = 0; i < o_.length; i++) {
    const o = o_[i];
    if (o.dead) continue;
    let moved = false;
    if (o.state === 0) {
      const mv = o.move;
      if (mv) {
        if (mv.kind === 'drive') {
          // у ограждения машина разворачивается на встречную полосу по полукругу
          const end = world.half - 3 - o.d / 2 - Math.abs(mv.off) * 0.9;
          if (mv.turn !== undefined) {
            mv.turn = Math.min(Math.PI, mv.turn + dt * Math.abs(mv.sp) / Math.abs(mv.off));
            const s = Math.sign(mv.sp), c = Math.cos(mv.turn), sn = Math.sin(mv.turn);
            const lat = mv.rc + mv.off * c, lon = mv.end + s * Math.abs(mv.off) * sn * 0.9;
            const nx = mv.vert ? lat : lon, nz = mv.vert ? lon : lat;
            if (nx !== o.x || nz !== o.z) o.rot = Math.atan2(nx - o.x, nz - o.z);
            o.x = nx; o.z = nz;
            if (mv.turn >= Math.PI) { mv.turn = undefined; mv.off = -mv.off; mv.sp = -mv.sp; o.rot = mv.vert ? (mv.sp > 0 ? 0 : Math.PI) : (mv.sp > 0 ? Math.PI / 2 : -Math.PI / 2); }
          } else {
            const p = (mv.vert ? o.z : o.x) + mv.sp * dt;
            if (mv.vert) o.z = p; else o.x = p;
            if ((mv.sp > 0 && p > end) || (mv.sp < 0 && p < -end)) { mv.turn = 0; mv.end = mv.sp > 0 ? end : -end; }
          }
          moved = true;
        } else if (mv.kind === 'side') {
          const p = mv.horiz ? o.x : o.z; let np = p + mv.sp * dt;
          if (np < mv.a1 || np > mv.a2) { mv.sp = -mv.sp; np = clamp(np, mv.a1, mv.a2); }
          if (mv.horiz) { o.x = np; o.rot = mv.sp > 0 ? Math.PI / 2 : -Math.PI / 2; } else { o.z = np; o.rot = mv.sp > 0 ? 0 : Math.PI; }
          moved = true;
        } else {
          mv.t -= dt; if (mv.t < 0) { mv.a += (Math.random() - 0.5) * 2.4; mv.t = 1.5 + Math.random() * 3; }
          let nx = o.x + Math.sin(mv.a) * mv.sp * dt, nz = o.z + Math.cos(mv.a) * mv.sp * dt;
          if (nx < mv.bx1 || nx > mv.bx2 || nz < mv.bz1 || nz > mv.bz2) { mv.a += Math.PI; nx = clamp(nx, mv.bx1, mv.bx2); nz = clamp(nz, mv.bz1, mv.bz2); }
          o.x = nx; o.z = nz; o.rot = mv.a; moved = true;
        }
        // люди разбегаются от дыры
        if (mv.kind !== 'drive' && playing) {
          const dx = o.x - hx, dz = o.z - hz, d2 = dx * dx + dz * dz, fr = R + 3;
          if (d2 < fr * fr && d2 > 0.01) { const d = Math.sqrt(d2); o.x += dx / d * dt * 1.2; o.z += dz / d * dt * 1.2; }
        }
      }
      if (playing) {
        const dx = o.x - hx, dz = o.z - hz;
        const reach = R + o.ext;
        let near = false;
        if (dx > -reach && dx < reach && dz > -reach && dz < reach) {
          const d = Math.sqrt(dx * dx + dz * dz);
          const fits = o.need * 0.93 <= R;
          if (fits && d < R - o.need * 0.3) {
            startFall(o, hx, hz); near = true;
          } else if (fits && d < R + o.ext * 0.3) {
            // висит над краем: сползает к дыре и кренится, но в землю за краем не проваливается
            const pull = (2 + R * 0.6) * dt; o.x -= dx / (d || 1) * pull; o.z -= dz / (d || 1) * pull;
            o.tilt = Math.min(0.35, (R + o.ext * 0.3 - d) * 0.25); o.ax = -dz; o.az = dx; o.y = 0;
            for (let it = 0; it < 3; it++) { const c = checkRim(o, hx, hz, R * 1.08); if (c.lift <= 0) break; o.y += c.lift; }
            moved = near = true;
          } else if (!fits && d < R * 0.95 + o.ext * 0.3) {
            o.wob += dt; o.tilt = Math.sin(o.wob * 22) * 0.035; o.ax = 1; o.az = 0.4; o.y = 0; moved = near = true;
          }
        }
        if (!near && (o.tilt || o.y)) { o.tilt = 0; o.y = 0; moved = true; if (o.dark < 1) setDark(o, 1); }
      }
      if (o.beacon) { o.beacon.position.set(o.x, o.h + 2.5 + Math.sin(game.t * 3) * 0.5, o.z); o.beacon.rotation.y = game.t * 2; }
    }
    if (o.state === 1) {
      const top = fallStep(o, dt, hx, hz, R);
      moved = true;
      // дыра уехала раньше, чем предмет провалился: он остаётся на земле
      const ex = o.cx - hx, ez = o.cz - hz;
      if (o.y > -0.3 && ex * ex + ez * ez > (R + 0.4) * (R + 0.4)) {
        o.state = 0; o.tilt = 0; o.y = 0; o.vy = 0; setDark(o, 1); if (o.beacon) o.beacon.visible = true;
      } else if ((top < -0.4 && o.dark < 0.08) || top < -(R * 2 + 6) || o.y < -60) swallow(o);
    }
    if (moved) writeMatrix(o);
  }

  // стрелка к обязательному
  let best = null, bd = 1e9;
  for (const r of world.reqs) if (!r.done && r.o.state === 0) { const d = Math.hypot(r.o.x - hx, r.o.z - hz); if (d < bd) { bd = d; best = r.o; } }
  if (best && playing && bd > R + 6) {
    const a = Math.atan2(best.x - hx, best.z - hz);
    arrow.visible = true; const rr = R * 1.075 + 1.4 + Math.sin(game.t * 5) * 0.25;
    arrow.position.set(hx + Math.sin(a) * rr, 0.08, hz + Math.cos(a) * rr); arrow.rotation.y = a + Math.PI; arrow.scale.setScalar(1 + R * 0.12);
  } else arrow.visible = false;

  // дыра
  hole.position.set(hx, 0, hz);
  const pr = R * (1 + game.pulse * 0.06);
  holeStencil.scale.set(pr, 1, pr); inner.scale.set(pr, 1, pr); holeRim.scale.set(pr, 1, pr);

  // камера
  const dist = 20 + R * 5.2;
  const tx = hx, tz = hz;
  if (game.state === 'menu' || game.state === 'levels') {
    menuAng += dt * 0.08;
    camPos.set(Math.sin(menuAng) * 70, 55, Math.cos(menuAng) * 70);
    camLook.set(0, 0, 0);
  } else {
    const k = 1 - Math.exp(-dt * 5);
    camPos.x = lerp(camPos.x, tx, k); camPos.y = lerp(camPos.y, dist * 0.92, k); camPos.z = lerp(camPos.z, tz + dist * 0.62, k);
    camLook.set(camPos.x, 0, camPos.z - dist * 0.62);
  }
  camera.position.copy(camPos); camera.lookAt(camLook);
  scene.fog.near = Math.max(60, dist * 1.5); scene.fog.far = scene.fog.near + 180 + dist * 2;

  if (playing) {
    updateHud();
    if (game.time <= 0) finish(false);
  }
}

function swallow(o) {
  o.dead = true; o.state = 2; writeMatrix(o);
  if (o.mesh) { o.mesh.visible = false; }
  if (game.state !== 'play') return;
  game.eaten++;
  game.R2 += o.gain; game.Rt = Math.min(RMAX, Math.sqrt(game.R2));
  blip(o.fit);
  if (o.fit > 1.5) game.pulse = 1;
  if (o.req) {
    const r = world.reqs.find((q) => q.o === o); if (r) { r.done = true; r.el.classList.add('done'); tone(660, 0.15, 'sine', 0.18); tone(990, 0.2, 'sine', 0.18, 0.1); }
  }
  if (game.eaten >= world.cfg.target && world.reqs.every((r) => r.done)) finish(true);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (world && game.state !== 'pause' && game.state !== 'end') step(dt);
  else if (world && game.state === 'end') { step(dt * 0.3); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------- прогресс ----------
let progress = { unlocked: 1, stars: {} };
try { const s = JSON.parse(localStorage.getItem('hole.progress')); if (s && s.unlocked) progress = s; } catch {}
const save = () => { try { localStorage.setItem('hole.progress', JSON.stringify(progress)); } catch {} };

// ---------- экраны ----------
const screens = ['menu', 'levels', 'intro', 'hudwrap', 'pause', 'end'];
function show(...ids) { for (const s of screens) $(s).classList.toggle('hidden', !ids.includes(s)); }
let current = 1;

function loadLevel(n) {
  current = n; const cfg = levelConfig(n); buildWorld(cfg); resetPlayer(); buildReqChips(); lastHud = {};
}
function openIntro(n) {
  loadLevel(n); game.state = 'intro';
  const cfg = world.cfg;
  $('intro-level').textContent = 'Уровень ' + n;
  const tag = $('intro-tag'); tag.className = 'tag' + (cfg.superHard ? ' super' : cfg.hard ? ' hard' : '');
  tag.textContent = cfg.superHard ? 'Очень сложный' : cfg.hard ? 'Сложный' : cfg.theme.name;
  $('intro-target').textContent = cfg.target;
  $('intro-time').textContent = fmtTime(cfg.time);
  { const [c2, c3] = starCut(cfg); $('intro-stars').innerHTML = `<b>★★★</b> если на таймере останется ${fmtTime(c3)}<br><b>★★</b> если ${fmtTime(c2)}, <b>★</b> за любую победу`; }
  $('intro-req').innerHTML = world.reqs.map((r) => `<span class="chip">${r.name}</span>`).join('');
  $('intro-hint').classList.toggle('hidden', n > 2);
  hud.level.textContent = 'Ур. ' + n;
  show('intro');
  game.x = world.startX; game.z = world.startZ;
}
function startPlay() { audio(); game.state = 'play'; show('hudwrap'); }
function togglePause(force) {
  if (game.state === 'play' || force === true) { if (game.state !== 'play') return; game.state = 'pause'; show('hudwrap', 'pause'); input.active = false; input.jx = input.jy = 0; ptr = null; joy.classList.remove('on'); }
  else if (game.state === 'pause') { game.state = 'play'; show('hudwrap'); last = performance.now(); }
}
function finish(win) {
  game.state = 'end';
  const cfg = world.cfg;
  const endEl = $('end');
  endEl.classList.toggle('win', win);
  $('end-title').textContent = win ? 'Уровень пройден' : 'Время вышло';
  const left = Math.ceil(game.time), [c2, c3] = starCut(cfg);
  const stars = win ? starsFor(cfg, left) : 0;
  [...document.querySelectorAll('#end-stars .star')].forEach((s, i) => s.classList.toggle('on', i < stars));
  $('end-stars').classList.toggle('hidden', !win);
  let msg;
  if (win) {
    msg = `Проглочено ${game.eaten}. На таймере осталось ${fmtTime(left)}.`;
    if (stars === 2) msg += ` Третья звезда, если останется ${fmtTime(c3)}.`;
    if (stars === 1) msg += ` Вторая звезда, если останется ${fmtTime(c2)}, третья — ${fmtTime(c3)}.`;
  }
  else {
    const missN = cfg.target - game.eaten; const missR = world.reqs.filter((r) => !r.done).map((r) => r.name);
    const parts = []; if (missN > 0) parts.push(`не хватило ${missN} ${plural(missN, 'предмета', 'предметов', 'предметов')}`);
    if (missR.length) parts.push('не проглочено: ' + missR.join(', '));
    msg = parts.join('; ') + '.'; msg = msg[0].toUpperCase() + msg.slice(1);
  }
  $('end-msg').textContent = msg;
  $('end-next').classList.toggle('hidden', !win || current >= 100);
  $('end-retry').classList.toggle('primary', !win);
  if (win) {
    progress.stars[current] = Math.max(progress.stars[current] || 0, stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(100, current + 1)); save();
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.14, i * 0.1));
  } else { tone(300, 0.4, 'sawtooth', 0.08); tone(200, 0.5, 'sawtooth', 0.08, 0.2); }
  show('hudwrap', 'end');
}
function plural(n, one, few, many) { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return one; if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few; return many; }

function renderLevels() {
  const grid = $('level-grid'); grid.innerHTML = '';
  for (let n = 1; n <= 100; n++) {
    const b = document.createElement('button');
    const locked = n > progress.unlocked;
    b.className = 'lvl' + (n % 10 === 0 ? ' super' : n % 5 === 0 ? ' hard' : '') + (locked ? ' locked' : '') + (n === progress.unlocked ? ' current' : '');
    b.disabled = locked;
    const st = progress.stars[n] || 0;
    b.innerHTML = `<span class="num">${n}</span><span class="st">${[0, 1, 2].map((i) => `<svg viewBox="0 0 24 24" class="${i < st ? 'on' : ''}"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>`).join('')}</span>`;
    b.setAttribute('aria-label', 'Уровень ' + n + (locked ? ', закрыт' : ''));
    b.onclick = () => openIntro(n);
    grid.appendChild(b);
  }
  $('levels-progress').textContent = `Открыто ${progress.unlocked} из 100`;
}

function toMenu() {
  game.state = 'menu'; show('menu');
  $('menu-play').textContent = progress.unlocked > 1 ? `Играть: уровень ${progress.unlocked}` : 'Играть';
  if (!world) loadLevel(progress.unlocked);
}

$('menu-play').onclick = () => openIntro(progress.unlocked);
$('menu-levels').onclick = () => { game.state = 'levels'; renderLevels(); show('levels'); requestAnimationFrame(() => document.querySelector('.lvl.current')?.scrollIntoView({ block: 'center' })); };
$('levels-back').onclick = toMenu;
$('intro-play').onclick = startPlay;
$('intro-back').onclick = () => { $('menu-levels').onclick(); };
$('hud-pause').onclick = () => togglePause();
$('pause-resume').onclick = () => togglePause();
$('pause-restart').onclick = () => openIntro(current);
$('pause-levels').onclick = () => $('menu-levels').onclick();
$('end-next').onclick = () => openIntro(current + 1);
$('end-retry').onclick = () => openIntro(current);
$('end-levels').onclick = () => $('menu-levels').onclick();
function syncMute() { document.querySelectorAll('.mute').forEach((b) => b.classList.toggle('off', muted)); }
document.querySelectorAll('.mute').forEach((b) => (b.onclick = () => { muted = !muted; try { localStorage.setItem('hole.muted', muted ? '1' : '0'); } catch {} syncMute(); }));
syncMute();

toMenu();
requestAnimationFrame(frame);
window.__game = { game, input, renderer, scene, camera, sim(secs, cb) { for (let t = 0; t < secs && game.state === "play"; t += 1 / 30) { cb && cb(); step(1 / 30); } }, get world() { return world; }, checkRim, openIntro, startPlay, levelConfig };

// ---------- Android-приложение ----------
const Cap = window.Capacitor;
if (Cap?.isNativePlatform?.()) {
  try { Cap.Plugins.StatusBar?.hide(); } catch {}
  try {
    Cap.Plugins.App?.addListener('backButton', () => {
      if (game.state === 'play') togglePause();
      else if (game.state === 'pause') togglePause();
      else if (game.state === 'intro' || game.state === 'end') $('menu-levels').onclick();
      else if (game.state === 'levels') toMenu();
      else Cap.Plugins.App.exitApp();
    });
  } catch {}
}
