import json, subprocess, os, glob
ORD = {'s01': 3, 'p01': 3, 't01': 1}
meta = json.load(open('build/meta.json'))
out = 'site'; man = {}
for f in meta:
    films = man.setdefault(f['level'], {'level': f['level'], 'films': []})['films']
    film = {'ord': f.get('ord') or ORD.get(f['id'], 50), 'id': f['id'], 'title': f['title'], 'poster': f"clips/{f['id']}/poster.jpg", 'clips': []}; films.append(film)
    os.makedirs(f"{out}/{f['level']}/clips/{f['id']}", exist_ok=True)
    for c in f['clips']:
        cid = f"{f['id']}_c{c['n']}"; tm = json.load(open(f'build/audio/{cid}.json'))
        lst = f'build/{cid}.txt'
        with open(lst, 'w') as L:
            for q in tm['cues']: L.write(f"file '{os.path.abspath(q['img'])}'\nduration {q['b']-q['a'] + (tm['cues'][0]['a'] if q is tm['cues'][0] else 0):.3f}\n")
            L.write(f"file '{os.path.abspath(tm['cues'][-1]['img'])}'\n")
        mp4 = f"{out}/{f['level']}/clips/{f['id']}/c{c['n']:02d}.mp4"
        if not (os.path.exists(mp4) and os.path.getmtime(mp4) > os.path.getmtime(f'build/audio/{cid}.wav')): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'build/audio/{cid}.wav',
            '-vf', 'scale=720:1280:flags=lanczos,fps=24,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '24',
            '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-shortest', '-movflags', '+faststart', mp4], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f"build/img/{cid}_q1.png", '-vf', 'scale=360:640', '-q:v', '5', f"{out}/{f['level']}/clips/{f['id']}/c{c['n']:02d}.jpg"], check=True)
        cues = [s for q in tm['cues'] for s in q['subs']]
        film['clips'].append({'n': c['n'], 'title': c['title'], 'dur': tm['dur'], 'v': f"clips/{f['id']}/c{c['n']:02d}.mp4", 'p': f"clips/{f['id']}/c{c['n']:02d}.jpg", 'cues': cues})
        print(mp4, os.path.getsize(mp4) // 1024, 'KB', flush=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f"build/img/{f['id']}_c1_q1.png", '-vf', 'scale=360:640', '-q:v', '5', f"{out}/{f['level']}/clips/{f['id']}/poster.jpg"], check=True)
for lv, m in man.items():
    m['films'].sort(key=lambda x: x['ord'])
    [x.pop('ord') for x in m['films']]
for lv, m in man.items(): json.dump(m, open(f'{out}/{lv}/manifest.json', 'w'), ensure_ascii=False, indent=1)
