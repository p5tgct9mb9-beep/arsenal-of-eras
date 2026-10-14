'use strict';
const ERAS=[
 {id:'ww2',name:'WORLD WAR II',sub:'ALLIES VS AXIS',foe:'AXIS FORCES (FICTIONAL UNITS)',year:'1944',
  bg:{ct:'#24283a',cb:'#4c5262',ft:'#3a3428',fb:'#6e5e44'},fog:[34,34,40],fogD:13,
  prim:['garand','thompson','bar','carbine'],sec:['m1911'],gren:['frag','smoke'],
  levels:['NORMANDY BUNKERS','RAIL YARD','ARMORED TRAIN DEPOT'],boss:'tiger',bossName:'GREY WOLF HEAVY TANK',
  walls:[['brick','#8a4a32'],['blocks','#7c7a70'],['planks','#7a5a36'],['concrete','#8a8474']],uni:'#6f7472',helm:'#555a58',oUni:'#4c5250',glove:'#c89a70'},
 {id:'cold',name:'COLD WAR',sub:'NATO VS WARSAW PACT',foe:'WARSAW PACT (FICTIONAL UNITS)',year:'1979',
  bg:{ct:'#1e2430',cb:'#3c4450',ft:'#33332f',fb:'#5c5a50'},fog:[28,32,36],fogD:14,
  prim:['m16a1','m14','m60','car15'],sec:['m1911c'],gren:['frag','smoke','flash'],
  levels:['BORDER CHECKPOINT','MISSILE SITE','HIND AIRBASE'],boss:'hind',bossName:'HIND-D GUNSHIP',
  walls:[['concrete','#8a8e88'],['metal','#4e6a4e'],['brick','#7a5040'],['sand','#a08e64']],uni:'#7a7450',helm:'#4e5a3a',oUni:'#5a5a42',glove:'#6a6a4a'},
 {id:'mod',name:'MODERN ERA',sub:'COALITION VS OPFOR',foe:'RUSSIA / CHINA / IRAN / DPRK / CSTO (FICTIONAL)',year:'2026',
  bg:{ct:'#5a86c0',cb:'#a8c8e0',ft:'#6a5c44',fb:'#a08a64'},fog:[150,170,180],fogD:16,
  prim:['m4a1','m27','mk18','scarh','m110'],sec:['m17','glock19'],gren:['frag','flash','smoke'],
  levels:['DESERT COMPOUND','URBAN BLOCK','ARMORED HQ'],boss:'t90',bossName:'IRON BEAR T-90 COMMAND TANK',
  walls:[['stucco','#b8a07a'],['metal','#7a4a3a'],['concrete','#9a9890'],['sand','#b09a6a']],uni:'#6a6c4a',helm:'#4a4e3a',oUni:'#3e423a',glove:'#3a3a32'}];
// classes: pistol smg carbine rifle dmr lmg
const WPN={
 garand:{n:'M1 GARAND',c:'rifle',dmg:58,rpm:240,auto:0,rec:2.4,sp:2.2,mag:8,res:6,rl:2.2,rng:14,mob:.92,noMag:1,p:{len:100,stock:'wood',body:'#4a4c4e',furn:'#8a5a30',mag:'internal',bar:14,hg:'wood'}},
 thompson:{n:'THOMPSON M1928',c:'smg',dmg:24,rpm:700,auto:1,rec:1.3,sp:3.5,mag:20,res:6,rl:2,rng:7,mob:1,p:{len:82,stock:'wood',body:'#3a3a3c',furn:'#8a5a30',mag:'stick',bar:9,hg:'vgrip'}},
 bar:{n:'BAR M1918',c:'lmg',dmg:46,rpm:550,auto:1,rec:2.3,sp:3,mag:20,res:7,rl:2.6,rng:12,mob:.82,p:{len:108,stock:'wood',body:'#3e4042',furn:'#7a5030',mag:'box',bar:18,hg:'wood'}},
 carbine:{n:'M1 CARBINE',c:'carbine',dmg:32,rpm:330,auto:0,rec:1.2,sp:2.2,mag:15,res:7,rl:1.8,rng:10,mob:1.03,p:{len:86,stock:'wood',body:'#44464a',furn:'#9a6a3a',mag:'box',bar:10,hg:'wood'}},
 m1911:{n:'M1911',c:'pistol',dmg:30,rpm:300,auto:0,rec:1.6,sp:2.5,mag:7,res:6,rl:1.5,rng:7,mob:1.08,p:{pistol:1,body:'#3a3c40',furn:'#6a4628'}},
 m16a1:{n:'M16A1',c:'rifle',dmg:30,rpm:750,auto:1,rec:1.4,sp:2.6,mag:20,res:7,rl:2.1,rng:12,mob:.98,p:{len:96,stock:'black',body:'#2c2e30',furn:'#2c2e30',mag:'box',bar:14,hg:'tri',carry:1}},
 m14:{n:'M14',c:'dmr',dmg:54,rpm:420,auto:0,rec:2.2,sp:2.4,mag:20,res:6,rl:2.3,rng:16,mob:.9,p:{len:106,stock:'wood',body:'#3a3c3e',furn:'#8a5a30',mag:'box',bar:16,hg:'wood'}},
 m60:{n:'M60',c:'lmg',dmg:40,rpm:600,auto:1,rec:2,sp:4,mag:100,res:2,rl:4.2,rng:12,mob:.78,noMag:1,p:{len:110,stock:'black',body:'#2e3032',furn:'#2e3032',mag:'belt',bar:22,hg:'round'}},
 car15:{n:'CAR-15',c:'carbine',dmg:27,rpm:800,auto:1,rec:1.3,sp:3,mag:20,res:7,rl:2,rng:9,mob:1.05,p:{len:82,stock:'tube',body:'#2c2e30',furn:'#2c2e30',mag:'box',bar:8,hg:'round',carry:1}},
 m1911c:{n:'M1911A1',c:'pistol',dmg:30,rpm:300,auto:0,rec:1.6,sp:2.5,mag:7,res:6,rl:1.5,rng:7,mob:1.08,p:{pistol:1,body:'#2e3034',furn:'#4a3a2a'}},
 m4a1:{n:'M4A1',c:'carbine',dmg:28,rpm:800,auto:1,rec:1.2,sp:2.6,mag:30,res:6,rl:2,rng:11,mob:1.02,p:{len:88,stock:'tube',body:'#2a2c2e',furn:'#2a2c2e',mag:'curved',bar:10,hg:'rail',rail:1}},
 m27:{n:'M27 IAR',c:'lmg',dmg:30,rpm:750,auto:1,rec:1,sp:2.4,mag:30,res:8,rl:2.2,rng:13,mob:.94,p:{len:98,stock:'tube',body:'#2e3030',furn:'#2e3030',mag:'curved',bar:14,hg:'rail',rail:1}},
 mk18:{n:'MK18 CQBR',c:'carbine',dmg:26,rpm:850,auto:1,rec:1.25,sp:3,mag:30,res:6,rl:1.9,rng:8,mob:1.08,p:{len:78,stock:'tube',body:'#2a2c2e',furn:'#2a2c2e',mag:'curved',bar:5,hg:'rail',rail:1}},
 scarh:{n:'SCAR-H',c:'rifle',dmg:44,rpm:600,auto:1,rec:2,sp:2.6,mag:20,res:6,rl:2.3,rng:14,mob:.94,p:{len:98,stock:'black',body:'#b09a6a',furn:'#2a2a2a',mag:'box',bar:12,hg:'rail',rail:1}},
 m110:{n:'M110 SASS',c:'dmr',dmg:75,rpm:240,auto:0,rec:2.6,sp:2.8,mag:20,res:5,rl:2.6,rng:20,mob:.88,p:{len:112,stock:'black',body:'#3a3a32',furn:'#3a3a32',mag:'box',bar:20,hg:'rail',rail:1}},
 m17:{n:'M17',c:'pistol',dmg:26,rpm:380,auto:0,rec:1.3,sp:2.2,mag:17,res:5,rl:1.4,rng:8,mob:1.1,p:{pistol:1,body:'#2a2a2a',furn:'#a08a60',frame:'#a08a60'}},
 glock19:{n:'GLOCK 19',c:'pistol',dmg:24,rpm:420,auto:0,rec:1.2,sp:2.4,mag:15,res:5,rl:1.4,rng:7,mob:1.1,p:{pistol:1,body:'#303234',furn:'#222426'}}
};
const ALL=['ww2','cold','mod'],NP=['smg','carbine','rifle','dmr','lmg'],LONG=['carbine','rifle','dmr','lmg'];
const SLOTS=['optic','muzzle','under','mag','laser','stock'];
const SLOTN={optic:'OPTIC',muzzle:'MUZZLE',under:'UNDERBARREL',mag:'MAGAZINE',laser:'LASER/LIGHT',stock:'STOCK'};
const ATT={
 optic:[{id:'iron',n:'IRON SIGHTS',m:{zoom:1.25}},
  {id:'rdot',n:'RED DOT',eras:['mod'],m:{zoom:1.35,ads:.8,scope:'dot'}},
  {id:'holo',n:'HOLO SIGHT',eras:['mod'],cls:NP,m:{zoom:1.4,ads:.75,scope:'holo'}},
  {id:'acog',n:'ACOG 4X',eras:['mod'],cls:LONG,m:{zoom:2.4,ads:.5,mob:.97,scope:'acog'}},
  {id:'lpvo',n:'LPVO 1-6X',eras:['mod'],cls:LONG,m:{zoom:2,ads:.55,scope:'acog'}},
  {id:'c3x',n:'COLT 3X SCOPE',eras:['cold'],cls:['rifle','carbine'],m:{zoom:2,ads:.6,scope:'acog'}},
  {id:'snip',n:'SNIPER SCOPE',ne:{ww2:'M84 SCOPE',cold:'ART SCOPE'},cls:['rifle','dmr'],m:{zoom:4,ads:.25,mob:.92,sp:1.3,scope:'scope'}}],
 muzzle:[{id:'none',n:'NONE',m:{}},
  {id:'supp',n:'SUPPRESSOR',eras:['cold','mod'],m:{dmg:.92,rec:.9,rng:.9,quiet:1,noflash:1}},
  {id:'comp',n:'COMPENSATOR',ne:{ww2:'CUTTS COMP'},m:{rec:.72,sp:1.05}},
  {id:'fhide',n:'FLASH HIDER',cls:NP,m:{rec:.9,noflash:1}}],
 under:[{id:'none',n:'NONE',m:{}},
  {id:'fgrip',n:'FOREGRIP',cls:['smg','carbine','rifle','lmg'],m:{rec:.8,sp:.9,mob:.98}},
  {id:'bipod',n:'BIPOD',cls:['rifle','dmr','lmg'],m:{rec:.6,mob:.92,ads:.85}},
  {id:'m203',n:'M203 40MM GL',eras:['cold','mod'],cls:['carbine','rifle'],m:{gl:4,mob:.92}},
  {id:'m7',n:'M7 RIFLE GL',eras:['ww2'],w:['garand','carbine'],m:{gl:3,mob:.95}}],
 mag:[{id:'std',n:'STANDARD',m:{}},
  {id:'ext',n:'EXTENDED MAG',m:{mag:1.5,rl:1.1,mob:.98}},
  {id:'drum',n:'DRUM MAG',cls:['smg','carbine','rifle','lmg'],m:{mag:2.5,rl:1.35,mob:.93}}],
 laser:[{id:'none',n:'NONE',m:{}},
  {id:'light',n:'FLASHLIGHT',eras:['cold','mod'],m:{light:1}},
  {id:'laser',n:'LASER',eras:['mod'],m:{sp:.7,laser:1}},
  {id:'peq',n:'PEQ-15 COMBO',eras:['mod'],cls:NP,m:{sp:.75,light:1,laser:1,mob:.98}}],
 stock:[{id:'std',n:'STANDARD',m:{}},
  {id:'heavy',n:'HEAVY STOCK',cls:NP,m:{rec:.8,mob:.95}},
  {id:'lite',n:'LIGHT STOCK',ne:{ww2:'FOLDING STOCK',cold:'COLLAPSIBLE'},cls:['smg','carbine','rifle'],m:{rec:1.15,mob:1.07}}]
};
function attOK(a,era,wid){const w=WPN[wid];if(a.eras&&!a.eras.includes(era))return false;if(a.cls&&!a.cls.includes(w.c))return false;if(a.w&&!a.w.includes(wid))return false;
 if(w.noMag&&(a.id=='ext'||a.id=='drum'))return false;if(w.c=='pistol'&&['under','stock'].some(s=>ATT[s].includes(a))&&a.id!='none'&&a.id!='std')return false;return true}
function attList(slot,era,wid){return ATT[slot].filter(a=>attOK(a,era,wid))}
function attName(a,era){return (a.ne&&a.ne[era])||a.n}
function attGet(slot,id){return ATT[slot].find(a=>a.id==id)||ATT[slot][0]}
function calcStats(wid,att){const b=WPN[wid],s={n:b.n,c:b.c,dmg:b.dmg,rpm:b.rpm,auto:b.auto,rec:b.rec,sp:b.sp,ads:1,mag:b.mag,res:b.res,rl:b.rl,rng:b.rng,mob:b.mob,zoom:1.25,scope:null,quiet:0,noflash:0,gl:0,light:0,laser:0};
 for(const sl of SLOTS){const a=attGet(sl,att&&att[sl]);for(const k in a.m){const v=a.m[k];if(['zoom','scope','quiet','noflash','gl','light','laser'].includes(k))s[k]=v;else s[k]*=v}}
 s.mag=Math.round(s.mag);return s}
const GREN={frag:{n:'FRAG GRENADE',ne:{ww2:'MK2 FRAG'}},smoke:{n:'SMOKE GRENADE'},flash:{n:'FLASHBANG'}};
const GEAR={armor:{n:'ARMOR VEST',ne:{ww2:'FLAK VEST'}},medkit:{n:'MEDKIT X2'},ammo:{n:'EXTRA AMMO'}};
const ETYPES={soldier:{hp:60,spd:1.6,rate:1.15,dmg:6,acc:.55,hw:.28},officer:{hp:110,spd:1.9,rate:.85,dmg:8,acc:.6,hw:.3},
 turret:{hp:240,spd:0,rate:.16,dmg:4,acc:.35,hw:.7,armor:.6,burst:6},vehicle:{hp:480,spd:.9,rate:.2,dmg:4,acc:.35,hw:.8,armor:.5,burst:8},
 boss:{hp:1600,spd:.5,rate:.12,dmg:4,acc:.3,hw:.85,armor:.35,burst:8}};
