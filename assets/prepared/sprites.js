/* Works with file:// and HTTP. Load catalog.js before this script. */
(() => {
  const base = new URL('.', document.currentScript.src);
  const catalog = window.GAME_ASSET_CATALOG;
  const images = {};
  const ready = Promise.all(Object.entries(catalog.sheets).map(([key, sheet]) => new Promise(resolve => {
    const img = images[key] = new Image();
    img.onload = () => resolve({sheet:key,ok:true});
    img.onerror = () => resolve({sheet:key,ok:false});
    img.src = new URL(sheet.file, base).href;
  })));
  function draw(ctx,id,x,y,w,h=w) {
    const s=catalog.sprites[id];
    if(!s) return false;
    const img=images[s.sheet];
    if(!img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img,s.x,s.y,s.w,s.h,x,y,w,h);
    return true;
  }
  window.GameSprites = {catalog,ready,draw};
})();
