// Scroll-it SVT · inscriptions + suivi des élèves → ce Google Sheet.
// 1. Crée un Google Sheet vide, puis Extensions > Apps Script.
// 2. Colle tout ce fichier, enregistre, puis Déployer > Nouveau déploiement > Application Web
//    (Exécuter en tant que : moi · Qui a accès : tout le monde). Copie l'URL obtenue.
// Pour couper l'accès d'un élève : onglet « Inscrits », écris  non  dans la colonne « Accès » de sa ligne.

const TABS = {
  users: ['Inscrits', ['ID', 'Élève', 'Classe', 'Groupe', 'Inscrit le', 'Vu pour la dernière fois', 'Accès', 'Appareil']],
  act: ['Activité', ['Date', 'ID', 'Élève', 'Classe', 'Film', 'Vidéo', 'Titre', 'Événement', 'Secondes']],
};

function sheet_(k) {
  const ss = SpreadsheetApp.getActive();
  const [name, head] = TABS[k];
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, head.length).setFontWeight('bold'); }
  return sh;
}

function setup() {
  sheet_('users'); sheet_('act');
  const ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName('Suivi')) {
    const r = ss.insertSheet('Suivi', 0);
    r.getRange('A1').setValue('Suivi par élève').setFontWeight('bold');
    r.getRange('A2:G2').setValues([['Classe', 'Groupe', 'Élève', 'ID', 'Vidéos terminées', 'Minutes regardées', 'Dernière activité']]).setFontWeight('bold');
    r.getRange('A3').setFormula('=IFERROR(SORT(FILTER({Inscrits!C2:C, Inscrits!D2:D, Inscrits!B2:B, Inscrits!A2:A}, Inscrits!A2:A<>""), 1, TRUE, 3, TRUE), "")');
    r.getRange('E3').setFormula('=MAP(D3:D, LAMBDA(id, IF(id="", "", COUNTIFS(Activité!B2:B, id, Activité!H2:H, "terminée"))))');
    r.getRange('F3').setFormula('=MAP(D3:D, LAMBDA(id, IF(id="", "", ROUND(SUMIFS(Activité!I2:I, Activité!B2:B, id, Activité!H2:H, "watch")/60, 1))))');
    r.getRange('G3').setFormula('=MAP(D3:D, LAMBDA(id, IF(id="", "", IFERROR(MAXIFS(Activité!A2:A, Activité!B2:B, id), ""))))');
    r.getRange('G3:G').setNumberFormat('dd/mm/yyyy hh:mm'); r.hideColumns(4); r.setFrozenRows(2);
    const s = ss.insertSheet('Résumé', 1);
    s.getRange('A1:B5').setValues([
      ['Élèves inscrits', '=COUNTA(Inscrits!A2:A)'],
      ["Actifs aujourd'hui", '=IFERROR(COUNTUNIQUE(FILTER(Activité!B2:B, INT(Activité!A2:A)=TODAY())), 0)'],
      ['Actifs (7 jours)', '=IFERROR(COUNTUNIQUE(FILTER(Activité!B2:B, Activité!A2:A>=TODAY()-6)), 0)'],
      ['Minutes regardées (7 jours)', '=ROUND(SUMIFS(Activité!I2:I, Activité!A2:A, ">="&(TODAY()-6))/60)'],
      ['', ''],
    ]);
    s.getRange('A7').setValue('Vidéos les plus regardées').setFontWeight('bold');
    s.getRange('A8').setFormula("=IFERROR(QUERY(Activité!D2:I, \"select D, G, count(F), sum(I) where H = 'watch' group by D, G order by count(F) desc limit 30 label D 'Classe', G 'Vidéo', count(F) 'Vues', sum(I) 'Secondes'\", 0), \"\")");
    s.getRange('A1:A5').setFontWeight('bold');
    const s1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Feuille 1'); if (s1 && s1.getLastRow() === 0) ss.deleteSheet(s1);
  }
}

function findUser_(id) {
  const sh = sheet_('users'); const n = sh.getLastRow();
  if (n < 2) return null;
  const ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) return { sh, row: i + 2 };
  return null;
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  const id = (e.parameter.u || '').slice(0, 60);
  const u = id && findUser_(id);
  if (!u) return json_({ ok: true, known: false });
  const acc = String(u.sh.getRange(u.row, 7).getValue()).trim().toLowerCase();
  return json_({ ok: acc !== 'non', known: true });
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    setup();
    const d = JSON.parse(e.postData.contents || '{}');
    const id = String(d.u || '').slice(0, 60), name = String(d.name || '').slice(0, 80);
    const lvl = String(d.lvl || '').slice(0, 20), grp = String(d.grp || '').slice(0, 20);
    if (!id) return json_({ ok: false });
    const now = new Date();
    let u = findUser_(id);
    if (!u) { sheet_('users').appendRow([id, name, lvl, grp, now, now, 'oui', String(d.ua || '').slice(0, 30)]); u = findUser_(id); }
    else { u.sh.getRange(u.row, 3).setValue(lvl); u.sh.getRange(u.row, 6).setValue(now); }
    const ev = (d.ev || []).slice(0, 200).map(x => [new Date(x.t || now), id, name, lvl, String(x.f || ''), x.c || '', String(x.ti || '').slice(0, 80), String(x.e || ''), Math.round(+x.s || 0)]);
    if (ev.length) { const sh = sheet_('act'); sh.getRange(sh.getLastRow() + 1, 1, ev.length, 9).setValues(ev); }
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}
