// Drawing primitives for Scroll-it SVT frames (viewBox 0 0 500 520)
const C = {ink:'#EEF3F1', mut:'#8FA0A4', line:'#2B3439', bg:'#0F1417', panel:'#182024',
  A:'#FF8A5C', T:'#FFD166', C:'#6FD39A', G:'#B48CF2', U:'#FF6FA8', mom:'#F07AA0', dad:'#5CC8E8', bad:'#F0705F', ok:'#6FD39A'};
const S = (inner) => `<svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 20}" font-weight="${o.w || 600}" fill="${o.c || C.ink}" ${o.extra || ''}>${s}</text>`;
const arrow = (x1, y1, x2, y2, c = C.mut, w = 4) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 14;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * 6}" y2="${y2 - Math.sin(a) * 6}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x2} ${y2} L${x2 - h * Math.cos(a - .45)} ${y2 - h * Math.sin(a - .45)} L${x2 - h * Math.cos(a + .45)} ${y2 - h * Math.sin(a + .45)}Z" fill="${c}"/>`; };
const pointer = (x1, y1, x2, y2, label, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.mut}" stroke-width="2"/><circle cx="${x2}" cy="${y2}" r="4" fill="${C.mut}"/>` + T(x1 + (o.dx || 0), y1 + (o.dy || -8), label, { a: o.a || 'middle', fs: o.fs || 19, c: o.c });
const cellBody = (cx, cy, rx, ry, acc, o = {}) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${acc}" fill-opacity="${o.fo || .14}" stroke="${acc}" stroke-width="${o.sw || 4}"/>`;
const nucleus = (cx, cy, r, o = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#24303A" stroke="${o.c || C.ink}" stroke-width="${o.sw || 3}" ${o.dash ? 'stroke-dasharray="6 6"' : ''}/>`;
const squiggle = (cx, cy, w, c = C.ink, sw = 3) => { let d = ''; for (let i = 0; i <= 40; i++) { const x = cx - w / 2 + w * i / 40, y = cy + Math.sin(i * 1.1) * w * .12 + Math.cos(i * .55) * w * .08; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`; };
function base(x, y, b, r = 17) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C[b]}"/>` + T(x, y + 7, b, { fs: r * 1.1, w: 800, c: '#0F1417' }); }
function ladder(top, bot, o = {}) { // horizontal ladder: two strands with base pairs
  const x0 = o.x0 || 40, x1 = o.x1 || 460, y1 = o.y1 || 170, y2 = o.y2 || 330, n = top.length, w = (x1 - x0) / n; let s = '';
  s += `<rect x="${x0 - 10}" y="${y1 - 34}" width="${x1 - x0 + 20}" height="14" rx="7" fill="${C.ink}" opacity=".85"/><rect x="${x0 - 10}" y="${y2 + 20}" width="${x1 - x0 + 20}" height="14" rx="7" fill="${C.ink}" opacity=".85"/>`;
  for (let i = 0; i < n; i++) { const x = x0 + w * i + w / 2, dim = o.hl && !o.hl.includes(i) ? .25 : 1;
    s += `<g opacity="${dim}"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.mut}" stroke-width="3" stroke-dasharray="${bot[i] === '?' ? '5 6' : '0'}"/>${base(x, y1, top[i], o.r)}${bot[i] === '?' ? `<circle cx="${x}" cy="${y2}" r="${o.r || 17}" fill="none" stroke="${C.mut}" stroke-width="3" stroke-dasharray="5 5"/>` + T(x, y2 + 7, '?', { fs: 20, c: C.mut }) : base(x, y2, bot[i], o.r)}</g>`; }
  return s;
}
function helix(cx = 250, cy = 240, len = 420, amp = 70, rungs = 'ATGCGTACCGTA') {
  let p1 = '', p2 = '', r = ''; const x0 = cx - len / 2;
  for (let i = 0; i <= 120; i++) { const x = x0 + len * i / 120, ph = i / 120 * Math.PI * 4; p1 += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (cy + amp * Math.sin(ph)).toFixed(1); p2 += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (cy - amp * Math.sin(ph)).toFixed(1); }
  for (let i = 0; i < 24; i++) { const t = (i + .5) / 24, x = x0 + len * t, ph = t * Math.PI * 4, ya = cy + amp * Math.sin(ph), yb = cy - amp * Math.sin(ph); const b = rungs[i % rungs.length], pb = { A: 'T', T: 'A', C: 'G', G: 'C' }[b], ym = (ya + yb) / 2;
    r += `<line x1="${x}" y1="${ya}" x2="${x}" y2="${ym}" stroke="${C[b]}" stroke-width="7"/><line x1="${x}" y1="${ym}" x2="${x}" y2="${yb}" stroke="${C[pb]}" stroke-width="7"/>`; }
  return r + `<path d="${p1}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><path d="${p2}" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round" opacity=".75"/>`;
}
// chromosome: double (X, two chromatids) or single (I)
function chromo(x, y, col, o = {}) { const h = o.h || 60, w = o.w || 15, rot = o.rot || 0; const band = o.band ? `<rect x="${-w / 2}" y="${o.band[0]}" width="${w}" height="${o.band[1]}" fill="${o.band[2]}"/>` : '';
  const arm = (a, extra = '') => `<g transform="rotate(${a})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w / 2}" fill="${col}"/>${extra}</g>`;
  const body = o.single ? arm(0, o.band2 || '') : arm(14, o.bandL || '') + arm(-14, o.bandR || '');
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${body}${o.single ? '' : `<circle r="${w * .45}" fill="${C.bg}" opacity=".55"/>`}</g>`; }
function cell(cx, cy, r, acc, inner = '', o = {}) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${acc}" fill-opacity=".12" stroke="${acc}" stroke-width="${o.sw || 4}" ${o.dash ? 'stroke-dasharray="7 6"' : ''}/>${inner}`; }
function aaBead(x, y, i, r = 16) { const pal = ['#FF8A5C', '#FFD166', '#6FD39A', '#5CC8E8', '#B48CF2', '#FF6FA8', '#F2B35B']; return `<circle cx="${x}" cy="${y}" r="${r}" fill="${pal[i % pal.length]}" stroke="${C.bg}" stroke-width="2"/>`; }
function card(rows, acc, y0 = 40) { // recap card: label → facts
  let s = '', y = y0 + 36;
  rows.forEach(([k, v]) => { s += T(36, y, k, { a: 'start', fs: 23, w: 800, c: acc });
    const words = v.split(' '); let line = '', ls = []; words.forEach(w => { if ((line + ' ' + w).trim().length > 36) { ls.push(line.trim()); line = w; } else line += ' ' + w; }); ls.push(line.trim());
    ls.forEach((l, j) => s += T(36, y + 32 + j * 26, l, { a: 'start', fs: 20, w: 500 })); y += 32 + ls.length * 26 + 22; });
  return `<rect x="10" y="${y0 - 10}" width="480" height="${y - y0 + 4}" rx="22" fill="${C.panel}" stroke="${acc}" stroke-width="3"/>` + s; }
function mrna(x0, y, seq, o = {}) { let s = `<rect x="${x0 - 8}" y="${y - 6}" width="${seq.length * (o.step || 34) + 4}" height="12" rx="6" fill="${C.U}" opacity=".55"/>`;
  [...seq].forEach((b, i) => { const x = x0 + i * (o.step || 34) + 12; if (b === ' ') return; s += `<rect x="${x - 13}" y="${y - 34}" width="26" height="30" rx="6" fill="${C[b]}"/>` + T(x, y - 12, b, { fs: 19, w: 800, c: '#0F1417' }); }); return s; }
function ribosome(cx, cy, acc) { return `<ellipse cx="${cx}" cy="${cy - 76}" rx="74" ry="40" fill="${acc}"/><ellipse cx="${cx}" cy="${cy + 26}" rx="62" ry="18" fill="${acc}" opacity=".8"/>`; }
function book(x, y, w, h, label, col = C.ink) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${col}" fill-opacity=".14" stroke="${col}" stroke-width="3"/><line x1="${x + 14}" y1="${y}" x2="${x + 14}" y2="${y + h}" stroke="${col}" stroke-width="3"/>` + [0, 1, 2, 3].map(i => `<line x1="${x + 30}" y1="${y + 28 + i * 22}" x2="${x + w - 16}" y2="${y + 28 + i * 22}" stroke="${col}" stroke-opacity=".5" stroke-width="3"/>`).join('') + (label ? T(x + w / 2, y + h + 30, label, { fs: 19 }) : ''); }
function person(x, y, s = 1, col = C.ink) { return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-70" r="24" fill="${col}"/><rect x="-28" y="-40" width="56" height="78" rx="22" fill="${col}"/><rect x="-24" y="34" width="18" height="60" rx="9" fill="${col}"/><rect x="6" y="34" width="18" height="60" rx="9" fill="${col}"/></g>`; }
// ---- extra primitives (lot 1+)
function bars(x0, y0, w, h, data, o = {}) { // data: [[label, value, color]] ; value 0..max
  const max = o.max || Math.max(...data.map(d => d[1])), bw = w / data.length; let s = `<line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="${C.mut}" stroke-width="2"/>`;
  data.forEach(([l, v, c], i) => { const bh = h * v / max, x = x0 + i * bw + bw * .18; s += `<rect x="${x}" y="${y0 + h - bh}" width="${bw * .64}" height="${bh}" rx="6" fill="${c || C.ink}"/>` + T(x + bw * .32, y0 + h + 26, l, { fs: o.fs || 17, c: C.mut }) + (o.val ? T(x + bw * .32, y0 + h - bh - 10, o.val(v), { fs: 18 }) : ''); });
  return s; }
function lineChart(x0, y0, w, h, series, o = {}) { // series: [[points 0..1], color, label]
  let s = `<line x1="${x0}" y1="${y0 + h}" x2="${x0 + w}" y2="${y0 + h}" stroke="${C.mut}" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + h}" stroke="${C.mut}" stroke-width="2"/>`;
  const ly = []; series.forEach(([pts, c, l]) => { const d = pts.map((p, i) => (i ? 'L' : 'M') + (x0 + w * i / (pts.length - 1)).toFixed(1) + ' ' + (y0 + h - h * p).toFixed(1)).join(''); s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`; if (l) { let yy = y0 + h - h * pts[pts.length - 1] + 6; ly.forEach(q => { if (Math.abs(q - yy) < 26) yy = q + (yy >= q ? 26 : -26); }); ly.push(yy); s += T(x0 + w + 6, yy, l, { a: 'start', fs: 17, c }); } });
  if (o.x) s += T(x0 + w / 2, y0 + h + 30, o.x, { fs: 17, c: C.mut }); if (o.y) s += T(x0 - 8, y0 - 12, o.y, { a: 'start', fs: 17, c: C.mut });
  return s; }
function box(x, y, w, h, label, col, o = {}) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 14}" fill="${col}" fill-opacity="${o.fo ?? .2}" stroke="${col}" stroke-width="3"/>` + (label ? T(x + w / 2, y + h / 2 + 7, label, { fs: o.fs || 20, w: o.w || 700, c: o.c || C.ink }) : ''); }
function bacterium(x, y, s = 1, col = C.C, o = {}) { return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${o.rot || 0})"><rect x="-60" y="-28" width="120" height="56" rx="28" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-width="4"/>${o.plasmid ? `<circle cx="28" cy="0" r="11" fill="none" stroke="${o.plasmid}" stroke-width="4"/>` : ''}${o.dna !== false ? `<path d="M-40 0 C -30 -14, -10 14, 0 0 S 10 -14, 14 0" fill="none" stroke="${C.ink}" stroke-width="3"/>` : ''}</g>`; }
function mito(x, y, s = 1, col = C.A) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="60" ry="30" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-width="4"/><path d="M-44 0 L-34 -18 L-24 14 L-12 -18 L0 14 L12 -18 L24 14 L34 -18 L44 0" fill="none" stroke="${col}" stroke-width="3"/></g>`; }
function chloro(x, y, s = 1, col = C.ok) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="60" ry="30" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-width="4"/>${[-30, -10, 10, 30].map(dx => `<rect x="${dx - 7}" y="-14" width="14" height="28" rx="4" fill="${col}"/>`).join('')}</g>`; }
function treeDiag(leaves, nodes, o = {}) { // leaves: [[x,label]], nodes: [[x,y,childXs]] drawn as lines from (x,y) to child tops
  const yL = o.yL || 380; let s = '';
  nodes.forEach(([x, y, kids]) => kids.forEach(k => { const ky = k[1] ?? yL; s += `<path d="M${x} ${y} L${k[0]} ${ky}" stroke="${o.c || C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`; }));
  nodes.forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="7" fill="${o.nc || C.ink}"/>`; });
  leaves.forEach(([x, l]) => s += T(x, yL + 32, l, { fs: o.fs || 19 }));
  return s; }
function snail(x, y, col, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 30 H50 Q60 30 58 20 L40 18" fill="${C.mut}" stroke="${C.mut}" stroke-width="4"/><circle cx="-6" cy="-6" r="36" fill="${col}"/><path d="M-6 -6 m-24 0 a24 24 0 1 1 24 24 a14 14 0 1 1 -10 -16" fill="none" stroke="#0F1417" stroke-width="4" opacity=".5"/><path d="M44 18 L52 -6 M50 18 L62 -2" stroke="${C.mut}" stroke-width="4"/></g>`; }
function moth(x, y, col, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C -30 -30, -50 -10, -40 10 C -30 25, -10 15, 0 5 C 10 15, 30 25, 40 10 C 50 -10, 30 -30, 0 0Z" fill="${col}"/><rect x="-3" y="-12" width="6" height="26" rx="3" fill="${C.bg}"/></g>`; }
function cycleWheel(cx, cy, r, segs) { // segs: [[label, frac, color]]
  let a = -Math.PI / 2, s = ''; segs.forEach(([l, f, c]) => { const a2 = a + f * 2 * Math.PI, la = (a + a2) / 2, big = f > .5 ? 1 : 0;
    s += `<path d="M${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}" fill="none" stroke="${c}" stroke-width="34"/>` + T(cx + (r + 52) * Math.cos(la), cy + (r + 52) * Math.sin(la) + 7, l, { fs: 19 }); a = a2; });
  return s; }
// ---- lot 2 primitives
function neuron(x, y, s = 1, col = C.T, o = {}) { const L = o.len || 220; return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="4"/><circle r="10" fill="${col}"/>${[0, 1.3, 2.4, 3.6, 4.8].map(a => `<path d="M${30 * Math.cos(a)} ${30 * Math.sin(a)} l${22 * Math.cos(a)} ${22 * Math.sin(a)} l${10 * Math.cos(a + .6)} ${10 * Math.sin(a + .6)}" stroke="${col}" stroke-width="4" fill="none"/>`).join('')}<line x1="30" y1="0" x2="${L}" y2="0" stroke="${col}" stroke-width="6"/>${[0, -14, 14].map(d => `<path d="M${L} 0 l18 ${d}" stroke="${col}" stroke-width="4"/><circle cx="${L + 20}" cy="${d * 1.1}" r="6" fill="${col}"/>`).join('')}</g>`; }
function antibody(x, y, s = 1, col = C.T, rot = 0) { return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><path d="M0 40 V0 M0 0 L-24 -30 M0 0 L24 -30" stroke="${col}" stroke-width="9" stroke-linecap="round" fill="none"/></g>`; }
function virus(x, y, s = 1, col = C.G) { return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="26" fill="${col}" opacity=".85"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return `<line x1="${26 * Math.cos(a)}" y1="${26 * Math.sin(a)}" x2="${40 * Math.cos(a)}" y2="${40 * Math.sin(a)}" stroke="${col}" stroke-width="4"/><circle cx="${42 * Math.cos(a)}" cy="${42 * Math.sin(a)}" r="5" fill="${col}"/>`; }).join('')}</g>`; }
function wbc(x, y, r, col, label) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" fill-opacity=".25" stroke="${col}" stroke-width="4"/><circle cx="${x - r * .15}" cy="${y}" r="${r * .45}" fill="${col}" fill-opacity=".6"/>` + (label ? T(x, y + r + 26, label, { fs: 18 }) : ''); }
function pill(x, y, w, label, col) { return `<rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="22" fill="${col}"/>` + T(x, y + 7, label, { fs: 19, w: 800, c: '#0F1417' }); }
function head(x, y, s = 1, col = C.mut) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 60 C -90 -10, -60 -90, 10 -90 C 70 -90, 95 -40, 85 0 L 100 30 L 85 35 L 85 60 C 85 75, 60 80, 40 75 L 40 110 L -40 110 L -45 75 C -60 70, -70 65, -70 60Z" fill="${col}" fill-opacity=".25" stroke="${col}" stroke-width="4"/></g>`; }
// ---- lot 3 primitives
function leaf(x, y, s = 1, col = C.ok, rot = 0) { return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><path d="M0 0 C 40 -60, 120 -60, 160 0 C 120 60, 40 60, 0 0Z" fill="${col}" fill-opacity=".45" stroke="${col}" stroke-width="4"/><line x1="0" y1="0" x2="150" y2="0" stroke="${col}" stroke-width="3"/></g>`; }
function plant(x, y, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})"><line x1="0" y1="0" x2="0" y2="-180" stroke="${C.ok}" stroke-width="8"/>${leaf(0, -80, .5, C.ok, -30)}${leaf(0, -130, .5, C.ok, 210)}${[0, 1, 2, 3, 4].map(i => `<path d="M0 0 q${-40 + i * 20} 30 ${-60 + i * 30} 80" stroke="${C.T}" stroke-width="4" fill="none"/>`).join('')}<circle cx="0" cy="-190" r="16" fill="${C.U}"/></g>`; }
function flower(x, y, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="0" cy="-40" rx="20" ry="38" fill="${C.U}" opacity=".75" transform="rotate(${i * 72})"/>`).join('')}<circle r="18" fill="${C.T}"/></g>`; }
function fish(x, y, s = 1, col = C.dad) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 0 C -20 -26, 30 -26, 40 0 C 30 26, -20 26, -40 0Z M-40 0 L-62 -18 L-62 18Z" fill="${col}"/><circle cx="24" cy="-5" r="4" fill="${C.bg}"/></g>`; }
function bird(x, y, s = 1, col = C.T) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="34" ry="22" fill="${col}"/><circle cx="30" cy="-18" r="14" fill="${col}"/><path d="M42 -18 L58 -14 L42 -10Z" fill="${C.A}"/><path d="M-30 -4 L-56 -16 L-50 6Z" fill="${col}"/><circle cx="34" cy="-21" r="3" fill="${C.bg}"/></g>`; }
