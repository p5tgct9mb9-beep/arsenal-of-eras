'use strict';
const hexRGB=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d',{willReadFrequently:true});return c};
function toPix(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height);return{w:c.width,h:c.height,d:new Uint32Array(d.data.buffer.slice(0)),c}}
function shade(hex,f){const[r,g,b]=hexRGB(hex);const k=v=>Math.max(0,Math.min(255,Math.round(v*f)));return`rgb(${k(r)},${k(g)},${k(b)})`}
function rng(s){s=s>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function outline(c,col='#0b0b12'){const g=c.getContext('2d'),w=c.width,h=c.height,d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);const[r,gg,b]=hexRGB(col);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3]>40)continue;const n=(xx,yy)=>xx>=0&&yy>=0&&xx<w&&yy<h&&a[(yy*w+xx)*4+3]>40;
  if(n(x-1,y)||n(x+1,y)||n(x,y-1)||n(x,y+1)){o[i]=r;o[i+1]=gg;o[i+2]=b;o[i+3]=255}else if(a[i+3]>0)o[i+3]=0}
 g.putImageData(new ImageData(o,w,h),0,0);return c}
function poly(g,col,pts){g.fillStyle=col;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(p[0],p[1]);g.closePath();g.fill()}
function noise(g,r,a,n=140,w=32,h=32){for(let i=0;i<n;i++){g.fillStyle=r()<.5?`rgba(0,0,0,${a})`:`rgba(255,255,255,${a})`;g.fillRect(r()*w|0,r()*h|0,1,1)}}
// ---------- wall textures 32x32
const TEXP={
 brick(g,b,r){g.fillStyle=shade(b,.45);g.fillRect(0,0,32,32);for(let row=0;row<4;row++){const off=row%2?8:0;for(let k=-1;k<2;k++){const x=k*16+off,y=row*8,f=.85+r()*.3;g.fillStyle=shade(b,f);g.fillRect(x+1,y+1,15,7);g.fillStyle=shade(b,f*1.2);g.fillRect(x+1,y+1,15,1);g.fillStyle=shade(b,f*.75);g.fillRect(x+1,y+7,15,1)}}},
 blocks(g,b,r){g.fillStyle=shade(b,.5);g.fillRect(0,0,32,32);for(let row=0;row<2;row++)for(let k=-1;k<2;k++){const x=k*16+(row?8:0),y=row*16,f=.85+r()*.3;g.fillStyle=shade(b,f);g.fillRect(x+1,y+1,15,15);g.fillStyle=shade(b,f*1.25);g.fillRect(x+1,y+1,15,2);g.fillRect(x+1,y+1,2,15);g.fillStyle=shade(b,f*.7);g.fillRect(x+1,y+14,15,2)}},
 planks(g,b,r){for(let k=0;k<4;k++){const f=.85+r()*.3;g.fillStyle=shade(b,f);g.fillRect(k*8,0,8,32);g.fillStyle=shade(b,f*.8);for(let i=0;i<3;i++)g.fillRect(k*8+2+(r()*4|0),r()*28|0,1,4+(r()*6|0));g.fillStyle=shade(b,.4);g.fillRect(k*8+7,0,1,32);g.fillStyle='#222';g.fillRect(k*8+3,3,1,1);g.fillRect(k*8+3,28,1,1)}g.fillStyle=shade(b,.55);g.fillRect(0,14,32,3)},
 concrete(g,b,r){g.fillStyle=b;g.fillRect(0,0,32,32);noise(g,r,.12,260);g.fillStyle=shade(b,.6);g.fillRect(0,15,32,1);g.fillRect(0,0,1,32);g.fillStyle=shade(b,1.15);g.fillRect(0,16,32,1);g.fillRect(1,0,1,32);g.fillStyle=shade(b,.5);for(const[x,y]of[[4,4],[27,4],[4,20],[27,20]])g.fillRect(x,y,2,2);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(8+(r()*12|0),17,3,15)},
 stucco(g,b,r){g.fillStyle=b;g.fillRect(0,0,32,32);noise(g,r,.1,300);g.fillStyle=shade(b,.75);for(let i=0;i<3;i++)g.fillRect(r()*28|0,r()*28|0,3+(r()*4|0),1);g.fillStyle=shade(b,.6);g.fillRect(0,28,32,4);g.fillStyle=shade(b,1.12);g.fillRect(0,28,32,1)},
 metal(g,b,r){for(let x=0;x<32;x++){const p=x%6;g.fillStyle=shade(b,p<2?1.2:p<4?1:.7);g.fillRect(x,0,1,32)}noise(g,r,.1,120);g.fillStyle=shade(b,.5);g.fillRect(0,0,32,2);g.fillRect(0,30,32,2);g.fillStyle='rgba(120,60,30,.35)';g.fillRect(r()*24|0,20,6,10)},
 sand(g,b,r){g.fillStyle=shade(b,.45);g.fillRect(0,0,32,32);for(let row=0;row<5;row++){const off=row%2?5:0;for(let k=-1;k<4;k++){const x=k*10+off,y=row*6+1,f=.85+r()*.25;g.fillStyle=shade(b,f);g.fillRect(x+1,y,9,5);g.fillStyle=shade(b,f*1.2);g.fillRect(x+2,y,7,1);g.fillStyle=shade(b,f*.7);g.fillRect(x+1,y+4,9,1)}}}
};
function texDoor(stripe,base){const c=mk(32,32),g=c.getContext('2d'),r=rng(7);g.fillStyle=shade(base,.5);g.fillRect(0,0,32,32);g.fillStyle=base;g.fillRect(2,1,28,31);noise(g,r,.08);
 g.fillStyle=shade(base,1.25);g.fillRect(2,1,28,1);g.fillStyle=shade(base,.65);g.fillRect(15,1,2,31);for(let y=4;y<32;y+=7){g.fillStyle='#222';g.fillRect(4,y,1,1);g.fillRect(27,y,1,1)}
 if(stripe){g.fillStyle=stripe;g.fillRect(2,5,28,4);g.fillRect(2,23,28,4);g.fillStyle='#fff';g.fillRect(13,13,6,6);g.fillStyle=stripe;g.fillRect(14,14,4,4)}else{g.fillStyle='#d8c060';g.fillRect(10,16,4,2)}return c}
function texExit(lit){const c=mk(32,32),g=c.getContext('2d'),r=rng(9);TEXP.concrete(g,'#6a6e70',r);g.fillStyle='#1a1c22';g.fillRect(3,6,26,20);g.fillStyle=lit?'#2a4a2a':'#3a1a1a';g.fillRect(4,7,24,9);
 glyphs(g,'EXIT',4,8,1,lit?'#7cff7c':'#ff6a5a');g.fillStyle='#888';g.fillRect(14,18,4,7);g.fillStyle=lit?'#7cff7c':'#ff5040';g.fillRect(13,lit?17:22,6,3);return c}
// ---------- soldier sprites 44x44, feet at (22,43)
function drawSoldier(o,fr){const c=mk(44,44),g=c.getContext('2d');const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 g.save();if(fr==5){g.translate(22,43);g.rotate(-.7);g.translate(0,0)}else if(fr==6){g.translate(38,38);g.rotate(-Math.PI/2)}else g.translate(22,43);
 const u=o.uni,ud=shade(o.uni,.7),ul=shade(o.uni,1.2),l=fr==1?2:fr==2?-2:0;
 R(-5+(l>0?-1:0),-15,4,13-(l<0?2:0),ud);R(1+(l<0?1:0),-15,4,13-(l>0?2:0),ud);R(-6+(l>0?-1:0),-3-(l<0?2:0),5,3,'#1e1a16');R(1+(l<0?1:0),-3-(l>0?2:0),5,3,'#1e1a16');
 if(o.coat){R(-7,-28,14,18,u);R(-7,-28,3,18,ul)}else{R(-6,-28,12,14,u);R(-6,-28,3,14,ul)}R(3,-28,3,14,ud);R(-6,-16,12,2,o.belt||'#3a2e1e');
 if(o.vest){R(-5,-27,10,9,o.vest);R(-4,-26,3,3,shade(o.vest,1.3));R(1,-26,3,3,shade(o.vest,1.3))}
 if(o.camo){const rr=rng(o.camo);g.fillStyle=shade(o.uni,.55);for(let i=0;i<14;i++)g.fillRect(-6+(rr()*12|0),-28+(rr()*26|0),2,2)}
 R(-3,-34,6,6,o.skin||'#d0a07a');R(-2,-32,1,1,'#222');R(1,-32,1,1,'#222');if(o.mask)R(-3,-31,6,3,o.mask);
 if(o.hat=='helm'){R(-5,-38,10,5,o.helm);R(-6,-34,12,2,o.helm);R(-4,-38,4,1,shade(o.helm,1.3))}
 else if(o.hat=='cap'){R(-4,-37,8,3,o.helm);R(-5,-35,10,1,'#222');R(-5,-38,10,1,o.helm)}
 else if(o.hat=='modern'){R(-5,-38,10,5,o.helm);R(-5,-34,1,2,o.helm);R(4,-34,1,2,o.helm);R(-3,-38,6,2,'#222')}
 else if(o.hat=='ushanka'){R(-5,-38,10,5,o.helm);R(-6,-35,2,5,o.helm);R(4,-35,2,5,o.helm)}
 const gc='#2a2420';
 if(fr==3){R(-8,-26,3,8,u);R(5,-26,3,8,u);R(-4,-24,8,5,gc);R(-1,-23,2,3,'#555');R(-2,-24,4,1,'#888');g.fillStyle='#ffe070';g.beginPath();g.arc(0,-22,4,0,7);g.fill();R(-1,-23,2,2,'#fff')}
 else{R(-8,-27,3,11,u);R(5,-27,3,11,u);R(-9,-21,18,2,gc);R(6,-22,4,3,gc);R(-9,-20,4,1,'#555')}
 g.restore();return outline(c)}
function mkSoldierSet(o){return[0,1,2,3,4,5,6].map(f=>toPix(drawSoldier(o,f)))}
// ---------- turret, vehicles, bosses
function drawTurret(era,fire,dead){const c=mk(40,32),g=c.getContext('2d'),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 if(era=='mod'){R(8,20,24,11,dead?'#333':'#5a5e52');R(12,10,16,10,dead?'#2a2a2a':'#6a6e60');R(13,11,6,4,'#1a2a3a');R(18,14,4,4,'#222');R(19,15,2,2,'#555')}
 else{for(let i=0;i<4;i++){R(2+i*9,22,9,5,shade('#a08e64',i%2?.9:1.05));R(6+i*8-4,27,9,5,shade('#a08e64',i%2?1:.85))}R(14,12,12,10,dead?'#333':'#3a3c3a');R(16,8,8,5,shade(era=='ww2'?'#555a58':'#4e5a3a',dead?.5:1));R(18,15,4,4,'#111');R(19,16,2,2,'#666')}
 if(fire){g.fillStyle='#ffe070';g.beginPath();g.arc(20,17,6,0,7);g.fill();R(19,16,2,2,'#fff')}if(dead){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,40,32)}return outline(c)}
function drawVehicle(era,fire,dead){const c=mk(56,40),g=c.getContext('2d'),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};const b=dead?'#3a3a3a':era=='ww2'?'#6a6e66':era=='cold'?'#56603e':'#8a7a56';
 R(6,30,10,9,'#1a1a1a');R(40,30,10,9,'#1a1a1a');R(4,16,48,16,b);R(4,16,48,2,shade(b,1.3));R(8,20,40,4,shade(b,.75));R(10,24,8,4,'#d8d0a0');R(38,24,8,4,'#d8d0a0');
 if(era=='ww2'){R(14,8,28,9,shade(b,.85));R(24,2,8,7,dead?'#333':'#555a58');R(26,4,4,3,'#d0a07a');R(27,9,2,6,'#222')}
 else if(era=='cold'){poly(g,shade(b,.9),[[10,16],[18,8],[38,8],[46,16]]);R(22,3,12,6,shade(b,1.1));R(27,7,2,8,'#222')}
 else{R(12,8,32,9,shade(b,.9));R(20,1,16,8,shade(b,1.1));R(27,5,2,10,'#222');R(14,10,6,3,'#1a2a3a')}
 if(fire){g.fillStyle='#ffe070';g.beginPath();g.arc(28,15,6,0,7);g.fill();R(27,14,2,2,'#fff')}if(dead){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,56,40)}return outline(c)}
function drawBoss(kind,fire,dead){let c,g,R;const S=(w,h)=>{c=mk(w,h);g=c.getContext('2d');R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)}};
 if(kind=='hind'){S(84,48);const b=dead?'#333':'#5a6a48',b2=shade(b,.75);R(0,4,84,2,'#222');R(40,2,4,8,'#333');poly(g,b,[[26,14],[58,14],[64,30],[52,40],[32,40],[20,30]]);R(30,16,24,9,'#9ac0d0');R(31,17,10,3,'#e0f0f8');R(42,16,1,9,b2);
  poly(g,b2,[[8,26],[26,24],[26,30],[8,32]]);poly(g,b2,[[76,26],[58,24],[58,30],[76,32]]);for(const x of[8,14,64,70]){R(x,30,6,6,'#3a3a3a');g.fillStyle='#111';g.beginPath();g.arc(x+3,33,2,0,7);g.fill()}
  R(38,38,8,6,'#2a2a2a');R(40,43,4,3,'#111');R(30,40,24,2,shade(b,1.2));if(fire){g.fillStyle='#ffe070';g.beginPath();g.arc(42,45,5,0,7);g.fill()}}
 else{S(72,48);const t=kind=='tiger',b=dead?'#3a3a3a':t?'#6e7270':'#5e6a44',b2=shade(b,.72),b3=shade(b,1.25);
  R(2,30,68,16,'#262626');for(let i=0;i<6;i++){R(4+i*11,34,9,9,'#444');R(6+i*11,36,5,5,'#666')}R(4,22,64,12,b);R(4,22,64,2,b3);R(8,26,56,4,b2);
  if(t){R(16,8,40,15,b);R(16,8,40,2,b3);R(20,12,8,6,b2);R(48,12,4,4,'#222')}else{poly(g,b,[[14,22],[20,8],[52,8],[58,22]]);for(let i=0;i<6;i++)R(16+i*7,16,6,5,shade(b,i%2?.85:1.1));R(44,4,8,5,'#3a3a3a')}
  g.fillStyle='#1a1a1a';g.beginPath();g.arc(36,17,6,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(36,17,3,0,7);g.fill();R(22,24,4,3,'#d8d0a0');R(46,24,4,3,'#d8d0a0');
  if(fire){g.fillStyle='#ffe070';g.beginPath();g.arc(36,17,8,0,7);g.fill();R(34,15,4,4,'#fff')}}
 if(dead){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,c.width,c.height)}return outline(c)}
// ---------- pickups / fx
function drawPick(k){const c=mk(18,18),g=c.getContext('2d'),R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 if(k=='hp'){R(2,5,14,11,'#e8e8e0');R(2,5,14,2,'#fff');R(7,7,4,8,'#2ab04a');R(5,9,8,4,'#2ab04a')}
 else if(k=='ammo'){R(2,7,14,9,'#5a6a3a');R(2,7,14,2,'#7a8a4a');R(4,3,2,5,'#d8a840');R(8,3,2,5,'#d8a840');R(12,3,2,5,'#d8a840');R(6,11,6,2,'#e8e0a0')}
 else if(k=='armor'){poly(g,'#4a5a7a',[[3,3],[7,3],[9,6],[11,3],[15,3],[15,16],[3,16]]);R(5,9,8,2,'#6a7a9a')}
 else if(k=='keyR'||k=='keyB'){const col=k=='keyR'?'#e84040':'#4a7ae8';R(3,5,12,9,col);R(3,5,12,2,'#fff');R(5,9,4,3,'#ffd84a');R(11,9,2,3,'#222')}
 else if(k=='gren'){g.fillStyle='#4a5a32';g.beginPath();g.arc(9,11,5,0,7);g.fill();R(7,3,4,4,'#888');R(11,4,3,1,'#ccc')}
 return toPix(outline(c))}
function drawFx(k,i){const c=mk(32,32),g=c.getContext('2d');
 if(k=='boom'){const r=6+i*4,cols=['#fff8c0','#ffd040','#ff8020','#a03010'];for(let j=0;j<4;j++){g.fillStyle=cols[Math.min(3,j+(i>>1))];g.beginPath();g.arc(16,18-i,Math.max(1,r-j*3),0,7);g.fill()}if(i>2){g.fillStyle='rgba(60,60,60,.9)';g.beginPath();g.arc(14,10,6,0,7);g.arc(20,12,5,0,7);g.fill()}}
 else if(k=='puff'){g.fillStyle=i?'#a89a80':'#ffe080';g.beginPath();g.arc(16,26,2+i*2,0,7);g.fill()}
 else if(k=='smoke'){const r=rng(3+i);g.fillStyle='rgba(200,200,200,.85)';for(let j=0;j<6;j++){g.beginPath();g.arc(8+r()*16,10+r()*16,7+r()*4,0,7);g.fill()}}
 else if(k=='shell'){g.fillStyle='#ff9020';g.beginPath();g.arc(16,16,4,0,7);g.fill();g.fillStyle='#fff8c0';g.fillRect(15,15,2,2)}
 else if(k=='nade'){g.fillStyle='#3a4a2a';g.beginPath();g.arc(16,26,3,0,7);g.fill()}
 return toPix(k=='smoke'?c:outline(c))}
// ---------- era art bundle
function makeEraArt(era){const r=rng(era.id.length*99);const tex=[null];
 for(const[k,b]of era.walls){const c=mk(32,32);TEXP[k](c.getContext('2d'),b,r);tex.push(toPix(c))}
 const db=era.id=='mod'?'#6a7078':'#5a6058';tex.push(toPix(texDoor(null,db)),toPix(texDoor('#d83a3a',db)),toPix(texDoor('#3a6ad8',db)),toPix(texExit(false)),toPix(texExit(true)));
 const id=era.id;let sold,off;
 if(id=='ww2'){sold={uni:era.uni,helm:era.helm,hat:'helm'};off={uni:era.oUni,helm:'#3e4240',hat:'cap',coat:1}}
 else if(id=='cold'){sold={uni:era.uni,helm:era.helm,hat:'helm'};off={uni:era.oUni,helm:'#4a4a36',hat:'ushanka',coat:1}}
 else{sold={uni:era.uni,helm:era.helm,hat:'modern',vest:'#4a4c38',camo:5,mask:'#2a2a2a'};off={uni:era.oUni,helm:'#2e302a',hat:'modern',vest:'#2a2c26',coat:1,mask:'#1a1a1a'}}
 const fx={};for(const k of['boom','puff','smoke','shell','nade'])fx[k]=[0,1,2,3,4].map(i=>drawFx(k,i));
 return{tex,soldier:mkSoldierSet(sold),officer:mkSoldierSet(off),
  turret:[0,1,2].map(i=>toPix(drawTurret(id,i==1,i==2))),vehicle:[0,1,2].map(i=>toPix(drawVehicle(id,i==1,i==2))),boss:[0,1,2].map(i=>toPix(drawBoss(era.boss,i==1,i==2))),
  pick:Object.fromEntries(['hp','ammo','armor','keyR','keyB','gren'].map(k=>[k,drawPick(k)])),fx}}
// ---------- weapon profile (points right). returns {c,mx,my}
const gunCache={};
function drawGun(wid,att,hands,glove){att=att||{};const key=wid+JSON.stringify(att)+hands+glove;if(gunCache[key])return gunCache[key];
 const w=WPN[wid],p=w.p,c=mk(170,64),g=c.getContext('2d'),R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,ww|0,hh|0)};
 const A=s=>att[s]||ATT[s][0].id,ox=8,oy=24,dk='#1e1f22';let mx,my;
 const hl=(x,y,ww,col)=>R(x,y,ww,1,shade(col,1.45));
 if(p.pistol){const sx=ox+46,fr=p.frame||p.body;
  R(sx+4,oy+8,32,5,fr);poly(g,p.furn,[[sx+4,oy+11],[sx+15,oy+11],[sx+11,oy+30],[sx-1,oy+30]]);R(sx,oy+14,3,12,shade(p.furn,1.25));
  R(sx+15,oy+13,8,1,dk);R(sx+22,oy+13,1,5,dk);R(sx+14,oy+18,9,1,dk);R(sx+17,oy+13,1,3,'#555');
  R(sx,oy,40,9,p.body);hl(sx,oy,40,p.body);for(let i=0;i<4;i++)R(sx+3+i*2,oy+3,1,4,shade(p.body,.6));R(sx+2,oy-2,4,2,dk);R(sx+36,oy-2,2,2,dk);
  mx=sx+40;my=oy+3;
  if(A('mag')=='ext')R(sx+0,oy+30,10,6,'#26272a');
  if(A('optic')=='rdot'){R(sx+10,oy-7,11,7,dk);R(sx+19,oy-6,2,4,'#e83a3a')}
  const ls=A('laser');if(ls!='none'){R(sx+22,oy+13,13,5,'#33353a');R(sx+34,oy+14,1,3,ls=='laser'?'#ff3a3a':'#fff6c0')}
  const mz=A('muzzle');if(mz=='comp'){R(mx,oy,7,9,'#333');R(mx+2,oy+1,1,2,'#000');R(mx+4,oy+1,1,2,'#000');mx+=7}
  if(mz=='supp'){R(mx,oy+1,24,7,'#2a2b2e');hl(mx,oy+1,24,'#2a2b2e');mx+=24}
  if(hands){g.fillStyle=glove;g.fillRect(sx-2,oy+14,14,12);g.fillRect(sx+10,oy+18,8,8);R(sx-2,oy+14,14,2,shade(glove,1.2))}
 }else{
  const L=p.len,st=A('stock'),rx=ox+24,rl=30,bar=p.bar,hgx=rx+rl,hgl=Math.max(10,L-24-rl-bar),bx=hgx+hgl,fu=p.furn,bo=p.body;
  // stock
  const sc=p.stock=='wood'?fu:p.stock=='tan'?'#b09a6a':dk;
  if(st=='lite'||(p.stock=='tube'&&st!='heavy')){R(ox+8,oy+4,rx-ox-8,3,'#333');R(ox+8,oy+10,rx-ox-8,2,'#333');R(ox+4,oy+2,6,13,sc==fu&&st=='lite'?'#333':sc)}
  else{const big=st=='heavy'?2:0;poly(g,sc,[[ox-big,oy+3-big],[rx,oy+1],[rx,oy+10],[ox-big,oy+17+big]]);hl(ox,oy+3,rx-ox,sc);R(ox-big,oy+3-big,3,15+big*2,'#222')}
  // grip
  poly(g,p.stock=='wood'&&p.hg!='vgrip'?fu:dk,[[rx+9,oy+9],[rx+16,oy+9],[rx+13,oy+21],[rx+6,oy+21]]);
  R(rx+16,oy+10,9,1,dk);R(rx+24,oy+10,1,6,dk);R(rx+15,oy+15,10,1,dk);
  // mag
  const mg=A('mag'),mt=p.mag,mxp=rx+rl-13;
  if(mg=='drum'||(mt=='stick'&&false)){g.fillStyle='#2a2b2e';g.beginPath();g.arc(mxp+4,oy+20,10,0,7);g.fill();g.fillStyle='#45474c';g.beginPath();g.arc(mxp+4,oy+20,4,0,7);g.fill()}
  else if(mt=='belt'){R(rx+4,oy+9,16,13,'#3e4a2e');hl(rx+4,oy+9,16,'#3e4a2e');for(let i=0;i<5;i++)R(rx+20+i*2,oy+6+i,2,3,'#d8a840')}
  else if(mt!='internal'){const ml=(mt=='stick'?16:12)*(mg=='ext'?1.6:1);if(mt=='curved')poly(g,'#2a2b2e',[[mxp,oy+9],[mxp+8,oy+9],[mxp+12,oy+9+ml],[mxp+4,oy+10+ml]]);else R(mxp,oy+9,8,ml,'#2a2b2e');R(mxp+1,oy+9,1,ml,'#45474c')}
  // receiver
  R(rx,oy,rl,10,bo);hl(rx,oy,rl,bo);R(rx+4,oy+3,10,3,shade(bo,.65));
  // handguard
  if(p.hg=='wood'||p.hg=='vgrip'){R(hgx,oy+2,hgl,7,fu);hl(hgx,oy+2,hgl,fu);if(p.hg=='vgrip'&&A('under')=='none')poly(g,fu,[[hgx+4,oy+8],[hgx+10,oy+8],[hgx+9,oy+18],[hgx+4,oy+18]])}
  else if(p.hg=='tri'){R(hgx,oy+1,hgl,9,'#2c2e30');for(let i=2;i<hgl;i+=3)R(hgx+i,oy+2,1,7,'#1a1a1c')}
  else if(p.hg=='round'){R(hgx,oy+2,hgl,8,'#2e3032');for(let i=2;i<hgl;i+=4)R(hgx+i,oy+3,2,2,'#111')}
  else{R(hgx,oy+1,hgl,9,shade(bo,.9));for(let i=1;i<hgl;i+=3){R(hgx+i,oy,2,1,'#3a3a3a');R(hgx+i,oy+10,2,1,'#3a3a3a')}}
  // barrel
  R(bx,oy+4,bar,3,'#2a2a2c');R(bx+bar-4,oy,2,4,dk);mx=bx+bar;my=oy+5;
  // top
  const op=A('optic');
  if(p.rail)for(let i=0;i<rl+hgl;i+=3)R(rx+i,oy-1,2,1,'#3a3a3a');
  if(p.carry&&op=='iron'){R(rx+4,oy-6,22,2,bo);R(rx+5,oy-6,2,6,bo);R(rx+22,oy-6,2,6,bo);R(rx+6,oy-8,2,2,dk)}else if(op=='iron'){R(rx+2,oy-3,3,3,dk)}
  if(op=='rdot'){R(rx+8,oy-8,12,8,dk);R(rx+18,oy-7,2,5,'#e83a3a')}
  if(op=='holo'){R(rx+6,oy-9,16,9,'#2e3034');R(rx+8,oy-8,10,6,'#6a8a9a');R(rx+12,oy-6,2,2,'#ff4040')}
  if(op=='acog'||op=='lpvo'||op=='c3x'){const L2=op=='lpvo'?26:20;R(rx+2,oy-9,L2,6,'#2a2b2e');R(rx,oy-10,5,8,'#2a2b2e');R(rx+L2-2,oy-10,6,8,'#2a2b2e');R(rx+L2+3,oy-9,1,6,'#5ab0e0');R(rx+8,oy-3,3,3,dk);hl(rx+2,oy-9,L2,'#2a2b2e')}
  if(op=='snip'){R(rx-2,oy-10,40,6,'#222326');R(rx-4,oy-11,7,8,'#222326');R(rx+32,oy-12,9,10,'#222326');R(rx+40,oy-11,1,8,'#5ab0e0');R(rx+16,oy-13,4,3,'#333');R(rx+6,oy-4,3,4,dk);R(rx+28,oy-4,3,4,dk);hl(rx-2,oy-10,40,'#222326')}
  // under
  const un=A('under');
  if(un=='fgrip')poly(g,dk,[[hgx+hgl-14,oy+9],[hgx+hgl-8,oy+9],[hgx+hgl-9,oy+20],[hgx+hgl-14,oy+20]]);
  if(un=='bipod'){g.strokeStyle='#333';g.lineWidth=2;g.beginPath();g.moveTo(bx-4,oy+8);g.lineTo(bx-10,oy+24);g.moveTo(bx-2,oy+8);g.lineTo(bx+4,oy+24);g.stroke();R(bx-6,oy+7,6,3,'#333')}
  if(un=='m203'){R(hgx+2,oy+9,hgl+2,6,'#3a3c30');hl(hgx+2,oy+9,hgl,'#3a3c30');R(hgx+2,oy+15,4,5,'#3a3c30')}
  if(un=='m7'){R(mx,oy+2,10,7,'#3a3c30');R(mx+10,oy+1,4,9,'#4a5a32');mx+=14}
  // laser/light
  const ls=A('laser');if(ls!='none'){const lx=hgx+hgl-12;R(lx,oy+3,10,5,'#333538');if(ls!='light')R(lx+10,oy+4,1,2,'#ff3a3a');if(ls!='laser'){R(lx-2,oy+2,4,7,'#333538');R(lx+10,oy+5,1,2,'#fff6c0')}}
  // muzzle
  const mz=A('muzzle');if(un!='m7'){if(mz=='supp'){R(mx,oy+2,26,7,'#2a2b2e');hl(mx,oy+2,26,'#2a2b2e');R(mx+24,oy+2,2,7,'#1a1a1a');mx+=26}
  else if(mz=='comp'){R(mx,oy+3,8,5,'#333');R(mx+2,oy+3,1,2,'#000');R(mx+5,oy+3,1,2,'#000');mx+=8}
  else if(mz=='fhide'){R(mx,oy+3,7,5,'#333');R(mx+2,oy+5,5,1,'#000');mx+=7}}
  if(hands){g.fillStyle=glove;g.fillRect(rx+5,oy+12,13,11);R(rx+5,oy+12,13,2,shade(glove,1.2));const hx=un=='fgrip'?hgx+hgl-16:hgx+6;g.fillRect(hx,oy+6,14,un=='fgrip'?14:8);R(hx,oy+6,14,2,shade(glove,1.2))}
 }
 outline(c);return gunCache[key]={c,mx,my}}
