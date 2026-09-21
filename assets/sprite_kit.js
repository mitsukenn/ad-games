/* ============================================================
   SpriteKit：assets/prepared の素材シートを、ゲームの Canvas 描画から使うための小さな道具。
   先に assets/prepared/catalog.js と assets/sprite_bounds.js を読み込んでおく。

   - 読み込み前・失敗時は各関数が false を返す。ゲーム側はそのとき今までの描画を使う
   - 位置合わせは「絵の見えている部分」で行う（セルの余白は無視）
   - 小さく何百体も描く兵士などは、縮小済みの画像を作って使い回す（軽くて、縮小のギザギザも出ない）
   ============================================================ */
(() => {
  const catalog = window.GAME_ASSET_CATALOG;
  const bounds = window.GAME_SPRITE_BOUNDS || {};
  const images = {};
  const listeners = [];
  let loaded = false;

  if (catalog) {
    const base = "assets/prepared/";
    const keys = Object.keys(catalog.sheets);
    let left = keys.length;
    for (const k of keys) {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (--left === 0) { loaded = true; listeners.splice(0).forEach((f) => f()); }
      };
      img.src = base + catalog.sheets[k].file;
      images[k] = img;
    }
  }

  /** その素材がいま描けるか */
  function ok(id) {
    const s = catalog && catalog.sprites[id];
    if (!s) return false;
    const img = images[s.sheet];
    return !!(img && img.complete && img.naturalWidth);
  }

  /** 見えている部分（シート上の座標） */
  function rect(id) {
    const s = catalog.sprites[id], b = bounds[id] || [0, 0, s.w, s.h];
    return { img: images[s.sheet], x: s.x + b[0], y: s.y + b[1], w: b[2], h: b[3] };
  }

  /* 縮小済みの画像。高さ 40/80/160px の3段階（元画像は約300px）。
     半分ずつ縮めていくので、細い線もつぶれにくい */
  const cache = new Map();
  const BUCKETS = [40, 80, 160];
  function scaled(id, needH) {
    let hB = BUCKETS.find((b) => b >= needH);
    if (!hB) return null;                             // 大きく描くときは元画像から直接
    const key = id + "@" + hB;
    let c = cache.get(key);
    if (c) return c;
    const r = rect(id);
    let src = r.img, sx = r.x, sy = r.y, sw = r.w, sh = r.h;
    while (sh / 2 >= hB) {                             // 半分ずつ縮める
      const t = document.createElement("canvas");
      t.width = Math.max(1, Math.round(sw / 2)); t.height = Math.max(1, Math.round(sh / 2));
      const tc = t.getContext("2d");
      tc.imageSmoothingQuality = "high";
      tc.drawImage(src, sx, sy, sw, sh, 0, 0, t.width, t.height);
      src = t; sx = 0; sy = 0; sw = t.width; sh = t.height;
    }
    c = document.createElement("canvas");
    c.height = hB; c.width = Math.max(1, Math.round((sw * hB) / sh));
    const cc = c.getContext("2d");
    cc.imageSmoothingQuality = "high";
    cc.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
    cache.set(key, c);
    return c;
  }

  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

  /** 足元合わせ：見えている部分の下端中央を (x, y) に置き、高さ h で描く */
  function foot(ctx, id, x, y, h, flip) {
    if (!ok(id) || h <= 0) return false;
    const r = rect(id), w = (h * r.w) / r.h;
    const c = scaled(id, h * DPR());
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (c) ctx.drawImage(c, -w / 2, -h, w, h);
    else ctx.drawImage(r.img, r.x, r.y, r.w, r.h, -w / 2, -h, w, h);
    ctx.restore();
    return true;
  }

  /** 中央合わせ：見えている部分を size 四方の枠に収め、中心を (x, y) に置く。rot で回転 */
  function center(ctx, id, x, y, size, rot) {
    if (!ok(id) || size <= 0) return false;
    const r = rect(id), k = size / Math.max(r.w, r.h), w = r.w * k, h = r.h * k;
    const c = scaled(id, h * DPR());
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (c) ctx.drawImage(c, -w / 2, -h / 2, w, h);
    else ctx.drawImage(r.img, r.x, r.y, r.w, r.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  /** 横幅合わせ：見えている部分の下端中央を (x, y) に置き、幅 w で描く（門・神殿など） */
  function footW(ctx, id, x, y, w) {
    if (!ok(id) || w <= 0) return false;
    const r = rect(id);
    return foot(ctx, id, x, y, (w * r.h) / r.w);
  }

  /** 見えている部分の縦横比（幅 ÷ 高さ） */
  function aspect(id) {
    if (!catalog || !catalog.sprites[id]) return 1;
    const r = rect(id);
    return r.w / r.h;
  }

  /** 小さな canvas（画面上部の武器欄など）にアイコンを描き直す */
  function paintIcon(canvas, id) {
    const d = DPR(), cw = canvas.clientWidth || 28, ch = canvas.clientHeight || 28;
    canvas.width = Math.round(cw * d); canvas.height = Math.round(ch * d);
    const c = canvas.getContext("2d");
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, cw, ch);
    return center(c, id, cw / 2, ch / 2, Math.min(cw, ch) * 0.92);
  }

  /** 読み込みが終わったら呼ぶ（もう終わっていればすぐ呼ぶ） */
  function onReady(f) { if (loaded) f(); else listeners.push(f); }

  window.SpriteKit = { ok, foot, footW, center, aspect, paintIcon, onReady };
})();
