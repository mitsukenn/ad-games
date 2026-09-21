(() => {
  const base = new URL('.',document.currentScript.src);
  const themes=['遺跡の歩兵','砂漠の銅鎧兵','氷雪の銀鎧兵','火山の重装兵','天空の聖騎士'];
  const catalog={sheets:{soldiers:{file:'soldiers.png',width:1254,height:1254},gates:{file:'gates.png',width:1254,height:1254}},sprites:{}};
  for(let tier=0;tier<5;tier++)for(let frame=0;frame<2;frame++){
    const x=Math.round(tier*1254/5),end=Math.round((tier+1)*1254/5);
    catalog.sprites[`soldier_${tier+1}_${frame+1}`]={sheet:'soldiers',x,y:frame?640:140,w:end-x,h:460,name:themes[tier]};
  }
  for(let i=0;i<6;i++)catalog.sprites[`gate_${i+1}`]={sheet:'gates',x:(i%2)*627,y:Math.floor(i/2)*418,w:627,h:418,name:['遺跡の門','砂漠の門','氷雪の門','火山の門','天空の門','最終決戦の門'][i]};
  const images={};
  const ready=Promise.all(Object.entries(catalog.sheets).map(([id,s])=>new Promise(resolve=>{
    const img=images[id]=new Image();img.onload=()=>resolve({id,ok:true});img.onerror=()=>resolve({id,ok:false});img.src=new URL(s.file,base).href;
  })));
  function level(value){const n=Number(value);return Number.isFinite(n)?Math.max(1,Math.min(10,Math.floor(n))):1}
  function forLevel(value){const n=level(value),tier=Math.floor((n-1)/2)+1;return {name:themes[tier-1],soldiers:[`soldier_${tier}_1`,`soldier_${tier}_2`],gate:`gate_${n===10?6:tier}`}}
  function draw(ctx,id,x,y,w,h){const s=catalog.sprites[id];if(!s)return false;const img=images[s.sheet];if(!img.complete||!img.naturalWidth)return false;ctx.drawImage(img,s.x,s.y,s.w,s.h,x,y,w,h??w*s.h/s.w);return true}
  window.LevelAssets={catalog,ready,forLevel,draw};
})();
