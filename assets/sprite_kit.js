/* ============================================================
   SpriteKit：素材シートを、ゲームの Canvas 描画から使うための小さな道具。
   先に次を読み込んでおく（無いものは飛ばしてよい）
     assets/prepared/catalog.js     … 兵士・巨人・武器・小物（GAME_ASSET_CATALOG）
     assets/level-units/catalog.js  … レベル別の兵士・ゲート（LEVEL_UNITS_CATALOG）
     assets/v2/catalog.js           … 迎撃ロード v2 素材（GEIGEKI_V2_CATALOG）
     assets/v2g/catalog.js          … ステージ別の巨人（GEIGEKI_V2G_CATALOG）
     assets/sprite_bounds.js        … 各素材の「見えている部分」の矩形

   - 読み込み前・失敗時は各関数が false を返す。ゲーム側はそのとき今までの描画を使う
   - 位置合わせは「絵の見えている部分」で行う（セルの余白は無視）
   - 画像は軽い WebP を先に読み、読めない端末では元の PNG に切り替える
   - シートは初めて使うときに読み込む（まだ来ないステージの素材で通信しない）
   - 小さく何百体も描く兵士などは、縮小済みの画像を作って使い回す（軽くて、縮小のギザギザも出ない）
   ============================================================ */
(() => {
  const bounds = window.GAME_SPRITE_BOUNDS || {};
  const sheets = {};                 // シート名 → { png, img }
  const sprites = {};                // 素材ID → { sheet, x, y, w, h }
  const listeners = [];

  function addCatalog(cat, base) {
    if (!cat) return;
    for (const k of Object.keys(cat.sheets)) sheets[base + k] = { png: base + cat.sheets[k].file, img: null };
    for (const id of Object.keys(cat.sprites)) {
      const s = cat.sprites[id];
      sprites[id] = { sheet: base + s.sheet, x: s.x, y: s.y, w: s.w, h: s.h };
    }
  }
  addCatalog(window.GAME_ASSET_CATALOG, "assets/prepared/");
  addCatalog(window.LEVEL_UNITS_CATALOG, "assets/level-units/");
  addCatalog(window.GEIGEKI_V2_CATALOG, "assets/v2/");            // 迎撃ロード v2（敵・門・台座・格上げ兵・新武器）
  addCatalog(window.GEIGEKI_V2G_CATALOG, "assets/v2g/");          // ステージ別の巨人（ステージごとに1枚。そのステージで初めて読む）

  function load(key) {
    const sh = sheets[key];
    if (sh.img) return sh.img;
    const img = new Image();
    img.decoding = "async";
    let triedPng = false;
    img.onerror = () => { if (!triedPng) { triedPng = true; img.src = sh.png; } };   // WebP が読めなければ PNG
    img.onload = () => listeners.forEach((f) => f());
    img.src = sh.png.replace(/\.png$/, ".webp");
    sh.img = img;
    return img;
  }
  // 基本の素材（兵士・巨人・武器・小物）は最初から読み始める
  for (const key of Object.keys(sheets)) if (key.startsWith("assets/prepared/") || key.startsWith("assets/v2/")) load(key);

  /** その素材がいま描けるか（まだ読んでいなければ読み始める） */
  function ok(id) {
    const s = sprites[id];
    if (!s) return false;
    const img = load(s.sheet);
    return !!(img.complete && img.naturalWidth);
  }

  /** 見えている部分（シート上の座標） */
  function rect(id) {
    const s = sprites[id], b = bounds[id] || [0, 0, s.w, s.h];
    return { img: sheets[s.sheet].img, x: s.x + b[0], y: s.y + b[1], w: b[2], h: b[3] };
  }

  /* 縮小済みの画像。高さ 40/80/160px の3段階。半分ずつ縮めていくので、細い線もつぶれにくい */
  const cache = new Map();
  const BUCKETS = [40, 80, 160];
  function scaled(id, needH) {
    const hB = BUCKETS.find((b) => b >= needH);
    if (!hB) return null;                              // 大きく描くときは元画像から直接
    const key = id + "@" + hB;
    let c = cache.get(key);
    if (c) return c;
    const r = rect(id);
    let src = r.img, sx = r.x, sy = r.y, sw = r.w, sh = r.h;
    while (sh / 2 >= hB) {
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
    if (!flip) {                          // 反転しないときは save/restore なしで直接描く（何百体も描くので軽くする）
      if (c) ctx.drawImage(c, x - w / 2, y - h, w, h);
      else ctx.drawImage(r.img, r.x, r.y, r.w, r.h, x - w / 2, y - h, w, h);
      return true;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
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
    if (!rot) {                           // 回さないときは save/restore なしで直接描く
      if (c) ctx.drawImage(c, x - w / 2, y - h / 2, w, h);
      else ctx.drawImage(r.img, r.x, r.y, r.w, r.h, x - w / 2, y - h / 2, w, h);
      return true;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
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
    if (!sprites[id]) return 1;
    const s = sprites[id], b = bounds[id] || [0, 0, s.w, s.h];
    return b[2] / b[3];
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

  /** シートを読み終えるたびに呼ぶ（今すぐも一度呼ぶ） */
  function onReady(f) { listeners.push(f); f(); }

  window.SpriteKit = { ok, foot, footW, center, aspect, paintIcon, onReady };
})();
