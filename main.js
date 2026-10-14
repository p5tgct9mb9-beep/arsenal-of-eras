'use strict';
// Arsenal of Eras - main loop. Flow: title -> era select -> unit select -> level.
const back=()=>jp.has('Escape')||jp.has('Backspace')||jp.has('pad_b')||(TF.state!='assault'&&jp.has('KeyX'));
const prL=()=>jp.has('ArrowLeft')||jp.has('KeyA')||jp.has('pad_left'),prR=()=>jp.has('ArrowRight')||jp.has('KeyD')||jp.has('pad_right');
function drawTitle(){const t=TF.t;TF.era=0;const bg=BBG.ww2;G.drawImage(bg.sky,0,0);for(const c of bg.clouds){c.x-=c.v;if(c.x<-c.c.width)c.x=W;G.drawImage(c.c,c.x|0,c.y|0)}G.drawImage(bg.ground,0,H-152);
 G.fillStyle='rgba(10,14,30,.35)';G.fillRect(0,0,W,H);drawSprite(SPR.tank,330,196,true);drawSprite(SPR.jet,60,170+Math.sin(t*.07)*2,true);
 const run=(t*1.2)%(W+200)-40;for(let i=0;i<5;i++){const u=ROSTERS.ww2[i];drawSprite(SPR['u_'+u.key][1+((t>>2)+i)%4],run-i*40,262,false)}G.drawImage(SPR.logo,0,0)}
function drawMenuBg(){const e=ERAS[TF.state=='era'?TF.menuSel:TF.era],bg=BBG[e.id];G.drawImage(bg.sky,0,0);G.drawImage(bg.ground,0,H-152);G.fillStyle='rgba(8,10,20,.55)';G.fillRect(0,0,W,H)}
function frame(){TF.t++;pollPad();G.setTransform(GBA_K,0,0,GBA_K,0,0);updParts();updParts2();const st=TF.state;
 if(st=='title'){drawTitle();if(conf()){if(tutSeen())TF.state='era';else startTut();fade=15}}
 else if(st=='tut'){updTut();drawTut()}
 else if(st=='era'){drawMenuBg();if(prL())TF.menuSel=(TF.menuSel+4)%5;if(prR())TF.menuSel=(TF.menuSel+1)%5;if(conf()){TF.era=TF.menuSel;TF.state='role';fade=10}else if(back())TF.state='title'}
 else if(st=='unit'){drawMenuBg();if(ERA().id=='mod'&&(pr('up')||pr('down'))){TF.tab=TF.tab?0:1;TF.unitSel=0}const nU=curRoster().length;if(prL())TF.unitSel=(TF.unitSel+nU-1)%nU;if(prR())TF.unitSel=(TF.unitSel+1)%nU;if(conf())startAssault();else if(back())TF.state='role'}
 else if(st=='role'){drawMenuBg();if(prL())TF.roleSel=(TF.roleSel+2)%3;if(prR())TF.roleSel=(TF.roleSel+1)%3;if(conf())roleConfirm();else if(back())TF.state='era'}
 else if(st=='vpick'){drawMenuBg();const n=vList().length;if(prL())TF.vSel=(TF.vSel+n-1)%n;if(prR())TF.vSel=(TF.vSel+1)%n;if(conf())startMode();else if(back())TF.state='role'}
 else if(st=='drive'||st=='air'){if(jp.has('Escape')){TF.state='role';TF.md=null;parts=[];drawMenuBg()}else if(st=='drive'){updDrive();drawDrive()}else{updAir();drawAir()}}
 else if(st=='assault'){if(jp.has('Escape')&&!TF.as.done){TF.state='unit';TF.as=null;parts=[];drawMenuBg()}else{updAssault();drawAssault()}}
 jp.clear();
 let sx=0,sy=0;if(shake>0){sx=(R()-.5)*shake*S;sy=(R()-.5)*shake*S;shake*=.85;if(shake<.3)shake=0}
 X.imageSmoothingEnabled=false;X.fillStyle='#000';X.fillRect(0,0,1920,1080);X.drawImage(L,Math.round(sx/3)*3,Math.round(sy/3)*3,1920,1080);
 if(fade>0){X.fillStyle=`rgba(0,0,0,${fade/20})`;X.fillRect(0,0,1920,1080);fade--}
 drawHUD();if(TF.state=='role')drawRoleSelect();if(TF.state=='vpick')drawVPick();if(TF.state=='drive')drawDriveHUD();if(TF.state=='air')drawAirHUD();if(TF.state=='tut')drawTutHUD();requestAnimationFrame(frame)}
function init(){const mk=pb=>({c:pb.canvas(),w:pb.canvas(true)}),mkB=pb=>{rimLight(pb,[220,236,255],.28);return mk(pb)};
 // vehicles: bosses (tank,t62,mbt,mech), hazards (jet), air-strike flybys (p47,f4,apache,hover)
 SPR.tank=mk(mkTigerHD());SPR.abrams=mk(mkAbramsHD());SPR.f22=mk(mkF22HD());SPR.f15=mk(mkF15HD());SPR.p47=mk(mkP47());SPR.jet=mk(mkMe262());SPR.f4=mk(mkF4());SPR.t62=mk(mkT62HD());SPR.apache=mk(mkApache());SPR.mbt=mk(mkT90HD());SPR.hover=mk(mkHover());SPR.mech=mkB(mkMech());SPR.orbital=mkB(mkOrbital());SPR.lander=mk(mkLander());
 SPR.logo=mkLogo();buildModeArt(mk);buildModeArt2(mk);buildRealArt(mk);buildAceArt(mk);SPR.chute=mk(mkChute());
 for(const id in ROSTERS)for(const u of ROSTERS[id])SPR['u_'+u.key]=[0,1,2,3,4,5,6].map(f=>mk(mkTrooperE(u,f)));
 for(const id in LTH){SPR['bot_'+id]=[0,1].map(f=>mk(mkBot(LTH[id].bot,f)));SPR['drone_'+id]=[0,1].map(f=>mk(mkDrone(LTH[id].bot,f)))}
 for(const e of ERAS)BBG[e.id]=buildBB(e);TF.sheet=makeSheet;TF.unitSheet=makeUnitSheet;TF.styleSheet=()=>makeStyleSheet().toDataURL('image/png');TF.modeSheet=makeModeSheet;buildRealArt2(mk);gbaPass();TF.ready=true;requestAnimationFrame(frame)}
init();

function makeSheet(){const c=document.createElement('canvas');c.width=1920;c.height=1500;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#1a1c26';g.fillRect(0,0,1920,1500);
 const lab=(s,x,y)=>glyphs(g,s,x,y,3,'#ffe060');lab('ARSENAL OF ERAS - HD SPRITE SHEET (SOLDIERS 3X, VEHICLES 2X)',40,24);
 ROSTERS.mod.forEach((u,r)=>{lab(u.name+'  IDLE/RUN x4/JUMP/SHOOT',40,80+r*240);for(let f=0;f<7;f++)g.drawImage(SPR['u_'+u.key][f].c,40+f*110,110+r*240,96,144)});
 const bs=[['tank','TIGER I'],['t62','T-62'],['mbt','T-90-TYPE'],['mech','PLA WAR-MECH'],['orbital','ORBITAL LASER PLATFORM'],['jet','ME 262'],['p47','P-47'],['f4','F-4'],['apache','AH-64'],['hover','HOVER TANK'],['lander','LANDER']];
 let x=880,y=70,rowH=0;for(const[k,n]of bs){const s=SPR[k].c,w=s.width*2,h=s.height*2;if(x+w>1910){x=880;y+=rowH+46;rowH=0}lab(n,x,y);g.drawImage(s,x,y+28,w,h);x+=w+24;rowH=Math.max(rowH,h)}
 return c.toDataURL('image/png')}

function makeUnitSheet(){const c=document.createElement('canvas');c.width=1920;c.height=1600;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#1a1c26';g.fillRect(0,0,1920,1600);
 glyphs(g,'ARSENAL OF ERAS - UNIT ROSTERS (29 UNITS, 32X48, IDLE / RUN / JUMP / SHOOT, 2X)',30,16,3,'#ffe060');
 [...ERAS,{id:'ua',name:'MODERN - UKRAINE'}].forEach((e,r)=>{const y=60+r*256;glyphs(g,e.name,30,y,3,'#9cf');ROSTERS[e.id].forEach((u,i)=>{const x=30+i*378;glyphs(g,u.name,x,y+26,2,'#fff');glyphs(g,u.ab,x,y+44,2,'#ffb080');
  [0,1,3,5,6].forEach((f,k)=>g.drawImage(SPR['u_'+u.key][f].c,x+k*70,y+64,64,96))})});return c.toDataURL('image/png')}

function makeModeSheet(){const c=document.createElement('canvas');c.width=1920;c.height=1180;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#1a1c26';g.fillRect(0,0,1920,1180);
 glyphs(g,'ARSENAL OF ERAS - ROLE MODE VEHICLES (2X)',30,16,3,'#ffe060');let x=30,y=70,rh=0;
 const all=[...Object.values(PV).flat(),...Object.values(PA).flat(),...['zero','me262s','mig21','hind','su57','shahed','j20','swarm','fdrone','aiF','aiB','me264','hindB','j20B','carrier'].map(k=>({k,name:k.toUpperCase()}))];
 for(const v of all){const s=SPR[v.k].c,w=s.width*2,h=s.height*2;if(x+w>1900){x=30;y+=rh+44;rh=0}glyphs(g,v.name,x,y,2,'#fff');g.drawImage(s,x,y+20,w,h);x+=w+30;rh=Math.max(rh,h)}return c.toDataURL('image/png')}
