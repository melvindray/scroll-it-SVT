import json, re, sys, os, numpy as np, soundfile as sf, time
from kokoro_onnx import Kokoro
k = Kokoro("/tmp/voices/kokoro.onnx", "/tmp/voices/voices.bin")
meta = json.load(open('build/meta.json'))
SR = 24000; GAP_S = 0.28; GAP_CUE = 0.6; LEAD = 0.5
os.makedirs('build/audio', exist_ok=True)
only = sys.argv[1] if len(sys.argv) > 1 else ''
def sentences(t):
    parts = re.split(r'(?<=[.!?])\s+', t.strip())
    return [p for p in parts if p]
timing = {}
for f in meta:
    for c in f['clips']:
        cid = f"{f['id']}_c{c['n']}"
        if only and not cid.startswith(only): continue
        t0 = time.time(); chunks = [np.zeros(int(SR * LEAD), dtype=np.float32)]; t = LEAD; cues = []
        for qi, q in enumerate(c['cues']):
            qa = t; subs = []
            for s in sentences(q['say']):
                spoken = s.replace('En science :', 'En science,')
                a, sr = k.create(spoken, voice='ff_siwis', speed=0.97, lang='fr-fr'); assert sr == SR
                a = np.asarray(a, dtype=np.float32)
                subs.append({'a': round(t, 2), 'b': round(t + len(a) / SR, 2), 'fr': s, 'sci': q['sci']})
                chunks += [a, np.zeros(int(SR * GAP_S), dtype=np.float32)]; t += len(a) / SR + GAP_S
            chunks.append(np.zeros(int(SR * GAP_CUE), dtype=np.float32)); t += GAP_CUE
            cues.append({'img': f"build/img/{cid}_q{qi+1}.png", 'a': qa, 'b': t, 'subs': subs})
        audio = np.concatenate(chunks); sf.write(f'build/audio/{cid}.wav', audio, SR)
        timing[cid] = {'dur': round(t, 2), 'cues': cues}
        json.dump(timing[cid], open(f'build/audio/{cid}.json', 'w'), ensure_ascii=False, indent=1)
        print(cid, round(t, 1), 's audio in', round(time.time() - t0), 's', flush=True)
