import json, subprocess, os, glob
meta = json.load(open('build/meta.json'))
out = 'site'; man = {}
for f in meta:
    films = man.setdefault(f['level'], {'level': f['level'], 'films': []})['films']
    film = {'id': f['id'], 'title': f['title'], 'poster': f"clips/{f['id']}/poster.jpg", 'clips': []}; films.append(film)
    os.makedirs(f"{out}/{f['level']}/clips/{f['id']}", exist_ok=True)
    for c in f['clips']:
        cid = f"{f['id']}_c{c['n']}"; tm = json.load(open(f'build/audio/{cid}.json'))
        lst = f'build/{cid}.txt'
        with open(lst, 'w') as L:
            for q in tm['cues']: L.write(f"file '{os.path.abspath(q['img'])}'\nduration {q['b']-q['a'] + (tm['cues'][0]['a'] if q is tm['cues'][0] else 0):.3f}\n")
            L.write(f"file '{os.path.abspath(tm['cues'][-1]['img'])}'\n")
        mp4 = f"{out}/{f['level']}/clips/{f['id']}/c{c['n']:02d}.mp4"
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'build/audio/{cid}.wav',
            '-vf', 'scale=720:1280:flags=lanczos,fps=24,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '24',
            '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-shortest', '-movflags', '+faststart', mp4], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f"build/img/{cid}_q1.png", '-vf', 'scale=360:640', '-q:v', '5', f"{out}/{f['level']}/clips/{f['id']}/c{c['n']:02d}.jpg"], check=True)
        cues = [s for q in tm['cues'] for s in q['subs']]
        film['clips'].append({'n': c['n'], 'title': c['title'], 'dur': tm['dur'], 'v': f"clips/{f['id']}/c{c['n']:02d}.mp4", 'p': f"clips/{f['id']}/c{c['n']:02d}.jpg", 'cues': cues})
        print(mp4, os.path.getsize(mp4) // 1024, 'KB', flush=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f"build/img/{f['id']}_c1_q1.png", '-vf', 'scale=360:640', '-q:v', '5', f"{out}/{f['level']}/clips/{f['id']}/poster.jpg"], check=True)
for lv, m in man.items(): json.dump(m, open(f'{out}/{lv}/manifest.json', 'w'), ensure_ascii=False, indent=1)
