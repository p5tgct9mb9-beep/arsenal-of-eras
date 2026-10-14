'use strict';
const cv=document.getElementById('c'),X=cv.getContext('2d');
let W=400,H=240,img,fb,zbuf,bgBuf=null,bgKey='';
function resize(){const vw=innerWidth,vh=innerHeight;W=Math.max(320,Math.min(520,Math.round(vw/vh*240)))&~1;cv.width=W;cv.height=H;
 let s=Math.min(vw/W,vh/H);if(s>=2)s=Math.floor(s);cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px';
 img=X.createImageData(W,H);fb=new Uint32Array(img.data.buffer);zbuf=new Float32Array(W);bgBuf=null;X.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
// ---------- save
let SAVE={lo:{},prog:{}};try{SAVE=Object.assign(SAVE,JSON.parse(localStorage.getItem('aoefps')||'{}'))}catch(e){}
const store=()=>{try{localStorage.setItem('aoefps',JSON.stringify(SAVE))}catch(e){}};
function loadout(eid){const e=ERAS.find(x=>x.id==eid);let l=SAVE.lo[eid];if(!l||!e.prim.includes(l.p)){l=SAVE.lo[eid]={p:e.prim[0],s:e.sec[0],g:e.gren[0],gear:'armor',att:{}}}return l}
// ---------- text/ui
function T(s,x,y,col='#fff',al='left',sc=1){s=String(s);const w=fW(s,sc);if(al=='center')x-=w/2;else if(al=='right')x-=w;x=Math.round(x);glyphs(X,s,x+sc,y+sc,sc,'#000');glyphs(X,s,x,y,sc,col)}
function panel(x,y,w,h,fill='#262c3a',bd='#e8d8a0'){x|=0;y|=0;w|=0;h|=0;X.fillStyle='#0b0b12';X.fillRect(x+1,y,w-2,h);X.fillRect(x,y+1,w,h-2);X.fillStyle=bd;X.fillRect(x+2,y+1,w-4,h-2);X.fillRect(x+1,y+2,w-2,h-4);X.fillStyle=fill;X.fillRect(x+2,y+2,w-4,h-4);X.fillStyle='rgba(255,255,255,.08)';X.fillRect(x+2,y+2,w-4,2)}
let UI=[];const btn=(x,y,w,h,act)=>UI.push({x,y,w,h,act});
function button(x,y,w,h,label,act,sel){panel(x,y,w,h,sel?'#5a4420':'#262c3a',sel?'#ffd860':'#a89870');T(label,x+w/2,y+(h-7)/2|0,sel?'#ffe890':'#e8e8f0','center');btn(x,y,w,h,act)}
function bar(x,y,w,v,col,ref){X.fillStyle='#0b0b12';X.fillRect(x,y,w+2,5);X.fillStyle='#3a3e4a';X.fillRect(x+1,y+1,w,3);X.fillStyle=col;X.fillRect(x+1,y+1,Math.round(w*clamp(v,0,1)),3);
 if(ref!=null&&Math.abs(ref-v)>.005){const a=Math.min(v,ref),b=Math.max(v,ref);X.fillStyle=v>ref?'#6aff6a':'#ff5a5a';X.fillRect(x+1+Math.round(w*clamp(a,0,1)),y+1,Math.max(1,Math.round(w*(clamp(b,0,1)-clamp(a,0,1)))),3)}}
// ---------- audio
let AC=null;function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state=='suspended')AC.resume().catch(()=>{})}
function snd(type,vol=.3){if(!AC)return;try{const t=AC.currentTime,g=AC.createGain();g.connect(AC.destination);
 if(type=='beep'||type=='pick'){const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(type=='beep'?660:880,t);if(type=='pick')o.frequency.setValueAtTime(1320,t+.06);o.connect(g);g.gain.setValueAtTime(vol*.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.start(t);o.stop(t+.15);return}
 const dur=type=='boom'?.7:type=='quiet'?.08:.16,len=AC.sampleRate*dur|0,b=AC.createBuffer(1,len,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,type=='boom'?1.5:3);
 const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=type=='boom'?500:type=='quiet'?1800:type=='enemy'?1400:3200;s.connect(f);f.connect(g);g.gain.value=vol;s.start(t)}catch(e){}}
// ---------- input
const keys={},kp={};let mdx=0,mouseDown=false,rmb=false,touchMode=false,locked=false;
addEventListener('keydown',e=>{if(!keys[e.code])kp[e.code]=1;keys[e.code]=1;audio();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=0});
const toIn=(cx,cy)=>{const r=cv.getBoundingClientRect();return[(cx-r.left)/r.width*W,(cy-r.top)/r.height*H]};
function hitUI(x,y){for(let i=UI.length-1;i>=0;i--){const b=UI[i];if(x>=b.x&&y>=b.y&&x<b.x+b.w&&y<b.y+b.h){snd('beep');b.act();return true}}return false}
cv.addEventListener('mousedown',e=>{audio();const[x,y]=toIn(e.clientX,e.clientY);if(state!='play'){hitUI(x,y);return}
 if(touchMode)return;if(!locked){const p=cv.requestPointerLock&&cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}if(e.button==0)mouseDown=true;if(e.button==2)rmb=true});
addEventListener('mouseup',e=>{if(e.button==0)mouseDown=false;if(e.button==2)rmb=false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement==cv;if(!locked&&state=='play'&&!touchMode)mouseDown=false});
addEventListener('mousemove',e=>{if(locked)mdx+=e.movementX});
// touch
const TB={};let stick=null,look=null,tlookDx=0;
function touchButtons(){const r=19;return[{id:'fire',x:W-42,y:H-50,r:26,l:'FIRE'},{id:'ads',x:W-96,y:H-30,r,l:'ADS'},{id:'reload',x:W-24,y:H-104,r:15,l:'RLD'},{id:'swap',x:W-64,y:H-104,r:15,l:'SWP'},
 {id:'use',x:W-104,y:H-76,r:15,l:'USE'},{id:'gren',x:W-138,y:H-36,r:15,l:'GRN'},{id:'med',x:W-140,y:H-80,r:13,l:'MED'},{id:'pause',x:W/2,y:12,r:10,l:'II'}]}
function onTouch(e){e.preventDefault();if(e.type=='touchend')audio();touchMode=true;const tl=e.changedTouches;
 for(const t of tl){const[x,y]=toIn(t.clientX,t.clientY),id=t.identifier;
  if(e.type=='touchstart'){if(state!='play'){hitUI(x,y);continue}
   let hb=null;for(const b of touchButtons())if(Math.hypot(x-b.x,y-b.y)<b.r+4){hb=b;break}
   if(hb){TB[hb.id]={id,x,y,first:1};if(hb.id=='fire')look={id,x,y}}else if(x<W*.42){stick={id,ox:x,oy:y,x,y}}else look={id,x,y}}
  else if(e.type=='touchmove'){if(stick&&stick.id==id){stick.x=x;stick.y=y}if(look&&look.id==id){tlookDx+=x-look.x;look.x=x;look.y=y}}
  else{if(stick&&stick.id==id)stick=null;if(look&&look.id==id)look=null;for(const k in TB)if(TB[k].id==id)delete TB[k]}}}
for(const ev of['touchstart','touchmove','touchend','touchcancel'])cv.addEventListener(ev,onTouch,{passive:false});
// gamepad
let gpPrev={},gp={axes:[0,0,0,0],b:{}};
function pollPad(){gp={axes:[0,0,0,0],b:{}};const pads=navigator.getGamepads?navigator.getGamepads():[];for(const p of pads){if(!p)continue;gp.axes=p.axes.slice(0,4).map(v=>Math.abs(v)<.18?0:v);p.buttons.forEach((b,i)=>gp.b[i]=b.pressed||b.value>.5);break}}
const gpP=i=>gp.b[i]&&!gpPrev[i];
function act(a){// edge-triggered menu/actions
 const K=c=>kp[c];switch(a){case'up':return K('ArrowUp')||K('KeyW')||gpP(12)||(gp.axes[1]<-.6&&!gpPrev.ay);case'down':return K('ArrowDown')||K('KeyS')||gpP(13)||(gp.axes[1]>.6&&!gpPrev.ay);
 case'left':return K('ArrowLeft')||K('KeyA')||gpP(14)||(gp.axes[0]<-.6&&!gpPrev.ax);case'right':return K('ArrowRight')||K('KeyD')||gpP(15)||(gp.axes[0]>.6&&!gpPrev.ax);
 case'ok':return K('Enter')||K('Space')||gpP(0)||gpP(9);case'back':return K('Escape')||K('Backspace')||gpP(1);}}
// ---------- state
let state='title',ERA=ERAS[0],EI=0,LI=0,ART=null,L=null,P=null,ENTS=[],PICKS=[],PROJ=[],FX=[],SMOKES=[],msg='',msgT=0,tNow=0,stats={},focus=0,attTab=0,menuT=0,shake=0,hurtT=0;
const artCache={};const getArt=i=>artCache[i]||(artCache[i]=makeEraArt(ERAS[i]));
function setState(s){state=s;focus=0;menuT=0;if(s!='play'&&document.pointerLockElement){try{document.exitPointerLock()}catch(e){}}mouseDown=false}
// ---------- level start
function startLevel(ei,li){EI=ei;ERA=ERAS[ei];LI=li;ART=getArt(ei);L=genLevel(ei,li);bgBuf=null;const lo=loadout(ERA.id);
 const mkW=wid=>{const s=calcStats(wid,lo.att[wid]);const ex=lo.gear=='ammo'?1.5:1;return{id:wid,s,mag:s.mag,res:Math.round(s.mag*s.res*ex),gl:s.gl}};
 const keep=P&&li>0&&P.era==ei?P:null;
 P={era:ei,x:L.start.x,y:L.start.y,a:L.start.a,hp:keep?Math.max(keep.hp,60):100,armor:keep?keep.armor:(lo.gear=='armor'?100:0),med:lo.gear=='medkit'?2:(keep?keep.med:0),gren:3,gtype:lo.g,
  w:[mkW(lo.p),mkW(lo.s)],cur:0,cd:0,rl:0,sw:0,ads:0,kick:0,bloom:0,bob:0,keys:{},flash:0,moving:0};
 ENTS=L.ents.map(e=>{const t=ETYPES[e.type],m=ei==2?1.15:1;const hp=e.type=='boss'?t.hp*(1+ei*.15):t.hp*(1+li*.1);
  return{...e,hp,max:hp,alive:true,t:0,cd:1+Math.random(),alert:false,frame:0,alpha:1,stun:0,shootT:0,burst:0,z:e.type=='boss'&&ERA.boss=='hind'?.7:0,dmg:t.dmg*m,flash:0,ph:Math.random()*6,kind:e.type=='boss'?ERA.boss:null}});
 PICKS=L.picks.map(p=>({...p}));PROJ=[];FX=[];SMOKES=[];stats={kills:0,shots:0,hits:0,t:0};say(ERA.levels[li]);setState('play')}
function say(s,t=2.5){msg=s;msgT=t}
// ---------- world helpers
const tile=(x,y)=>{x|=0;y|=0;if(x<0||y<0||x>=L.S||y>=L.S)return 1;return L.g[y*L.S+x]};
const solid=(x,y)=>{const t=tile(x,y);if(t==0)return false;if(t>=5&&t<=7)return L.door[(y|0)*L.S+(x|0)]<.9;return true};
const freeAt=(x,y,r)=>!solid(x-r,y-r)&&!solid(x+r,y-r)&&!solid(x-r,y+r)&&!solid(x+r,y+r);
function los(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d*5);for(let i=1;i<n;i++){const t=i/n;if(solid(x0+(x1-x0)*t,y0+(y1-y0)*t))return false}return true}
function tryMove(o,dx,dy,r){if(freeAt(o.x+dx,o.y,r))o.x+=dx;else if(o==P)bump(o.x+dx+Math.sign(dx)*r,o.y);if(freeAt(o.x,o.y+dy,r))o.y+=dy;else if(o==P)bump(o.x,o.y+dy+Math.sign(dy)*r)}
function bump(x,y){const t=tile(x,y);if(t==5)openDoor(x|0,y|0)}
function openDoor(x,y){const i=y*L.S+x;if(L.door[i]<=0){L.door[i]=.01;snd('beep',.2)}}
function useAct(){const lx=P.x+Math.cos(P.a)*.9,ly=P.y+Math.sin(P.a)*.9;for(const[x,y]of[[lx,ly],[P.x+Math.cos(P.a)*1.4,P.y+Math.sin(P.a)*1.4]]){const t=tile(x,y);
 if(t==5){openDoor(x|0,y|0);return}if(t==6){if(P.keys.R)openDoor(x|0,y|0);else say('RED KEY REQUIRED');return}if(t==7){if(P.keys.B)openDoor(x|0,y|0);else say('BLUE KEY REQUIRED');return}
 if(t==8){if(L.boss&&ENTS.some(e=>e.type=='boss'&&e.alive)){say('DESTROY THE '+ERA.bossName.split(' ').slice(-2).join(' ')+' FIRST');return}L.g[(y|0)*L.S+(x|0)]=9;snd('pick');levelDone();return}}}
function levelDone(){const p=SAVE.prog[ERA.id]||0;SAVE.prog[ERA.id]=Math.max(p,LI+1);store();setState(LI==2?'victory':'clear')}
// ---------- combat
function W0(){return P.w[P.cur]}
function shoot(){const w=W0(),s=w.s;w.mag--;P.cd=60/s.rpm;stats.shots++;P.kick=Math.min(P.kick+s.rec*.9,6);P.bloom=Math.min(P.bloom+s.rec*.5,6);P.flash=s.noflash?.03:.06;
 snd(s.quiet?'quiet':'shot',s.quiet?.15:.28);
 let spread=(P.ads>.5?s.sp*s.ads*.3:s.sp*(s.laser?.85:1))+P.bloom*.4+(P.moving?.8:0);const off=(Math.random()-.5)*2*spread*Math.PI/180;
 const f=cam.f,col=clamp(Math.round(W/2+Math.tan(off)*f),0,W-1);let best=null;
 for(const e of ENTS){if(!e.alive||!(e.ty>0))continue;const hw=e.sw*ETYPES[e.type].hw;if(Math.abs(e.sx-col)<hw&&e.ty<zbuf[col]+.05&&(!best||e.ty<best.ty))best=e}
 if(best){const d=best.ty,fall=d<s.rng?1:Math.max(.45,1-(d-s.rng)/s.rng*.5);hurt(best,s.dmg*fall,'bullet');stats.hits++}
 else{const d=zbuf[col]*.96,a=P.a+off;FX.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,z:.35+Math.random()*.3,k:'puff',t:0,dur:.2,ppu:220})}
 const nr=s.quiet?3:14;for(const e of ENTS)if(e.alive&&Math.hypot(e.x-P.x,e.y-P.y)<nr)e.alert=true}
function hurt(e,d,src){if(!e.alive)return;const t=ETYPES[e.type];if(t.armor)d*=src=='bullet'?t.armor:2.6;e.hp-=d;e.flash=.08;e.alert=true;if(e.type=='soldier'||e.type=='officer')e.pain=.15;
 if(e.hp<=0){e.alive=false;e.t=0;stats.kills++;if(e.type!='soldier'&&e.type!='officer'){boom(e.x,e.y,0,0,e.type=='boss'?1:.5);snd('boom',.5)}
  if(e.type=='boss')say(ERA.bossName+' DESTROYED! FIND THE EXIT',4);if(Math.random()<.3&&e.type!='boss')PICKS.push({kind:Math.random()<.5?'ammo':'hp',x:e.x,y:e.y})}}
function boom(x,y,r,dmg,scale=.6,src){FX.push({x,y,z:0,k:'boom',t:0,dur:.5,ppu:32/(scale*2.2)});shake=Math.max(shake,.3);if(r<=0)return;snd('boom',.45);
 for(const e of ENTS){if(!e.alive)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<r+(e.type=='boss'?1:0))hurt(e,dmg*(1-d/(r+1)*.6),'exp')}
 const dp=Math.hypot(P.x-x,P.y-y);if(dp<r)hurtP(dmg*(1-dp/r)*(src=='p'?.4:1))}
function hurtP(d){if(state!='play')return;const a=Math.min(P.armor,d*.6);P.armor-=a;P.hp-=d-a;hurtT=.35;if(P.hp<=0){P.hp=0;setState('dead')}}
function throwGren(){const s=W0().s;if(W0().gl>0){W0().gl--;const a=P.a;PROJ.push({x:P.x,y:P.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,z:.45,vz:0,k:'nade',own:'p',t:0,gl:1,ty:'frag'});snd('quiet',.3);return}
 if(P.gren<=0){say('NO GRENADES');return}P.gren--;const a=P.a;PROJ.push({x:P.x,y:P.y,vx:Math.cos(a)*6,vy:Math.sin(a)*6,z:.5,vz:2.2,k:'nade',own:'p',t:0,ty:P.gtype})}
function detonate(p){if(p.ty=='frag')boom(p.x,p.y,p.gl?2.2:2.8,p.gl?140:120,.7,'p');
 else if(p.ty=='smoke'){SMOKES.push({x:p.x,y:p.y,t:0});for(let i=0;i<6;i++)FX.push({x:p.x+(Math.random()-.5)*2,y:p.y+(Math.random()-.5)*2,z:0,k:'smoke',t:-i*.05,dur:9,ppu:22,fade:1});snd('quiet',.3)}
 else{FX.push({x:p.x,y:p.y,z:.3,k:'puff',t:0,dur:.3,ppu:12});snd('boom',.3);for(const e of ENTS)if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<6&&los(e.x,e.y,p.x,p.y))e.stun=e.type=='boss'?1:3.5;
  if(Math.hypot(P.x-p.x,P.y-p.y)<4&&los(P.x,P.y,p.x,p.y))hurtT=.6}}
function inSmoke(x,y){return SMOKES.some(s=>Math.hypot(s.x-x,s.y-y)<2.6)}
// ---------- update
function update(dt){tNow+=dt;stats.t+=dt;if(msgT>0)msgT-=dt;if(hurtT>0)hurtT-=dt;if(shake>0)shake-=dt;
 const w=W0(),s=w.s;
 let f=0,st=0,turn=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyA)st-=1;if(keys.KeyD)st+=1;if(keys.ArrowLeft)turn-=2.6*dt;if(keys.ArrowRight)turn+=2.6*dt;
 f-=gp.axes[1];st+=gp.axes[0];turn+=gp.axes[2]*3.2*dt;
 if(stick){const dx=stick.x-stick.ox,dy=stick.y-stick.oy,m=Math.hypot(dx,dy),R=28;if(m>R){stick.ox=stick.x-dx/m*R;stick.oy=stick.y-dy/m*R}st+=clamp(dx/R,-1,1);f-=clamp(dy/R,-1,1)}
 const zoomF=1+(s.zoom-1)*P.ads;turn+=mdx*.0032/zoomF+tlookDx*.012/zoomF;mdx=0;tlookDx=0;P.a+=turn;
 const m=Math.hypot(f,st);if(m>1){f/=m;st/=m}const spd=3.2*s.mob*(P.ads>.5?.55:1)*dt,ca=Math.cos(P.a),sa=Math.sin(P.a);P.moving=m>.1;
 tryMove(P,(ca*f-sa*st)*spd,(sa*f+ca*st)*spd,.22);if(P.moving)P.bob+=dt*9;
 const fire=mouseDown||keys.KeyJ||gp.b[7]||!!TB.fire,adsIn=rmb||keys.KeyK||gp.b[6]||!!TB.ads;
 P.ads=clamp(P.ads+(adsIn&&!P.rl&&!P.sw?dt:-dt)*6,0,1);
 const tbP=k=>{if(TB[k]&&TB[k].first){TB[k].first=0;return true}return false};
 if(kp.KeyR||gpP(2)||tbP('reload'))reload();
 if(kp.KeyQ||kp.Digit1||kp.Digit2||gpP(3)||tbP('swap')){const n=kp.Digit1?0:kp.Digit2?1:1-P.cur;if(n!=P.cur){P.cur=n;P.sw=.4;P.rl=0}}
 if(kp.KeyE||kp.KeyF&&false||gpP(0)||tbP('use'))useAct();
 if(kp.KeyG||gpP(5)||tbP('gren'))throwGren();
 if(kp.KeyH||gpP(4)||tbP('med')){if(P.med>0&&P.hp<100){P.med--;P.hp=Math.min(100,P.hp+50);snd('pick');say('MEDKIT USED')}else if(P.med<=0)say('NO MEDKITS')}
 if(kp.Escape||kp.KeyP||gpP(9)||tbP('pause')){setState('pause');return}
 P.cd-=dt;P.kick=Math.max(0,P.kick-dt*14);P.bloom=Math.max(0,P.bloom-dt*(fire?3:9));if(P.flash>0)P.flash-=dt;
 if(P.sw>0)P.sw-=dt;else if(P.rl>0){P.rl-=dt;if(P.rl<=0){P.rl=0;const need=s.mag-w.mag,take=Math.min(need,w.res);w.mag+=take;w.res-=take}}
 else if(fire&&P.cd<=0&&(s.auto||!P.held)){if(w.mag>0)shoot();else{reload();if(!w.res&&!P.held)say('OUT OF AMMO')}}
 P.held=fire;
 // doors
 for(let i=0;i<L.door.length;i++)if(L.door[i]>0&&L.door[i]<1)L.door[i]=Math.min(1,L.door[i]+dt*2.2);
 // enemies
 for(const e of ENTS)updEnemy(e,dt);ENTS=ENTS.filter(e=>e.alive||e.alpha>0);
 // projectiles
 for(const p of PROJ){p.t+=dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
  if(p.own=='p'){p.z+=p.vz*dt;p.vz-=6*dt;if(p.z<.05){p.z=.05;p.vz=Math.abs(p.vz)*.4;p.vx*=.6;p.vy*=.6}
   if(solid(nx,p.y)){p.vx*=-.5;if(p.gl)p.dead=1}else p.x=nx;if(solid(p.x,ny)){p.vy*=-.5;if(p.gl)p.dead=1}else p.y=ny;
   if(p.gl&&ENTS.some(e=>e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<(e.type=='boss'?1.2:.5)))p.dead=1;
   if(p.t>(p.gl?3:1.6))p.dead=1;if(p.dead)detonate(p)}
  else{if(p.hom){const a=Math.atan2(P.y-p.y,P.x-p.x),v=Math.hypot(p.vx,p.vy),c=Math.atan2(p.vy,p.vx);let d=a-c;d=Math.atan2(Math.sin(d),Math.cos(d));const n=c+clamp(d,-1.2*dt,1.2*dt);p.vx=Math.cos(n)*v;p.vy=Math.sin(n)*v}
   p.x=nx;p.y=ny;if(p.z>.3)p.z-=dt*.3;
   if(solid(nx,ny)||Math.hypot(P.x-nx,P.y-ny)<.45||p.t>6){p.dead=1;boom(p.x-p.vx*dt,p.y-p.vy*dt,1.6,p.dmg,.6)}}}
 PROJ=PROJ.filter(p=>!p.dead);
 for(const x of FX)x.t+=dt;FX=FX.filter(x=>x.t<x.dur);for(const sm of SMOKES)sm.t+=dt;SMOKES=SMOKES.filter(s=>s.t<9);
 // pickups
 for(const p of PICKS){if(Math.hypot(p.x-P.x,p.y-P.y)>.55)continue;let ok=true;
  if(p.kind=='hp'){if(P.hp>=100)ok=false;else{P.hp=Math.min(100,P.hp+25);say('+25 HEALTH')}}
  else if(p.kind=='ammo'){for(const ww of P.w)ww.res+=ww.s.mag*2;if(P.w[0].s.gl)P.w[0].gl=Math.min(P.w[0].gl+1,P.w[0].s.gl);say('AMMO')}
  else if(p.kind=='armor'){if(P.armor>=100)ok=false;else{P.armor=Math.min(100,P.armor+50);say('+50 ARMOR')}}
  else if(p.kind=='gren'){P.gren=Math.min(6,P.gren+1);say('+1 '+GREN[P.gtype].n)}
  else if(p.kind=='keyR'){P.keys.R=1;say('RED KEY ACQUIRED')}else if(p.kind=='keyB'){P.keys.B=1;say('BLUE KEY ACQUIRED')}
  if(ok){p.got=1;snd('pick')}}
 PICKS=PICKS.filter(p=>!p.got)}
function reload(){const w=W0();if(P.rl||w.mag>=w.s.mag||w.res<=0)return;P.rl=w.s.rl;P.ads=0}
function updEnemy(e,dt){e.t+=dt;if(e.flash>0)e.flash-=dt;if(e.shootT>0)e.shootT-=dt;if(e.pain>0)e.pain-=dt;
 if(!e.alive){if(e.t>1)e.alpha=Math.max(0,1-(e.t-1)/1.2);return}
 if(e.stun>0){e.stun-=dt;return}
 const T=ETYPES[e.type],dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy),sees=d<(e.type=='boss'?22:15)&&los(e.x,e.y,P.x,P.y);
 if(sees&&d<9)e.alert=true;if(!e.alert)return;
 const r=e.type=='boss'?.9:e.type=='vehicle'?.6:.25;
 if(T.spd>0){let mx=0,my=0;const want=e.type=='boss'?(e.kind=='hind'?6:5):e.type=='vehicle'?4:2.2;
  if(e.kind=='hind'){const px=-dy/d,py=dx/d,o=Math.sin(tNow*.7+e.ph)*1.6;mx=px*o*.8+(d>want?dx/d:-dx/d*.5);my=py*o*.8+(d>want?dy/d:-dy/d*.5)}
  else if(!sees||d>want){mx=dx/d;my=dy/d}else{mx=-dy/d*Math.sin(e.t*.8+e.ph);my=dx/d*Math.sin(e.t*.8+e.ph)}
  const sp=T.spd*(e.kind=='hind'?3:1)*dt;tryMove(e,mx*sp,my*sp,r);e.frame=(mx||my)?1+((e.t*4|0)%2):0}
 e.cd-=dt;if(!sees)return;
 if(e.type=='boss'){e.big=(e.big||3)-dt;if(e.big<=0){e.big=e.kind=='hind'?3.2:3.6;const n=e.kind=='hind'?3:1;
   for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+(i-(n-1)/2)*.12;PROJ.push({x:e.x+Math.cos(a)*1.1,y:e.y+Math.sin(a)*1.1,vx:Math.cos(a)*(e.kind=='hind'?7:6),vy:Math.sin(a)*(e.kind=='hind'?7:6),z:e.z+.3,k:'shell',own:'e',t:0,dmg:e.kind=='hind'?18:30,hom:e.kind=='t90'&&i==0&&Math.random()<.5})}
   e.shootT=.25;snd('boom',.25)}}
 if(e.cd<=0){if(T.burst){e.burst++;if(e.burst>=T.burst){e.burst=0;e.cd=1.4+Math.random()}else e.cd=T.rate}else e.cd=T.rate*(.7+Math.random()*.6)*(e.type=='soldier'?1.4:1);
  e.shootT=.12;snd('enemy',.12);let ch=T.acc*clamp(1.25-d/14,.15,1)*(P.moving?.75:1);if(inSmoke(P.x,P.y)||inSmoke(e.x,e.y))ch*=.3;if(Math.random()<ch)hurtP(e.dmg*(e.type=='soldier'||e.type=='officer'?1:.8))}}
// ---------- render world
let cam={f:200};
function buildBg(){const b=ERA.bg,k=W+'x'+H+ERA.id;bgBuf=new Uint32Array(W*H);const c=(h1,h2,t)=>{const a=hexRGB(h1),z=hexRGB(h2);return a.map((v,i)=>Math.round(v+(z[i]-v)*t))};const pk=a=>(0xff000000|(a[2]<<16)|(a[1]<<8)|a[0])>>>0;
 const bands=8,bay=[[0,2],[3,1]];for(let y=0;y<H;y++){const top=y<H/2;const t=top?y/(H/2):(y-H/2)/(H/2);const q=t*bands,lo=Math.floor(q),fr=q-lo;
  const c1=pk(top?c(b.ct,b.cb,lo/bands):c(b.ft,b.fb,lo/bands)),c2=pk(top?c(b.ct,b.cb,Math.min(1,(lo+1)/bands)):c(b.ft,b.fb,Math.min(1,(lo+1)/bands)));
  for(let x=0;x<W;x++)bgBuf[y*W+x]=fr*4>bay[y&1][x&1]+.5?c2:c1}bgKey=k}
function renderWorld(){if(!bgBuf||bgBuf.length!=W*H)buildBg();fb.set(bgBuf);const s=W0().s,zf=1+(s.zoom-1)*P.ads;
 const f=H*.92*zf,a=P.a+(shake>0?(Math.random()-.5)*.02:0),dX=Math.cos(a),dY=Math.sin(a),pl=(W/2)/f,pX=-dY*pl,pY=dX*pl;cam={f,dX,dY,pX,pY};
 const S=L.S,g=L.g,tex=ART.tex,[fr,fg,fbl]=ERA.fog,fogD=ERA.fogD*(s.light?1.4:1)*(P.flash>0?1.2:1),hz=H/2+(P.moving?Math.sin(P.bob)*1.2:0)-P.kick*.6;cam.hz=hz;
 const col=(x,pd,tx,u,side,open)=>{const lh=f/pd,top=hz-lh/2,y0=Math.max(0,Math.ceil(top)),y1=Math.min(H,Math.ceil(top+lh*(1-open)));let sh=Math.max(.1,1-pd/fogD);sh=Math.round(sh*12)/12;if(side)sh*=.8;const ish=1-sh,fo=[fr*ish,fg*ish,fbl*ish];
  for(let y=y0;y<y1;y++){let v=((y-top)/lh*32+open*32)|0;if(v>31)v=31;const c=tx.d[v*32+u];fb[y*W+x]=(0xff000000|((((c>>16)&255)*sh+fo[2])<<16)|((((c>>8)&255)*sh+fo[1])<<8)|(((c&255)*sh+fo[0])|0))>>>0}};
 for(let x=0;x<W;x++){const cx=2*x/W-1,rx=dX+pX*cx,ry=dY+pY*cx;let mx=P.x|0,my=P.y|0;const ddx=Math.abs(1/rx),ddy=Math.abs(1/ry);let sx,sy,sdx,sdy;
  if(rx<0){sx=-1;sdx=(P.x-mx)*ddx}else{sx=1;sdx=(mx+1-P.x)*ddx}if(ry<0){sy=-1;sdy=(P.y-my)*ddy}else{sy=1;sdy=(my+1-P.y)*ddy}
  let side=0,t=1,door=null;for(let i=0;i<90;i++){if(sdx<sdy){sdx+=ddx;mx+=sx;side=0}else{sdy+=ddy;my+=sy;side=1}if(mx<0||my<0||mx>=S||my>=S){t=1;break}t=g[my*S+mx];if(t===0)continue;
   if(t>=5&&t<=7){const o=L.door[my*S+mx];if(o>=.98)continue;if(o>0){if(!door)door={pd:side?sdy-ddy:sdx-ddx,side,t,o,rx,ry};continue}}break}
  const uv=(pd,sd)=>{let w=sd?P.x+pd*rx:P.y+pd*ry;w-=Math.floor(w);let u=(w*32)|0;if((sd==0&&rx>0)||(sd==1&&ry<0))u=31-u;return u};
  const pd=Math.max(.05,side?sdy-ddy:sdx-ddx);col(x,pd,tex[t]||tex[1],uv(pd,side),side,0);zbuf[x]=pd;
  if(door){col(x,door.pd,tex[door.t],uv(door.pd,door.side),door.side,door.o);zbuf[x]=door.pd}}
 // sprites
 const list=[];const inv=1/(pX*dY-dX*pY);
 const add=(o,p,ppu,z,alpha,flash)=>{const ddx=o.x-P.x,ddy=o.y-P.y,tx=inv*(dY*ddx-dX*ddy),ty=inv*(-pY*ddx+pX*ddy);o.ty=ty;if(ty<.15){o.sx=-999;return}list.push({o,p,ppu,z,alpha,flash,tx,ty})};
 for(const e of ENTS){let p,ppu=48;const A=ART;
  if(e.type=='soldier'||e.type=='officer'){const set=e.type=='officer'?A.officer:A.soldier;p=set[!e.alive?(e.t<.25?5:6):e.shootT>0?3:e.pain>0?4:e.frame]}
  else{const set=A[e.type];p=set[!e.alive?2:e.shootT>0?1:0];ppu=e.type=='boss'?26:e.type=='vehicle'?32:40}
  add(e,p,ppu,e.z+(e.kind=='hind'?Math.sin(tNow*2)*.05:0),e.alpha,e.flash>0)}
 for(const p of PICKS)add(p,ART.pick[p.kind],40,.0+Math.sin(tNow*3+p.x)*.03,1);
 for(const p of PROJ)add(p,ART.fx[p.k][0],p.k=='shell'?40:48,p.z-.3,1);
 for(const x of FX){const fr=Math.min(4,Math.floor(Math.max(0,x.t)/x.dur*5));if(x.t<0)continue;add(x,ART.fx[x.k][x.k=='smoke'?0:fr],x.ppu,x.z,x.fade?Math.min(1,(x.dur-x.t)/2)*.85:1)}
 list.sort((a,b)=>b.ty-a.ty);
 for(const s of list){const{p,ty}=s,lh=f/ty,sh=lh*p.h/s.ppu,sw=lh*p.w/s.ppu,sx=W/2*(1+s.tx/ty),bottom=hz+lh/2-s.z*lh,top=bottom-sh,left=sx-sw/2;s.o.sx=sx;s.o.sw=sw;
  let shd=Math.max(.15,1-ty/fogD);shd=Math.round(shd*12)/12;const ish=1-shd,x0=Math.max(0,Math.ceil(left)),x1=Math.min(W,Math.ceil(left+sw)),y0=Math.max(0,Math.ceil(top)),y1=Math.min(H,Math.ceil(bottom)),al=s.alpha;
  for(let x=x0;x<x1;x++){if(ty>=zbuf[x])continue;const u=((x-left)/sw*p.w)|0;for(let y=y0;y<y1;y++){const c=p.d[(((y-top)/sh*p.h)|0)*p.w+u];const ca=c>>>24;if(ca<100)continue;
   let r=c&255,gg=(c>>8)&255,b=(c>>16)&255;if(s.flash){r=255;gg=255;b=255}r=r*shd+fr*ish;gg=gg*shd+fg*ish;b=b*shd+fbl*ish;const i=y*W+x;
   if(al<1||ca<250){const k=al*ca/255,o=fb[i];r=r*k+(o&255)*(1-k);gg=gg*k+((o>>8)&255)*(1-k);b=b*k+((o>>16)&255)*(1-k)}fb[i]=(0xff000000|(b<<16)|(gg<<8)|(r|0))>>>0}}}
 X.putImageData(img,0,0)}
// ---------- viewmodel + hud
function drawView(){const w=W0(),s=w.s,lo=loadout(ERA.id),gun=drawGun(w.id,lo.att[w.id],true,ERA.glove),ads=P.ads,sc=s.scope;
 const hideGun=ads>.85&&(sc=='acog'||sc=='scope');
 if(!hideGun){const bobx=Math.cos(P.bob)*3*(1-ads),boby=Math.abs(Math.sin(P.bob))*3*(1-ads),down=(P.sw>0?P.sw/.4:0)*80+(P.rl>0?Math.sin(Math.min(1,P.rl/s.rl)*Math.PI)*40:0);
  const tx=W/2+34*(1-ads)+bobx-(s.c=='pistol'?0:0),ty=H*.6+12*(1-ads)+boby+down+P.kick*2,rot=.34*(1-ads)+.08*ads-P.kick*.02;
  X.save();X.translate(tx,ty);X.rotate(rot);X.scale(-2,2);X.translate(P.kick*1.5,0);X.drawImage(gun.c,-gun.mx,-gun.my);X.restore();
  if(P.flash>0&&!s.noflash){X.fillStyle='#ffe070';X.beginPath();X.arc(tx,ty,9+Math.random()*4,0,7);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(tx,ty,4,0,7);X.fill()}
  else if(P.flash>0){X.fillStyle='rgba(255,230,140,.5)';X.fillRect(tx-2,ty-2,4,4)}}
 // optics
 const cx=W/2,cy=H/2;
 if(hideGun){const R=sc=='scope'?H*.44:H*.47;X.fillStyle='#000';X.beginPath();X.rect(0,0,W,H);X.moveTo(cx+R,cy);X.arc(cx,cy,R,0,Math.PI*2,true);X.fill('evenodd');X.fillStyle='rgba(0,0,0,.25)';X.beginPath();X.arc(cx,cy,R,0,Math.PI*2);X.moveTo(cx+R-6,cy);X.arc(cx,cy,R-6,0,Math.PI*2,true);X.fill('evenodd');
  if(sc=='scope'){X.fillStyle='#000';X.fillRect(cx-R,cy,R*2,1);X.fillRect(cx,cy-R,1,R*2);X.fillRect(cx-R,cy-1,R*.6,3);X.fillRect(cx+R*.4,cy-1,R*.6,3);X.fillRect(cx-1,cy+R*.4,3,R*.6)}
  else{X.fillStyle='#ff3a2a';X.fillRect(cx-3,cy,7,1);X.fillRect(cx-2,cy+1,5,1);X.fillRect(cx,cy+2,1,1);X.fillStyle='#000';X.fillRect(cx,cy+4,1,R*.5)}}
 else if(ads>.85&&(sc=='dot'||sc=='holo')){X.fillStyle='#ff3030';X.fillRect(cx-1,cy-1,2,2);if(sc=='holo'){X.strokeStyle='rgba(255,60,60,.8)';X.lineWidth=1;X.beginPath();X.arc(cx,cy,8,0,7);X.stroke()}}
 else if(ads<.5){const sp=Math.round(3+(s.sp*(s.laser?.85:1)+P.bloom*.4+(P.moving?.8:0))*2.2);X.fillStyle='#0b0b12';for(const[a,b,c,d]of[[cx-sp-4,cy-1,5,3],[cx+sp,cy-1,5,3],[cx-1,cy-sp-4,3,5],[cx-1,cy+sp,3,5]])X.fillRect(a,b,c,d);X.fillStyle='#f0f0e0';
  for(const[a,b,c,d]of[[cx-sp-3,cy,3,1],[cx+sp+1,cy,3,1],[cx,cy-sp-3,1,3],[cx,cy+sp+1,1,3]])X.fillRect(a,b,c,d);if(s.laser){X.fillStyle='#ff2a2a';X.fillRect(cx+2,cy+2,2,2)}}}
function drawHUD(){const w=W0(),s=w.s;
 if(hurtT>0){X.fillStyle=`rgba(255,40,30,${hurtT*.6})`;X.fillRect(0,0,W,4);X.fillRect(0,H-4,W,4);X.fillRect(0,0,4,H);X.fillRect(W-4,0,4,H)}
 panel(4,4,118,34);T(ERA.name,10,8,'#ffd860');T('HP',10,19,'#fff');bar(24,20,60,P.hp/100,P.hp>35?'#5ad85a':'#ff5a4a');T(Math.min(100,Math.ceil(P.hp)),90,19,'#fff');
 T('AR',10,28,'#fff');bar(24,29,60,P.armor/100,'#5a9aff');T(Math.ceil(P.armor),90,28,'#fff');
 let kx=126;if(P.keys.R){X.drawImage(ART.pick.keyR.c,kx,4);kx+=18}if(P.keys.B)X.drawImage(ART.pick.keyB.c,kx,4);
 const alive=ENTS.filter(e=>e.alive&&e.type!='boss').length;panel(W-112,4,108,24);T(ERA.levels[LI],W-58,8,'#e8e8f0','center');T('HOSTILES '+alive+'  '+ (LI+1)+'/3',W-58,18,'#a8b8c8','center');
 panel(W-150,H-36,146,32);T(s.n,W-144,H-31,'#ffd860');T(P.rl>0?'RELOADING':w.mag+' / '+w.res,W-144,H-20,P.rl>0?'#ffb040':w.mag==0?'#ff5a4a':'#fff');
 T((s.gl?'GL '+w.gl+' ':'')+'G'+P.gren+' M'+P.med,W-10,H-20,'#c8d8c0','right');
 const boss=ENTS.find(e=>e.type=='boss'&&e.alive&&e.alert);if(boss){const bw=Math.min(220,W-180);panel(W/2-bw/2-6,H-62+(touchMode?-0:0),bw+12,22);T(ERA.bossName,W/2-bw/2,H-58,'#fff');bar(W/2-bw/2,H-48,bw-2,boss.hp/boss.max,'#5ad85a')}
 if(msgT>0){T(msg,W/2,42,'#fff0a0','center')}
 if(touchMode){X.globalAlpha=.55;for(const b of touchButtons()){X.fillStyle=TB[b.id]?'#ffd860':'#1a1e2a';X.beginPath();X.arc(b.x,b.y,b.r,0,7);X.fill();X.strokeStyle='#e8d8a0';X.lineWidth=1;X.stroke();X.globalAlpha=1;T(b.l,b.x,b.y-3,'#fff','center');X.globalAlpha=.55}
  if(stick){X.fillStyle='#1a1e2a';X.beginPath();X.arc(stick.ox,stick.oy,28,0,7);X.fill();X.fillStyle='#e8d8a0';X.beginPath();X.arc(stick.x,stick.y,10,0,7);X.fill()}
  else{X.strokeStyle='#e8d8a0';X.beginPath();X.arc(54,H-56,26,0,7);X.stroke()}X.globalAlpha=1}}
// ---------- menus
function menuBG(){const t=tNow;if(!ART)ART=getArt(EI);X.fillStyle='#141824';X.fillRect(0,0,W,H);for(let y=0;y<H;y+=4){X.fillStyle=`rgba(255,255,255,${.02+.02*Math.sin(y*.1+t)})`;X.fillRect(0,y,W,1)}}
let attract=null;
function drawTitle(){if(!attract){const ei=0;ART=getArt(ei);ERA=ERAS[ei];L=genLevel(0,0);P={x:L.start.x,y:L.start.y,a:0,w:[{id:'garand',s:calcStats('garand',{}),mag:8,res:0}],cur:0,ads:0,kick:0,bob:0,flash:0,moving:0};ENTS=L.ents.map(e=>({...e,alive:true,frame:0,alpha:1,z:0,t:0}));PICKS=[];PROJ=[];FX=[];attract=1}
 P.a+=.003;bgBuf=null;renderWorld();X.fillStyle='rgba(10,12,20,.55)';X.fillRect(0,0,W,H);
 const s='ARSENAL OF ERAS',sc=3,w=fW(s,sc),x=(W-w)/2|0,y=50;for(const[o,c]of[[3,'#1a0e08'],[2,'#6a3010']])for(let dx=-o;dx<=o;dx+=o)for(let dy=-o;dy<=o;dy+=o)glyphs(X,s,x+dx,y+dy,sc,c);
 const gr=X.createLinearGradient(0,y,0,y+21);gr.addColorStop(0,'#fff4c0');gr.addColorStop(.5,'#ffc040');gr.addColorStop(1,'#c04a10');glyphs(X,s,x,y,sc,gr);
 const s2='FRONTLINE FPS',w2=fW(s2,2);glyphs(X,s2,(W-w2)/2+2|0,y+34,2,'#000');glyphs(X,s2,(W-w2)/2|0,y+32,2,'#9ad8ff');
 T('- A HISTORY OF WAR, IN FIRST PERSON -',W/2,y+56,'#e8e8f0','center');
 if((tNow*2|0)%2)T(touchMode?'TAP TO START':'PRESS ENTER / CLICK / (A)',W/2,H-60,'#ffd860','center');
 T('WASD MOVE  MOUSE LOOK  CLICK FIRE  RMB ADS',W/2,H-32,'#8898a8','center');T('R RELOAD  Q SWAP  E USE  G GRENADE  H MEDKIT  ESC PAUSE',W/2,H-22,'#8898a8','center');T('TOUCH + GAMEPAD SUPPORTED',W/2,H-12,'#5a6a7a','center');
 btn(0,0,W,H,()=>setState('era'));if(act('ok'))setState('era')}
function drawEra(){menuBG();T('SELECT ERA',W/2,10,'#ffd860','center',2);const cw=Math.min(122,(W-24)/3|0),gx=(W-cw*3-12)/2|0;
 if(act('left'))focus=(focus+2)%3;if(act('right'))focus=(focus+1)%3;if(act('ok')){EI=focus;ERA=ERAS[focus];setState('loadout');return}if(act('back')){setState('title');return}
 ERAS.forEach((e,i)=>{const x=gx+i*(cw+6),y=34,sel=focus==i;panel(x,y,cw,170,sel?'#3a3020':'#222838',sel?'#ffd860':'#a89870');const A=getArt(i);
  X.fillStyle=e.bg.cb;X.fillRect(x+4,y+4,cw-8,60);X.fillStyle=e.bg.fb;X.fillRect(x+4,y+44,cw-8,20);X.drawImage(A.boss[0].c,x+cw-6-A.boss[0].w*.8|0,y+14,A.boss[0].w*.8|0,A.boss[0].h*.8|0);X.drawImage(A.soldier[0].c,x+4,y+20);
  T(e.name,x+cw/2,y+70,sel?'#ffe890':'#fff','center');T(e.year,x+cw/2,y+80,'#a8b8c8','center');T(e.sub,x+cw/2,y+92,'#9ad8ff','center');
  const words=e.foe.split(' ');let line='',ly=y+106;for(const wd of words){if(fW(line+wd)>cw-10){T(line,x+cw/2,ly,'#c8b8a8','center');ly+=9;line=''}line+=wd+' '}T(line,x+cw/2,ly,'#c8b8a8','center');
  T('BOSS:',x+cw/2,y+136,'#ff9a6a','center');T(e.bossName.length*6>cw-8?e.bossName.split(' ').slice(-2).join(' '):e.bossName,x+cw/2,y+145,'#ffd0b0','center');
  const pr=SAVE.prog[e.id]||0;T('CLEARED '+pr+'/3',x+cw/2,y+158,pr>=3?'#6aff6a':'#8898a8','center');btn(x,y,cw,170,()=>{if(focus==i){EI=i;ERA=e;setState('loadout')}else focus=i})});
 button(8,H-26,60,20,'BACK',()=>setState('title'));button(W-90,H-26,82,20,'SELECT',()=>{EI=focus;ERA=ERAS[focus];setState('loadout')},true)}
function statBars(x,y,wid,att,ref){const s=calcStats(wid,att),r=ref?calcStats(wid,ref):null;const rows=[['DAMAGE',v=>v.dmg/80],['FIRE RATE',v=>v.rpm/900],['CONTROL',v=>1-v.rec/3.2],['ACCURACY',v=>1-v.sp*v.ads/4.5],['RANGE',v=>v.rng/20],['MOBILITY',v=>(v.mob-.7)/.45]];
 rows.forEach(([n,f],i)=>{T(n,x,y+i*10,'#c8d0e0');bar(x+64,y+i*10+1,80,f(s),'#ffd860',r?f(r):null)});
 T('MAG '+s.mag+(s.auto?'  AUTO':'  SEMI')+(s.gl?'  GL x'+s.gl:'')+(s.scope?'  '+(s.zoom|0||1)+'.'+(Math.round(s.zoom*10)%10)+'X':''),x,y+62,'#9ad8ff')}
function drawLoadout(){menuBG();const e=ERA,lo=loadout(e.id);T(e.name+' - LOADOUT',W/2,8,'#ffd860','center',2);
 const cyc=(arr,v,d)=>arr[(arr.indexOf(v)+d+arr.length)%arr.length];const gears=Object.keys(GEAR);
 const rows=[['PRIMARY',()=>WPN[lo.p].n,d=>lo.p=cyc(e.prim,lo.p,d)],['SECONDARY',()=>WPN[lo.s].n,d=>lo.s=cyc(e.sec,lo.s,d)],['GRENADE',()=>GREN[lo.g].ne&&GREN[lo.g].ne[e.id]||GREN[lo.g].n,d=>lo.g=cyc(e.gren,lo.g,d)],
  ['GEAR',()=>GEAR[lo.gear].ne&&GEAR[lo.gear].ne[e.id]||GEAR[lo.gear].n,d=>lo.gear=cyc(gears,lo.gear,d)]];
 const nb=rows.length+3;if(act('up'))focus=(focus+nb-1)%nb;if(act('down'))focus=(focus+1)%nb;
 const acts=[()=>{attTab=0;setState('attach')},()=>startLevel(EI,0),()=>setState('era')];
 if(focus<rows.length){if(act('left')){rows[focus][2](-1);store();snd('beep')}if(act('right')){rows[focus][2](1);store();snd('beep')}}else if(act('ok')){acts[focus-rows.length]();return}
 if(act('back')){setState('era');return}
 const lw=Math.min(190,W*.46|0);rows.forEach(([n,v,c],i)=>{const y=30+i*30,sel=focus==i;panel(8,y,lw,26,sel?'#3a3020':'#222838',sel?'#ffd860':'#a89870');T(n,14,y+4,'#a8b8c8');T(v(),lw/2+8,y+14,sel?'#ffe890':'#fff','center');
  T('◀',14,y+14,'#ffd860');T('▶',lw-4,y+14,'#ffd860','right');btn(8,y,lw/2,26,()=>{focus=i;c(-1);store()});btn(8+lw/2,y,lw/2,26,()=>{focus=i;c(1);store()})});
 const rx=lw+16,rw=W-rx-8;panel(rx,30,rw,150);const gun=drawGun(lo.p,lo.att[lo.p],false);X.drawImage(gun.c,rx+rw/2-85|0,34);
 const g2=drawGun(lo.s,lo.att[lo.s],false);X.drawImage(g2.c,rx+rw-120|0,64,85,32);T(WPN[lo.p].n,rx+8,84,'#ffd860');statBars(rx+8,98,lo.p,lo.att[lo.p]);
 const by=H-30;button(8,by,92,22,'ATTACHMENTS',acts[0],focus==4);button(106,by,80,22,'DEPLOY ▶',acts[1],focus==5);button(W-68,by,60,22,'BACK',acts[2],focus==6);
 T('SAVED AUTOMATICALLY',W-72,by-10,'#6a7a8a','right')}
function drawAttach(){menuBG();const e=ERA,lo=loadout(e.id),wid=attTab?lo.s:lo.p;lo.att[wid]=lo.att[wid]||{};const at=lo.att[wid];
 T('ATTACHMENTS - '+WPN[wid].n,W/2,8,'#ffd860','center',1);
 button(8,18,90,16,'PRIMARY',()=>{attTab=0},attTab==0);button(102,18,90,16,'SECONDARY',()=>{attTab=1},attTab==1);if(kp.Tab||gpP(4)||gpP(5))attTab^=1;
 const nb=SLOTS.length+1;if(act('up'))focus=(focus+nb-1)%nb;if(act('down'))focus=(focus+1)%nb;if(act('back')||(focus==SLOTS.length&&act('ok'))){setState('loadout');focus=4;return}
 const chg=(sl,d)=>{const l=attList(sl,e.id,wid);if(l.length<2)return;const cur=Math.max(0,l.findIndex(a=>a.id==(at[sl]||ATT[sl][0].id)));at[sl]=l[(cur+d+l.length)%l.length].id;store()};
 if(focus<SLOTS.length){if(act('left'))chg(SLOTS[focus],-1);if(act('right'))chg(SLOTS[focus],1)}
 const lw=Math.min(180,W*.45|0);const prev=menuT?null:null;
 SLOTS.forEach((sl,i)=>{const y=38+i*24,sel=focus==i,l=attList(sl,e.id,wid),cur=attGet(sl,at[sl]),na=l.length<2;panel(8,y,lw,22,sel?'#3a3020':'#222838',sel?'#ffd860':'#a89870');
  T(SLOTN[sl],14,y+3,'#8898a8');T(na?'N/A':attName(cur,e.id),lw/2+8,y+12,na?'#5a6070':sel?'#ffe890':'#fff','center');if(!na){T('◀',14,y+12,'#ffd860');T('▶',lw-4,y+12,'#ffd860','right');
  btn(8,y,lw/2,22,()=>{focus=i;chg(sl,-1)});btn(8+lw/2,y,lw/2,22,()=>{focus=i;chg(sl,1)})}});
 const rx=lw+16,rw=W-rx-8;panel(rx,38,rw,142);const gun=drawGun(wid,at,false);const scl=rw>=180?1:rw/175;X.drawImage(gun.c,rx+4,42,170*scl|0,64*scl|0);statBars(rx+8,112,wid,at,{});
 T('GREEN/RED = VS BASE',rx+8,H-52,'#6a7a8a');button(W-68,H-30,60,22,'DONE',()=>{setState('loadout');focus=4},focus==SLOTS.length)}
function overlay(title,sub,btns){X.fillStyle='rgba(8,10,16,.72)';X.fillRect(0,0,W,H);panel(W/2-120,40,240,150);T(title,W/2,56,'#ffd860','center',2);sub.forEach((s,i)=>T(s,W/2,82+i*11,'#e8e8f0','center'));
 if(act('up'))focus=(focus+btns.length-1)%btns.length;if(act('down'))focus=(focus+1)%btns.length;
 btns.forEach(([l,f],i)=>button(W/2-70,140+i*24-(btns.length>2?12:0),140,20,l,f,focus==i));if(act('ok'))btns[focus][1]()}
// ---------- main loop
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;pollPad();UI=[];menuT+=dt;
 try{if(state=='play'){update(dt);if(state=='play'||state=='dead'||state=='clear'||state=='victory'||state=='pause'){renderWorld();drawView();drawHUD()}}
 else if(state=='title')drawTitle();else if(state=='era'){tNow+=dt;drawEra()}else if(state=='loadout'){tNow+=dt;drawLoadout()}else if(state=='attach'){tNow+=dt;drawAttach()}
 else{renderWorld();drawHUD();const acc=stats.shots?Math.round(stats.hits/stats.shots*100):0,tm=Math.round(stats.t);
  if(state=='pause'){overlay('PAUSED',['WASD/STICK MOVE - MOUSE/DRAG LOOK','FIRE / ADS / RELOAD / SWAP / USE'],[['RESUME',()=>setState('play')],['RESTART LEVEL',()=>startLevel(EI,LI)],['QUIT TO MENU',()=>{setState('loadout')}]]);if(kp.Escape&&menuT>.2)setState('play')}
  else if(state=='dead')overlay('K.I.A.',['YOU WERE TAKEN OUT.','KILLS '+stats.kills+'   ACCURACY '+acc+'%'],[['RETRY LEVEL',()=>{P=null;startLevel(EI,LI)}],['LOADOUT',()=>setState('loadout')]]);
  else if(state=='clear')overlay('MISSION COMPLETE',[ERA.levels[LI],'KILLS '+stats.kills+'  ACC '+acc+'%  TIME '+tm+'S'],[['NEXT MISSION ▶',()=>startLevel(EI,LI+1)],['LOADOUT',()=>setState('loadout')]]);
  else if(state=='victory')overlay('ERA CLEARED!',[ERA.bossName+' DESTROYED','KILLS '+stats.kills+'  ACC '+acc+'%','THE '+ERA.name+' CAMPAIGN IS WON'],[['ERA SELECT',()=>setState('era')]])}}
 catch(err){console.warn(err)}
 for(const k in kp)delete kp[k];gpPrev={...gp.b,ax:Math.abs(gp.axes[0])>.6,ay:Math.abs(gp.axes[1])>.6};requestAnimationFrame(frame)}
requestAnimationFrame(frame);
if('serviceWorker'in navigator&&location.protocol.startsWith('http')&&!/[?&]nosw/.test(location.search))navigator.serviceWorker.register('sw.js').catch(()=>{});
// test hooks
window.AOE={get state(){return state},start:(e,l)=>{P=null;startLevel(e,l)},setState,get P(){return P},get ENTS(){return ENTS},get L(){return L},
 toBoss(){const b=ENTS.find(e=>e.type=='boss');if(!b)return;const rm=L.rooms[L.rooms.length-1];P.x=rm.x+rm.w/2;P.y=b.y<rm.y+rm.h/2?rm.y+rm.h-1.5:rm.y+1.5;if(solid(P.x,P.y))P.x+=.6;P.a=Math.atan2(b.y-P.y,b.x-P.x);b.alert=true;for(let i=0;i<L.door.length;i++)if(L.g[i]>=5&&L.g[i]<=7)L.door[i]=1},
 faceNearest(){let best=null,bd=99;for(const e of ENTS){if(!e.alive)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd&&los(P.x,P.y,e.x,e.y)){bd=d;best=e}}if(best)P.a=Math.atan2(best.y-P.y,best.x-P.x);return!!best},
 nearEnemy(){for(const e of ENTS){if(!e.alive||e.type!='soldier'&&e.type!='officer')continue;for(let k=0;k<16;k++){const a=k*Math.PI/8,x=e.x+Math.cos(a)*3.2,y=e.y+Math.sin(a)*3.2;if(freeAt(x,y,.3)&&los(x,y,e.x,e.y)){P.x=x;P.y=y;P.a=a+Math.PI;e.alert=true;return true}}}return false},
 god(){P.hp=1e6},setAtt(slot,id,tab=0){const lo=loadout(ERA.id),w=tab?lo.s:lo.p;lo.att[w]=lo.att[w]||{};lo.att[w][slot]=id;store()},setLo(o){Object.assign(loadout(ERA.id),o);store()},era:i=>{EI=i;ERA=ERAS[i]}};
