"""Gemini'nin kukla sayfalarını parçalara ayırır.

Kullanım: python3 araclar/kukla-kes.py            (varliklar/gorsel/kukla/*-a.png hepsi)
          python3 araclar/kukla-kes.py arif bektas

Girdi:  varliklar/gorsel/kukla/<kimlik>-a.png  (iki baş, iki iris, 3-4 ağız; siyah zemin)
        varliklar/gorsel/kukla/<kimlik>-b.png  (boyunlu gövde; siyah zemin)
Çıktı:  varliklar/gorsel/kukla-parca/<kimlik>/{bas,bas-kapali,goz,bebek,agiz-yarim,agiz-acik,govde}.png
        src/icerik/kukla/<kimlik>.json  (göz elipsleri, ağız yeri, boyun genişliği: sorgu odası bunu okur)
"""
import sys, os, json, glob
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GIR = os.path.join(KOK, 'varliklar/gorsel/kukla')
CIK = os.path.join(KOK, 'varliklar/gorsel/kukla-parca')
AYAR = os.path.join(KOK, 'src/icerik/kukla')


def bilesenler(im, esik=22, kapat=6):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    fg = nd.binary_fill_holes(nd.binary_closing(a.max(2) > esik, iterations=kapat))
    lab, _ = nd.label(fg)
    ps = []
    for i, sl in enumerate(nd.find_objects(lab), 1):
        h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start
        if h * w < 1500: continue
        ps.append(dict(i=i, x=sl[1].start, y=sl[0].start, w=w, h=h, alan=int((lab[sl] == i).sum())))
    yumus = Image.fromarray((nd.binary_erosion(fg, iterations=1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    return ps, lab, yumus


def kes(im, lab, yumus, p, pad=3):
    k = (max(p['x'] - pad, 0), max(p['y'] - pad, 0), min(p['x'] + p['w'] + pad, im.width), min(p['y'] + p['h'] + pad, im.height))
    al = np.asarray(yumus.crop(k)).copy(); l = lab[k[1]:k[3], k[0]:k[2]]
    al[(l != p['i']) & (l != 0)] = 0
    r = im.convert('RGB').crop(k); r.putalpha(Image.fromarray(al)); return r


def gozler(bas):
    B = np.asarray(bas).astype(np.int16); H, W = B.shape[:2]
    rgb = B[..., :3]; lum = rgb.mean(2); sat = rgb.max(2) - rgb.min(2)
    beyaz = (lum > 140) & (sat < 70) & (B[..., 3] > 200)
    beyaz[:int(H * .22)] = False; beyaz[int(H * .62):] = False
    beyaz = nd.binary_opening(beyaz, iterations=1)
    wl, wn = nd.label(beyaz)
    aday = []
    for k in range(1, wn + 1):
        ys, xs = np.nonzero(wl == k)
        if len(xs) < 40 or np.ptp(ys) > H * .09 or np.ptp(xs) > W * .3: continue
        aday.append((len(xs), xs.mean(), ys.mean(), k))
    aday.sort(reverse=True)
    sol = [a for a in aday if a[1] < W / 2][:1]; sag = [a for a in aday if a[1] >= W / 2][:1]
    if not sol or not sag: raise SystemExit('göz beyazı bulunamadı')
    maske = np.zeros_like(beyaz); el = []
    for _, cx, cy, k in sol + sag:
        m = wl == k; maske |= m; ys, xs = np.nonzero(m)
        el.append(dict(x=round(float(xs.mean()), 1), y=round(float(ys.mean()), 1), rx=round(np.ptp(xs) / 2 + 2, 1), ry=round(np.ptp(ys) / 2 + 2, 1)))
    maske = nd.binary_dilation(maske, iterations=2)
    mi = np.zeros((H, W, 4), np.uint8); mi[maske] = (255, 255, 255, 255)
    return el, Image.fromarray(mi)


def agizYeri(bas, agiz):
    B = np.asarray(bas.convert('L')).astype(np.float32); H, W = B.shape
    en = (1e18,)
    for o in np.arange(.8, 1.81, .05):
        m = agiz.resize((max(8, int(agiz.width * o)), max(8, int(agiz.height * o))))
        M = np.asarray(m.convert('L')).astype(np.float32); Ma = np.asarray(m)[..., 3] > 200; mh, mw = M.shape
        if mh >= H or mw >= W: continue
        for y in range(int(H * .45), H - mh, 4):
            for x in range(max(0, W // 2 - mw // 2 - W // 8), min(W - mw, W // 2 - mw // 2 + W // 8), 4):
                s1 = B[y:y + mh, x:x + mw][Ma]; s2 = M[Ma]
                s1 = s1 - s1.mean(); s2 = s2 - s2.mean()
                d = -(s1 * s2).sum() / (np.sqrt((s1 * s1).sum() * (s2 * s2).sum()) + 1e-6)  # eksi normalize çapraz ilinti
                if d < en[0]: en = (d, o, x, y, mw, mh)
    _, o, x, y, mw, mh = en
    return dict(olcek=round(float(o), 3), x=round((x + mw / 2) / W, 4), y=round(y / H, 4))


def boyunGenisligi(govde):
    a = np.asarray(govde)[..., 3] > 128
    for y in range(a.shape[0]):
        xs = np.nonzero(a[y])[0]
        if len(xs) > 10: break
    satir = a[y + 6]; xs = np.nonzero(satir)[0]
    return int(np.ptp(xs))


def isle(kim):
    A = Image.open(f'{GIR}/{kim}-a.png'); Bi = Image.open(f'{GIR}/{kim}-b.png')
    ps, lab, yum = bilesenler(A, kapat=3)
    ps.sort(key=lambda p: -p['alan'])
    basP = sorted(ps[:2], key=lambda p: p['x'])
    kalan = [p for p in ps[2:] if p['alan'] > basP[0]['alan'] * .02]
    yuvarlak = [p for p in kalan if abs(p['w'] - p['h']) < .15 * max(p['w'], p['h']) and p['alan'] > .7 * p['w'] * p['h'] * .78]
    iris = sorted(sorted(yuvarlak, key=lambda p: -p['alan'])[:2], key=lambda p: p['x'])
    agizlar = sorted([p for p in kalan if p not in iris], key=lambda p: (round(p['y'] / 60), p['x']))
    if len(iris) < 1 or len(agizlar) < 3: raise SystemExit(f'{kim}: parça bulunamadı (iris {len(iris)}, ağız {len(agizlar)})')
    d = os.path.join(CIK, kim); os.makedirs(d, exist_ok=True)
    bas = kes(A, lab, yum, basP[0]); kapali = kes(A, lab, yum, basP[1]).resize(bas.size)
    kapaliAgiz = kes(A, lab, yum, agizlar[0])
    yarim = kes(A, lab, yum, agizlar[1]); acik = kes(A, lab, yum, agizlar[-1])
    bebek = kes(A, lab, yum, iris[0])
    gps, glab, gyum = bilesenler(Bi)
    govde = kes(Bi, glab, gyum, max(gps, key=lambda p: p['alan']))
    el, maske = gozler(bas)
    ag = agizYeri(bas, kapaliAgiz)
    for ad, r in [('bas', bas), ('bas-kapali', kapali), ('goz', maske), ('bebek', bebek), ('agiz-yarim', yarim), ('agiz-acik', acik), ('govde', govde)]:
        r.save(f'{d}/{ad}.png', optimize=True)
    os.makedirs(AYAR, exist_ok=True)
    ayar = dict(kimlik=kim, bas=dict(w=bas.width, h=bas.height), gozler=el, agiz=ag,
                govde=dict(w=govde.width, h=govde.height, boyun=boyunGenisligi(govde)))
    json.dump(ayar, open(f'{AYAR}/{kim}.json', 'w'), ensure_ascii=False, indent=1)
    print(kim, 'göz', [(g['x'], g['y']) for g in el], 'ağız', ag, 'boyun', ayar['govde']['boyun'], 'baş', bas.size)


if __name__ == '__main__':
    kimler = sys.argv[1:] or sorted(os.path.basename(f)[:-6] for f in glob.glob(f'{GIR}/*-a.png'))
    for k in kimler: isle(k)
