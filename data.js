'use strict';
// ===== Arsenal of Eras FPS — game data =====
// weapon: n name, c class(rifle/smg/lmg/sniper/shotgun/pistol/launcher/energy), d dmg, rof rpm, mag, rel s, sp hip spread(rad), rec recoil, rng m, auto, mob, pel pellets, proj
const W=(id,n,c,d,rof,mag,rel,sp,rec,rng,auto,mob,x={})=>Object.assign({id,n,c,d,rof,mag,rel,sp,rec,rng,auto,mob},x);
const A=(id,n,vis,m={},x={})=>Object.assign({id,n,vis,m},x);
const OPT_IRON=A('iron','Iron Sights','none',{},{z:1.3});
const ERAS=[
{id:'ww2',n:'World War II',yr:'1944',foe:'Axis Forces',foeNote:'Axis infantry in plain grey uniforms (no insignia)',
 sky:[[70,110,165],[205,190,160]],fog:[175,170,150],sun:[1,.92,.78],sunI:3.0,hemi:[[150,170,200],[80,70,50]],ground:'grass',gcol:[78,96,50],amp:3,
 prop:'farm',uni:{body:0x60656a,pants:0x55595d,helm:0x4d5254,helmT:'stahl',skin:0xc89a78,gear:0x3a3226},grav:18,
 prim:[W('garand','M1 Garand','rifle',42,240,8,2.2,.012,1.4,90,0,1),W('thompson','M1A1 Thompson','smg',24,700,30,2.0,.03,.55,40,1,1.08),W('bar','M1918 BAR','lmg',38,550,20,2.8,.03,1.0,80,1,.9),W('springfield','M1903A4 Springfield','sniper',95,45,5,3.0,.04,2.6,160,0,.92),W('trench','M97 Trench Gun','shotgun',16,80,6,3.4,.09,1.6,22,0,1,{pel:9})],
 sec:[W('m1911','M1911','pistol',30,350,7,1.5,.02,.9,35,0,1.12),W('m1carbine','M1 Carbine','rifle',28,450,15,1.8,.02,.6,60,0,1.06)],
 lau:[W('bazooka','M1A1 Bazooka','launcher',420,30,1,3.6,.01,3,120,0,.85,{proj:'rocket',spd:45}),W('piat','Rifle Grenade (M7)','launcher',300,40,1,2.5,.01,2,80,0,.95,{proj:'gl',spd:30})],
 lethal:[['frag','Mk 2 Frag'],['stick','No. 74 Sticky Bomb']],tact:[['smoke','M15 Smoke'],['flash','Flash Charge']],
 gadgets:[['c4','Satchel Charge'],['mine','Trip Mine'],['recon','RC Recon Glider (experimental)']],
 att:{optic:[OPT_IRON,A('peep','Ghost-Ring Peep','peep',{sp:.92},{z:1.4}),A('m73','M73B1 2.5x Scope','scope_s',{ads:1.15,mob:.98},{z:2.5}),A('unertl','Unertl 8x Scope','scope_l',{ads:1.35,mob:.96},{z:5,scope:1})],
  muzzle:[A('none','Bare Muzzle','none'),A('comp','Cutts Compensator','comp',{rec:.8}),A('flash','Flash Hider','flash',{rec:.92,q:.5}),A('bayonet','M1 Bayonet','bayonet',{mob:.97,mel:2})],
  under:[A('none','None','none'),A('bipod','Folding Bipod','bipod',{rec:.75,mob:.95}),A('sling','Combat Sling','sling',{ads:.9}),A('torch','TL-122 Flashlight','light',{sp:.95})],
  grip:[A('none','Wood Furniture','none'),A('fgrip','Vertical Foregrip','vgrip',{rec:.85,ads:1.05}),A('tape','Friction Tape','wrap',{ads:.92})],
  mag:[A('std','Standard','std'),A('ext','Extended Mag','ext',{mag:1.5,rel:1.15,mob:.98}),A('drum','50-rd Drum','drum',{mag:2.2,rel:1.45,mob:.92}),A('clip','Stripper Clips','fast',{rel:.75})],
  stock:[A('std','Wood Stock','std'),A('heavy','Recoil Pad','heavy',{rec:.85,ads:1.08}),A('light','Cut-down Stock','light',{ads:.88,mob:1.04,rec:1.1})]},
 air:{id:'p51',n:'P-51D Mustang',t:'jet',model:'prop'},enemyAir:{n:'Grey fighter',model:'prop'},
 missions:[
  {n:'Hedgerow Breakout',brief:'Push through the farmland, knock out the flak guns, then stop the heavy tank column.',time:'day',kill:12,tgt:{n:2,t:'flak',name:'Flak gun'},boss:{t:'tank',n:'Heavy Tank "Grauwolf"',hp:2400},drones:0,air:1},
  {n:'River Crossing at Dusk',brief:'Secure the village, destroy the artillery and shoot down the heavy bomber leading the raid. Take the P-51 up!',time:'dusk',kill:14,tgt:{n:3,t:'arty',name:'Artillery piece'},boss:{t:'bomber',n:'Heavy Bomber "Nachtfalke"',hp:1800},drones:0,air:2}]},
{id:'cold',n:'Cold War',yr:'1983',foe:'Warsaw Pact',foeNote:'Warsaw Pact motor-rifle troops',
 sky:[[110,130,150],[200,205,210]],fog:[185,190,195],sun:[1,.95,.9],sunI:2.4,hemi:[[170,185,205],[90,90,95]],ground:'snow',gcol:[215,220,226],amp:5,
 prop:'forest',uni:{body:0x6e6a4a,pants:0x5e5b40,helm:0x4c5a3a,helmT:'ssh',skin:0xd2a684,gear:0x3b3a2a},grav:18,
 prim:[W('m16a1','M16A1','rifle',30,750,20,2.1,.02,.7,75,1,1.03),W('ak47','AK-47 (captured)','rifle',36,600,30,2.4,.026,.95,70,1,1),W('m60','M60','lmg',36,550,100,4.5,.035,1.0,85,1,.85),W('m21','M21 DMR','sniper',75,180,20,2.6,.03,1.7,140,0,.94),W('car15','CAR-15','smg',27,750,30,2.0,.024,.6,50,1,1.08)],
 sec:[W('m1911c','M1911A1','pistol',30,350,7,1.5,.02,.9,35,0,1.12),W('skorpion','vz.61 Skorpion','smg',18,850,20,1.6,.035,.4,25,1,1.12)],
 lau:[W('law','M72 LAW','launcher',450,30,1,3.0,.01,3,120,0,.95,{proj:'rocket',spd:55}),W('rpg7','RPG-7 (captured)','launcher',480,30,1,3.4,.015,3,130,0,.9,{proj:'rocket',spd:60}),W('carlg','Carl Gustaf M2','launcher',520,30,1,4.0,.01,3.2,150,0,.85,{proj:'rocket',spd:70})],
 lethal:[['frag','M67 Frag'],['impact','M406 Impact']],tact:[['smoke','AN-M8 Smoke'],['flash','M84 Flashbang']],
 gadgets:[['claymore','M18A1 Claymore'],['c4','C4 Charge'],['recon','Recon Drone (prototype)']],
 att:{optic:[OPT_IRON,A('reflex','Singlepoint Reflex','reflex',{ads:.95},{z:1.45}),A('art','ART-II 4x','scope_s',{ads:1.2,mob:.97},{z:3}),A('starlight','AN/PVS-2 Starlight','scope_l',{ads:1.35,mob:.94},{z:4.5,scope:1})],
  muzzle:[A('none','Birdcage','none'),A('supp','Suppressor','supp',{q:1,rng:.9,d:.95}),A('comp','Compensator','comp',{rec:.78}),A('bayonet','M7 Bayonet','bayonet',{mob:.97,mel:2})],
  under:[A('none','None','none'),A('m203','M203 40mm','gl',{mob:.93},{gl:1}),A('bipod','Bipod','bipod',{rec:.72,mob:.95}),A('light','Weapon Light','light',{sp:.94})],
  grip:[A('none','Standard Handguard','none'),A('fgrip','Vertical Grip','vgrip',{rec:.85,ads:1.05}),A('stip','Stippled Grip','wrap',{ads:.9})],
  mag:[A('std','Standard','std'),A('ext','30-rd Mag','ext',{mag:1.5,rel:1.1}),A('drum','Beta C-Mag','drum',{mag:3,rel:1.5,mob:.9}),A('jungle','Jungle Clip','fast',{rel:.7})],
  stock:[A('std','Fixed Stock','std'),A('fold','Folding Stock','light',{ads:.85,mob:1.05,rec:1.12}),A('heavy','Buttpad','heavy',{rec:.86,ads:1.06})]},
 air:{id:'f4',n:'F-4 Phantom II',t:'jet',model:'jet'},air2:{id:'huey',n:'UH-1 Huey',t:'heli',model:'heli'},enemyAir:{n:'MiG-21',model:'jet'},
 missions:[
  {n:'Fulda Gap',brief:'Hold the snowy forest pass. Destroy the SAM launchers so air support can fly, then kill the lead T-72.',time:'day',kill:14,tgt:{n:3,t:'sam',name:'SAM launcher'},boss:{t:'tank',n:'T-72 Main Battle Tank',hp:2600},drones:1,air:1},
  {n:'Firebase Echo',brief:'Defend the valley firebase. Wreck the radar vans and bring down the Mi-24 Hind gunship. A Huey is on the pad.',time:'dusk',kill:14,tgt:{n:2,t:'radar',name:'Radar van'},boss:{t:'heli',n:'Mi-24 Hind Gunship',hp:2000},drones:2,air:1,heli:1}]},
{id:'modern',n:'Modern',yr:'2025',foe:'Eastern Coalition (OPFOR)',foeNote:'Fictional OPFOR coalition: Russia, China, Iran, North Korea and CSTO units',
 sky:[[95,145,205],[225,210,180]],fog:[215,200,170],sun:[1,.93,.8],sunI:3.4,hemi:[[180,195,215],[120,100,70]],ground:'sand',gcol:[196,170,120],amp:4,
 prop:'town',uni:{body:0x8a7a58,pants:0x7a6c4e,helm:0x6e6448,helmT:'mod',skin:0x2a2a2a,gear:0x4a4636},grav:18,
 prim:[W('m4a1','M4A1','rifle',30,800,30,2.0,.02,.65,80,1,1.04),W('scarh','SCAR-H','rifle',40,600,20,2.3,.022,.95,90,1,.98),W('mk18','Mk 18 CQBR','smg',27,850,30,1.9,.024,.55,55,1,1.1),W('m249','M249 SAW','lmg',30,800,100,4.8,.034,.8,80,1,.86),W('m110','M110 SASS','sniper',80,200,20,2.6,.03,1.6,170,0,.93),W('m1014','M1014','shotgun',15,240,8,3.6,.08,1.2,25,0,1,{pel:9})],
 sec:[W('m17','M17','pistol',28,400,17,1.4,.018,.7,35,0,1.12),W('glock18','Glock 18','smg',20,1100,33,1.5,.035,.4,25,1,1.12)],
 lau:[W('at4','AT4','launcher',500,30,1,3.0,.01,3,140,0,.92,{proj:'rocket',spd:70}),W('javelin','FGM-148 Javelin','launcher',900,15,1,4.2,.01,2,300,0,.85,{proj:'jav',spd:40,lock:1}),W('stinger','FIM-92 Stinger','launcher',600,20,1,3.6,.01,2,300,0,.88,{proj:'jav',spd:70,lock:1,aa:1})],
 lethal:[['frag','M67 Frag'],['semtex','Sticky Charge']],tact:[['smoke','M18 Smoke'],['flash','M84 Flashbang']],
 gadgets:[['fpv','FPV Kamikaze Drone'],['recon','Recon Quadcopter'],['c4','C4'],['claymore','Claymore']],
 att:{optic:[OPT_IRON,A('rdot','Red Dot','reflex',{ads:.95},{z:1.5}),A('holo','Holographic','holo',{ads:.97},{z:1.6}),A('acog','4x ACOG','scope_s',{ads:1.18,mob:.97},{z:3}),A('lpvo','8x LPVO Scope','scope_l',{ads:1.35,mob:.95},{z:6,scope:1})],
  muzzle:[A('none','Flash Hider','none'),A('supp','Suppressor','supp',{q:1,rng:.92}),A('comp','Compensator','comp',{rec:.76}),A('brake','Muzzle Brake','brake',{rec:.82,sp:.95})],
  under:[A('none','None','none'),A('m320','M320 GL','gl',{mob:.93},{gl:1}),A('bipod','Bipod','bipod',{rec:.7,mob:.95}),A('peq','PEQ-15 Laser','laser',{sp:.75})],
  grip:[A('none','None','none'),A('vgrip','Vertical Grip','vgrip',{rec:.84,ads:1.05}),A('agrip','Angled Grip','agrip',{ads:.88}),A('stip','Stippled Grip','wrap',{ads:.93,rec:.95})],
  mag:[A('std','Standard','std'),A('ext','Extended Mag','ext',{mag:1.5,rel:1.12}),A('drum','100-rd Drum','drum',{mag:3,rel:1.55,mob:.9}),A('fast','Dual Mag','fast',{rel:.7})],
  stock:[A('std','Standard Stock','std'),A('light','Lightweight','light',{ads:.86,mob:1.05,rec:1.1}),A('heavy','Heavy Stock','heavy',{rec:.82,ads:1.08})]},
 air:{id:'f35',n:'F-35A Lightning II',t:'jet',model:'jet'},air2:{id:'apache',n:'AH-64 Apache',t:'heli',model:'heli'},enemyAir:{n:'Su-34 strike jet',model:'jet'},bradley:1,
 missions:[
  {n:'Operation Iron Sand',brief:'Take the desert town with the Bradley. Destroy the comms towers, then defeat the T-90M.',time:'day',kill:16,tgt:{n:3,t:'tower',name:'Comms tower'},boss:{t:'tank',n:'T-90M Main Battle Tank',hp:3000},drones:3,air:1},
  {n:'Refinery at Night',brief:'Night raid on the coastal refinery. Kill the SAM sites and bring down the Ka-52 attack helicopter. Apache on standby.',time:'night',kill:16,tgt:{n:3,t:'sam',name:'SAM site'},boss:{t:'heli',n:'Ka-52 Attack Helicopter',hp:2200},drones:4,air:1,heli:1}]},
{id:'future',n:'Futuristic',yr:'2071',foe:'Chinese Sky Dragon Corps (fictional)',foeNote:'Fictional near-future Chinese exo-infantry',
 sky:[[60,80,120],[200,150,140]],fog:[150,130,140],sun:[1,.8,.7],sunI:2.6,hemi:[[150,160,210],[70,60,80]],ground:'concrete',gcol:[120,124,130],amp:2,
 prop:'city',uni:{body:0x2e3238,pants:0x24272c,helm:0x3a3e46,helmT:'visor',skin:0x1e1e22,gear:0x8a1c1c,emit:0x30e0ff},grav:16,
 prim:[W('xr9','XR-9 Pulse Rifle','energy',30,850,40,1.8,.018,.55,90,1,1.04),W('coil','Coilgun DMR','sniper',85,220,12,2.4,.025,1.3,180,0,.95),W('plmg','Plasma LMG','lmg',28,900,120,4.6,.03,.7,85,1,.86),W('flech','Flechette SMG','smg',22,1100,50,1.8,.03,.4,45,1,1.12)],
 sec:[W('arc','Arc Pistol','pistol',34,380,14,1.3,.016,.6,40,0,1.12)],
 lau:[W('rail','RG-2 Railgun','launcher',700,40,3,3.0,.002,3.5,400,0,.88,{proj:'rail'}),W('swarm','Swarm Missile Pod','launcher',300,120,4,3.6,.01,1.5,250,0,.9,{proj:'jav',spd:50,lock:1,multi:1})],
 lethal:[['frag','Plasma Grenade'],['semtex','Mag-Sticky']],tact:[['emp','EMP Grenade'],['smoke','Nano-Smoke']],
 gadgets:[['fpv','FPV Swarm Drone'],['recon','Recon Drone'],['shield','Energy Shield'],['claymore','Mag-Mine']],
 att:{optic:[OPT_IRON,A('holo','Holo-AR Sight','holo',{ads:.92},{z:1.6}),A('smart','Smart-Link 3x','smart',{ads:1.1,sp:.85},{z:3}),A('xray','Thermal 8x','scope_l',{ads:1.3,mob:.95},{z:6,scope:1})],
  muzzle:[A('none','Emitter','none'),A('supp','Field Damper','supp',{q:1,rng:.95}),A('comp','Recoil Stabilizer','comp',{rec:.7}),A('focus','Beam Focuser','brake',{rng:1.3,sp:.9})],
  under:[A('none','None','none'),A('gl','Micro-GL','gl',{mob:.94},{gl:1}),A('laser','Targeting Laser','laser',{sp:.7}),A('stab','Gyro Stabilizer','bipod',{rec:.7})],
  grip:[A('none','None','none'),A('vgrip','Haptic Grip','vgrip',{rec:.82,ads:1.04}),A('agrip','Angled Grip','agrip',{ads:.86})],
  mag:[A('std','Standard Cell','std'),A('ext','Hi-Cap Cell','ext',{mag:1.5,rel:1.1}),A('fast','Quick-Swap Cell','fast',{rel:.6})],
  stock:[A('std','Standard','std'),A('light','Skeleton','light',{ads:.85,mob:1.06,rec:1.1}),A('heavy','Exo-Brace','heavy',{rec:.75,ads:1.1})]},
 air:{id:'vtol',n:'Kestrel VTOL Gunship',t:'heli',model:'vtol'},enemyAir:{n:'Dragonfly strike drone',model:'jet'},
 missions:[
  {n:'Neon Outskirts',brief:'Fight through the arcology outskirts, destroy the drone hubs, then take down the Tianlong mech walker.',time:'dusk',kill:16,tgt:{n:3,t:'hub',name:'Drone hub'},boss:{t:'mech',n:'Tianlong Mech Walker',hp:3000},drones:5,air:1},
  {n:'Skyport Assault',brief:'Storm the skyport, destroy the shield pylons and shoot down the Fenghuang gunship. The VTOL is fuelled.',time:'night',kill:16,tgt:{n:3,t:'pylon',name:'Shield pylon'},boss:{t:'heli',n:'Fenghuang Gunship',hp:2600},drones:5,air:1}]},
{id:'space',n:'Space',yr:'2240',foe:'NULL Fleet (rogue AI)',foeNote:'Rogue AI combat robots and drone swarms',
 sky:[[2,3,8],[10,12,20]],fog:[10,12,18],sun:[1,1,1],sunI:3.6,hemi:[[120,130,160],[40,40,45]],ground:'regolith',gcol:[140,140,138],amp:6,
 prop:'moon',uni:{body:0xb8bcc2,pants:0x8a8e94,helm:0x6a6e74,helmT:'robot',skin:0x3a3e44,gear:0x2a2c30,emit:0xff3020},grav:4,
 prim:[W('laser','LR-7 Laser Rifle','energy',28,700,50,1.8,.012,.3,120,1,1.04),W('gauss','Gauss Rifle','sniper',110,90,6,2.6,.02,2,220,0,.92),W('ion','Ion Repeater','lmg',26,900,150,4.5,.03,.6,90,1,.88),W('scatter','Scatter Blaster','shotgun',14,150,10,2.8,.08,1,25,0,1,{pel:10})],
 sec:[W('ionp','Ion Pistol','pistol',32,400,16,1.3,.014,.5,45,0,1.12)],
 lau:[W('plasma','Plasma Launcher','launcher',520,40,2,3.0,.01,2.5,150,0,.9,{proj:'rocket',spd:50}),W('rail2','Heavy Railgun','launcher',900,30,2,3.4,.002,3.5,500,0,.85,{proj:'rail'})],
 lethal:[['frag','Gravity Grenade'],['semtex','Plasma Sticky']],tact:[['emp','EMP Pulse'],['flash','Photon Flash']],
 gadgets:[['fpv','FPV Hunter Drone'],['recon','Recon Probe'],['shield','Deflector Shield'],['c4','Breach Charge']],
 att:{optic:[OPT_IRON,A('holo','Holo Sight','holo',{ads:.92},{z:1.6}),A('smart','Smart Scope','smart',{ads:1.1,sp:.85},{z:3}),A('quantum','Quantum 10x','scope_l',{ads:1.3,mob:.95},{z:7,scope:1})],
  muzzle:[A('none','Emitter','none'),A('supp','Photon Damper','supp',{q:1}),A('comp','Recoil Nullifier','comp',{rec:.65}),A('focus','Lens Array','brake',{rng:1.35,sp:.9})],
  under:[A('none','None','none'),A('gl','Grav-GL','gl',{mob:.94},{gl:1}),A('laser','Targeting Laser','laser',{sp:.7}),A('stab','Inertial Damper','bipod',{rec:.7})],
  grip:[A('none','None','none'),A('vgrip','Mag-Grip','vgrip',{rec:.82,ads:1.04}),A('agrip','Angled Grip','agrip',{ads:.86})],
  mag:[A('std','Standard Cell','std'),A('ext','Fusion Cell','ext',{mag:1.6,rel:1.1}),A('fast','Hot-Swap Cell','fast',{rel:.6})],
  stock:[A('std','Standard','std'),A('light','Skeleton','light',{ads:.85,mob:1.06,rec:1.1}),A('heavy','Exo-Brace','heavy',{rec:.75,ads:1.1})]},
 air:{id:'star',n:'SF-9 Starfighter',t:'jet',model:'star'},enemyAir:{n:'NULL interceptor',model:'star'},
 missions:[
  {n:'Lunar Relay',brief:'Low gravity on the Moon. Destroy the AI relay masts, then defeat the Sentinel walker.',time:'space',kill:14,tgt:{n:3,t:'relay',name:'AI relay mast'},boss:{t:'mech',n:'Sentinel Walker',hp:3200},drones:5,air:1},
  {n:'Station Kepler',brief:'Retake Kepler Station on the lunar surface. Destroy the reactor nodes, then fly up and destroy the Overmind dreadnought.',time:'space',kill:16,tgt:{n:3,t:'node',name:'Reactor node'},boss:{t:'mother',n:'Overmind Dreadnought',hp:3600},drones:6,air:2,station:1}]}];
ERAS.forEach(e=>{e.lethal=e.lethal.map(([id,n])=>({id,n}));e.tact=e.tact.map(([id,n])=>({id,n}));e.gadgets=e.gadgets.map(([id,n])=>({id,n}));for(const w of[...e.prim,...e.sec])w.att=1});
const ATT_CATS=['optic','muzzle','under','grip','mag','stock'];
const ATT_LABEL={optic:'Optic',muzzle:'Muzzle',under:'Underbarrel',grip:'Grip',mag:'Magazine',stock:'Stock'};
// stats computed from weapon + attachments
function wStats(w,att,era){const s={d:w.d,rof:w.rof,mag:w.mag,rel:w.rel,sp:w.sp,rec:w.rec,rng:w.rng,mob:w.mob,ads:1,z:1.3,scope:0,q:0,gl:0};
 if(w.att&&att)for(const c of ATT_CATS){const a=era.att[c].find(x=>x.id==att[c]);if(!a)continue;for(const k in a.m){if(k=='q'||k=='mel')s[k]=a.m[k];else s[k]*=a.m[k]}if(c=='optic'){s.z=a.z||1.3;s.scope=a.scope||0}if(a.gl)s.gl=1}
 s.mag=Math.max(1,Math.round(s.mag));if(w.c=='launcher'){s.z=w.lock?2.5:1.6;s.scope=w.lock?1:0}return s}
function defaultLoadout(e){return{p:e.prim[0].id,s:e.sec[0].id,l:e.lau[0].id,le:e.lethal[0].id,ta:e.tact[0].id,g:e.gadgets[0].id,armor:1,att:{}}}

const STORY=['Chapter 1 — 1944. Task Force Ironclad, an Allied rifle company, lands in occupied farmland. Their orders: break the Axis line and silence the guns before the armour arrives.',
'Chapter 2 — 1983. The Cold War turns hot in a fictional crisis. Ironclad’s successors hold the Fulda Gap against Warsaw Pact armour and helicopters.',
'Chapter 3 — 2025. A fictional Eastern Coalition (OPFOR) of Russian, Chinese, Iranian, North Korean and CSTO units strikes. Ironclad rolls out in Bradleys.',
'Chapter 4 — 2071. A fictional near-future war against the Chinese Sky Dragon Corps. Exo-suits, railguns and drone swarms.',
'Epilogue — 2240. The war machines outlived the war. A rogue AI fleet called NULL seizes the Moon. Ironclad goes to space.'];
const CAMPAIGN=[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[4,1]];
