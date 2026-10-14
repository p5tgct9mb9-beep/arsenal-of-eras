'use strict';
var vmScene;
// ===== Arsenal of Eras: Frontline — core game =====
const QS=new URLSearchParams(location.search);const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const TIERS=[{pr:.5,sh:0,post:0,n:'Low'},{pr:.75,sh:1024,post:1,n:'Medium'},{pr:1,sh:2048,post:1,n:'High'},{pr:1.5,sh:2048,post:1,n:'Ultra'}];
const SET=Object.assign({q:'auto',sens:1,inv:0,vol:.7},JSON.parse(localStorage.getItem('aoe3d.set')||'{}'));
const QUAL={tier:QS.has('q')?+QS.get('q'):(SET.q!='auto'?+SET.q:(TOUCH?1:2)),auto:!QS.has('q')&&SET.q=='auto',shadow:2048,post:1};
const I={mx:0,my:0,lx:0,ly:0,fire:0,ads:0,jump:0,crouch:0,sprint:0,pr:new Set()};const press=k=>I.pr.add(k),took=k=>I.pr.delete(k);
let ren,scene,cam,vmRoot,rt=null,post,postScene,postCam,GL2=false;
const G={mode:'menu',era:ERAS[2],ei:2,mi:0,t:0,phase:0,kills:0,tgtLeft:0,boss:null,score:0,shots:0,hits:0,god:0,msgT:0,lives:3};
const P={p:new T.Vector3(),v:new T.Vector3(),yaw:0,pitch:0,hp:100,armor:0,ground:true,crouch:0,ch:1.62,mode:'foot',w:[],cur:0,swapT:0,relT:0,next:0,ads:0,rec:0,kick:0,lastHurt:-9,shield:0,le:3,ta:2,gad:2,med:2,placed:[],chute:0,bob:0,lockT:0,lock:null};
let ENTS=[],PROJ=[],SMOKES=[],LO={};
const V3=()=>new T.Vector3(),tmp=V3(),tmp2=V3(),UP=new T.Vector3(0,1,0);const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------- audio ----------
let AC=null,NB=null;function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){AC=null}}
function sfx(kind,vol=1,dist=0){if(!AC||SET.vol<=0)return;const t=AC.currentTime,v=SET.vol*vol*Math.max(.05,1-dist/150);if(v<.02)return;const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter(),g=AC.createGain();s.connect(f);f.connect(g);g.connect(AC.destination);
 const cfg={shot:[1800,.12,.9],sup:[700,.08,.35],big:[600,.35,1],boom:[300,1.1,1.2],click:[3000,.03,.3],hit:[4000,.05,.4],laser:[2400,.1,.5],jet:[500,.5,.3],nade:[900,.05,.3]}[kind]||[1000,.1,.5];
 f.type=kind=='boom'||kind=='big'?'lowpass':'bandpass';f.frequency.value=cfg[0];f.Q.value=.7;g.gain.setValueAtTime(v*cfg[2],t);g.gain.exponentialRampToValueAtTime(.001,t+cfg[1]);s.start(t,Math.random()*.5);s.stop(t+cfg[1]+.05);
 if(kind=='laser'){const o=AC.createOscillator(),og=AC.createGain();o.frequency.setValueAtTime(1400,t);o.frequency.exponentialRampToValueAtTime(200,t+.15);og.gain.setValueAtTime(v*.15,t);og.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(og);og.connect(AC.destination);o.start(t);o.stop(t+.16)}}
// ---------- renderer ----------
function dirtCanvas(){const c=document.createElement('canvas');c.width=256;c.height=144;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,144);for(let i=0;i<60;i++){const x=Math.random()*256,y=Math.random()*144,r=3+Math.random()*16,gr=g.createRadialGradient(x,y,0,x,y,r);const a=.1+Math.random()*.4;gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}return new T.CanvasTexture(c)}
function initRender(){const cv=document.getElementById('c');ren=new T.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:QS.has('test')});GL2=ren.capabilities.isWebGL2;
 ren.shadowMap.enabled=true;ren.shadowMap.type=T.PCFShadowMap;ren.outputColorSpace=T.SRGBColorSpace;
 scene=new T.Scene();cam=new T.PerspectiveCamera(72,innerWidth/innerHeight,.05,1500);vmScene=new T.Scene();vmRoot=new T.Group();vmScene.add(vmRoot);
 vmScene.add(new T.HemisphereLight(0xc8d0e0,0x403830,1.2));const vl=new T.DirectionalLight(0xfff0e0,2.2);vl.position.set(.5,1,.3);vmScene.add(vl);vmScene.userData.dl=vl;
 const fl=new T.PointLight(0xffb060,0,6,1.5);fl.position.set(.1,0,-.6);vmRoot.add(fl);vmScene.userData.flash=fl;
 if(GL2){post=new T.ShaderMaterial({uniforms:{tS:{value:null},tD:{value:dirtCanvas()},uT:{value:0},uR:{value:new T.Vector2(1,1)},uHurt:{value:0},uNV:{value:0}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tS,tD;uniform float uT,uHurt,uNV;uniform vec2 uR;varying vec2 vUv;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=vUv;vec2 dc=uv-.5;vec3 col=vec3(texture2D(tS,uv+dc*.003).r,texture2D(tS,uv).g,texture2D(tS,uv-dc*.003).b);
vec3 bl=textureLod(tS,uv,2.5).rgb*.25+textureLod(tS,uv,4.).rgb*.35+textureLod(tS,uv,5.5).rgb*.4;vec3 br=max(bl-vec3(.7),0.);
float dirt=texture2D(tD,vUv).r;col+=br*(.8+dirt*2.5);
col=aces(col*1.05);float L=dot(col,vec3(.299,.587,.114));col=mix(col*vec3(.86,.97,1.05),col*vec3(1.07,1.,.86),smoothstep(.15,.75,L));col=mix(vec3(L),col,.88);
col=pow(col,vec3(1./2.2));col=mix(col,col*col*(3.-2.*col),.3);float v=smoothstep(1.05,.35,length(dc*vec2(1.25,1.)));col*=mix(.55,1.,v);
col=mix(col,vec3(L*.3,L*1.6+.05,L*.4),uNV);col+=vec3(.5,0.,0.)*uHurt*(1.-v)*1.5;
col+=(hs(floor(vUv*uR)+fract(uT*7.3)*91.)-.5)*.04;gl_FragColor=vec4(col,1.);}`});
  postScene=new T.Scene();const q=new T.Mesh(new T.PlaneGeometry(2,2),post);q.frustumCulled=false;postScene.add(q);postCam=new T.OrthographicCamera(-1,1,1,-1,0,1)}
 for(let i=0;i<3;i++){const l=new T.PointLight(0xffb060,0,30,1.6);scene.add(l);FX.li.push({l,t:0,I:1})}setTier(QUAL.tier);addEventListener('resize',resize)}
function resize(){const t=TIERS[QUAL.tier];const pr=Math.min(devicePixelRatio||1,2)*t.pr;ren.setPixelRatio(pr);ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
 if(QUAL.post){const w=Math.max(2,Math.floor(innerWidth*pr)),h=Math.max(2,Math.floor(innerHeight*pr));if(rt)rt.dispose();rt=new T.WebGLRenderTarget(w,h,{type:T.HalfFloatType,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter,magFilter:T.LinearFilter,depthBuffer:true});post.uniforms.tS.value=rt.texture;post.uniforms.uR.value.set(w,h)}}
function setTier(t,silent){QUAL.tier=clamp(t,0,3);const d=TIERS[QUAL.tier];QUAL.post=d.post&&GL2?1:0;QUAL.shadow=d.sh;ren.shadowMap.enabled=d.sh>0;ren.toneMapping=QUAL.post?T.NoToneMapping:T.ACESFilmicToneMapping;ren.toneMappingExposure=1;
 if(WORLD.sun){WORLD.sun.castShadow=d.sh>0;if(d.sh){WORLD.sun.shadow.mapSize.set(d.sh,d.sh);if(WORLD.sun.shadow.map){WORLD.sun.shadow.map.dispose();WORLD.sun.shadow.map=null}}}
 scene.traverse(o=>{if(o.material&&!Array.isArray(o.material))o.material.needsUpdate=true});resize();!silent&&UI.toast&&G.mode=='play'&&UI.toast('Graphics: '+d.n)}
const FT={n:0,s:0,good:0,last:0};function autoQ(dt){if(!QUAL.auto||G.mode!='play')return;FT.n++;FT.s+=dt;if(FT.n<90)return;const avg=FT.s/FT.n;FT.n=FT.s=0;const now=performance.now();
 if(avg>1/34&&QUAL.tier>0){setTier(QUAL.tier-1);FT.good=0;FT.last=now}else if(avg<1/58){if(++FT.good>=3&&QUAL.tier<(TOUCH?2:3)&&now-FT.last>15000){setTier(QUAL.tier+1);FT.good=0;FT.last=now}}else FT.good=0}
// ---------- FX ----------
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,220,160,.8)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(c)}
function smokeTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),id=g.createImageData(64,64),n=mkNoise(5,8);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-32,y-32)/32,a=Math.max(0,1-r)**1.5*(.5+n(x/8,y/8)*.7);const i=(y*64+x)*4;id.data[i]=id.data[i+1]=id.data[i+2]=255;id.data[i+3]=Math.min(255,a*255)}g.putImageData(id,0,0);return new T.CanvasTexture(c)}
let GLOW,SMK;const FX={sp:[],tr:[],li:[],shake:0};
function sprite(pos,col,size,life,add,vel,grow=1){let s=FX.sp.find(q=>q.l<=0);if(!s){if(FX.sp.length>120)return;const m=new T.Sprite(new T.SpriteMaterial({map:GLOW,transparent:true,depthWrite:false}));scene.add(m);s={m,l:0};FX.sp.push(s)}
 s.m.material.map=add?GLOW:SMK;s.m.material.blending=add?T.AdditiveBlending:1;s.m.material.color.setHex(col);s.m.material.opacity=1;s.m.material.needsUpdate=true;s.m.position.copy(pos);s.m.scale.setScalar(size);s.m.visible=true;s.m.material.rotation=Math.random()*6;
 Object.assign(s,{l:life,L:life,v:vel?vel.clone():V3(),sz:size,g:grow,add})}
function tracer(a,b,col=0xffd080){let t=FX.tr.find(q=>q.l<=0);if(!t){if(FX.tr.length>40)return;const m=new T.Mesh(BOXG,new T.MeshBasicMaterial({color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));scene.add(m);t={m,l:0};FX.tr.push(t)}
 const d=b.distanceTo(a);t.m.position.copy(a).lerp(b,.5);t.m.lookAt(b);t.m.scale.set(.03,.03,d);t.m.material.color.setHex(col);t.m.visible=true;t.l=.05}
function flash(pos,int,col=0xffb060){if(FX.li.length<3){const l=new T.PointLight(col,0,30,1.6);scene.add(l);FX.li.push({l,t:0})}const f=FX.li.reduce((a,b)=>a.t<=b.t?a:b);f.l.position.copy(pos);f.l.color.setHex(col);f.t=int;f.I=int}
function stepFX(dt){for(const s of FX.sp){if(s.l<=0)continue;s.l-=dt;if(s.l<=0){s.m.visible=false;continue}const k=1-s.l/s.L;s.m.position.addScaledVector(s.v,dt);s.m.scale.setScalar(s.sz*(1+k*s.g));s.m.material.opacity=s.add?(1-k):(1-k)*.8}
 for(const t of FX.tr){if(t.l>0){t.l-=dt;if(t.l<=0)t.m.visible=false}}for(const f of FX.li){f.t=Math.max(0,f.t-dt*f.I*6);f.l.intensity=f.t*60}FX.shake=Math.max(0,FX.shake-dt*2)}
function explode(pos,rad,dmg,owner,opt={}){const big=rad>5;sprite(pos,0xffc070,rad*.9,.35,1,null,1.6);sprite(tmp.copy(pos).add(UP),0xff8030,rad*.6,.5,1,UP,1.2);for(let i=0;i<(big?6:3);i++)sprite(tmp.copy(pos).add(new T.Vector3(rnd(-1,1),rnd(0,1.5),rnd(-1,1)).multiplyScalar(rad*.3)),G.era.id=='space'?0x888890:0x3a3632,rad*.7,2.5+Math.random()*2,0,new T.Vector3(rnd(-.5,.5),rnd(.5,1.5),rnd(-.5,.5)),2);
 flash(pos,big?1.5:.8,opt.col||0xffa050);const pd=pos.distanceTo(P.p);FX.shake=Math.max(FX.shake,clamp(rad*.15-pd*.01,0,1));sfx('boom',big?1:.7,pd);
 for(const e of ENTS){if(!e.alive)continue;const d=Math.max(0,e.p.distanceTo(pos)-(e.R||.5));if(d<rad){if(owner=='e'&&e.team=='e')continue;const f=1-d/rad;dmgEnt(e,dmg*(.3+.7*f),'expl',owner)}}
 if(owner!='p'||opt.self){const d=pos.distanceTo(tmp.copy(P.p).add(new T.Vector3(0,1,0)));if(d<rad)hurtPlayer(dmg*(1-d/rad)*(owner=='p'?.35:.6),pos)}
 if(P.mode=='veh'&&owner=='e'){const d=pos.distanceTo(P.veh.p);if(d<rad+2)dmgEnt(P.veh,dmg*(1-d/(rad+2)),'expl','e')}
 for(const c of P.placed)if(c.k=='c4'&&c.p.distanceTo(pos)<rad*.6&&!c.boom){c.boom=1}}
// ---------- player weapons ----------
function mkWeapon(def,att){const st=wStats(def,att,G.era);return{def,att,st,mag:st.mag,res:def.c=='launcher'?(def.proj=='rail'?6:4):st.mag*4,gl:st.gl?3:0,mesh:null}}
function equipLoadout(){const e=G.era,lo=LO[e.id]||defaultLoadout(e);const f=(arr,id)=>arr.find(x=>x.id==id)||arr[0];
 P.w=[mkWeapon(f(e.prim,lo.p),lo.att[lo.p]||{}),mkWeapon(f(e.sec,lo.s),lo.att[lo.s]||{}),mkWeapon(f(e.lau,lo.l),{})];P.leT=f(e.lethal,lo.le);P.taT=f(e.tact,lo.ta);P.gadT=f(e.gadgets,lo.g);
 P.le=3;P.ta=2;P.gad=P.gadT.id=='c4'||P.gadT.id=='claymore'||P.gadT.id=='mine'?2:P.gadT.id=='shield'?2:3;P.med=2;P.armor=lo.armor?50:0;P.cur=0;setVM()}
function setVM(){vmRoot.children.filter(c=>c.userData.gun).forEach(c=>vmRoot.remove(c));const w=P.w[P.cur];if(!w.mesh){w.mesh=buildGun(w.def,w.att,G.era);w.mesh.userData.gun=1}vmRoot.add(w.mesh);P.swapT=.45;P.relT=0;UI.hudWeapon&&UI.hudWeapon()}
function curW(){return P.w[P.cur]}
function swapTo(i){if(i==P.cur||P.relT>0&&false)return;P.cur=(i+3)%3;P.lock=null;P.lockT=0;setVM();sfx('click',.5)}
function reload(){const w=curW();if(P.relT>0||w.mag>=w.st.mag||w.res<=0)return;P.relT=w.st.rel;sfx('click',.6)}
function eyePos(o=V3()){return o.set(P.p.x,P.p.y+P.ch,P.p.z)}
function camDir(o=V3()){return o.set(0,0,-1).applyEuler(new T.Euler(P.pitch,P.yaw,0,'YXZ'))}
function hitscan(o,d,range,team='e'){let best=rayWorld(o,d,range),he=null,mult=1;
 for(const e of ENTS){if(!e.alive||e.team==team&&team!='e'||e.team!='e'&&team=='e'||e===P.veh)continue;const dx=e.p.x-o.x,dy=e.p.y-o.y,dz=e.p.z-o.z;const R=(e.R||1)+5;const tc=dx*d.x+dy*d.y+dz*d.z;if(tc<-R||tc>best+R)continue;if(dx*dx+dy*dy+dz*dz-tc*tc>R*R*1.5+30)continue;
  const c=Math.cos(e.yaw||0),s=Math.sin(e.yaw||0);for(const h of e.hits){const hx=e.p.x+h[0]*c+h[2]*s,hy=e.p.y+h[1]+(e.hy||0),hz=e.p.z-h[0]*s+h[2]*c;const ox=hx-o.x,oy=hy-o.y,oz=hz-o.z,tca=ox*d.x+oy*d.y+oz*d.z;if(tca<0)continue;const d2=ox*ox+oy*oy+oz*oz-tca*tca,r2=h[3]*h[3];if(d2>r2)continue;const t=tca-Math.sqrt(r2-d2);if(t<best){best=t;he=e;mult=h[4]||1}}}
 return{t:best,e:he,mult}}
function fireWeapon(){const w=curW(),st=w.st,d=w.def;if(P.swapT>0||P.relT>0)return;if(w.mag<=0){if(w.res>0)reload();else if(I.pr.has('firePress'))sfx('click',.4);return}
 const now=G.t;if(now<P.next)return;if(!d.auto&&!P.semiOK)return;P.semiOK=false;P.next=now+60/st.rof;w.mag--;G.shots++;
 const o=eyePos(),dir=camDir();const mv=Math.hypot(P.v.x,P.v.z)>1?1.6:1;const spread=st.sp*(1-P.ads*.85)*mv*(P.crouch?.75:1)*(P.ground?1:1.8);
 const muz=w.mesh.userData.muz.clone();w.mesh.localToWorld(muz);vmRoot.updateMatrixWorld();
 // launcher projectiles
 if(d.proj&&d.proj!='rail'){const v=dir.clone().multiplyScalar(d.spd);const tg=d.lock?P.lock:null;spawnProj(d.proj=='gl'?'gl':d.lock?'jav':'rocket',tmp.copy(o).addScaledVector(dir,1).add(new T.Vector3(0,-.15,0)),v,'p',{dmg:st.d,rad:d.proj=='gl'?6:7,tgt:tg,aa:d.aa});
  if(d.multi&&tg)for(let k=1;k<3;k++)spawnProj('jav',tmp.copy(o).addScaledVector(dir,1).add(new T.Vector3(rnd(-1,1),rnd(0,1),0)),v.clone().add(new T.Vector3(rnd(-6,6),rnd(2,6),0)),'p',{dmg:st.d,rad:5,tgt:tg});
  sfx('big',.9);P.kick+=st.rec*.08;FX.shake=Math.max(FX.shake,.25);if(w.mag<=0&&w.res>0)setTimeout(()=>{if(curW()===w)reload()},400);return}
 const pel=d.pel||1;let hitAny=false;
 for(let k=0;k<pel;k++){const dd=dir.clone();dd.x+=rnd(-1,1)*spread;dd.y+=rnd(-1,1)*spread;dd.z+=rnd(-1,1)*spread;dd.normalize();const range=d.proj=='rail'?500:st.rng*2.2;const h=hitscan(o,dd,range);
  const end=tmp2.copy(o).addScaledVector(dd,Math.min(h.t,range));if(k<3||d.proj=='rail')tracer(muz,end,d.proj=='rail'?0x60c0ff:d.c=='energy'||G.era.id=='space'?(G.era.id=='space'?0xff5030:0x40e0ff):0xffd8a0);
  if(d.proj=='rail'){explode(end,3,st.d*.4,'p',{col:0x60c0ff});const pierce=[];for(const e of ENTS){if(!e.alive||e.team!='e')continue;tmp.copy(e.p).sub(o);const tc=tmp.dot(dd);if(tc<0||tc>h.t+1)continue;if(tmp.lengthSq()-tc*tc<(e.R||1)*(e.R||1))pierce.push(e)}pierce.forEach(e=>dmgEnt(e,st.d,'rail','p'));hitAny=pierce.length>0;continue}
  if(h.e){let dm=st.d*(h.t>st.rng?Math.max(.45,1-(h.t-st.rng)/st.rng*.6):1)*h.mult;dmgEnt(h.e,dm,'bullet','p',h.mult>1.5);hitAny=true;sprite(end,h.e.k=='sol'?0x8a8478:0xffd070,.3,.15,h.e.k!='sol',null,1)}
  else if(h.t<range){sprite(end,G.era.ground=='snow'?0xe8eef4:0x8a7a62,.5,.6,0,UP.clone().multiplyScalar(.6),1.5);if(Math.random()<.3)sprite(end,0xffc060,.12,.05,1)}}
 if(hitAny){G.hits++;UI.hitMark()}
 const ec=d.c=='energy'||G.era.id=='space'||G.era.id=='future';sfx(st.q?'sup':ec?'laser':'shot',d.c=='sniper'||d.c=='shotgun'?1:.7);
 if(!st.q){const fl=vmScene.userData.flash;fl.intensity=6;fl.color.setHex(ec?0x60d0ff:0xffb060);flash(o,.25,ec?0x60d0ff:0xffa040);muzzleSprite(muz,ec);G.loud=1.5}
 const rk=st.rec*(1-P.ads*.35)*(P.crouch?.8:1);P.pitch+=rk*.012*(1+Math.random()*.5);P.yaw+=rnd(-1,1)*rk*.006;P.kick+=rk*.05;P.rec=Math.min(1,P.rec+rk*.1)}
let MZ=null;function muzzleSprite(pos,ec){if(!MZ){MZ=new T.Sprite(new T.SpriteMaterial({map:GLOW,transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:false}));vmScene.add(MZ)}MZ.material.color.setHex(ec?0x80e0ff:0xffc070);vmRoot.worldToLocal(pos);MZ.position.copy(pos);vmRoot.add(MZ);MZ.scale.setScalar(.12+Math.random()*.08);MZ.visible=true;MZ.userData.t=.04}
// ---------- projectiles ----------
const PGEO={};function spawnProj(k,pos,vel,owner,o={}){let mesh;const gm=k=='gren'||k=='gl'||k=='c4'?sm(0x3a4030,.6,.3):sm(0x6a6a5a,.5,.5);
 if(k=='rocket'||k=='jav'||k=='tow'||k=='shell'||k=='msl'){mesh=new T.Group();box(mesh,gm,0,0,0,.12,.12,.7);const gl=new T.Sprite(new T.SpriteMaterial({map:GLOW,color:o.col||0xffa040,blending:T.AdditiveBlending,transparent:true,depthWrite:false}));gl.scale.setScalar(k=='shell'?1.2:.9);gl.position.z=.4;mesh.add(gl)}
 else if(k=='plasma'||k=='laserb'){mesh=new T.Sprite(new T.SpriteMaterial({map:GLOW,color:o.col||0xff4020,blending:T.AdditiveBlending,transparent:true,depthWrite:false}));mesh.scale.setScalar(k=='plasma'?1.6:.7)}
 else{mesh=new T.Mesh(SPHG,gm);mesh.scale.setScalar(k=='bomb'?.6:.12);mesh.castShadow=true}
 mesh.position.copy(pos);scene.add(mesh);const pr=Object.assign({k,p:pos.clone(),v:vel.clone(),owner,life:k=='gren'?2.6:8,mesh,dmg:100,rad:6},o);PROJ.push(pr);return pr}
function stepProj(dt){const g=G.era.grav;for(let i=PROJ.length-1;i>=0;i--){const q=PROJ[i];q.life-=dt;let boom=q.life<=0&&q.k!='gren'&&q.k!='smoke'&&q.k!='flash'&&q.k!='emp';
 if(q.k=='gren'||q.k=='gl'||q.k=='bomb'||q.k=='shell'||q.k=='smoke'||q.k=='flash'||q.k=='emp')q.v.y-=g*dt*(q.k=='shell'?.3:1);
 if((q.k=='jav'||q.k=='msl')&&q.tgt&&q.tgt.alive){const age=8-q.life;const tp=tmp.copy(q.tgt.p).add(new T.Vector3(0,q.tgt.hy||1,0));if(q.k=='jav'&&!q.aa&&age<.9&&!q.tgt.air){tp.y+=40}const sp=q.v.length()+dt*20;const want=tp.sub(q.p).normalize().multiplyScalar(Math.min(sp,q.k=='msl'?140:80));q.v.lerp(want,clamp(dt*(q.k=='msl'?3:2.5),0,1))}
 if(q.k=='tow'&&P.mode=='veh'){const aim=eyeAim(300);const want=aim.sub(q.p).normalize().multiplyScalar(60);q.v.lerp(want,clamp(dt*3,0,1))}
 if(q.stuck){if(q.stuck.alive===false)q.stuck=null;else if(q.stuck.p)q.p.copy(q.stuck.p).add(q.so)}else q.p.addScaledVector(q.v,dt);
 q.mesh.position.copy(q.p);if(q.mesh.isGroup)q.mesh.lookAt(tmp.copy(q.p).sub(q.v));
 if((q.k=='rocket'||q.k=='jav'||q.k=='tow'||q.k=='msl')&&Math.random()<.7)sprite(q.p,G.era.id=='space'?0x9090a0:0xbab4aa,.5,1.2,0,null,2.5);
 const gy=WORLD.H(q.p.x,q.p.z);let hitW=q.p.y<gy;if(!hitW)for(const b of WORLD.boxes)if(q.p.x>b.x0&&q.p.x<b.x1&&q.p.z>b.z0&&q.p.z<b.z1&&q.p.y>b.y0&&q.p.y<b.y1){hitW=b;break}
 if(q.k=='gren'||q.k=='smoke'||q.k=='flash'||q.k=='emp'){if(hitW&&!q.stuck){if(q.sticky){q.v.set(0,0,0);q.stuck={p:q.p.clone()};q.so=V3()}else{q.p.addScaledVector(q.v,-dt);if(hitW===true){q.v.y=Math.abs(q.v.y)*.35;q.v.x*=.6;q.v.z*=.6}else{q.v.multiplyScalar(-.3)}if(q.impact)boom=1}}
  if(q.sticky&&!q.stuck)for(const e of ENTS)if(e.alive&&e.team=='e'&&e.p.distanceTo(q.p)<(e.R||1)+.5){q.stuck=e;q.so=q.p.clone().sub(e.p);break}
  if(q.life<=0){if(q.k=='gren')boom=1;else{tacBurst(q);scene.remove(q.mesh);PROJ.splice(i,1);continue}}}
 else if(hitW&&q.k!='c4')boom=1;
 if(!boom&&q.k!='gren'&&q.k!='c4'&&q.k!='smoke'&&q.k!='flash'&&q.k!='emp'){for(const e of ENTS){if(!e.alive||(q.owner=='e'&&e.team=='e')||(q.owner=='p'&&e.team!='e'))continue;if(e.p.distanceTo(q.p)<(e.R||1)+.6){const mid=tmp.copy(e.p);mid.y+=e.hy||1;if(mid.distanceTo(q.p)<(e.R||1)+1){boom=1;q.direct=e;break}}}
  if(q.owner=='e'){const pp=P.mode=='veh'?P.veh.p:P.mode=='air'?P.air.e.p:P.p;if(q.p.distanceTo(tmp.copy(pp).add(new T.Vector3(0,1,0)))<(P.mode=='foot'?1.2:3))boom=1}}
 if(boom){if(q.direct)dmgEnt(q.direct,q.dmg*.6,'expl',q.owner);explode(q.p,q.rad,q.dmg,q.owner,{col:q.col});scene.remove(q.mesh);PROJ.splice(i,1)}}}
function tacBurst(q){if(q.k=='smoke'){for(let i=0;i<10;i++)sprite(tmp.copy(q.p).add(new T.Vector3(rnd(-3,3),rnd(0,2.5),rnd(-3,3))),0xc8ccd0,5,12,0,new T.Vector3(rnd(-.2,.2),.2,rnd(-.2,.2)),1.2);SMOKES.push({p:q.p.clone(),t:12})}
 else{sprite(q.p,q.k=='emp'?0x60a0ff:0xffffff,8,.4,1,null,2);flash(q.p,1.2,q.k=='emp'?0x6090ff:0xffffff);sfx('boom',.6,q.p.distanceTo(P.p));for(const e of ENTS){if(!e.alive||e.team!='e')continue;const d=e.p.distanceTo(q.p);if(d<14){e.stun=q.k=='emp'?5:4;if(q.k=='emp'&&(e.k=='drone'||G.era.id=='space'&&e.k=='sol'))dmgEnt(e,q.k=='emp'&&e.k=='drone'?999:60,'expl','p')}}
  if(q.k=='flash'&&q.p.distanceTo(P.p)<10)UI.flashbang()}}
// ---------- damage ----------
function dmgEnt(e,d,kind,owner,head){if(!e.alive)return;if(e===P.veh&&owner=='e'){if(G.god)return;e.hp-=d*(kind=='bullet'?.15:1);UI.hurt();if(e.hp<=0){vehDestroyed(e)}return}if(e.team=='a'&&owner=='e'){e.hp-=d*(kind=='bullet'?(e.ba??1):1);if(e.hp<=0)kill(e,0,'e');return}if(e.team!='e'||owner=='e')return;
 let m=kind=='bullet'?(e.ba??1):kind=='rail'?1:(e.ea??1);e.hp-=d*m;e.hurtT=.15;if(e.k=='sol'){e.alert=1;e.stun=Math.max(e.stun||0,kind=='bullet'?.1:0)}
 if(e.hp<=0)kill(e,head,owner)}
function kill(e,head,by){if(!e.alive)return;e.alive=false;e.dieT=0;if(G.mp){MP.onKill(e,by||'p',head);if(e.k=='sol')return}G.score+=e.k=='boss'?1000:e.k=='tgt'?250:e.k=='air'?300:100;
 if(e.k=='sol'&&!G.mp){G.kills++;UI.feed((head?'Headshot · ':'')+'Enemy down +100')}
 if(e.k=='tgt'){G.tgtLeft--;UI.feed(e.name+' destroyed +250');explode(e.p.clone().add(new T.Vector3(0,1.5,0)),7,0,'p');e.o.traverse(o=>{if(o.isMesh)o.material=sm(0x222020,.95)})}
 if(e.k=='drone'||e.k=='air'){explode(e.p.clone(),e.k=='air'?8:3,0,'p');UI.feed((e.k=='air'?'Aircraft':'Drone')+' destroyed +'+(e.k=='air'?300:100))}
 if(e.k=='boss'){UI.feed(e.name+' DESTROYED');for(let i=0;i<5;i++)setTimeout(()=>explode(e.p.clone().add(new T.Vector3(rnd(-4,4),rnd(1,4),rnd(-4,4))),9,0,'p'),i*250);setTimeout(()=>missionEnd(true),2500)}}
function hurtPlayer(d,from){if(G.god||G.mode!='play')return;if(P.mode=='veh'){dmgEnt(P.veh,d,'expl','e');return}if(P.mode=='air'){P.air.e.hp-=d*.5;UI.hurt(from);if(P.air.e.hp<=0)airCrash(P.air.e);return}
 if(P.shield>0){P.shield-=d;return}if(P.armor>0){const a=Math.min(P.armor,d*.5);P.armor-=a;d-=a}P.hp-=d;P.lastHurt=G.t;UI.hurt(from);if(P.hp<=0){P.hp=0;if(P.mode=='drone')endDrone();playerDown()}}
function playerDown(){if(G.mp){MP.playerDown();return}G.lives--;if(G.lives<=0){missionEnd(false);return}UI.toast('You were downed — redeploying ('+G.lives+' left)');P.hp=100;P.armor=LO[G.era.id]?.armor!==0?50:0;P.p.copy(WORLD.start);P.p.y=groundAt(P.p.x,P.p.z);P.v.set(0,0,0);P.yaw=0;P.pitch=0}
// ---------- entities ----------
function addEnt(e){ENTS.push(Object.assign({alive:true,team:'e',hp:100,max:100,yaw:0,hits:[[0,1,0,.5,1]],R:1,hy:1},e));const q=ENTS[ENTS.length-1];q.max=q.hp;if(q.fac==null)q.fac=q.team=='e'?'e':'p';if(q.o)scene.add(q.o);return q}
function spawnSoldier(near,opt){const e=G.era;let x,z;for(let k=0;k<30;k++){const a=Math.random()*6.283,r=near?rnd(35,55):rnd(55,95);x=P.p.x+Math.cos(a)*r;z=P.p.z+Math.sin(a)*r;if(Math.abs(x)<140&&Math.abs(z)<140&&z<P.p.z+20)break}
 if(opt&&opt.pos){x=opt.pos.x;z=opt.pos.z}x=clamp(x,-138,138);z=clamp(z,-138,138);const o=buildSoldier(e,0,opt&&opt.uni);const s=addEnt({k:'sol',o,p:new T.Vector3(x,0,z),hp:e.id=='space'?110:e.id=='future'?100:80,hits:[[0,1.65,0,.2,2.2],[0,1.15,0,.32,1],[0,.55,0,.25,.8]],R:.5,hy:1.1,
  pref:rnd(14,32),cool:rnd(1,3),burst:0,losT:0,goal:new T.Vector3(x,0,z),walk:0,alert:Math.random()<.5,acc:e.id=='space'?.5:.42,dmg:e.id=='ww2'?9:e.id=='cold'?9:10},opt&&opt.x||{});s.p.y=groundAt(x,z);pushOut(s.p,.4,1.8);return s}
function sees(a,b){tmp.copy(b).sub(a);const d=tmp.length();tmp.divideScalar(d);for(const s of SMOKES){const t=tmp2.copy(s.p).sub(a).dot(tmp);if(t>0&&t<d&&tmp2.copy(s.p).sub(a).addScaledVector(tmp,-t).length()<5)return false}return rayWorld(a,tmp.clone(),d)>=d-.6}
function targetPos(o=V3()){if(P.mode=='veh')return o.copy(P.veh.p).add(new T.Vector3(0,1.8,0));if(P.mode=='air')return o.copy(P.air.e.p);return o.set(P.p.x,P.p.y+(P.crouch?1:1.45),P.p.z)}
function enemyShot(e,from,dmg,acc,col){const tp=targetPos();const d=from.distanceTo(tp);let hit=Math.random()<acc*(1-d/140)*(P.mode=='foot'&&P.crouch?.75:1)*(P.mode=='foot'&&Math.hypot(P.v.x,P.v.z)>4?.7:1)*(G.era.id=='space'&&P.mode=='foot'&&!P.ground?.6:1);
 const end=tp.clone();if(!hit)end.add(new T.Vector3(rnd(-1.5,1.5),rnd(-1,1.5),rnd(-1.5,1.5)));tracer(from,end,col||(G.era.id=='space'||G.era.id=='future'?0xff4030:0xffd070));sfx(G.era.id=='space'?'laser':'shot',.35,d);
 if(hit)hurtPlayer(dmg,from);else if(d<12)sfx('hit',.2)}
function stepSol(e,dt){const u=e.o.userData;if(!e.alive){e.dieT+=dt;e.o.rotation.x=-Math.min(1,e.dieT*2.2)*Math.PI/2*.95;e.o.position.y=e.p.y+Math.min(1,e.dieT*2.2)*.25-(e.dieT>3?(e.dieT-3)*.5:0);if(e.dieT>5)return 'rm';return}
 if(e.stun>0){e.stun-=dt;u.head.rotation.z=Math.sin(G.t*20)*.2;return}
 if(e.tg&&e.tg.ent&&!e.tg.ent.alive){e.tg=null;e.losT=0}if(G.mp&&e.tg&&e.tg.pl&&MP.pDead)e.tg=null;e.losT-=dt;if(e.losT<=0&&G.mp)e.tg=MP.pick(e);const tg=e.tg;const tp=G.mp?(tg?(tg.pl?targetPos():tmp.copy(tg.ent.p).add(new T.Vector3(0,tg.ent.k=='sol'?1.3:(tg.ent.hy||1),0))):(e.obj||e.goal).clone()):targetPos(),eye=tmp2.set(e.p.x,e.p.y+1.6,e.p.z);const dist=Math.max(.01,Math.hypot(tp.x-e.p.x,tp.z-e.p.z));
 if(e.losT<=0){e.losT=rnd(.25,.5);e.los=(!G.mp||tg)&&dist<(G.loud>0?140:100)&&sees(eye.clone(),tp);if(G.mp&&e.melee)e.los=!!tg&&dist<60}if(G.mp&&!tg){e.alert=0}if(e.los||(G.loud>0&&dist<70))e.alert=1;
 let mvx=0,mvz=0;const sp=G.era.id=='space'?2.6:3.3;
 if(e.melee&&e.alert){const dx=(tp.x-e.p.x)/dist,dz=(tp.z-e.p.z)/dist;e.yaw=Math.atan2(-dx,-dz);mvx=dx*1.7;mvz=dz*1.7;if(dist<1.6){e.cool-=dt;if(e.cool<=0){e.cool=.6;if(tg.pl)hurtPlayer(30,e.p);else MP.botHit(e,tg.ent,999)}}}
 else if(e.alert){const dx=(tp.x-e.p.x)/dist,dz=(tp.z-e.p.z)/dist;e.yaw=Math.atan2(-dx,-dz);
  if(dist>e.pref+6||!e.los){mvx=dx;mvz=dz}else if(dist<e.pref-8){mvx=-dx;mvz=-dz}else{const s=Math.sin(G.t*.7+e.pref)>0?1:-1;mvx=-dz*s*.5;mvz=dx*s*.5}}
 else{const gl=e.obj||e.goal;const gd=Math.max(.01,Math.hypot(gl.x-e.p.x,gl.z-e.p.z));const fs=e.obj?1.1:.5;mvx=(gl.x-e.p.x)/gd*fs;mvz=(gl.z-e.p.z)/gd*fs;if(gd<3&&e.obj)e.obj=null;if(gd<2&&!e.obj)e.goal.set(clamp(e.p.x+rnd(-20,20),-135,135),0,clamp(e.p.z+rnd(-20,20),-135,135));e.yaw=Math.atan2(-mvx,-mvz)}
 const ox=e.p.x,oz=e.p.z;e.p.x+=mvx*sp*dt;e.p.z+=mvz*sp*dt;pushOut(e.p,.4,1.8);const moved=Math.hypot(e.p.x-ox,e.p.z-oz)/dt;if(moved<.3&&(mvx||mvz)){e.goal.set(e.p.x+rnd(-15,15),0,e.p.z+rnd(-15,15));e.alert=e.los?1:0}
 e.p.y=groundAt(e.p.x,e.p.z,e.p.y);e.walk+=moved*dt*2.2;const sw=Math.sin(e.walk)*.6*Math.min(1,moved/2);u.legs[0].rotation.x=sw;u.legs[1].rotation.x=-sw;
 u.arms[0].rotation.x=u.arms[1].rotation.x=e.alert?-1.2:-.3+sw*.3;
 if(e.alert&&e.los&&dist<120&&!e.melee){e.cool-=dt;if(e.cool<=0){if(e.burst<=0){e.burst=e.k2=G.era.id=='ww2'?1+(Math.random()*2|0):3;}e.cool=.13;e.burst--;const m=V3();u.gun.getWorldPosition(m);m.y+=.05;if(!G.mp||tg.pl)enemyShot(e,m,e.dmg,e.acc);else MP.botShot(e,m,tg.ent);sprite(m,0xffb060,.4,.05,1);if(e.burst<=0)e.cool=rnd(1.2,2.6)}}
 if(e.hurtT>0){e.hurtT-=dt}}
// drones
function spawnDrone(kam){const a=Math.random()*6.283,x=clamp(P.p.x+Math.cos(a)*70,-135,135),z=clamp(P.p.z+Math.sin(a)*70,-135,135);const o=buildDrone(G.era,kam?'fpv':'quad');o.scale.setScalar(1.6);
 return addEnt({k:'drone',o,p:new T.Vector3(x,WORLD.H(x,z)+15,z),hp:40,hits:[[0,0,0,.7,1]],R:.7,hy:0,kam,cool:2,air:1,ea:1})}
function stepDrone(e,dt){if(!e.alive)return 'rm';const tp=targetPos(),d=e.p.distanceTo(tp);if(e.stun>0){e.stun-=dt;e.p.y-=dt*3;e.o.position.copy(e.p);if(e.p.y<WORLD.H(e.p.x,e.p.z))kill(e);return}
 const want=V3();if(e.kam&&d<35){want.copy(tp).sub(e.p).normalize().multiplyScalar(22)}else{const ang=G.t*.4+e.p.x;want.set(tp.x+Math.cos(ang)*14-e.p.x,WORLD.H(e.p.x,e.p.z)+8-e.p.y,tp.z+Math.sin(ang)*14-e.p.z);if(want.length()>8)want.setLength(8)}
 e.p.addScaledVector(want,dt);e.o.position.copy(e.p);e.o.rotation.y=Math.atan2(-(tp.x-e.p.x),-(tp.z-e.p.z));e.o.userData.rot.forEach(r=>r.rotation.y+=dt*40);
 if(e.kam&&d<2.5){e.alive=false;explode(e.p.clone(),4,35,'e');return 'rm'}
 if(!e.kam){e.cool-=dt;if(e.cool<=0&&d<50){e.cool=rnd(1.5,3);enemyShot(e,e.p.clone(),6,.4,0xff4030)}}}
// enemy aircraft (non-boss & bomber boss)
function spawnAir(boss){const m=boss?'bomber':G.era.enemyAir.model;const o=buildAircraft(m,1,G.era);if(boss)o.scale.setScalar(1);const a=Math.random()*6.283;
 return addEnt({k:boss?'boss':'air',air:1,o,p:new T.Vector3(Math.cos(a)*150,boss?70:60,Math.sin(a)*150),hp:boss?boss.hp:320,hits:boss?[[0,0,0,3,1],[0,0,-6,2.5,1],[0,0,6,2.5,1],[-9,0,-1,2.5,1],[9,0,-1,2.5,1]]:[[0,0,0,2,1],[0,0,-3,1.5,1],[0,0,3,1.5,1]],R:boss?8:3,hy:0,ba:boss?.4:.6,
  hd:new T.Vector3(1,0,0),spd:boss?32:(G.era.id=='ww2'?45:65),run:0,cool:rnd(6,12),name:boss?boss.n:G.era.enemyAir.n,bomb:!!boss})}
function stepAir(e,dt){if(!e.alive){e.p.addScaledVector(e.hd,e.spd*dt);e.p.y-=dt*25;e.o.position.copy(e.p);e.o.rotation.z+=dt*2;if(Math.random()<.5)sprite(e.p,0x302c2a,3,2,0,null,2);if(e.p.y<WORLD.H(e.p.x,e.p.z)){explode(e.p.clone(),10,0,'p');return 'rm'}return}
 const tp=targetPos();let goal=V3();e.cool-=dt;
 if(e.bomb){const ang=Math.atan2(e.p.z-tp.z,e.p.x-tp.x)+.5;goal.set(tp.x+Math.cos(ang)*60,75,tp.z+Math.sin(ang)*60);if(e.cool<=0&&Math.hypot(e.p.x-tp.x,e.p.z-tp.z)<40){e.cool=.35;e.drop=(e.drop||0)+1;spawnProj('bomb',e.p.clone().add(new T.Vector3(0,-2,0)),e.hd.clone().multiplyScalar(e.spd*.8),'e',{dmg:55,rad:9});if(e.drop>5){e.drop=0;e.cool=9}}}
 else if(e.run>0){goal.copy(tp);e.run-=dt;const fw=tmp.copy(tp).sub(e.p);const d=fw.length();fw.normalize();if(fw.dot(e.hd)>.96&&d<160&&d>25&&Math.random()<dt*8)enemyShot(e,e.p.clone().addScaledVector(e.hd,5),8,.35);if(d<30)e.run=0}
 else{const ang=G.t*.25+(e.id||0);goal.set(Math.cos(ang)*110,55,Math.sin(ang)*110);if(e.cool<=0){e.run=8;e.cool=rnd(10,16)}}
 const want=goal.sub(e.p).normalize();if(e.p.y<WORLD.H(e.p.x,e.p.z)+25)want.y=Math.max(want.y,.4);const prev=e.hd.clone();e.hd.lerp(want,clamp(dt*.9,0,1)).normalize();e.p.addScaledVector(e.hd,e.spd*dt);
 e.o.position.copy(e.p);e.o.lookAt(tmp.copy(e.p).sub(e.hd));const turn=prev.cross(e.hd).y;e.roll=(e.roll||0)*.95+clamp(-turn*40,-1.2,1.2)*.05;e.o.rotateZ(e.roll);e.o.userData.rot.forEach(r=>r&&(r.rotation.z+=dt*40));e.yaw=0}
// objective targets
function spawnTargets(m){const tg=m.tgt;G.tgtLeft=tg.n;for(let i=0;i<tg.n;i++){const s=WORLD.spots[i]||[rnd(-100,100),rnd(-120,0)];const o=buildTarget(tg.t,G.era);const p=new T.Vector3(s[0],WORLD.H(s[0],s[1]),s[1]);
 const e=addEnt({k:'tgt',o,p,hp:tg.t=='tower'||tg.t=='relay'?350:450,hits:[[0,1,0,1.8,1],[0,3,0,1.4,1]],R:2,hy:1.5,ba:.25,name:tg.name,tt:tg.t,cool:rnd(2,5)});o.position.copy(p);WORLD.boxes.push({x0:p.x-1.2,x1:p.x+1.2,z0:p.z-1.2,z1:p.z+1.2,y0:p.y-1,y1:p.y+1.5});
 for(let k=0;k<3;k++){const a=k*2.1;const s2=spawnSoldier();s2.p.set(p.x+Math.cos(a)*6,0,p.z+Math.sin(a)*6);pushOut(s2.p,.4,1.8);s2.p.y=groundAt(s2.p.x,s2.p.z);s2.alert=0;s2.goal.copy(s2.p)}}}
function stepTgt(e,dt){if(e.o.userData.spin&&e.alive)e.o.userData.spin.rotation.y+=dt*1.5;if(!e.alive){if(Math.random()<dt*1.5)sprite(tmp.copy(e.p).add(new T.Vector3(rnd(-1,1),2,rnd(-1,1))),0x6a6660,3,4,0,new T.Vector3(rnd(-.6,.6),1.2,rnd(-.6,.6)),3);return}
 if((e.tt=='flak'||e.tt=='sam')&&P.mode=='air'){e.cool-=dt;if(e.cool<=0){e.cool=e.tt=='sam'?6:.8;if(e.tt=='sam'&&P.air.e.p.distanceTo(e.p)<250){const m=spawnProj('msl',e.p.clone().add(new T.Vector3(0,3,0)),new T.Vector3(0,40,0),'e',{dmg:45,rad:6,tgt:P.air.e});m.life=6;UI.toast('MISSILE WARNING — break hard!')}
  else if(e.tt=='flak'&&P.air.e.p.distanceTo(e.p)<200){const bp=P.air.e.p.clone().add(new T.Vector3(rnd(-15,15),rnd(-8,8),rnd(-15,15)));sprite(bp,0x2a2a2a,4,1.5,0,null,1);sprite(bp,0xffa040,2,.2,1);if(bp.distanceTo(P.air.e.p)<9)hurtPlayer(10,bp)}}}}
// bosses
function spawnBoss(){const m=G.mission,b=m.boss,e=G.era;let ent;const s=WORLD.spots[3]||[0,-110];const p=new T.Vector3(s[0],0,s[1]);p.y=WORLD.H(p.x,p.z);
 if(b.t=='tank'){const o=buildTank(e,'mbt');ent=addEnt({k:'boss',bt:'tank',o,p,hp:b.hp,hits:[[0,1.2,0,2.4,1],[0,1.2,-2.4,2,1],[0,1.2,2.4,2,1],[0,2.3,0,1.6,1]],R:3.5,hy:1.4,ba:.08,cool:4})}
 else if(b.t=='heli'){const o=buildAircraft(e.id=='future'?'vtol':'heli',1,e);o.scale.setScalar(1.15);p.y+=35;ent=addEnt({k:'boss',bt:'heli',air:1,o,p,hp:b.hp,hits:[[0,0,0,2.4,1],[0,0,-2.5,1.8,1],[0,.3,4,1.4,1]],R:3,hy:0,ba:.4,cool:3,ang:0})}
 else if(b.t=='mech'){const o=buildMech(e);ent=addEnt({k:'boss',bt:'mech',o,p,hp:b.hp,hits:[[0,6,0,2.4,1],[0,3,0,1.6,1],[0,7,-1.5,1.2,1.6]],R:3,hy:5,ba:.15,cool:3,walk:0})}
 else if(b.t=='bomber'){ent=spawnAir(b);ent.o.scale.setScalar(1)}
 else if(b.t=='mother'){const o=buildMother(e);p.y+=60;ent=addEnt({k:'boss',bt:'mother',air:1,o,p,hp:b.hp,hits:[[0,-2.6,0,3.8,1.6],[0,0,0,5,.4],[0,0,10,5,.4],[0,0,-10,5,.4]],R:12,hy:0,ba:.3,cool:5,dcool:6})}
 ent.name=b.n;G.boss=ent;UI.bossBar(ent);UI.toast('BOSS: '+b.n);sfx('boom',.5);return ent}
function stepBoss(e,dt){if(!e.alive){if(e.bt=='heli'||e.bt=='mother'){e.p.y-=dt*12;e.o.position.copy(e.p);e.o.rotation.z+=dt;if(e.p.y<WORLD.H(e.p.x,e.p.z)){explode(e.p.clone(),12,0,'p');return 'rm'}}else if(Math.random()<dt*2)sprite(tmp.copy(e.p).add(new T.Vector3(rnd(-2,2),3,rnd(-2,2))),0x4a4642,3.5,4,0,new T.Vector3(rnd(-.6,.6),1.5,rnd(-.6,.6)),3);return}
 if(e.bt=='bomber')return stepAir(e,dt);const tp=targetPos(),d=e.p.distanceTo(tp);e.cool-=dt;const u=e.o.userData;
 if(e.bt=='tank'){const flat=Math.hypot(tp.x-e.p.x,tp.z-e.p.z);const hy=Math.atan2(-(tp.x-e.p.x),-(tp.z-e.p.z));e.yaw+=clamp(((hy-e.yaw+Math.PI*3)%(Math.PI*2))-Math.PI,-dt*.5,dt*.5);
  if(flat>30){e.p.x-=Math.sin(e.yaw)*dt*4;e.p.z-=Math.cos(e.yaw)*dt*4;pushOut(e.p,3,2)}e.p.y=WORLD.H(e.p.x,e.p.z);e.o.position.copy(e.p);e.o.rotation.y=e.yaw;u.tur.rotation.y=hy-e.yaw;
  if(e.cool<=0&&d<160){e.cool=rnd(3.5,5);const mz=V3();u.tur.userData.gun.localToWorld(mz.set(0,0,-5.6));const v=tp.clone().add(new T.Vector3(rnd(-2,2),0,rnd(-2,2))).sub(mz);const fl=v.length();v.normalize().multiplyScalar(70);v.y+=fl/70*G.era.grav*.3*.5;spawnProj('shell',mz,v,'e',{dmg:50,rad:5});sprite(mz,0xffc070,3,.2,1);sprite(mz,0x8a8478,3,2,0,null,2);sfx('big',1,d);flash(mz,1)}
  if(Math.random()<dt*2)enemyShot(e,e.p.clone().add(new T.Vector3(0,3,0)),5,.3)}
 else if(e.bt=='heli'){e.ang+=dt*.25;const goal=new T.Vector3(tp.x+Math.cos(e.ang)*45,Math.max(WORLD.H(e.p.x,e.p.z)+22,tp.y+18),tp.z+Math.sin(e.ang)*45);e.p.lerp(goal,clamp(dt*.6,0,1));e.o.position.copy(e.p);e.o.lookAt(tp.x,e.p.y,tp.z);e.o.rotateY(Math.PI);e.o.rotateX(.12);u.rot.forEach(r=>r&&(r.rotation.y+=dt*30));
  if(e.cool<=0){e.cool=rnd(4,6);for(let k=0;k<4;k++)setTimeout(()=>{if(!e.alive)return;const v=targetPos().add(new T.Vector3(rnd(-4,4),0,rnd(-4,4))).sub(e.p).normalize().multiplyScalar(55);spawnProj('rocket',e.p.clone().add(new T.Vector3(0,-1,0)),v,'e',{dmg:35,rad:5})},k*200)}
  if(Math.random()<dt*3)enemyShot(e,e.p.clone(),6,.35)}
 else if(e.bt=='mech'){const flat=Math.hypot(tp.x-e.p.x,tp.z-e.p.z);e.yaw=Math.atan2(-(tp.x-e.p.x),-(tp.z-e.p.z));if(flat>25){e.p.x-=Math.sin(e.yaw)*dt*3.2;e.p.z-=Math.cos(e.yaw)*dt*3.2;e.walk+=dt*3;pushOut(e.p,2.5,6)}
  e.p.y=WORLD.H(e.p.x,e.p.z);e.o.position.copy(e.p);e.o.position.y+=Math.abs(Math.sin(e.walk))*.3;e.o.rotation.y=e.yaw;u.legs[0].rotation.x=Math.sin(e.walk)*.35;u.legs[1].rotation.x=-Math.sin(e.walk)*.35;
  if(e.cool<=0){e.cool=rnd(3,4.5);for(let k=0;k<6;k++)setTimeout(()=>{if(!e.alive)return;const s=k%2?1:-1;const m=e.o.localToWorld(new T.Vector3(s*2.3,6.1,-2.9));const v=targetPos().add(new T.Vector3(rnd(-3,3),0,rnd(-3,3))).sub(m).normalize().multiplyScalar(45);spawnProj('plasma',m,v,'e',{dmg:22,rad:4,col:G.era.id=='space'?0xff3020:0xff3060})},k*140)}
  if(Math.random()<dt*2.5)enemyShot(e,e.o.localToWorld(new T.Vector3(2.3,6.1,-2.9)),7,.4)}
 else if(e.bt=='mother'){e.p.x+=Math.sin(G.t*.2)*dt*6;e.p.z+=Math.cos(G.t*.15)*dt*4;e.o.position.copy(e.p);e.o.rotation.y=G.t*.05;u.core.material.emissiveIntensity=3+Math.sin(G.t*4)*1.5;
  e.dcool-=dt;if(e.dcool<=0){e.dcool=7;for(let k=0;k<2;k++){const dr=spawnDrone(k==0);dr.p.copy(e.p).add(new T.Vector3(rnd(-5,5),-4,rnd(-5,5)))}}
  if(e.cool<=0){e.cool=rnd(3,5);for(let k=0;k<5;k++)setTimeout(()=>{if(!e.alive)return;const v=targetPos().add(new T.Vector3(rnd(-5,5),0,rnd(-5,5))).sub(e.p).normalize().multiplyScalar(40);spawnProj('plasma',e.p.clone().add(new T.Vector3(0,-4,0)),v,'e',{dmg:25,rad:5})},k*180)}}}
// ---------- player vehicles (aircraft, Bradley) ----------
function spawnPlayerVehicles(){const e=G.era,m=G.mission;const air=m.heli&&e.air2?e.air2:e.air;const ap=new T.Vector3(16,0,104);ap.y=WORLD.H(ap.x,ap.z);
 const o=buildAircraft(air.model,0,e);const pa=addEnt({k:'pair',team:'p',o,p:ap.clone(),hp:air.t=='heli'?350:300,info:air,home:ap.clone(),hits:[],R:5,hy:1});pa.p.y+=air.t=='heli'?1.6:1.4;o.position.copy(pa.p);o.rotation.y=Math.PI*.5;pa.yaw=Math.PI*.5;
 G.pair=pa;if(e.bradley&&G.mi==0){const bo=buildTank(e,'ifv');const bp=new T.Vector3(-12,0,103);bp.y=WORLD.H(bp.x,bp.z);G.brad=addEnt({k:'pveh',team:'p',o:bo,p:bp,hp:900,hits:[[0,1.3,0,2.6,1]],R:3,hy:1.3,yaw:0,ty:0,tp:0,spd:0,tow:2,towT:0});bo.position.copy(bp);WORLD.boxes.push(G.brad.box={x0:bp.x-1.6,x1:bp.x+1.6,z0:bp.z-3.2,z1:bp.z+3.2,y0:bp.y-1,y1:bp.y+2.4})}else G.brad=null}
function nearUse(){if(P.mode!='foot')return null;if(G.pair&&G.pair.alive&&!G.pair.flying&&G.pair.p.distanceTo(P.p)<7)return{t:'air',e:G.pair,n:G.pair.info.n};if(G.brad&&G.brad.alive&&G.brad.p.distanceTo(P.p)<5.5)return{t:'veh',e:G.brad,n:G.era.bradley?'M2A3 Bradley':'Tank'};if(G.boat&&G.boat.alive&&G.boat.p.distanceTo(P.p)<6)return{t:'veh',e:G.boat,n:'Patrol boat'};return null}
function enterAir(pa){const heli=pa.info.t=='heli';P.mode='air';P.air={e:pa,heli,spd:heli?0:45,yaw:pa.yaw,pitch:heli?0:.25,roll:0,cool:0,msl:pa.info.model=='prop'?6:4,mslT:0,cy:pa.yaw,cp:-.1};pa.flying=true;pa.team='p';if(!heli)pa.p.y+=2;vmRoot.visible=false;UI.mode();UI.toast((heli?'Hover: ':'Flight: ')+pa.info.n+(heli?' · JUMP/CROUCH = up/down':' · stick ↑↓ throttle · drag to steer'))}
function exitAir(){const a=P.air,e=a.e;P.mode='foot';P.p.copy(e.p);P.p.y-=1;P.v.set(0,0,0);P.chute=e.p.y-WORLD.H(e.p.x,e.p.z)>5?1:0;vmRoot.visible=true;UI.mode();
 if(a.heli&&e.p.y-WORLD.H(e.p.x,e.p.z)<4){e.flying=false;e.p.y=WORLD.H(e.p.x,e.p.z)+1.6;P.p.x+=4}else{e.abandon=a.heli?{v:V3()}:{v:camFwd(a).multiplyScalar(a.spd)}}P.air=null;if(P.chute)UI.toast('Parachute deployed')}
function camFwd(a){return new T.Vector3(0,0,-1).applyEuler(new T.Euler(a.pitch,a.yaw,0,'YXZ'))}
function airCrash(e){explode(e.p.clone(),10,0,'p');e.alive=false;e.o.visible=false;if(P.mode=='air'&&P.air.e===e){P.mode='foot';P.p.copy(e.p);P.p.y=Math.max(WORLD.H(e.p.x,e.p.z)+.1,P.p.y);P.chute=P.p.y-WORLD.H(P.p.x,P.p.z)>4?1:0;P.air=null;vmRoot.visible=true;UI.mode();hurtPlayer(20);UI.toast('Aircraft lost — ejected! Replacement in 20s')}
 setTimeout(()=>{if(G.mode=='menu')return;e.alive=true;e.o.visible=true;e.hp=e.max;e.flying=false;e.abandon=null;e.p.copy(e.home);e.p.y+=e.info.t=='heli'?1.6:1.4;e.o.position.copy(e.p);e.o.rotation.set(0,Math.PI*.5,0);e.yaw=Math.PI*.5},20000)}
function stepPairIdle(e,dt){if(e.abandon&&e.alive){e.abandon.v.y-=G.era.grav*dt;e.p.addScaledVector(e.abandon.v,dt);e.o.position.copy(e.p);e.o.rotation.x-=dt*.3;if(e.p.y<WORLD.H(e.p.x,e.p.z)+1)airCrash(e)}}
function updAir(dt){const a=P.air,e=a.e,sp=G.era.id=='space',sens=SET.sens;a.cool-=dt;a.mslT-=dt;
 if(a.heli){a.yaw-=I.lx*.0035*sens;a.cp=clamp(a.cp-I.ly*.0035*sens*(SET.inv?-1:1),-1.2,.5);const f=new T.Vector3(-Math.sin(a.yaw),0,-Math.cos(a.yaw)),r=new T.Vector3(Math.cos(a.yaw),0,-Math.sin(a.yaw));
  const tv=f.multiplyScalar(I.my*28).addScaledVector(r,I.mx*20);tv.y=(I.jump?10:0)-(I.crouch?10:0);if(!a.vel)a.vel=V3();a.vel.lerp(tv,clamp(dt*1.5,0,1));e.p.addScaledVector(a.vel,dt);const gh=WORLD.H(e.p.x,e.p.z)+1.6;if(e.p.y<gh){e.p.y=gh;a.vel.y=Math.max(0,a.vel.y)}e.p.y=Math.min(e.p.y,160);
  e.p.x=clamp(e.p.x,-200,200);e.p.z=clamp(e.p.z,-200,200);e.o.position.copy(e.p);e.o.rotation.set(0,0,0);e.o.rotation.order='YXZ';e.o.rotation.y=a.yaw;e.o.rotation.x=-a.vel.dot(new T.Vector3(-Math.sin(a.yaw),0,-Math.cos(a.yaw)))*.012;e.o.rotation.z=-I.mx*.15;e.o.userData.rot.forEach(r=>r&&(r.rotation.y+=dt*35));
  a.pitch=a.cp;const cd=camFwd(a);cam.position.copy(e.p).addScaledVector(cd,-14).add(new T.Vector3(0,4,0));cam.lookAt(tmp.copy(e.p).addScaledVector(cd,30).add(new T.Vector3(0,2,0)))}
 else{const thr=I.my;a.spd=clamp(a.spd+thr*35*dt,sp?40:30,sp?150:(e.info.model=='prop'?75:110));const yr=-(I.lx*.0028*sens)-I.mx*1.0*dt,pr=-(I.ly*.0028*sens*(SET.inv?-1:1));a.yaw+=yr;a.pitch=clamp(a.pitch+pr,-1.3,1.3);a.roll=a.roll*.9+clamp(yr*25,-1.1,1.1)*.1;
  const fw=camFwd(a);if(!sp&&a.spd<40)fw.y-=(40-a.spd)*.01;e.p.addScaledVector(fw,a.spd*dt);e.p.x=clamp(e.p.x,-260,260);e.p.z=clamp(e.p.z,-260,260);e.p.y=Math.min(e.p.y,sp?400:300);
  if(e.p.y<WORLD.H(e.p.x,e.p.z)+1.2){airCrash(e);return}for(const b of WORLD.boxes)if(e.p.x>b.x0&&e.p.x<b.x1&&e.p.z>b.z0&&e.p.z<b.z1&&e.p.y<b.y1&&b.y1-b.y0>3){airCrash(e);return}
  e.o.position.copy(e.p);e.o.rotation.order='YXZ';e.o.rotation.set(a.pitch,a.yaw,a.roll);e.o.userData.rot.forEach(r=>r&&(r.rotation.z+=dt*45));
  cam.position.copy(e.p).addScaledVector(fw,-16).add(new T.Vector3(0,4.5,0));cam.lookAt(tmp.copy(e.p).addScaledVector(fw,40));if(Math.random()<.4)sprite(tmp.copy(e.p).addScaledVector(fw,-7),sp?0x60a0ff:0xd0d0d0,.8,.8,sp?1:0,null,1.5)}
 // weapons
 const aimDir=a.heli?new T.Vector3().subVectors(tmp.copy(cam.position).add(cam.getWorldDirection(tmp2).multiplyScalar(60)),e.p).normalize():camFwd(a);
 if(I.fire&&a.cool<=0){a.cool=a.heli?.09:.06;const o=e.p.clone().addScaledVector(aimDir,a.heli?3:8);const dd=aimDir.clone().add(new T.Vector3(rnd(-.012,.012),rnd(-.012,.012),rnd(-.012,.012))).normalize();const h=hitscan(o,dd,500);const end=o.clone().addScaledVector(dd,Math.min(h.t,500));
  tracer(o,end,sp?0xff6040:0xffd070);sfx(sp?'laser':'shot',.5);if(h.e){dmgEnt(h.e,a.heli?45:30,'bullet','p');UI.hitMark()}if(h.t<500){if(a.heli&&G.era.id!='ww2')explode(end,2.5,25,'p');else sprite(end,0x8a7a62,1.2,.6,0,null,1.2)}}
 if(I.ads&&a.mslT<=0&&a.msl>0){a.mslT=.5;a.msl--;let best=null,bd=.9;for(const x of ENTS){if(!x.alive||x.team!='e'||x.k=='sol')continue;const v=tmp.copy(x.p).sub(e.p);const dl=v.length();const dt2=v.normalize().dot(aimDir);if(dt2>bd&&dl<600){bd=dt2;best=x}}
  spawnProj(best?'msl':'rocket',e.p.clone().addScaledVector(aimDir,4).add(new T.Vector3(0,-1,0)),aimDir.clone().multiplyScalar(a.heli?70:a.spd+60),'p',{dmg:a.heli?450:550,rad:7,tgt:best});sfx('big',.6);UI.toast(best?'Missile locked: '+(best.name||'target'):'Rockets away');if(a.msl<=0)setTimeout(()=>{if(P.air)P.air.msl=a.heli?6:4},6000)}
 if(took('use'))exitAir()}
function enterVeh(v){P.mode='veh';P.veh=v;v.ty=v.yaw;vmRoot.visible=false;const i=WORLD.boxes.indexOf(v.box);if(i>=0)WORLD.boxes.splice(i,1);UI.mode();UI.toast(v.boat?'Patrol boat · FIRE gun · ADS missile':G.era.bradley?'M2A3 Bradley · FIRE 25mm · ADS = TOW missile':'Tank · FIRE cannon · ADS missile')}
function exitVeh(){const v=P.veh;P.mode='foot';P.p.set(v.p.x+Math.cos(v.yaw)*3,0,v.p.z-Math.sin(v.yaw)*3);P.p.y=groundAt(P.p.x,P.p.z);P.veh=null;vmRoot.visible=true;v.box={x0:v.p.x-1.8,x1:v.p.x+1.8,z0:v.p.z-1.8,z1:v.p.z+1.8,y0:v.p.y-1,y1:v.p.y+2.4};WORLD.boxes.push(v.box);UI.mode()}
function vehDestroyed(v){v.alive=false;explode(v.p.clone().add(new T.Vector3(0,1,0)),8,0,'p');v.o.traverse(o=>{if(o.isMesh)o.material=sm(0x1a1818,.95)});if(P.veh===v){exitVeh();hurtPlayer(25);UI.toast('Bradley destroyed!')}}
function eyeAim(dist){const d=cam.getWorldDirection(V3());const t=rayWorld(cam.position,d,dist);return cam.position.clone().addScaledVector(d,t)}
function updVeh(dt){const v=P.veh,sens=SET.sens;v.ty-=I.lx*.003*sens;v.tp=clamp(v.tp-I.ly*.003*sens*(SET.inv?-1:1),-.25,.5);v.spd+=(I.my*13-v.spd)*clamp(dt*1.5,0,1);v.yaw-=I.mx*dt*1.1*(v.spd<-.5?-1:1);
 const ox=v.p.x,oz=v.p.z;v.p.x-=Math.sin(v.yaw)*v.spd*dt*(v.boat?1.6:1);v.p.z-=Math.cos(v.yaw)*v.spd*dt*(v.boat?1.6:1);if(v.boat){if(WORLD.H(v.p.x,v.p.z)>-1.8){v.p.x=ox;v.p.z=oz;v.spd*=.5}v.p.y=-1.4+Math.sin(G.t*2)*.1}else{pushOut(v.p,2.4,2);v.p.y=WORLD.H(v.p.x,v.p.z)}v.o.position.copy(v.p);v.o.rotation.y=v.yaw;
 const tur=v.o.userData.tur;tur.rotation.y=v.ty-v.yaw;tur.userData.gun.rotation.x=v.tp;const cd=new T.Vector3(0,0,-1).applyEuler(new T.Euler(v.tp,v.ty,0,'YXZ'));
 cam.position.copy(v.p).add(new T.Vector3(0,4.2,0)).addScaledVector(cd,-8.5);cam.lookAt(tmp.copy(v.p).add(new T.Vector3(0,3.2,0)).addScaledVector(cd,20));
 v.cool=(v.cool||0)-dt;v.towT-=dt;if(v.towT<=0&&v.tow<2){v.tow++;v.towT=4}
 if(I.fire&&v.cool<=0){v.cool=.3;const mz=V3();tur.userData.gun.localToWorld(mz.set(0,0,-2.3));const aim=eyeAim(400);const d=aim.clone().sub(mz).normalize();const h=hitscan(mz,d,400);const end=mz.clone().addScaledVector(d,Math.min(h.t,400));tracer(mz,end,0xffc060);sprite(mz,0xffc070,1,.06,1);flash(mz,.3);sfx('big',.5);
  if(h.t<400)explode(end,2.5,75,'p');if(h.e)UI.hitMark();FX.shake=Math.max(FX.shake,.08)}
 if(I.ads&&v.tow>0&&v.towT<3.5&&!v.towLock){v.tow--;v.towT=Math.max(v.towT,4);v.towLock=1;const lp=tur.localToWorld(new T.Vector3(-1.25,.5,-.7));spawnProj('tow',lp,cd.clone().multiplyScalar(40),'p',{dmg:950,rad:6,life:8});sfx('big',.8);UI.toast('TOW away — keep crosshair on target')}if(!I.ads)v.towLock=0;
 if(took('use'))exitVeh()}
// ---------- player drone ----------
function deployDrone(kind){const o=buildDrone(G.era,kind=='recon'&&G.era.id=='ww2'?'glider':kind,1);o.scale.setScalar(1.3);scene.add(o);const p=eyePos().add(camDir().multiplyScalar(1.2));p.y+=1;
 P.dr={o,kind,p,yaw:P.yaw,pitch:kind=='fpv'?-.1:-.25,bat:kind=='fpv'?30:45,v:V3(),glider:G.era.id=='ww2'};P.mode='drone';vmRoot.visible=false;UI.mode();UI.toast(kind=='fpv'?'FPV drone: FIRE to detonate · USE to return':'Recon drone: FIRE to spot enemies · USE to return')}
function endDrone(boom){const d=P.dr;if(!d)return;if(boom)explode(d.p.clone(),G.era.id=='modern'?7:8,320,'p');scene.remove(d.o);P.dr=null;P.mode='foot';vmRoot.visible=true;UI.mode()}
function updDrone(dt){const d=P.dr,sens=SET.sens;d.bat-=dt;d.yaw-=I.lx*.003*sens;d.pitch=clamp(d.pitch-I.ly*.003*sens*(SET.inv?-1:1),-1.4,.8);const fw=new T.Vector3(0,0,-1).applyEuler(new T.Euler(d.kind=='fpv'?d.pitch:0,d.yaw,0,'YXZ')),rt=new T.Vector3(Math.cos(d.yaw),0,-Math.sin(d.yaw));
 const tv=V3();if(d.kind=='fpv'){tv.copy(fw).multiplyScalar(14+I.my*14).addScaledVector(rt,I.mx*10)}else{tv.copy(fw).multiplyScalar(d.glider?14+I.my*6:I.my*14).addScaledVector(rt,I.mx*12);tv.y=(I.jump?7:0)-(I.crouch?7:0)}
 d.v.lerp(tv,clamp(dt*3,0,1));d.p.addScaledVector(d.v,dt);const gh=WORLD.H(d.p.x,d.p.z);d.p.y=Math.min(d.p.y,gh+70);d.o.position.copy(d.p);d.o.rotation.set(d.kind=='fpv'?d.pitch:-I.my*.2,d.yaw,-I.mx*.3,'YXZ');d.o.userData.rot&&d.o.userData.rot.forEach(r=>r.rotation.y+=dt*50);
 cam.position.copy(d.p).add(new T.Vector3(0,-.15,0));cam.rotation.set(d.pitch,d.yaw,0,'YXZ');
 let hit=d.p.y<gh+.3;if(!hit)for(const b of WORLD.boxes)if(d.p.x>b.x0&&d.p.x<b.x1&&d.p.z>b.z0&&d.p.z<b.z1&&d.p.y>b.y0&&d.p.y<b.y1){hit=true;break}
 if(d.kind=='fpv'){for(const e of ENTS)if(e.alive&&e.team=='e'&&tmp.copy(e.p).add(new T.Vector3(0,e.hy||1,0)).distanceTo(d.p)<(e.R||1)+1.2)hit=true;if(hit||took('fire1')||d.bat<=0){endDrone(true);return}}
 else{if(hit){d.p.y=Math.max(gh+.4,d.p.y+.5);d.v.multiplyScalar(-.3)}if(took('fire1')){let n=0;for(const e of ENTS){if(!e.alive||e.team!='e')continue;tmp.copy(e.p).sub(d.p);const l=tmp.length();if(l<110&&tmp.normalize().dot(cam.getWorldDirection(tmp2))>.5){e.spot=25;n++}}UI.toast(n+' hostiles spotted');sfx('click',.8)}if(d.bat<=0){UI.toast('Drone battery depleted');endDrone();return}}
 if(took('use'))endDrone()}
// ---------- gadgets/equipment ----------
function throwNade(tact){const t=tact?P.taT:P.leT;if(tact?P.ta<=0:P.le<=0)return;const w=curW();if(!tact&&w.st.gl&&w.gl>0&&P.cur==0){w.gl--;spawnProj('gl',eyePos().addScaledVector(camDir(),.8),camDir().multiplyScalar(40).add(new T.Vector3(0,2,0)),'p',{dmg:220,rad:6});sfx('big',.5);UI.toast('40mm GL ('+w.gl+' left)');return}
 if(tact)P.ta--;else P.le--;const k=tact?t.id:'gren';const pr=spawnProj(k=='frag'?'gren':k,eyePos().addScaledVector(camDir(),.6),camDir().multiplyScalar(19).add(new T.Vector3(0,4.5,0)).add(P.v),'p',{dmg:t.id=='impact'?170:190,rad:t.id=='frag'&&G.era.id!='ww2'?7.5:7,sticky:t.id=='stick'||t.id=='semtex',impact:t.id=='impact'});pr.life=t.id=='stick'||t.id=='semtex'?2:t.id=='impact'?6:2.6;if(tact)pr.life=1.6;sfx('nade',.6)}
function useGadget(){const g=P.gadT.id;const c4=P.placed.filter(x=>x.k=='c4'&&!x.boom);if(g=='c4'&&c4.length&&P.gad<=0||g=='c4'&&c4.length&&I.pr.has('gadHold')){c4.forEach(c=>c.boom=1);return}
 if(g=='c4'&&c4.length){c4.forEach(c=>c.boom=1);return}if(P.gad<=0){UI.toast('No '+P.gadT.n+' left');return}
 if(g=='recon'||g=='fpv'){P.gad--;deployDrone(g);return}
 if(g=='shield'){P.gad--;P.shield=150;P.shieldT=12;UI.toast('Energy shield up');return}
 P.gad--;const pos=P.p.clone().add(new T.Vector3(-Math.sin(P.yaw)*1.2,0,-Math.cos(P.yaw)*1.2));pos.y=groundAt(pos.x,pos.z,P.p.y)+.15;const o=new T.Group();
 if(g=='c4'){box(o,sm(0xc8c0a0,.8),0,0,0,.3,.12,.2);box(o,sm(0xff2020,.2,0,{emissive:0xff2020,emissiveIntensity:3}),0,.07,0,.04,.02,.04);const v=camDir().multiplyScalar(9).add(new T.Vector3(0,3,0));P.placed.push({k:'c4',p:pos.copy(eyePos()),v,o,stuck:0});UI.toast('C4 thrown — press GADGET again to detonate')}
 else{box(o,sm(0x4a5a3a,.7),0,.12,0,.25,.16,.05);box(o,sm(0x222222,.7),.08,0,0,.02,.12,.02);box(o,sm(0x222222,.7),-.08,0,0,.02,.12,.02);o.rotation.y=P.yaw;P.placed.push({k:'clay',p:pos,o,yaw:P.yaw});UI.toast(P.gadT.n+' placed')}
 o.position.copy(pos);scene.add(o);o.traverse(m=>m.castShadow=true)}
function stepPlaced(dt){for(let i=P.placed.length-1;i>=0;i--){const c=P.placed[i];if(c.k=='c4'&&!c.stuck){c.v.y-=G.era.grav*dt;c.p.addScaledVector(c.v,dt);if(c.p.y<groundAt(c.p.x,c.p.z,c.p.y+.5)+.06){c.p.y=groundAt(c.p.x,c.p.z,c.p.y+.5)+.06;c.stuck=1}c.o.position.copy(c.p)}
 if(c.k=='clay'&&!c.boom){const f=new T.Vector3(-Math.sin(c.yaw),0,-Math.cos(c.yaw));for(const e of ENTS){if(!e.alive||e.team!='e'||e.air)continue;tmp.copy(e.p).sub(c.p);const l=tmp.length();if(l<4.5&&tmp.normalize().dot(f)>.3){c.boom=1;break}}}
 if(c.boom){scene.remove(c.o);P.placed.splice(i,1);explode(c.p.clone().add(new T.Vector3(0,.4,0)),c.k=='c4'?8:6,c.k=='c4'?600:250,'p')}}}
// ---------- player on foot ----------
function updFoot(dt){const w=curW(),st=w.st,sens=SET.sens*(1-P.ads*(1-1/Math.sqrt(st.z))) ;P.yaw-=I.lx*.0032*sens;P.pitch=clamp(P.pitch-I.ly*.0032*sens*(SET.inv?-1:1),-1.45,1.45);
 const crouchH=P.crouch?1.05:1.62;P.ch+=(crouchH-P.ch)*clamp(dt*10,0,1);const sprint=I.sprint&&I.my>.5&&!P.ads&&!I.fire;
 const spd=(P.crouch?2.6:sprint?7.4:4.9)*st.mob*(1-P.ads*.45)*(G.era.id=='space'?.9:1);const f=new T.Vector3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),r=new T.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));
 const wish=V3().addScaledVector(f,I.my).addScaledVector(r,I.mx);if(wish.lengthSq()>1)wish.normalize();wish.multiplyScalar(spd);const acc=P.ground?12:(G.era.id=='space'?2:3);P.v.x+=(wish.x-P.v.x)*clamp(dt*acc,0,1);P.v.z+=(wish.z-P.v.z)*clamp(dt*acc,0,1);
 if(took('jump')){if(P.ground){P.v.y=G.era.id=='space'?6.5:6.8;P.ground=false;P.crouch=0}}if(took('crouch'))P.crouch=P.crouch?0:1;
 P.v.y-=G.era.grav*dt;if(P.chute)P.v.y=Math.max(P.v.y,-4.5);P.p.addScaledVector(P.v,dt);pushOut(P.p,.38,P.ch);const g=groundAt(P.p.x,P.p.z,P.p.y);if(P.p.y<=g){if(!P.ground&&P.v.y<-16&&!P.chute)hurtPlayer((-P.v.y-16)*4);P.p.y=g;P.v.y=0;P.ground=true;P.chute=0}else if(P.p.y>g+.05)P.ground=false;
 if(P.ground&&P.p.y-g<.4)P.p.y=g;
 // weapon state
 P.swapT=Math.max(0,P.swapT-dt);if(P.relT>0){P.relT-=dt;if(P.relT<=0){const need=w.st.mag-w.mag,n=Math.min(need,w.res);w.mag+=n;w.res-=n}}
 const wantAds=I.ads&&P.relT<=0&&P.swapT<=0&&!sprint?1:0;P.ads+=(wantAds-P.ads)*clamp(dt*9/st.ads,0,1);
 if(!I.fire)P.semiOK=true;if(I.fire)fireWeapon();if(took('reload'))reload();if(took('swap'))swapTo(P.cur+1);for(const k of[0,1,2])if(took('w'+k))swapTo(k);
 if(took('gren'))throwNade(0);if(took('tact'))throwNade(1);if(took('gadget'))useGadget();if(took('med')){if(P.med>0&&P.hp<100){P.med--;P.hp=Math.min(100,P.hp+60);UI.toast('Medkit used (+60)')}}
 if(took('use')){const u=nearUse();if(u){if(u.t=='air')enterAir(u.e);else enterVeh(u.e)}}
 if(G.t-P.lastHurt>5&&P.hp<100)P.hp=Math.min(100,P.hp+dt*8);
 // javelin lock
 if(w.def.lock&&P.ads>.8){const cd=camDir();let best=null,bd=.985;for(const e of ENTS){if(!e.alive||e.team!='e'||e.k=='sol'||e.k=='tgt'&&false)continue;if(w.def.aa&&!e.air)continue;tmp.copy(e.p).add(new T.Vector3(0,e.hy||1,0)).sub(eyePos(tmp2));const dt2=tmp.normalize().dot(cd);if(dt2>bd){bd=dt2;best=e}}
  if(best&&best===P.lockC){P.lockT+=dt;if(P.lockT>1.4&&P.lock!==best){P.lock=best;sfx('click',1)}}else{P.lockC=best;P.lockT=0;P.lock=null}}else{P.lockT=0;P.lock=null;P.lockC=null}
 P.rec=Math.max(0,P.rec-dt*3);P.kick*=Math.pow(.0005,dt);
 // camera + viewmodel
 eyePos(cam.position);cam.rotation.set(P.pitch+P.kick*.2,P.yaw,0,'YXZ');const mv=Math.hypot(P.v.x,P.v.z);if(P.ground)P.bob+=mv*dt*1.6;const bob=Math.sin(P.bob)*.012*Math.min(1,mv/5)*(1-P.ads*.8);cam.position.y+=Math.abs(bob)*.6;
 const gm=w.mesh;const hip=new T.Vector3(.15,-.15,-.42),ads=new T.Vector3(0,-gm.userData.sightY,-.3+(w.def.c=='pistol'?.0:.02));gm.position.lerpVectors(hip,ads,P.ads);gm.position.x+=Math.cos(P.bob*.5)*bob;gm.position.y+=bob-P.swapT*.5-(P.relT>0?.08:0)+(sprint?-.04:0);gm.position.z+=P.kick*.15;
 gm.rotation.set(P.kick*.5+(P.relT>0?-.5:0)+(sprint?-.3:0),(sprint?.6:0)*(1-P.ads),P.relT>0?.4:0);const sc=st.scope&&P.ads>.85;gm.visible=!sc;UI.scope(sc);
 cam.fov=72/(1+(st.z-1)*P.ads);if(sprint)cam.fov+=5;cam.updateProjectionMatrix()}
// ---------- mission flow ----------
function clearMission(){for(const e of ENTS)if(e.o)scene.remove(e.o);for(const q of PROJ)scene.remove(q.mesh);for(const c of P.placed)scene.remove(c.o);if(P.dr)scene.remove(P.dr.o);ENTS=[];PROJ=[];SMOKES=[];P.placed=[];P.dr=null;if(G.mp){if(G.mp.zm)scene.remove(G.mp.zm);if(G.mp.siteO)scene.remove(G.mp.siteO);(G.mp.loot||[]).forEach(l=>scene.remove(l.o))}G.boat=null;MP.pDead=false;FX.sp.forEach(s=>{s.l=0;s.m.visible=false})}
function startMission(ei,mi){audioInit();clearMission();G.mp=null;G.boat=null;G.ei=ei;G.era=ERAS[ei];G.mi=mi;G.mission=G.era.missions[mi];G.t=0;G.phase=0;G.kills=0;G.score=0;G.shots=0;G.hits=0;G.boss=null;G.lives=3;G.spawnT=0;G.loud=0;
 buildWorld(scene,G.era,G.mission,mi);setTier(QUAL.tier,1);vmScene.userData.dl.color.copy(WORLD.sun.color);
 P.p.copy(WORLD.start);P.p.y=groundAt(P.p.x,P.p.z);P.v.set(0,0,0);P.yaw=0;P.pitch=0;P.hp=100;P.mode='foot';P.veh=null;P.air=null;P.ads=0;P.crouch=0;P.chute=0;P.shield=0;vmRoot.visible=true;equipLoadout();
 spawnTargets(G.mission);for(let i=0;i<4;i++)spawnSoldier();const m=G.mission;for(let i=0;i<(m.drones||0);i++)if(i<3)spawnDrone(i%2==1);for(let i=0;i<(m.air||0);i++)if(m.boss.t!='bomber'||i==0)spawnAir();spawnPlayerVehicles();
 G.mode='play';UI.show(null);UI.mode();UI.brief(G.era,m);post&&(post.uniforms.uNV.value=0)}
function stepMission(dt){if(G.mp)return MP.step(dt);const m=G.mission;G.spawnT-=dt;const alive=ENTS.filter(e=>e.k=='sol'&&e.alive).length,cap=QUAL.tier==0?5:QUAL.tier==1?7:9;
 if(G.phase<2&&G.spawnT<=0&&alive<(G.phase==0?cap:Math.ceil(cap/2))){G.spawnT=G.phase==0?2.5:6;spawnSoldier()}
 if(G.phase==0&&G.kills>=m.kill&&G.tgtLeft<=0){G.phase=1;spawnBoss()}
 if(G.phase>=1&&G.era.id!='ww2'&&ENTS.filter(e=>e.k=='drone'&&e.alive).length<2&&Math.random()<dt*.1)spawnDrone(Math.random()<.5);
 G.loud=Math.max(0,G.loud-dt)}
function missionEnd(win){if(G.mode!='play')return;G.mode='end';if(win){const pr=JSON.parse(localStorage.getItem('aoe3d.prog')||'{}');pr[G.era.id+G.mi]=1;localStorage.setItem('aoe3d.prog',JSON.stringify(pr))}document.exitPointerLock&&document.exitPointerLock();UI.end(win)}
// ---------- main loop ----------
let last=performance.now();function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;if(G.mode=='play')dt*=G.slow||1;
 UI.poll(dt);if(G.mode=='play'){G.t+=dt;if(took('pause')){UI.pause();}else{
  if(G.mp&&MP.pDead){cam.position.set(MP.baseA.x,60,MP.baseA.z+40);cam.lookAt(0,0,0);vmRoot.visible=false}else if(P.mode=='foot'){vmRoot.visible=true;updFoot(dt)}else if(P.mode=='air')updAir(dt);else if(P.mode=='veh')updVeh(dt);else if(P.mode=='drone')updDrone(dt);
  if(P.mode!='foot'){P.swapT=0;if(P.mode=='drone'||P.mode=='air'||P.mode=='veh'){}}
  if(P.mode=='drone'){/*player body idle*/}
  for(let i=ENTS.length-1;i>=0;i--){const e=ENTS[i];let r;if(e.k=='sol')r=stepSol(e,dt);else if(e.k=='drone')r=stepDrone(e,dt);else if(e.k=='air')r=e.mp?MP.stepAir(e,dt):stepAir(e,dt);else if(e.k=='tank'||e.k=='boat')r=MP.stepVeh(e,dt);else if(e.k=='flag')MP.stepFlag(e,dt);else if(e.k=='boss')r=stepBoss(e,dt);else if(e.k=='tgt')stepTgt(e,dt);else if(e.k=='pair'&&!e.flying)stepPairIdle(e,dt);else if(e.k=='pair')stepPairIdle(e,dt);
   if(e.k=='sol'&&e.alive){e.o.position.copy(e.p);e.o.rotation.y=e.yaw}if(r=='rm'){scene.remove(e.o);ENTS.splice(i,1)}if(e.spot>0)e.spot-=dt}
  stepProj(dt);stepPlaced(dt);for(let i=SMOKES.length-1;i>=0;i--)if((SMOKES[i].t-=dt)<=0)SMOKES.splice(i,1);if(P.shield>0){P.shieldT-=dt;if(P.shieldT<=0)P.shield=0}
  stepMission(dt);I.pr.delete('fire1');I.pr.delete('firePress')}
  if(P.mode=='foot'&&!P.ads)I.pr.delete('fire1');
  if(FX.shake>0){cam.position.x+=rnd(-1,1)*FX.shake*.15;cam.position.y+=rnd(-1,1)*FX.shake*.15}
  const s=WORLD.sun;if(s){const c=P.mode=='air'?P.air.e.p:P.mode=='drone'?P.dr.p:P.mode=='veh'?P.veh.p:P.p;s.target.position.copy(c);s.position.copy(c).addScaledVector(WORLD.sunDir,120)}
  if(WORLD.sky)WORLD.sky.position.copy(cam.position);stepFX(dt);if(MZ&&MZ.visible){MZ.userData.t-=dt;if(MZ.userData.t<=0)MZ.visible=false}const fl=vmScene.userData.flash;fl.intensity*=Math.pow(.0001,dt);
  cam.updateMatrixWorld();vmRoot.position.copy(cam.position);vmRoot.quaternion.copy(cam.quaternion);UI.hud(dt);autoQ(dt);
  if(post){post.uniforms.uT.value=G.t;post.uniforms.uHurt.value=clamp(1-(P.hp/100),0,1)*.6*(P.mode=='foot'?1:0)+UI.hurtV;}
  draw(P.mode=='foot')}
 else if(G.mode=='menu'||G.mode=='pause'||G.mode=='end'){if(G.mode=='menu')SHOW.step(dt,now);if(G.mode=='menu')draw(false,SHOW.scene,SHOW.cam);else draw(false)}}
function draw(vm,sc=scene,cm=cam){if(QUAL.post&&rt){ren.setRenderTarget(rt);ren.render(sc,cm);G.calls=ren.info.render.calls;G.tris=ren.info.render.triangles;if(vm&&vmRoot.visible){ren.autoClear=false;ren.clearDepth();ren.render(vmScene,cm);ren.autoClear=true}ren.setRenderTarget(null);ren.render(postScene,postCam)}
 else{ren.render(sc,cm);if(vm&&vmRoot.visible){ren.autoClear=false;ren.clearDepth();ren.render(vmScene,cm);ren.autoClear=true}}}
// ---------- menu showroom ----------
const SHOW={scene:null,cam:null,obj:null,key:'',t:0,
 init(){const s=this.scene=new T.Scene();this.cam=new T.PerspectiveCamera(40,1,.05,500);s.background=new T.Color(0x0b0d12);s.fog=new T.Fog(0x0b0d12,14,60);
  s.add(new T.HemisphereLight(0x8090b0,0x202018,.8));const d=new T.DirectionalLight(0xfff0e0,3);d.position.set(4,8,3);d.castShadow=true;d.shadow.mapSize.set(1024,1024);d.shadow.camera.left=d.shadow.camera.bottom=-12;d.shadow.camera.right=d.shadow.camera.top=12;s.add(d);
  const r=new T.PointLight(0x4080ff,30,30,1.5);r.position.set(-5,3,-4);s.add(r);const fl=new T.Mesh(new T.CircleGeometry(30,48),pbr('concrete',6,{color:0x7a7c80}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.add(fl);this.grp=new T.Group();s.add(this.grp)},
 set(key,build,camPos,look){if(this.key==key)return;this.key=key;this.grp.clear();const o=build();this.grp.add(o);this.cp=camPos;this.look=look;this.obj=o},
 step(dt,now){this.t+=dt;if(!this.scene)this.init();this.cam.aspect=innerWidth/innerHeight;this.cam.updateProjectionMatrix();const cp=this.cp||[6,3,8];this.cam.position.set(...cp);this.cam.lookAt(...(this.look||[0,1,0]));if(this.obj&&this.obj.userData.spinMe)this.obj.rotation.y=this.t*.35;
  this.obj&&this.obj.traverse(o=>{if(o.userData.rot)o.userData.rot.forEach(r=>r&&(r.rotation.z+=dt*20))})}};
