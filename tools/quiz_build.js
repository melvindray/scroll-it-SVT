const fs = require('fs'), R = '/home/user/scroll-it-svt/';
const F = require('/tmp/claude-0/all.js');
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (const lv of ['seconde', 'premiere', 'terminale']) {
  const Qz = require('./quiz_' + lv + '.js'), out = {};
  const ids = F.filter(f => f.level === lv).map(f => f.id);
  for (const id of ids) if (!Qz[id]) throw 'missing ' + id;
  for (const [id, qs] of Object.entries(Qz)) {
    if (!ids.includes(id)) throw 'unknown ' + id;
    if (qs.length !== 5) throw id + ' has ' + qs.length;
    out[id] = qs.map((q, i) => { if (q.c.length !== 4 || !(q.ok >= 0 && q.ok < 4) || !q.info || !q.lien) throw id + ' q' + i;
      const neg = /PAS/.test(q.q);
      const order = [0, 1, 2, 3]; for (let k = 3; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
      return { q: q.q, c: order.map(k => q.c[k]), ok: order.indexOf(q.ok), info: q.info, lien: q.lien }; });
  }
  fs.writeFileSync(R + lv + '/quiz.json', JSON.stringify(out));
  const pos = Object.values(out).flat().map(q => q.ok); console.log(lv, Object.keys(out).length, 'chapitres', pos.length, 'questions, positions', [0,1,2,3].map(k => pos.filter(x => x === k).length));
}
