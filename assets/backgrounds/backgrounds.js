/* Load before game script. Drawing returns false until the selected image loads. */
(() => {
  const base = new URL('.', document.currentScript.src);
  const themes = [
    {min:1,max:2,name:'翠緑の遺跡',file:'level_01_02_valley.png'},
    {min:3,max:4,name:'黄金の砂漠',file:'level_03_04_desert.png'},
    {min:5,max:6,name:'氷雪の神殿',file:'level_05_06_snow.png'},
    {min:7,max:8,name:'灼熱の要塞',file:'level_07_08_volcano.png'},
    {min:9,max:10,name:'天空の聖域',file:'level_09_10_sky.png'}
  ];
  const images = new Map();
  function themeFor(level) {
    const n = Number(level);
    return themes[Math.max(0,Math.min(4,Math.floor(((Number.isFinite(n)?n:1)-1)/2)))];
  }
  function getImage(theme) {
    if(!images.has(theme.file)) {
      // 軽い WebP を先に読み、読めない端末では元の PNG に切り替える
      const img = new Image();
      let triedPng = false;
      img.onerror = () => { if (!triedPng) { triedPng = true; img.src = new URL(theme.file,base).href; } };
      img.src = new URL(theme.file.replace(/\.png$/, '.webp'),base).href;
      images.set(theme.file,img);
    }
    return images.get(theme.file);
  }
  function draw(ctx,level,w,h) {
    const theme=themeFor(level),img=getImage(theme);
    const next=themes[themes.indexOf(theme)+1];
    if(next)getImage(next);
    if(!img.complete||!img.naturalWidth)return false;
    const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
    const dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
    ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
    return true;
  }
  getImage(themes[0]);
  window.StageBackgrounds={themes,themeFor,draw};
})();
