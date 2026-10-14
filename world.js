'use strict';
// Arsenal of Eras - era config, menus, HUD (side-scrolling Assault build). Campaign/battle code archived in archive/.
const ERAS=[
 {id:'ww2',name:'WORLD WAR II',years:'1939–1945',flyby:'p47',hazard:'jet',bb:{top:[70,120,190],bot:[200,214,220],hill:[110,140,150],gr:[[86,120,58],[60,90,44]],clouds:1},
  faction:'AXIS POWERS',boss:{spr:'tank',name:'TIGER I HEAVY TANK',hp:30,m:[282,34],atk:'shell',dy:10}},
 {id:'cold',name:'COLD WAR',years:'1962–1985',flyby:'f4',bb:{top:[120,134,150],bot:[214,218,222],hill:[160,170,184],gr:[[230,236,242],[200,210,222]],clouds:1},
  faction:'WARSAW PACT',boss:{spr:'t62',name:'T-62 MAIN BATTLE TANK',hp:34,m:[282,43],atk:'shell',dy:10}},
 {id:'mod',name:'MODERN',years:'2003–2030',flyby:'f22',setpiece:'abrams',bb:{top:[60,60,110],bot:[250,170,100],hill:[150,100,90],gr:[[214,176,120],[180,140,94]],clouds:0},
  faction:'RUSSIA · CHINA · IRAN · DPRK',boss:{spr:'mbt',name:'T-90-TYPE MAIN BATTLE TANK',hp:38,m:[282,43],atk:'missile',dy:10}},
 {id:'fut',name:'FUTURISTIC',years:'2089+',flyby:'hover',bb:{top:[14,8,40],bot:[90,40,120],hill:[50,30,80],gr:[[40,30,70],[24,20,46]],clouds:0,stars:1,neon:1},
  faction:'FUTURE PLA',boss:{spr:'mech',name:'PLA WAR-MECH (fictional)',hp:44,m:[168,67],atk:'laser',dy:2}},
 {id:'space',name:'SPACE',years:'2140 · Lunar Front',flyby:'lander',faction:'ROGUE AI FLEET',bb:{top:[2,2,12],bot:[20,18,40],hill:[90,90,100],gr:[[150,150,158],[110,110,120]],clouds:0,stars:1},
  boss:{spr:'orbital',name:'ORBITAL LASER PLATFORM',hp:48,m:[12,65],atk:'laser',dy:-36}}];
const ERA=()=>ERAS[TF.era];
const TF=window.TF={state:'title',era:0,menuSel:0,unitSel:0,t:0,as:null};
const waiters=[];
const BBG={};
function buildBB(e){const b=e.bb;let pb=new PB(W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix(b.top,b.bot,y/H);if(b.stars&&hash(x,y)>.996)c=[255,255,255];pb.set(x,y,lit(c,1,x,y))}const sky=pb.canvas();
 pb=new PB(W,152);for(let y=0;y<152;y++)for(let x=0;x<W;x++){const hill=40+fbm(x*.01,0)*40,hill2=75+fbm(x*.02,5)*26;let c=null;
  if(y>hill2){c=mix(b.gr[0],b.gr[1],fbm(x*.08,y*.08));if(b.neon&&((x+((y-hill2)*2|0))%24==0||(y|0)%10==0))c=[160,60,220];c=lit(c,1.05-(y-hill2)*.004,x,y)}
  else if(y>hill){c=lit(b.hill,1-(y-hill)*.01,x,y);if(b.neon&&hash(x>>2,y>>2)>.9)c=[255,200,90]}if(c)pb.set(x,y,c)}
 const clouds=[];if(b.clouds)for(let k=0;k<6;k++){const w=60+AR()*80|0,h=20+AR()*14|0;const q=new PB(w,h);for(let a=0;a<6;a++)q.ell(w*(.2+a*.12),h*.6+(AR()-.5)*4,w*.18,h*.4,(i,j,dx,dy)=>lit(mix([250,250,250],b.bot,.2),1.08-.25*dy,i,j));clouds.push({c:q.canvas(),x:AR()*W,y:10+AR()*120,v:.1+AR()*.25})}
 return{sky,ground:pb.canvas(),clouds}}
// ---------- particles (extra kinds) ----------
function drawParts2(){G.globalCompositeOperation='lighter';for(const p of parts){if(p.k!='flash'&&p.k!='boom'&&p.k!='beam'&&p.k!='fire')continue;const f=p.t/p.life,r=(p.k=='boom'?40*p.s:p.k=='flash'?18*p.s:p.k=='fire'?6:30)*(1-f*.5),x=p.k=='beam'?p.x2:p.x,y=p.k=='beam'?p.y2:p.y;
  const g=G.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,200,120,${.55*(1-f)})`);g.addColorStop(1,'rgba(255,120,40,0)');G.fillStyle=g;G.fillRect(x-r,y-r,r*2,r*2)}G.globalCompositeOperation='source-over';
 for(const p of parts){const f=p.t/p.life;
 if(p.k=='beam'){G.strokeStyle=p.c;G.globalAlpha=1-f;G.lineWidth=p.w*(1-f*.5);G.beginPath();G.moveTo(p.x|0,p.y|0);G.lineTo(p.x2|0,p.y2|0);G.stroke();G.strokeStyle='#fff';G.lineWidth=1;G.stroke();G.globalAlpha=1}
 else if(p.k=='drone'){G.fillStyle='#333';G.fillRect(p.x-5|0,p.y-1|0,10,3);G.fillStyle='#999';G.fillRect(p.x-7|0,p.y-3|0,5,1);G.fillRect(p.x+2|0,p.y-3|0,5,1);G.fillStyle='#f44';G.fillRect(p.x|0,p.y+1|0,1,1)}
 else if(p.k=='missile'){G.fillStyle='#e0e0d8';G.fillRect(p.x-6|0,p.y-1|0,9,3);G.fillStyle='#c03020';G.fillRect(p.x+2|0,p.y-1|0,2,3);G.fillStyle=p.t%2?'#fff0a0':'#ff8030';G.fillRect(p.x-10|0,p.y-1|0,4,3)}
 else if(p.k=='heal'){G.fillStyle='#60ff80';G.fillRect(p.x-1|0,p.y-3|0,3,7);G.fillRect(p.x-3|0,p.y-1|0,7,3)}}}
function updParts2(){for(const p of parts){if((p.k=='missile'||p.k=='drone')&&p.t%2==0)spawn({k:'smoke',x:p.x,y:p.y,vy:-.1,r:2,life:26});
 if((p.k=='missile'||p.k=='drone'||p.k=='beam')&&p.t>=p.life-1&&p.onHit&&!p.done){p.done=1;p.onHit(p)}}}
function drawSprite(s,x,y,flip,white){const c=white?s.w:s.c;if(flip){G.save();G.translate(x+c.width|0,y|0);G.scale(-1,1);G.drawImage(c,0,0);G.restore()}else G.drawImage(c,x|0,y|0)}
function drawProp(x,y,t){G.fillStyle='rgba(60,60,60,.25)';G.fillRect(x-1,y-36,4,72);G.fillStyle='#2a2a26';
 for(let k=0;k<4;k++){const a=t*.9+k*Math.PI/2,ey=Math.sin(a)*34;if(Math.cos(a)<-.2)continue;const y0=Math.min(0,ey),h=Math.abs(ey)|0;G.fillRect(x,y+y0|0,3,h);G.fillStyle='#d8c040';G.fillRect(x,(ey<0?y+ey:y+ey-3)|0,3,3);G.fillStyle='#2a2a26'}}
function big(c,x,y,s){X.imageSmoothingEnabled=false;X.drawImage(c,x,y,c.width*s,c.height*s)}
function curRoster(){return ERA().id=='mod'&&TF.tab==1?ROSTERS.ua:ROSTERS[ERA().id]}
function drawUnitSelect(){txt('SELECT UNIT · '+ERA().name,960,120,60,'#ffe060','center');if(ERA().id=='mod'){['US','UKRAINE'].forEach((t,i)=>{tag((TF.tab==i?'> ':'')+t+' (UP/DN)',700+i*300,140,TF.tab==i?(i?'#0057b7':'#a84a20'):'#333')})}const RR=curRoster();RR.forEach((u,i)=>{const x=960-RR.length*185+15+i*370,y=190,sel=TF.unitSel==i;panel(x,y,340,640,sel?.95:.72);
 if(sel){X.strokeStyle='#ffe060';X.lineWidth=8;X.beginPath();X.roundRect(x-6,y-6,352,652,22);X.stroke()}
 const s=SPR['u_'+u.key][sel?1+(TF.t>>3)%4:0].c;big(s,x+74,y+14,6);txt(u.name.length>17?u.name.replace('COMBAT ','C. '):u.name,x+170,y+300,u.name.length>15?24:28,sel?'#ffe060':'#fff','center');txt(u.branch,x+170,y+340,22,'#9cf','center');
 tag(u.ab,x+20,y+380,'#a84a20');const words=u.desc.split(' ');let line='',ly=y+470;for(const w of words){if((line+w).length>22){txt(line,x+25,ly,22,'#cde');ly+=34;line=''}line+=w+' '}txt(line,x+25,ly,22,'#cde')});
 txt('◀ ▶ choose · Enter deploy · ESC/X back     In level: ←→ run · Z/Space/A jump · X/B fire · C/Y ability',960,900,26,'#cde','center')}
function drawEraSelect(){txt('SELECT ERA',960,130,72,'#ffe060','center');ERAS.forEach((e,i)=>{const x=40+i*372,y=220,sel=TF.menuSel==i;
 X.save();if(sel){X.shadowColor='#ffd060';X.shadowBlur=40}panel(x,y,350,560,sel?.95:.75);X.restore();if(sel){X.strokeStyle='#ffe060';X.lineWidth=8;X.beginPath();X.roundRect(x-6,y-6,362,572,22);X.stroke()}
 const bg=BBG[e.id];X.drawImage(bg.sky,0,40,W,160,x+15,y+20,320,200);X.drawImage(bg.ground,0,0,W,152,x+15,y+120,320,100);
 const s=SPR[e.boss.spr];X.save();const k=e.boss.spr=='mech'?1.1:e.boss.spr=='orbital'?1.5:1.1;X.translate(x+335,y+(e.boss.spr=='mech'?36:70));X.scale(-k,k);X.imageSmoothingEnabled=false;X.drawImage(s.c,0,0);X.restore();
 txt(e.name,x+175,y+290,36,sel?'#ffe060':'#fff','center');txt(e.years,x+175,y+336,26,'#9cf','center');txt('vs '+e.faction,x+175,y+380,e.faction.length>20?18:22,'#ff9a80','center');txt('BOSS:',x+175,y+430,22,'#888','center');
 const n=e.boss.name;const sp=n.lastIndexOf(' ',18);txt(n.length>20?n.slice(0,sp):n,x+175,y+466,22,'#ffb080','center');if(n.length>20)txt(n.slice(sp+1),x+175,y+496,22,'#ffb080','center')});
 txt('◀ ▶ choose · Enter confirm',960,900,34,'#cde','center')}
function drawHUD(){if(TF.state=='title'){if(TF.t%60<38)txt('PRESS START',960,880,56,'#ffe060','center');txt('Side-scrolling action across the eras · Enter/Z/A to start',960,960,28,'#cde','center');txt('HD PREVIEW BUILD 3 · 1920×1080',1880,1060,22,'#9ab','right')}
 if(TF.state=='era')drawEraSelect();if(TF.state=='unit')drawUnitSelect();if(TF.state=='assault')drawAssaultHUD()}
