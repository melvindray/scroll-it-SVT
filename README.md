# Scroll-it SVT

Fil de courtes vidéos de génétique pour le lycée (seconde, première, terminale). Application web installable (PWA) servie par GitHub Pages.

- `index.html`, `sw.js`, `config.json` : l'application. Chaque élève s'inscrit (prénom, nom, classe) et ne voit que les vidéos de sa classe.
- `seconde/`, `premiere/`, `terminale/` : `manifest.json` + `clips/<film>/cNN.mp4` (720×1280, voix incluse) et `cNN.jpg`.
- `tracker.gs` : script Google Apps Script du Google Sheet de suivi (inscriptions, vidéos regardées). Son URL est dans `config.json` (`track`).
- `tools/` : fabrication des vidéos. `films.js` (textes lus + schémas) et `draw.js` (dessins), `shots.js` (images via Playwright), `tts.py` (voix Kokoro, `ff_siwis`), `mux.py` (vidéos + manifestes).
