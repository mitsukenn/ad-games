const fs = require('node:fs');
const path = require('node:path');
const groups = [
  ['weapons', '武器', [
    ['weapon_1_club','棍棒'],['weapon_2_dagger','短剣'],['weapon_3_longsword','長剣'],['weapon_4_spear','槍'],['weapon_5_axe','戦斧'],['weapon_6_hammer','雷槌'],
    ['ranged_0_stone','投石'],['ranged_1_sling','スリング'],['ranged_2_bow','弓'],['ranged_3_crossbow','クロスボウ'],['ranged_4_matchlock','火縄銃'],['ranged_5_pistol','拳銃'],['ranged_6_rifle','ライフル'],['ranged_7_shotgun','ショットガン'],['ranged_8_machinegun','マシンガン'],['ranged_9_cannon','大砲']
  ]],
  ['characters-world','兵士・巨人・ステージ',[
    ['ally_run_1','味方・走り1'],['ally_run_2','味方・走り2'],['enemy_stand_1','敵・構え1'],['enemy_stand_2','敵・構え2'],
    ['giant_idle','巨人・待機'],['giant_raise','巨人・振りかぶり'],['giant_slam','巨人・叩きつけ'],['giant_king_idle','巨人王・待機'],
    ['giant_king_raise','巨人王・振りかぶり'],['giant_king_slam','巨人王・叩きつけ'],['temple_goal','ゴール神殿'],['blade_trap','回転刃'],
    ['pillar','石柱'],['gate_frame','二択ゲート枠'],['fx_dust','土煙'],['fx_spark','火花']
  ]],
  ['resources','資源・報酬・小物',[
    ['material_wood','木材'],['material_stone','石材'],['material_iron','鉄鉱石'],['material_gold','金鉱石'],
    ['material_leather','革'],['material_cloth','布'],['material_jade','翡翠結晶'],['coin_gold','金貨'],
    ['chest_closed','宝箱・閉'],['chest_open','宝箱・開'],['potion_health','回復薬'],['potion_energy','エネルギー薬'],
    ['banner_ally','味方旗'],['banner_enemy','敵旗'],['supply_crate','補給箱'],['fx_shockwave','衝撃波']
  ]]
];
const manifest = {version:1, layout:'4x4', source:'Built-in ImageGen, 2026-09-21', sheets:{}, sprites:{}, animations:{ally:['ally_run_1','ally_run_2'],enemy:['enemy_stand_1','enemy_stand_2'],giant:['giant_idle','giant_raise','giant_slam'],king:['giant_king_idle','giant_king_raise','giant_king_slam']}};
for(const [sheet,category,entries] of groups){
  const data=fs.readFileSync(path.join(__dirname,sheet+'.png'));
  const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
  manifest.sheets[sheet]={file:sheet+'.png',width,height};
  entries.forEach(([id,name],i)=>{
    const col=i%4,row=Math.floor(i/4),x=Math.round(col*width/4),y=Math.round(row*height/4);
    manifest.sprites[id]={name,category,sheet,x,y,w:Math.round((col+1)*width/4)-x,h:Math.round((row+1)*height/4)-y};
  });
}
fs.writeFileSync(path.join(__dirname,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'catalog.js'),'window.GAME_ASSET_CATALOG = '+JSON.stringify(manifest,null,2)+';\n');
const rows=Object.entries(manifest.sprites).map(([id,s])=>`| ${s.name} | \`${id}\` | ${s.sheet}.png | ${s.x}, ${s.y}, ${s.w}, ${s.h} | 制作済・シート内 |`);
fs.writeFileSync(path.join(__dirname,'一覧.md'),`# 素材一覧\n\n2026-09-21制作。48点を透過PNGシート3枚に収録。各シート1254×1254px。個別PNGではなく、manifest.jsonの矩形で参照する方式です。\n\n| 素材 | ID | シート | x, y, 幅, 高さ(px) | 状態 |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log('Catalog built: '+Object.keys(manifest.sprites).length+' sprites');
