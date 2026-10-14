'use strict';
const cv=document.getElementById('c');const X=cv.getContext('2d');
let W=320,H=240,S=1,DPR=1;
const DEST=[
 {n:'MOON',goal:3500,g:22,lim:24,amp:12,kind:'moon',sky:'space',obj:'earth',drag:0,pal:['#e2e2de','#b0b0ac','#808080','#505050','#2e2e30']},
 {n:'MARS',goal:5000,g:34,lim:24,amp:18,kind:'mars',sky:'mars',obj:'phobos',drag:.4,pal:['#f0a068','#c8683a','#984426','#62261a','#36140e']},
 {n:'PHOBOS',goal:5600,g:9,lim:16,amp:10,kind:'phobos',sky:'space',obj:'mars',drag:0,pal:['#b8a690','#8a7866','#625446','#40362c','#221c18']},
 {n:'EUROPA',goal:7000,g:20,lim:20,amp:7,kind:'europa',sky:'space',obj:'jupiter',drag:0,pal:['#ffffff','#dce6f4','#a8bcd8','#6c80a4','#3e4a66']},
 {n:'TITAN',goal:8200,g:18,lim:18,amp:12,kind:'titan',sky:'titan',obj:'saturn',drag:.8,pal:['#e8a858','#b8783a','#86501e','#56300e','#2e1806']}];
const MIL=[{d:3500,i:0},{d:9000,i:1},{d:12500,i:2},{d:21000,i:3},{d:31000,i:4}];
// ---------- storage ----------
let SV={unlocked:1,best:{},endBest:0,lb:[],veh:0,tilt:0};
try{const s=JSON.parse(localStorage.getItem('rocketrun_v1'));if(s)SV=Object.assign(SV,s)}catch(e){}
const save=()=>{try{localStorage.setItem('rocketrun_v1',JSON.stringify(SV))}catch(e){}};
// ---------- art ----------
let VEH,SAT,STG,FUEL,SHLD,AST=[],PL={},EARTHBIG=null;
function initArt(){VEH=buildVehicles();SAT=buildSat();STG=buildStage();FUEL=buildFuel();SHLD=buildShield();
 for(let i=0;i<8;i++)AST.push(buildAst([5,6,8,9,11,12,14,16][i],i*17+3));
 for(const k of['earth','moon','mars','phobos','europa','titan','jupiter'])PL[k]=planet(48,k);PL.saturn=planet(40,'saturn',true);
 PL.ic={};DEST.forEach(d=>PL.ic[d.kind]=planet(8,d.kind))}
// ---------- canvas ----------
function resize(){DPR=Math.min(3,window.devicePixelRatio||1);const iw=innerWidth,ih=innerHeight;S=Math.max(1,Math.round(Math.min(iw,ih)*DPR/250));
 W=Math.ceil(iw*DPR/S);H=Math.ceil(ih*DPR/S);cv.width=W;cv.height=H;cv.style.width=iw+'px';cv.style.height=ih+'px';X.imageSmoothingEnabled=false;EARTHBIG=null;
 if(G&&G.terrain)G.terrain=null;stars=mkStars()}
let stars=[];function mkStars(){const R=rng(99),a=[];for(let i=0;i<Math.max(60,W*H/300);i++)a.push({x:R()*W,y:R()*H,l:1+Math.floor(R()*3),c:R()<.15?'#ffd8a0':R()<.3?'#a8c8ff':'#ffffff'});return a}
const T=(s,x,y,c='#fff',al='l',sc=1,sh=1)=>{s=String(s);const w=fW(s,sc);if(al=='c')x-=w/2;else if(al=='r')x-=w;x=Math.round(x);y=Math.round(y);if(sh)glyphs(X,s,x+sc,y+sc,sc,'#000');glyphs(X,s,x,y,sc,c)};
const R_=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
function panel(x,y,w,h,a=.86){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);X.fillStyle='rgba(6,8,18,'+a+')';X.fillRect(x+1,y+1,w-2,h-2);
 X.fillStyle='#e8c878';X.fillRect(x+2,y,w-4,1);X.fillRect(x+2,y+h-1,w-4,1);X.fillRect(x,y+2,1,h-4);X.fillRect(x+w-1,y+2,1,h-4);X.fillRect(x+1,y+1,1,1);X.fillRect(x+w-2,y+1,1,1);X.fillRect(x+1,y+h-2,1,1);X.fillRect(x+w-2,y+h-2,1,1);
 X.fillStyle='#5a4a28';X.fillRect(x+2,y+1,w-4,1)}
function gradTxt(s,x,y,sc){const w=fW(s,sc);x=Math.round(x-w/2);glyphs(X,s,x+sc,y+sc,sc,'#000');glyphs(X,s,x,y+sc*0,sc,'#000');const gr=X.createLinearGradient(0,y,0,y+7*sc);gr.addColorStop(0,'#fff4c0');gr.addColorStop(.5,'#ffc040');gr.addColorStop(1,'#c04a10');glyphs(X,s,x,y-sc,sc,gr);
 X.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<s.length;k++)if(FONT[s[k]])X.fillRect(x+k*6*sc,y-sc,sc,sc)}
// ---------- input ----------
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const keys={},acts=[];let ptr={},UI=[],sel=0,tiltAx=0,padAx=0,padBoost=false,padPrev={},lastTouchDrag=0,anyTouch=false;
const KM={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Enter:'ok',KeyZ:'ok',Space:'ok',Escape:'back',KeyP:'pause',Backspace:'del'};
addEventListener('keydown',e=>{if(e.repeat&&!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys[e.code]=1;return}keys[e.code]=1;audioInit();if(KM[e.code])acts.push(KM[e.code]);if(/^Key[A-Z]$/.test(e.code))acts.push('ch:'+e.code[3]);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=0});
const toI=e=>[e.clientX*DPR/S,e.clientY*DPR/S];
function boostBtn(){const r=Math.round(Math.min(W,H)*.13);return{x:W-r-10,y:H-r-12,r}}
function pauseBtn(){return{x:W-20,y:3,w:17,h:15}}
cv.addEventListener('pointerdown',e=>{audioInit();if(e.pointerType=='touch')anyTouch=true;const[x,y]=toI(e);cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
 const p={x,y,sx:x,sy:y,lx:x,boost:false,t:performance.now()};ptr[e.pointerId]=p;
 if(G.mode=='play'){const pb=pauseBtn();if(x>pb.x-6&&y<pb.y+pb.h+6){acts.push('pause');p.dead=1;return}
  const b=boostBtn();if((anyTouch||e.pointerType!='mouse')&&Math.hypot(x-b.x,y-b.y)<b.r+10)p.boost=true;else if(e.pointerType=='mouse')p.boost=true}e.preventDefault()});
cv.addEventListener('pointermove',e=>{const p=ptr[e.pointerId];if(!p)return;const[x,y]=toI(e);if(G.mode=='play'&&!p.boost&&!p.dead&&e.pointerType!='mouse'){G.dragDx+=(x-p.lx)*1.25;lastTouchDrag=performance.now()}p.lx=x;p.x=x;p.y=y});
function pUp(e){const p=ptr[e.pointerId];delete ptr[e.pointerId];if(!p)return;const[x,y]=toI(e);
 if(G.mode!='play'){for(let i=0;i<UI.length;i++){const b=UI[i];if(x>=b.x-2&&x<=b.x+b.w+2&&y>=b.y-2&&y<=b.y+b.h+2){sel=i;if(b.act){sfx('ok');b.act()}break}}}}
cv.addEventListener('pointerup',pUp);cv.addEventListener('pointercancel',e=>delete ptr[e.pointerId]);
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('deviceorientation',e=>{if(!SV.tilt)return;const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;let v=ang==90?e.beta:ang==-90||ang==270?-e.beta:ang==180?-e.gamma:e.gamma;tiltAx=clamp((v||0)/18,-1,1)});
function pollPad(){padAx=0;padBoost=false;const ps=navigator.getGamepads?navigator.getGamepads():[];for(const gp of ps){if(!gp)continue;const ax=gp.axes[0]||0;if(Math.abs(ax)>.18)padAx=ax;const bt=i=>gp.buttons[i]&&gp.buttons[i].pressed;
 if(bt(14))padAx=-1;if(bt(15))padAx=1;padBoost=bt(0)||bt(7)||bt(5);const m={12:'up',13:'down',14:'left',15:'right',0:'ok',1:'back',9:'pause'};
 for(const k in m){const v=bt(+k),id=gp.index+':'+k;if(v&&!padPrev[id])acts.push(m[k]);padPrev[id]=v}
 const ay=gp.axes[1]||0,id2=gp.index+':ay';const st=ay<-.6?'up':ay>.6?'down':'';if(st&&padPrev[id2]!=st)acts.push(st);padPrev[id2]=st;break}}
// ---------- audio ----------
let AC=null,engG=null;function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.04*(Math.random()*2-1))/1.04;d[i]=l*3}
 const s=AC.createBufferSource();s.buffer=b;s.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=500;engG=AC.createGain();engG.gain.value=0;s.connect(f).connect(engG).connect(AC.destination);s.start()}catch(e){AC=null}}
function sfx(t){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;const P={ok:[660,880,.08,'square',.05],pick:[520,1040,.15,'square',.06],shield:[300,900,.25,'triangle',.08],hit:[200,40,.4,'sawtooth',.12],boom:[120,30,.7,'sawtooth',.15],nm:[900,1300,.07,'square',.04],stage:[180,90,.35,'triangle',.1],win:[440,1320,.6,'square',.06],warn:[700,500,.2,'square',.05]}[t]||[440,440,.1,'square',.05];
 o.type=P[3];o.frequency.setValueAtTime(P[0],n);o.frequency.exponentialRampToValueAtTime(P[1],n+P[2]);g.gain.setValueAtTime(P[4],n);g.gain.exponentialRampToValueAtTime(.001,n+P[2]);o.connect(g).connect(AC.destination);o.start(n);o.stop(n+P[2]+.02)}catch(e){}}
// ---------- game state ----------
let G={mode:'title',t:0,dragDx:0};let auto=false;
function newRun(type,dest){const V=VEH[SV.veh];G=Object.assign(G,{mode:'play',type,dest:dest||0,V,x:W/2,vx:0,fuel:100,shield:V.shield0+(type=='camp'?1:0),inv:0,dist:0,speed:0,staged:false,stageT:-1,phase:'fly',
 deb:[],picks:[],parts:[],pops:[],booster:null,score:0,bonus:0,picksN:0,nm:0,combo:0,maxCombo:0,comboT:0,mil:0,banner:null,spawnT:1.5,showerT:14,warn:null,pickT:3,shT:16,deadT:0,cause:'',
 land:null,terrain:null,dragDx:0,t0:G.t,shake:0,hint:3.5,legs:0,boostOn:false,result:null});
 if(type=='camp')G.goal=DEST[G.dest].goal;G.stageAt=type=='camp'?Math.round(G.goal*.22):1600;banner(type=='camp'?'LIFTOFF! DESTINATION '+DEST[G.dest].n:'ENDLESS RUN - LIFTOFF!',2.2);sfx('stage')}
function banner(a,b,t){if(typeof b=='number'){t=b;b=''}t=t||2;G.banner={a,b:b||'',t,max:t}}
function pop(x,y,s,c='#fff'){G.pops.push({x,y,s,c,t:1.1})}
function boom(x,y,n=30,big=1){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=(20+Math.random()*90)*big;G.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.8,max:1.2,c:['#fff6c0','#ffd040','#ff8a20','#e0401a','#7a2a1a'][i%5],s:1+(Math.random()<.3)})}
 for(let i=0;i<n/3;i++)G.parts.push({x:x+Math.random()*8-4,y:y+Math.random()*8-4,vx:Math.random()*20-10,vy:Math.random()*20-10,life:1.2,max:1.2,c:'#4a4650',s:2,smoke:1})}
function rocketH(){return(G.staged?G.V.upper:G.V.full).height}
function rocketY(){return G.phase=='land'?G.land.y:Math.round(H*(H>W?.76:.8))-(G.staged?G.V.full.height-G.V.upper.height-6:0)}
function hitbox(){const sp=G.staged?G.V.upper:G.V.full,h=sp.height,y=rocketY();return{x:G.x-sp.width/2+2,y:y-h+3,w:sp.width-4,h:h-4}}
function steerAx(){let a=0;if(keys.ArrowLeft||keys.KeyA)a-=1;if(keys.ArrowRight||keys.KeyD)a+=1;if(padAx)a=padAx;if(SV.tilt&&Math.abs(tiltAx)>.05)a=tiltAx;return clamp(a,-1,1)}
function boostHeld(){if(keys.Space||keys.ArrowUp||keys.KeyW||keys.ShiftLeft||padBoost)return true;for(const k in ptr)if(ptr[k].boost)return true;return false}
function autoPilot(){const y=rocketY(),hb=hitbox();if(G.phase=='land'){const L=G.land,alt=groundAt(G.x)-y;const dv=clamp((L.padX-G.x)*.9,-28,28);const ax=clamp((dv-G.vx)/8,-1,1);
  let want=alt>45?30:Math.max(6,alt*.35);if(Math.abs(L.padX-G.x)>L.padW/2-6&&alt<60)want=Math.min(want,0);return{ax,boost:L.vy>want}}
 let push=0;for(const d of G.deb){const ahead=y-d.y;if(ahead<-10||ahead>150)continue;const px=d.x+(d.vx||0)*(ahead/(G.speed+d.vy+1));const dx=G.x-px,m=d.r+hb.w/2+10;if(Math.abs(dx)<m)push+=(dx>=0?1:-1)*(1.6-ahead/150)*(m-Math.abs(dx))/m*2}
 if(G.warn){const dx=G.x-G.warn.x;if(Math.abs(dx)<G.warn.w/2+12)push+=(dx>=0?1:-1)*1.5}
 if(Math.abs(push)<.2)for(const p of G.picks){const ahead=y-p.y;if(ahead>0&&ahead<160){push+=clamp((p.x-G.x)/20,-1,1);break}}
 if(G.x<30)push+=.6;if(G.x>W-30)push-=.6;if(Math.abs(push)<.15)push=(W/2-G.x)/W;return{ax:clamp(push,-1,1),boost:G.fuel>45&&Math.abs(push)<.3}}
function spawnDeb(d){const R=Math.random();let o;const r=Math.random;if(R<.5){const i=Math.min(7,Math.floor(r()*(4+d*4)));const sp=AST[i];o={k:'ast',sp,r:sp.width/2-2.5,rot:r()*6,vr:(r()-.5)*2}}
 else if(R<.75)o={k:'sat',sp:SAT,r:7,rot:(r()-.5)*.6,vr:(r()-.5)*.8};else o={k:'stg',sp:STG,r:7,rot:r()*6,vr:(r()-.5)*3};
 o.x=12+r()*(W-24);o.y=-22;o.vy=8+r()*30*(.5+d);o.vx=(r()-.5)*20*(.3+d);G.deb.push(o)}
function update(dt){G.t+=dt;pollPad();
 if(G.mode=='play')updPlay(dt);else{const a=acts.splice(0);menuInput(a)}
 if(engG){const on=G.mode=='play'&&(G.phase=='fly'||G.phase=='land')&&!G.dead;engG.gain.value=on?(G.boostOn?.18:.07):0}}
function updPlay(dt){for(const a of acts.splice(0)){if(a=='pause'||a=='back'){G.mode='pause';sel=0;return}}
 const V=G.V,y=rocketY();let ax=steerAx(),bst=boostHeld();if(auto){const a=autoPilot();ax=a.ax;bst=a.boost}
 G.hint-=dt;G.inv=Math.max(0,G.inv-dt);G.shake=Math.max(0,G.shake-dt);
 if(G.banner&&(G.banner.t-=dt)<=0)G.banner=null;
 for(const p of G.parts){p.x+=p.vx*dt;p.y+=p.vy*dt+(p.smoke&&G.phase=='fly'?G.speed*dt*.6:0);p.life-=dt;if(p.smoke){p.vx*=.97;p.vy*=.97}}G.parts=G.parts.filter(p=>p.life>0);
 for(const p of G.pops){p.y-=18*dt;p.t-=dt}G.pops=G.pops.filter(p=>p.t>0);
 if(G.phase=='dead'){G.deadT-=dt;if(G.deadT<=0)endRun(false);return}
 if(G.phase=='won'){G.deadT-=dt;if(G.deadT<=0)endRun(true);return}
 G.boostOn=bst&&G.fuel>0;
 if(G.phase=='land'){updLand(dt,ax);return}
 // ---- flight ----
 const end=G.type=='endless',diff=end?Math.min(1.25,G.dist/30000):.15+G.dest*.14+.35*(G.dist/G.goal);
 const base=end?70+Math.min(120,G.dist*.004):70,top=base+(end?85:80);G.speed=lerp(G.speed,G.boostOn?top:base,dt*(G.boostOn?1.8:1.2));
 if(G.stageT>=0&&G.stageT<.5)G.speed*=.995;
 G.dist+=G.speed*dt;G.fuel-=dt*(end?1.35:1)*V.eco*(1+(G.boostOn?3:0));
 if(G.fuel<=0){G.fuel=0;G.speed=lerp(G.speed,0,dt*.8);if(G.speed<25){G.cause='OUT OF FUEL';die()}}
 const tv=ax*120*V.agile;G.vx=lerp(G.vx,tv,Math.min(1,dt*7));G.x+=G.vx*dt+G.dragDx;G.dragDx=0;G.x=clamp(G.x,8,W-8);
 // staging
 if(!G.staged&&G.dist>=G.stageAt){G.staged=true;G.stageT=0;G.fuel=100;const bs=V.boost;G.booster={x:G.x,y:rocketY()+1,vy:-14,rot:0,vr:(Math.random()<.5?-1:1)*.9};banner('STAGE SEPARATION','2ND STAGE IGNITION',2);sfx('stage');boom(G.x,y-V.upper.height,10,.4);G.shake=.3}
 if(G.stageT>=0)G.stageT+=dt;if(G.booster){const b=G.booster;b.vy+=26*dt;b.y+=b.vy*dt+G.speed*dt*.15;b.rot+=b.vr*dt;b.x+=(b.vr>0?8:-8)*dt;if(b.y>H+60)G.booster=null}
 // spawns
 const atmo=G.dist<500;G.spawnT-=dt;if(G.spawnT<=0&&!atmo){spawnDeb(diff);G.spawnT=lerp(1.3,.28,clamp(diff,0,1))*(G.staged?1:1.5)*(.7+Math.random()*.6)*(70/Math.max(60,G.speed))*1.3}
 G.pickT-=dt;if(G.pickT<=0&&!atmo){G.picks.push({k:'fuel',x:15+Math.random()*(W-30),y:-14,vy:12});G.pickT=end?4.5+Math.random()*3:5.5+Math.random()*3}
 G.shT-=dt;if(G.shT<=0&&!atmo){G.picks.push({k:'shield',x:15+Math.random()*(W-30),y:-14,vy:10});G.shT=16+Math.random()*10}
 if(G.staged){G.showerT-=dt;if(G.showerT<=0&&!G.warn){const w=Math.min(W*.45,50+diff*50);G.warn={x:w/2+Math.random()*(W-w),w,t:1.6,n:0};sfx('warn');G.showerT=lerp(15,6,clamp(diff,0,1))+Math.random()*5}}
 if(G.warn){G.warn.t-=dt;if(G.warn.t<=0){if(Math.random()<dt*28){G.deb.push({k:'mm',x:G.warn.x+(Math.random()-.5)*G.warn.w,y:-6,vy:190+Math.random()*90+diff*60,vx:(Math.random()-.5)*14,r:1.5});G.warn.n++}if(G.warn.t<-1.3)G.warn=null}}
 // move & collide
 const hb=hitbox();
 for(const d of G.deb){d.y+=(G.speed+d.vy)*dt;d.x+=d.vx*dt;if(d.rot!=null)d.rot+=d.vr*dt;
  const cx=clamp(d.x,hb.x,hb.x+hb.w),cy=clamp(d.y,hb.y,hb.y+hb.h),gap=Math.hypot(d.x-cx,d.y-cy)-d.r;d.min=Math.min(d.min==null?99:d.min,gap);
  if(gap<0&&!d.gone){if(G.inv>0)continue;d.gone=1;if(G.shield>0){G.shield--;G.inv=1.3;boom(d.x,d.y,16,.6);sfx('shield');pop(d.x,d.y-6,'SHIELD!','#7ad0ff');G.shake=.25}else{G.cause=d.k=='mm'?'MICROMETEOROID STRIKE':d.k=='sat'?'HIT A DEAD SATELLITE':d.k=='stg'?'HIT SPENT ROCKET STAGE':'ASTEROID IMPACT';die();return}}
  if(!d.gone&&!d.nmd&&d.y-d.r>hb.y+hb.h){d.nmd=1;if(d.min<(d.k=='mm'?7:10)){G.nm++;G.combo=Math.min(20,G.combo+1);G.maxCombo=Math.max(G.maxCombo,G.combo);G.comboT=2.6;const b=25*G.combo;G.bonus+=b;pop(d.x,hb.y+hb.h-10,'NEAR MISS +'+b,G.combo>4?'#ff8af0':'#ffe060');sfx('nm')}}}
 G.deb=G.deb.filter(d=>d.y<H+30&&!d.gone&&d.x>-40&&d.x<W+40);
 if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0}
 for(const p of G.picks){p.y+=(G.speed+p.vy)*dt;if(Math.abs(p.x-G.x)<hb.w/2+6&&p.y>hb.y-6&&p.y<hb.y+hb.h+6){p.got=1;G.picksN++;if(p.k=='fuel'){G.fuel=Math.min(100,G.fuel+30);G.bonus+=100;pop(p.x,p.y,'FUEL +100','#8aff6a');sfx('pick')}else{G.shield=Math.min(3,G.shield+1);G.bonus+=150;pop(p.x,p.y,'SHIELD +150','#7ad0ff');sfx('shield')}
  for(let i=0;i<10;i++)G.parts.push({x:p.x,y:p.y,vx:Math.random()*60-30,vy:Math.random()*60-30,life:.5,max:.5,c:p.k=='fuel'?'#8aff6a':'#7ad0ff',s:1})}}
 G.picks=G.picks.filter(p=>!p.got&&p.y<H+20);
 // exhaust
 if(Math.random()<.9){const fw=G.staged?V.uw:V.fw;G.parts.push({x:G.x+(Math.random()-.5)*fw,y:y+6+Math.random()*4,vx:(Math.random()-.5)*10,vy:20,life:G.dist<600?1.4:.5,max:1.4,c:G.dist<600?'#d8d4d0':'#6a6670',s:G.dist<600?3:1,smoke:1})}
 // score/milestones
 G.score=Math.floor(G.dist/10)+G.bonus;
 if(end){const m=mil(G.mil);if(G.dist>=m.d){const b=500*(G.mil+1);G.bonus+=b;banner('PASSED '+m.n+'!','MILESTONE +'+b,2.4);sfx('win');G.mil++}}
 else if(G.dist>=G.goal)startLanding()}
function mil(i){if(i<MIL.length)return{d:MIL[i].d,n:DEST[MIL[i].i].n,k:DEST[MIL[i].i].kind};return{d:31000+(i-MIL.length+1)*12000,n:'DEEP SPACE '+(i-MIL.length+1),k:null}}
function die(){G.phase='dead';G.deadT=1.8;const y=rocketY();boom(G.x,y-rocketH()/2,60,1.3);boom(G.x,y-rocketH(),20,.8);sfx('boom');G.shake=.6;G.combo=0}
// ---------- landing ----------
function startLanding(){const D=DEST[G.dest];G.phase='land';G.deb=[];G.picks=[];G.warn=null;G.booster=null;G.staged=true;G.fuel=Math.max(G.fuel,45);
 G.land={y:Math.round(H*.18),vy:28,padW:G.V===VEH[1]?40:34,padX:0,t:0};G.vx=0;G.x=W/2;G.terrain=null;banner(D.n+' APPROACH','LAND ON THE PAD - MAX SPEED '+D.lim,3);sfx('stage')}
let TER=null;
function buildTerrain(){const D=DEST[G.dest],L=G.land,R=rng(G.dest*31+7);const pal=D.pal.map(hx);if(!L.padX)L.padX=Math.round(L.padW+R()*(W-L.padW*2-Math.min(W,H)*.3));
 const base=H-Math.max(26,Math.round(H*.12)),hy=new Array(W),hy2=new Array(W);const ph=[R()*9,R()*9,R()*9];
 for(let x=0;x<W;x++){hy[x]=base-D.amp*(.5*Math.sin(x*.021+ph[0])+.3*Math.sin(x*.057+ph[1])+.2*Math.sin(x*.13+ph[2]))-fbm(x*.08,G.dest)*4;hy2[x]=base-18-D.amp*1.6*fbm(x*.012+ph[0],3)-10*Math.abs(Math.sin(x*.01+ph[1]))}
 const pv=hy[L.padX];for(let x=0;x<W;x++){const d=Math.abs(x-L.padX)-L.padW/2;if(d<4)hy[x]=pv;else if(d<20)hy[x]=lerp(pv,hy[x],(d-4)/16)}
 for(let x=0;x<W;x++)hy[x]=Math.round(hy[x]),hy2[x]=Math.round(hy2[x]);
 const cr=[];for(let i=0;i<W/30;i++)cr.push([R()*W,R(),3+R()*9]);
 const c=mk(W,H,(g)=>pix(g,W,H,(x,y)=>{if(y>=hy[x]){const dp=y-hy[x];if(Math.abs(x-L.padX)<L.padW/2+2&&dp<2)return pal[2];
   for(const k of cr){const cy=hy[Math.min(W-1,Math.max(0,k[0]|0))]+4+k[1]*(H-hy[k[0]|0]-6);const ex=(x-k[0])/k[2],ey=(y-cy)/(k[2]*.35);const e=ex*ex+ey*ey;if(e<1&&Math.abs(x-L.padX)>L.padW/2+3)return ey<0?pal[3]:pal[e>.6?1:3]}
   if(D.kind=='europa'&&Math.abs(Math.sin(x*.09+y*.31+fbm(x*.05,y*.05)*8))<.06)return hx('#a8603a');
   const v=dp<1?0:clamp(Math.floor(1+dp/9+fbm(x*.15,y*.15,4)*1.4-.5+thr(x,y)),1,4);return pal[v]}
  if(y>=hy2[x]){const v=y==hy2[x]?2:3;return mix(pal[v],pal[4],.35).concat(255)}return null}));
 G.terrain={c,hy}}
function groundAt(x){if(!G.terrain)return H;return G.terrain.hy[clamp(Math.round(x),0,W-1)]}
function updLand(dt,ax){const D=DEST[G.dest],L=G.land,V=G.V;if(!G.terrain)buildTerrain();L.t+=dt;
 L.vy+=D.g*dt;if(G.boostOn){L.vy-=(D.g+48)*dt;G.fuel-=dt*7*V.eco}if(G.fuel<0)G.fuel=0;
 G.vx+=ax*40*V.agile*dt;G.vx*=1-dt*(.4+D.drag);G.x+=G.vx*dt+G.dragDx*.6;G.dragDx=0;G.x=clamp(G.x,8,W-8);L.y+=L.vy*dt;if(L.y<20){L.y=20;L.vy=Math.max(0,L.vy)}
 const half=V.upper.width/2+3,gy=Math.min(groundAt(G.x-half),groundAt(G.x),groundAt(G.x+half));const alt=gy-L.y;G.legs=alt<55?Math.min(1,G.legs+dt*2):G.legs;
 if(G.boostOn&&Math.random()<.9)G.parts.push({x:G.x+(Math.random()-.5)*3,y:L.y+5,vx:(Math.random()-.5)*14,vy:40,life:.4,max:.5,c:'#ffb040',s:1});
 if(alt<25&&G.boostOn)for(let i=0;i<2;i++)G.parts.push({x:G.x,y:gy-1,vx:(Math.random()<.5?-1:1)*(30+Math.random()*40),vy:-Math.random()*8,life:.6,max:.6,c:D.pal[1],s:1});
 G.score=Math.floor(G.dist/10)+G.bonus;
 if(L.y>=gy){L.y=gy;const onPad=Math.abs(G.x-L.padX)<L.padW/2-2,soft=L.vy<=D.lim&&Math.abs(G.vx)<14;
  if(onPad&&soft){G.phase='won';G.deadT=2.2;const lb=Math.round(G.fuel*10+(D.lim-L.vy)*25+500);G.bonus+=lb;G.score=Math.floor(G.dist/10)+G.bonus;G.landBonus=lb;banner('TOUCHDOWN!','LANDING BONUS +'+lb,2.4);sfx('win');
   for(let i=0;i<30;i++)G.parts.push({x:G.x+(Math.random()-.5)*20,y:gy-1,vx:(Math.random()-.5)*80,vy:-Math.random()*15,life:1,max:1,c:'#c8c4c0',s:2,smoke:1})}
  else{G.cause=!onPad?'MISSED THE LANDING PAD':'TOUCHDOWN TOO FAST ('+Math.round(L.vy)+' > '+D.lim+')';die()}}}
// ---------- end of run ----------
function endRun(won){sel=0;if(G.type=='camp'){const D=DEST[G.dest];const k=D.kind;let nb=false;if(won){if(!SV.best[k]||G.score>SV.best[k].s){SV.best[k]={s:G.score,d:Math.floor(G.dist/10)};nb=true}SV.unlocked=Math.max(SV.unlocked,Math.min(DEST.length,G.dest+2))}save();G.result={won,nb};G.mode='result';return}
 const nb=G.score>SV.endBest;if(nb)SV.endBest=G.score;save();G.result={nb};G.mode='over';G.ini=null;
 if(qualifies(G.score)){G.ini={l:(SV.lastIni||'AAA').split('').map(c=>c.charCodeAt(0)-65),slot:0};G.mode='initials'}}
const qualifies=s=>s>0&&(SV.lb.length<10||s>SV.lb[SV.lb.length-1].s);
function submitIni(){const n=G.ini.l.map(i=>String.fromCharCode(65+i)).join('');SV.lastIni=n;const e={n,s:G.score,d:Math.floor(G.dist/10),id:Date.now()};SV.lb.push(e);SV.lb.sort((a,b)=>b.s-a.s);SV.lb=SV.lb.slice(0,10);save();G.hl=e.id;G.mode='board';sel=0}
// ---------- menus ----------
function menuInput(a){for(const x of a){if(G.mode=='initials'){const I=G.ini;if(x=='left')I.slot=Math.max(0,I.slot-1);else if(x=='right')I.slot=Math.min(3,I.slot+1);
   else if(x=='up'&&I.slot<3)I.l[I.slot]=(I.l[I.slot]+1)%26;else if(x=='down'&&I.slot<3)I.l[I.slot]=(I.l[I.slot]+25)%26;else if(x.startsWith('ch:')&&I.slot<3){I.l[I.slot]=x.charCodeAt(3)-65;I.slot++}
   else if(x=='del')I.slot=Math.max(0,I.slot-1);else if(x=='ok'){if(I.slot<3&&x=='ok'&&!keys.Enter&&!keys.NumpadEnter&&false)I.slot++;else submitIni()}continue}
  if(x=='up'||x=='left')sel=(sel+UI.length-1)%Math.max(1,UI.length);else if(x=='down'||x=='right')sel=(sel+1)%Math.max(1,UI.length);
  else if(x=='ok'&&UI[sel]&&UI[sel].act){sfx('ok');UI[sel].act()}else if(x=='back'||x=='pause'){if(G.mode=='pause')G.mode='play';else if(G.mode!='title'){G.mode='title';sel=0}}}}
function btn(label,x,y,w,h,act,i,dis){const b={x,y,w,h,act:dis?null:act};UI.push(b);const s=sel==UI.length-1;
 if(s){R_(x,y,w,h,'#e8c878');R_(x+1,y+h-2,w-2,1,'#b08a40');T(label,x+w/2,y+(h-7)/2|0,dis?'#776':'#1a1408','c',1,0)}else{panel(x,y,w,h,.8);T(label,x+w/2,y+(h-7)/2|0,dis?'#667':'#f0e8d0','c')}return b}
const go=m=>()=>{G.mode=m;sel=0};
// ---------- drawing ----------
const SKY=[[0,'#6aa8e8'],[.35,'#2a5ab0'],[.7,'#141a50'],[1,'#05060e']];
function skyCol(t){for(let i=1;i<SKY.length;i++)if(t<=SKY[i][0]){const a=SKY[i-1],b=SKY[i];return mix(hx(a[1]),hx(b[1]),(t-a[0])/(b[0]-a[0]))}return hx('#05060e')}
let ditherPat=null;function dpat(){if(!ditherPat)ditherPat=X.createPattern(mk(2,2,(g,r)=>{r(0,0,1,1,'#000');r(1,1,1,1,'#000')}),'repeat');return ditherPat}
function drawSkyGrad(top,bot){const st=6;for(let y=0;y<H;y+=st){const t=y/H;const c=mix(top,bot,Math.floor(t*12)/12);R_(0,y,W,st,rgb(c))}}
function drawStars(spd,alpha=1){for(const s of stars){const yy=(s.y+G.t*spd*s.l*.25)%H;X.globalAlpha=alpha*(s.l==3?1:s.l==2?.7:.45);R_(s.x,yy,1,1,s.c);if(s.l==3&&((s.x*7+G.t*3)|0)%9==0)R_(s.x-1,yy,3,1,s.c)}X.globalAlpha=1}
function drawEarthBig(off){const R=Math.round(W*.9);if(!EARTHBIG||EARTHBIG.R!=R){EARTHBIG=planet(Math.min(R,400),'earthb');EARTHBIG.R=R}const sz=EARTHBIG.width*R/Math.min(R,400);
 X.drawImage(EARTHBIG,Math.round(W/2-sz/2),Math.round(H-R*.25+off),Math.round(sz),Math.round(sz));
 X.globalAlpha=.35;X.fillStyle='#8ac8ff';X.beginPath();X.arc(W/2,H-R*.25+off+sz/2,sz/2+1,Math.PI*1.1,Math.PI*1.9);X.lineWidth=2;X.strokeStyle='#8ac8ff';X.stroke();X.globalAlpha=1}
function drawPad(gy,x){R_(0,gy,W,H-gy,'#3a4a2a');for(let i=0;i<W;i+=4)R_(i,gy,2,1,'#5a6a3a');R_(0,gy+3,W,H,'#2e3a22');R_(x-24,gy-3,48,4,'#8a8e98');R_(x-24,gy-3,48,1,'#c0c4cc');for(let i=0;i<48;i+=6)R_(x-24+i,gy,3,1,'#e0c040');
 const tx=x-17;R_(tx,gy-70,4,68,'#7a3a2a');for(let yy=gy-70;yy<gy-3;yy+=5){R_(tx-1,yy,6,1,'#a85a3a');R_(tx+1,yy+1,1,3,'#5a2a1a')}R_(tx+4,gy-55,7,2,'#8a4a32');R_(tx-2,gy-73,8,3,'#5a5e66');R_(tx+1,gy-76,1,3,'#c0c4cc');if(((G.t*2)|0)%2)R_(tx+1,gy-77,1,1,'#ff3a2a')}
function drawFlame(x,y,w,len){const f=G.t*30;for(let i=0;i<len;i++){const t=i/len,ww=Math.max(1,Math.round(w*(1-t*.6)+Math.sin(f+i)*.6));const c=t<.15?'#ffffff':t<.4?'#fff0a0':t<.7?'#ffb040':'#e0501a';
  if(t>.7&&(i+((f|0)))%2)continue;R_(Math.round(x-ww/2),y+i,ww,1,c);if(t<.5&&ww>2)R_(Math.round(x-ww/2)+1,y+i,ww-2,1,t<.25?'#ffffff':'#fff6c0')}}
function drawRocket(){if(G.phase=='dead')return;const y=Math.round(rocketY()),V=G.V,sp=G.staged?V.upper:V.full;if(G.inv>0&&((G.t*16)|0)%2)return;
 const coast=G.stageT>=0&&G.stageT<.45;const fw=G.staged?V.uw:V.fw;
 if(G.phase=='land'){if(G.boostOn)drawFlame(G.x,y,fw,10+Math.random()*5)}else if(!coast&&G.fuel>0)drawFlame(G.x,y,fw,(G.boostOn?22:12)+Math.random()*4);
 X.drawImage(sp,Math.round(G.x-sp.width/2),y-sp.height);
 if(G.legs>0){const L=Math.round(G.legs*4),bx=Math.round(G.x-sp.width/2)+2,ex=Math.round(G.x+sp.width/2)-3;for(let i=0;i<=L;i++){R_(bx-i,y-5+i,1,1,'#2a2d33');R_(ex+i,y-5+i,1,1,'#2a2d33')}R_(bx-L-1,y,2,1,'#5a5e66');R_(ex+L,y,2,1,'#5a5e66')}
 if(G.shield>0&&G.phase!='won'){const cy=y-sp.height/2,r=sp.height/2+5;X.globalAlpha=.45+.25*Math.sin(G.t*6);for(let a=0;a<6.283;a+=1/r){const px=Math.round(G.x+Math.cos(a)*(sp.width/2+6)),py=Math.round(cy+Math.sin(a)*r);R_(px,py,1,1,(a*5|0)%2?'#7ad0ff':'#e0f8ff')}X.globalAlpha=1}}
function drawRot(img,x,y,rot){X.save();X.translate(Math.round(x),Math.round(y));X.rotate(rot);X.drawImage(img,-img.width/2|0,-img.height/2|0);X.restore()}
function drawBg(){const P=G.mode=='play'||G.mode=='pause'||G.mode=='result'||G.mode=='over'||G.mode=='initials';
 if(P&&G.phase=='land'||(P&&G.phase=='won')||(P&&G.phase=='dead'&&G.land)){drawLandBg();return}
 const alt=P?clamp(G.dist/1400,0,1):0;const top=skyCol(clamp(alt*1.4+.15,0,1)),bot=skyCol(clamp(alt*1.1,0,1));drawSkyGrad(top,bot);
 drawStars(P?G.speed*.4:6,clamp(alt*1.5-.2,0,1));
 if(P){const end=G.type=='endless';
  if(G.dist>90&&G.dist<2500)drawEarthBig(30+(G.dist-90)*.07);
  const gy=rocketY()+3+G.dist*.55;if(gy<H)drawPad(Math.round(gy),Math.round(W/2));
  if(!end){const D=DEST[G.dest],p=clamp(G.dist/G.goal,0,1);if(p>.15){const r=Math.round(6+Math.pow(p,2.4)*Math.min(W,H)*.45),img=PL[D.kind];X.drawImage(img,Math.round(W*.7-r),Math.round(18+p*20-r*.4),r*2,r*2)}}
  else{const m=mil(G.mil);if(m.k){const rel=(G.dist-(m.d-1800))/2600;if(rel>0&&rel<1){const r=Math.round(Math.min(W,H)*.22),img=PL[m.k];X.drawImage(img,Math.round(W*.86-r),Math.round(-2*r+rel*(H+3*r)),r*2,r*2)}}
   const ly=rocketY()-(m.d-G.dist)*.9;if(ly>-10&&ly<H){for(let x=0;x<W;x+=8)R_(x,ly,4,1,'#e8c878');T(m.n,4,ly-9,'#e8c878')}}}}
function drawLandBg(){const D=DEST[G.dest];if(!G.terrain)buildTerrain();
 if(D.sky=='mars')drawSkyGrad(hx('#3a2420'),hx('#d8a070'));else if(D.sky=='titan')drawSkyGrad(hx('#5a3410'),hx('#e0a048'));else{R_(0,0,W,H,'#04050c');drawStars(0)}
 const o=D.obj,img=PL[o];const sz={earth:28,mars:90,phobos:10,jupiter:110,saturn:70}[o]||30;if(D.sky=='titan')X.globalAlpha=.35;X.drawImage(img,Math.round(W*(o=='mars'||o=='jupiter'?.22:.78)-img.width*sz/200),Math.round(H*.12),Math.round(img.width*sz/100),Math.round(img.height*sz/100));X.globalAlpha=1;
 X.drawImage(G.terrain.c,0,0);const L=G.land,gy=groundAt(L.padX);R_(L.padX-L.padW/2,gy-2,L.padW,3,'#6a6e78');R_(L.padX-L.padW/2,gy-2,L.padW,1,'#b8bec8');
 for(let i=0;i<L.padW;i+=4)R_(L.padX-L.padW/2+i,gy,2,1,'#e0c040');R_(L.padX-3,gy-2,7,1,'#ffffff');const bl=((G.t*3)|0)%2;R_(L.padX-L.padW/2,gy-3,1,1,bl?'#ff3a2a':'#5a1a10');R_(L.padX+L.padW/2-1,gy-3,1,1,bl?'#3aff5a':'#104a1a');
 if(D.sky=='titan'){X.fillStyle='rgba(224,150,60,.18)';X.fillRect(0,0,W,H)}}
function drawPlay(){const sh=G.shake>0?Math.round((Math.random()-.5)*G.shake*8):0;X.save();X.translate(sh,0);drawBg();
 if(G.booster){const b=G.booster;drawRot(G.V.boost,b.x,b.y+G.V.boost.height/2,b.rot);}
 if(G.warn){const w=G.warn;if(w.t>0&&((G.t*8)|0)%2){X.globalAlpha=.22;R_(w.x-w.w/2,0,w.w,H,'#ff3020');X.globalAlpha=1;T('! INCOMING !',w.x,14,'#ff6a4a','c')}}
 for(const p of G.picks){const img=p.k=='fuel'?FUEL:SHLD;const bob=Math.sin(G.t*5+p.x)*1.5;X.globalAlpha=.3+.2*Math.sin(G.t*8);R_(p.x-img.width/2-2,p.y-img.height/2-2+bob,img.width+4,img.height+4,p.k=='fuel'?'#4aff4a':'#4ab0ff');X.globalAlpha=1;X.drawImage(img,Math.round(p.x-img.width/2),Math.round(p.y-img.height/2+bob))}
 for(const d of G.deb){if(d.k=='mm'){R_(d.x,d.y-8,1,6,'#e0601a');R_(d.x,d.y-3,1,2,'#ffc040');R_(d.x-.5,d.y-1,2,2,'#ffffff')}else drawRot(d.sp,d.x,d.y,d.rot)}
 drawRocket();
 for(const p of G.parts){X.globalAlpha=clamp(p.life/p.max*1.5,0,1)*(p.smoke?.6:1);const s=p.smoke?Math.round(p.s+(1-p.life/p.max)*3):p.s;R_(p.x-s/2,p.y-s/2,s,s,p.c)}X.globalAlpha=1;
 for(const p of G.pops)T(p.s,p.x,p.y,p.c,'c');X.restore();drawHud()}
function bar(x,y,w,h,v,c1,c2){R_(x,y,w,h,'#101418');const n=Math.floor(w/3);for(let i=0;i<n;i++){const on=i/n<v;R_(x+1+i*3,y+1,2,h-2,on?(v<.25?((G.t*6|0)%2?'#ff4a3a':'#802018'):i/n<.3?c2:c1):'#22282e')}}
function drawHud(){const V=G.V,pw=Math.min(132,(W-26)/2-2);panel(3,3,pw,32);T(V.name,8,7,'#ffd860');bar(8,17,pw-44,6,G.fuel/100,'#58e048','#d8c040');T('FUEL',pw-32,17,'#9aa');
 for(let i=0;i<G.shield;i++)X.drawImage(SHLD,8+i*10,25,8,8);T(G.type=='endless'?'SCORE '+G.score:'PTS '+G.score,pw-2,26,'#fff','r');
 const rw=Math.min(118,(W-26)/2-2),rx=W-rw-24;panel(rx,3,rw,32);
 if(G.type=='camp'){const D=DEST[G.dest];if(G.phase=='land'||G.phase=='won'){const L=G.land,alt=Math.max(0,Math.round(groundAt(G.x)-L.y));T('ALT '+alt,rx+5,7,'#fff');const vy=Math.round(L.vy);T('V '+vy,rx+5,17,vy>D.lim?'#ff5a4a':'#7aff6a');T('MAX '+D.lim,rx+rw-5,17,'#9aa','r');T('H '+Math.round(G.vx),rx+5,26,Math.abs(G.vx)>14?'#ff5a4a':'#9ab')}
  else{T(D.n,rx+5,7,'#ffd860');T(Math.floor(G.dist/10)+'/'+G.goal/10+' KM',rx+rw-5,7,'#fff','r');bar(rx+5,18,rw-10,6,G.dist/G.goal,'#6ab0ff','#6ab0ff');X.drawImage(PL.ic[D.kind],rx+rw-14,22,10,10);if(!G.staged)T('STAGE',rx+5,26,'#9ab')}}
 else{T(Math.floor(G.dist/10)+' KM',rx+5,7,'#fff');T('BEST '+SV.endBest,rx+rw-5,7,'#9ab','r');if(G.combo>0){T('COMBO X'+G.combo,rx+5,18,G.combo>4?'#ff8af0':'#ffe060');R_(rx+5,28,(rw-10)*G.comboT/2.6,2,'#ffe060')}else T('NEXT: '+mil(G.mil).n,rx+5,18,'#9ab')}
 const pb=pauseBtn();panel(pb.x,pb.y,pb.w,pb.h);R_(pb.x+5,pb.y+4,2,7,'#f0e8d0');R_(pb.x+10,pb.y+4,2,7,'#f0e8d0');
 if((anyTouch||isTouch)&&G.mode=='play'){const b=boostBtn(),on=G.boostOn;X.globalAlpha=on?.55:.35;X.fillStyle=on?'#ffb040':'#2a3040';X.beginPath();X.arc(b.x,b.y,b.r,0,7);X.fill();X.strokeStyle='#e8c878';X.lineWidth=1;X.stroke();X.globalAlpha=1;T(G.phase=='land'?'THRUST':'BOOST',b.x,b.y-3,on?'#1a1008':'#f0e8d0','c',1,!on)
  if(G.hint>0&&G.phase=='fly'){T('DRAG TO STEER',W/2-20,H*.45,'#fff','c');T('HOLD TO BOOST',b.x-10,b.y-b.r-12,'#ffd860','r')}}
 else if(G.hint>0&&G.phase=='fly')T('ARROWS/STICK STEER - SPACE/A BOOST',W/2,H*.45,'#fff','c');
 if(G.phase=='land'&&G.land.t<4)T('HOLD THRUST TO SLOW DOWN',W/2,H*.4,'#ffd860','c');
 if(G.banner){const b=G.banner,a=Math.min(1,b.t*3,(b.max-b.t)*6);X.globalAlpha=a;const sc=W>260?2:1,w=Math.max(fW(b.a,sc),fW(b.b,1))+20;panel(W/2-w/2,H*.25-4,w,b.b?32:22);T(b.a,W/2,H*.25+2,'#ffd860','c',sc);if(b.b)T(b.b,W/2,H*.25+18,'#cfe','c');X.globalAlpha=1}}
function drawTitle(){const top=hx('#0a0c2a'),bot=hx('#e07a4a');drawSkyGrad(top,bot);drawStars(2,.7);const gy=H-Math.round(H*.1);
 const px=W>H?Math.round(W*.16):Math.round(W*.2);drawPad(gy,px);X.drawImage(PL.moon,W-60,W>H?10:Math.round(H*.5),44,44);
 const sp=VEH[SV.veh].full;X.drawImage(sp,px-sp.width/2|0,gy-3-sp.height);for(let i=0;i<6;i++){const a=(G.t*.6+i*.3)%1;X.globalAlpha=1-a;R_(px-8-a*20-i,gy-6-a*10,3+a*4,3+a*4,'#e8e8f0');R_(px+5+a*20+i,gy-6-a*8,3+a*4,3+a*4,'#e8e8f0')}X.globalAlpha=1;
 const sc=W>300?4:3,cx=W>H?W*.58:W/2;gradTxt('ROCKET RUN',cx,14,sc);T('- LAUNCH. DODGE. LAND. -',cx,16+8*sc,'#e8f0ff','c');
 UI=[];const bw=Math.min(150,W*.6),bh=17,x0=cx-bw/2;let y=32+8*sc;
 btn('ENDLESS RUN',x0,y,bw,bh,()=>newRun('endless'));y+=bh+3;btn('MISSIONS',x0,y,bw,bh,go('missions'));y+=bh+3;btn('LEADERBOARD',x0,y,bw,bh,go('board'));y+=bh+3;
 btn('SHIP: '+VEH[SV.veh].name,x0,y,bw,bh,()=>{SV.veh=1-SV.veh;save()});y+=bh+3;
 if(isTouch&&window.DeviceOrientationEvent)btn('TILT STEER: '+(SV.tilt?'ON':'OFF'),x0,y,bw,bh,()=>{SV.tilt=1-SV.tilt;save();if(SV.tilt&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().catch(()=>{})}),y+=bh+3;
 T('ENDLESS BEST '+SV.endBest,cx,y+3,'#ffd860','c');}
function drawMissions(){R_(0,0,W,H,'#05060e');drawStars(3);gradTxt('MISSIONS',W/2,8,2);UI=[];const rh=Math.min(28,(H-50)/6|0),bw=Math.min(300,W-16),x0=W/2-bw/2;let y=26;
 DEST.forEach((D,i)=>{const lock=i>=SV.unlocked;const b=btn('',x0,y,bw,rh-3,()=>newRun('camp',i),0,lock);const s=sel==UI.length-1;X.drawImage(PL.ic[D.kind],x0+4,y+(rh-3)/2-9|0);
  const c=s?'#1a1408':lock?'#667':'#f0e8d0';T((i+1)+'. '+D.n,x0+26,y+3,c,'l',1,!s);T(lock?'LOCKED - LAND ON '+DEST[i-1].n:('G '+D.g+'  MAX V '+D.lim+'  '+D.goal/10+' KM'),x0+26,y+rh-12,s?'#3a2a10':lock?'#556':'#9ab','l',1,!s);
  if(!lock)T(SV.best[D.kind]?'BEST '+SV.best[D.kind].s:'NEW',x0+bw-5,y+3,s?'#1a1408':'#ffd860','r',1,!s);y+=rh});btn('BACK',x0,y+2,60,15,go('title'))}
function drawBoard(){R_(0,0,W,H,'#05060e');drawStars(3);gradTxt('TOP 10',W/2,6,2);UI=[];const bw=Math.min(220,W-16),x0=W/2-bw/2;const lh=Math.min(13,(H-62)/10|0);panel(x0,24,bw,lh*10+8);
 for(let i=0;i<10;i++){const e=SV.lb[i],y=29+i*lh,hl=e&&e.id==G.hl;if(hl&&((G.t*4)|0)%2)R_(x0+2,y-2,bw-4,lh-1,'#3a2e10');const c=hl?'#ffd860':i==0?'#fff0a0':'#f0e8d0';
  T((i+1<10?' ':'')+(i+1)+'.',x0+6,y,c);T(e?e.n:'---',x0+30,y,c);T(e?e.s:'',x0+bw/2+20,y,c,'r');T(e?e.d+' KM':'',x0+bw-6,y,hl?c:'#9ab','r')}
 const y=30+lh*10+6;btn('PLAY AGAIN',x0,y,bw/2-2,16,()=>newRun('endless'));btn('MENU',x0+bw/2+2,y,bw/2-2,16,go('title'))}
function drawOverPanel(){const w=Math.min(230,W-12),h=G.mode=='initials'?Math.min(H-10,150):Math.min(H-10,130),x=W/2-w/2,y=Math.max(4,H/2-h/2);panel(x,y,w,h,.92);return{x,y,w,h}}
function drawOver(){drawPlay();UI=[];const P=drawOverPanel();let y=P.y+6;gradTxt('GAME OVER',W/2,y,2);y+=18;T(G.cause||'',W/2,y,'#ff8a6a','c');y+=11;
 const st=[['SCORE',G.score,'#ffd860'],['DISTANCE',Math.floor(G.dist/10)+' KM'],['NEAR MISSES',G.nm+'  MAX X'+G.maxCombo],['BEST',SV.endBest,G.result&&G.result.nb?'#7aff6a':'#fff']];
 if(G.mode=='initials'){T('SCORE '+G.score+(G.result.nb?'  NEW BEST!':''),W/2,y,'#ffd860','c');y+=12;T('NEW HIGH SCORE! ENTER INITIALS',W/2,y,'#7aff6a','c');y+=12;const I=G.ini,bx=W/2-48;
  for(let k=0;k<3;k++){const cx=bx+k*24;const s=I.slot==k;UI.push({x:cx,y:y,w:18,h:12,act:()=>{I.slot=k;I.l[k]=(I.l[k]+1)%26}});T('▲',cx+9,y+2,s?'#ffd860':'#9ab','c');
   panel(cx,y+13,18,18);T(String.fromCharCode(65+I.l[k]),cx+9,y+18,s&&((G.t*4|0)%2)?'#ffffff':'#ffd860','c',1);
   UI.push({x:cx,y:y+32,w:18,h:12,act:()=>{I.slot=k;I.l[k]=(I.l[k]+25)%26}});T('▼',cx+9,y+34,s?'#ffd860':'#9ab','c')}
  const ok=UI.push({x:bx+72,y:y+13,w:28,h:18,act:submitIni});if(I.slot==3){R_(bx+72,y+13,28,18,'#e8c878');T('OK',bx+86,y+18,'#1a1408','c',1,0)}else{panel(bx+72,y+13,28,18);T('OK',bx+86,y+18,'#f0e8d0','c')}
  T(isTouch?'TAP ▲▼ THEN OK':'ARROWS / TYPE - ENTER',W/2,y+48,'#9ab','c');return}
 for(const s of st){T(s[0],P.x+12,y,'#9ab');T(s[1],P.x+P.w-12,y,s[2]||'#fff','r');y+=11}y+=4;const bw=(P.w-24)/3;
 btn('RETRY',P.x+8,y,bw,16,()=>newRun('endless'));btn('SCORES',P.x+12+bw,y,bw,16,go('board'));btn('MENU',P.x+16+bw*2,y,bw,16,go('title'))}
function drawResult(){drawPlay();UI=[];const P=drawOverPanel(),D=DEST[G.dest],R=G.result;let y=P.y+6;gradTxt(R.won?'MISSION SUCCESS':'MISSION FAILED',W/2,y,W>280?2:1);y+=18;
 T(R.won?'LANDED ON '+D.n+'!':G.cause,W/2,y,R.won?'#7aff6a':'#ff8a6a','c');y+=12;const b=SV.best[D.kind];
 for(const s of[['SCORE',G.score,'#ffd860'],['DISTANCE',Math.floor(G.dist/10)+' KM'],['LANDING BONUS',R.won?G.landBonus:'-'],['BEST '+D.n,b?b.s:'-',R.nb?'#7aff6a':'#fff']]){T(s[0],P.x+12,y,'#9ab');T(s[1],P.x+P.w-12,y,s[2]||'#fff','r');y+=11}
 if(R.won&&G.dest+1<DEST.length&&G.dest+1<SV.unlocked){T('UNLOCKED: '+DEST[G.dest+1].n,W/2,y,'#ffd860','c')}y+=12;const bw=(P.w-24)/3;
 if(R.won&&G.dest+1<DEST.length)btn('NEXT',P.x+8,y,bw,16,()=>newRun('camp',G.dest+1));else btn('RETRY',P.x+8,y,bw,16,()=>newRun('camp',G.dest));
 btn('MISSIONS',P.x+12+bw,y,bw,16,go('missions'));btn('MENU',P.x+16+bw*2,y,bw,16,go('title'))}
function drawPause(){drawPlay();UI=[];X.fillStyle='rgba(0,0,0,.5)';X.fillRect(0,0,W,H);gradTxt('PAUSED',W/2,H/2-40,2);btn('RESUME',W/2-50,H/2-14,100,17,()=>{G.mode='play'});btn('QUIT TO MENU',W/2-50,H/2+8,100,17,go('title'))}
function draw(){X.setTransform(1,1e-9,0,1,0,0);X.setTransform(1,0,0,1,0,0);X.imageSmoothingEnabled=false;UI=G.mode=='play'?[]:UI;
 ({title:drawTitle,missions:drawMissions,board:drawBoard,play:drawPlay,pause:drawPause,result:drawResult,over:drawOver,initials:drawOver})[G.mode]();if(sel>=UI.length)sel=Math.max(0,UI.length-1)}
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(frame)}
addEventListener('resize',resize);
initArt();resize();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
// test/debug hooks
window.RR={ready:true,get G(){return G},get SV(){return SV},setAuto:v=>auto=v,start:(t,d)=>newRun(t,d),
 jump:(dist)=>{G.dist=dist},stage:()=>{G.dist=G.stageAt},land:()=>{G.dist=G.goal},field:()=>{for(let i=0;i<14;i++){spawnDeb(.8);G.deb[G.deb.length-1].y=Math.random()*rocketY()*.85}G.picks.push({k:'fuel',x:W*.3,y:H*.3,vy:10},{k:'shield',x:W*.7,y:H*.2,vy:10})},
 kill:()=>{G.cause='ASTEROID IMPACT';G.shield=0;die()},unlockAll:()=>{SV.unlocked=5;save()},
 icon:n=>{const c=mk(n,n,(g,r)=>{g.fillStyle='#0a0c2a';g.fillRect(0,0,n,n);const gr=g.createLinearGradient(0,0,0,n);gr.addColorStop(0,'#0a0c2a');gr.addColorStop(1,'#e07a4a');g.fillStyle=gr;g.fillRect(0,0,n,n);g.imageSmoothingEnabled=false;const sp=VEH[0].full,k=Math.floor(n*.8/sp.height);g.drawImage(sp,n/2-sp.width*k/2,n*.08,sp.width*k,sp.height*k)});return c.toDataURL()}};
