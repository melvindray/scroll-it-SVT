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
