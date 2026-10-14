'use strict';
// ===== procedural textures, PBR materials and models =====
const T=THREE;
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// tileable value noise
function mkNoise(seed,P){const r=mulberry(seed),g=new Float32Array(P*P);for(let i=0;i<P*P;i++)g[i]=r();const sm=t=>t*t*(3-2*t);
 return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=sm(x-xi),fy=sm(y-yi),a=((xi%P)+P)%P,b=((yi%P)+P)%P,a1=(a+1)%P,b1=(b+1)%P;
  return(g[b*P+a]*(1-fx)+g[b*P+a1]*fx)*(1-fy)+(g[b1*P+a]*(1-fx)+g[b1*P+a1]*fx)*fy}}
const TEXC={};
function genTex(kind,S=256){if(TEXC[kind])return TEXC[kind];
 const H=new Float32Array(S*S),C=new Uint8ClampedArray(S*S*4),R=new Uint8ClampedArray(S*S*4);const ns=[mkNoise(7,8),mkNoise(11,16),mkNoise(13,32),mkNoise(17,64)];const rnd=mulberry(kind.length*977+3);
 const fbm=(x,y)=>{let v=0,a=.5;for(let o=0;o<4;o++){const P=8<<o;v+=ns[o](x*P/S,y*P/S)*a;a*=.5}return v/.9375};
 const pal={grass:[[62,84,40],[98,112,58]],sand:[[176,150,105],[214,190,140]],snow:[[205,212,222],[245,248,252]],concrete:[[110,112,115],[160,160,158]],regolith:[[105,104,102],[170,168,165]],
  dirt:[[90,72,50],[130,108,78]],metal:[[70,74,78],[120,124,128]],brick:[[120,70,52],[160,100,76]],panel:[[150,155,162],[200,204,210]],wood:[[90,60,34],[140,98,58]],plaster:[[180,170,150],[220,212,195]],rust:[[90,60,40],[140,96,64]]}[kind]||[[120,120,120],[180,180,180]];
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){let h=fbm(x,y),t=h;const i=y*S+x;let rough=.85;
  if(kind=='grass'){t=fbm(x*3.1,y*3.1)*.6+h*.4;const bl=ns[3]((x*5.3)%S*64/S,(y*1.3)%S*64/S);h=h*.5+bl*.5;if(bl>.7){t*=.8}}
  if(kind=='sand'){h=h*.6+Math.sin((x*.08+h*6+y*.02))*.15+.15}
  if(kind=='snow'){rough=.55;h=h*.7}
  if(kind=='regolith'){h=h*.7+ns[3](x*64/S,y*64/S)*.3;rough=.95}
  if(kind=='concrete'){h=h*.3+ns[3](x*64/S,y*64/S)*.15+.4;if((x%128)<2||(y%128)<2)h-=.3;rough=.8}
  if(kind=='metal'){h=.5+ns[3](x*64/S,y*8/S)*.15+h*.1;if((x%64)<2||(y%128)<2)h-=.35;rough=.45+h*.2}
  if(kind=='panel'){h=.55+h*.15;const gx=x%64,gy=y%64;if(gx<3||gy<3)h=.15;if(gx>28&&gx<36&&gy>8&&gy<12)h=.8;rough=.4}
  if(kind=='brick'){const row=y>>4,off=(row&1)*16,bx=(x+off)%32,by=y%16;if(bx<2||by<2){h=.15;t=.9}else{h=.6+h*.3;t=h*.6+((((x+off)>>5)*7+row*13)%5)/12}}
  if(kind=='plaster'){h=.5+h*.4}
  if(kind=='wood'){h=.5+Math.sin(x*.15+fbm(x*.5,y*4)*8)*.25;rough=.75}
  if(kind=='rust'){h=h;rough=.9}
  H[i]=h;const c0=pal[0],c1=pal[1];for(let k=0;k<3;k++)C[i*4+k]=c0[k]+(c1[k]-c0[k])*Math.min(1,Math.max(0,t*1.4-.2))+(rnd()-.5)*10;C[i*4+3]=255;
  const rv=Math.min(255,rough*255);R[i*4]=255;R[i*4+1]=rv;R[i*4+2]=(kind=='metal'||kind=='panel')?180:0;R[i*4+3]=255}
 const cv=(D)=>{const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const id=g.createImageData(S,S);id.data.set(D);g.putImageData(id,0,0);return c};
 const N=new Uint8ClampedArray(S*S*4),str=kind=='grass'?3:kind=='brick'?4:2.5;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=y*S+x,dx=(H[y*S+(x+1)%S]-H[y*S+(x+S-1)%S])*str,dy=(H[((y+1)%S)*S+x]-H[((y+S-1)%S)*S+x])*str,l=Math.hypot(dx,dy,1);N[i*4]=(-dx/l*.5+.5)*255;N[i*4+1]=(dy/l*.5+.5)*255;N[i*4+2]=(1/l*.5+.5)*255;N[i*4+3]=255}
 const mk=(c,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(srgb)t.colorSpace=T.SRGBColorSpace;return t};
 return TEXC[kind]={map:mk(cv(C),1),normalMap:mk(cv(N)),roughnessMap:mk(cv(R))}}
const MATC={};
function pbr(kind,rep=1,o={}){const key=kind+rep+JSON.stringify(o);if(MATC[key])return MATC[key];const t=genTex(kind);const cl=x=>{const c=x.clone();c.repeat.set(rep,rep);c.needsUpdate=true;return c};
 const m=new T.MeshStandardMaterial(Object.assign({map:cl(t.map),normalMap:cl(t.normalMap),roughnessMap:cl(t.roughnessMap),metalnessMap:(kind=='metal'||kind=='panel')?cl(t.roughnessMap):null,roughness:1,metalness:(kind=='metal'||kind=='panel')?.35:0},o));return MATC[key]=m}
function sm(col,r=.6,m=0,o={}){const key='s'+col+r+m+JSON.stringify(o);return MATC[key]||(MATC[key]=new T.MeshStandardMaterial(Object.assign({color:col,roughness:r,metalness:m*.5},o)))}
const BOXG=new T.BoxGeometry(1,1,1),CYLG=new T.CylinderGeometry(.5,.5,1,12),SPHG=new T.SphereGeometry(.5,14,10),CONEG=new T.ConeGeometry(.5,1,10);
function part(par,geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;par.add(m);return m}
const box=(p,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>part(p,BOXG,mat,x,y,z,sx,sy,sz,rx,ry,rz);
const cyl=(p,mat,x,y,z,r,l,ax='z',r2)=>{const m=part(p,r2!=null?new T.CylinderGeometry(r2,r,1,12):CYLG,mat,x,y,z,r2!=null?1:r*2,l,r2!=null?1:r*2);if(ax=='z')m.rotation.x=Math.PI/2;if(ax=='x')m.rotation.z=Math.PI/2;return m};
const sph=(p,mat,x,y,z,sx,sy,sz)=>part(p,SPHG,mat,x,y,z,sx,sy,sz);
// ---------- weapons (first-person viewmodel, -Z forward, units metres) ----------
function gunMats(era,w){const fut=era.id=='future'||era.id=='space';return{
 m:sm(fut?0x3a3e44:0x2c2e32,.42,.45),p:sm(fut?0xd8dce0:0x2b2c2a,.55,.1),w:era.id=='ww2'||(era.id=='cold'&&/ak47|m21|m1911/.test(w.id))?pbr('wood',1,{color:0xb07850}):sm(era.id=='cold'?0x2a2a28:0x3a3a36,.6,.1),
 g:sm(0x223344,.1,.2,{transparent:true,opacity:.45}),e:sm(era.id=='space'?0xff7030:0x30d8ff,.3,0,{emissive:era.id=='space'?0xff6020:0x20c8ff,emissiveIntensity:2.5}),r:sm(0x101010,.2,.6),tan:sm(0x8a7a5a,.7,.05)}}
function buildGun(w,att,era){const g=new T.Group(),M=gunMats(era,w),c=w.c,fut=era.id=='future'||era.id=='space';att=att||{};const A=k=>{const a=(era.att[k]||[]).find(x=>x.id==att[k]);return a?a.vis:'none'};
 const L={rifle:.42,smg:.28,lmg:.5,sniper:.56,shotgun:.48,pistol:.12,energy:.4,launcher:.9}[c]||.4;let bar=L*.8,top=.05,muz;
 if(c=='launcher'){const big=w.proj=='rail';cyl(g,big?M.m:sm(era.id=='ww2'?0x4a5238:era.id=='modern'?0x6a6448:0x3a4a2a,.6,.2),0,0,-.25,big?.05:.055,1.0);
  if(big){box(g,M.p,0,.02,-.2,.11,.12,.6);box(g,M.e,0,.08,-.2,.02,.01,.55);for(let i=0;i<4;i++)cyl(g,M.e,0,0,-.5-i*.08,.065,.015)}
  if(w.lock){box(g,M.p,-.09,.05,-.1,.12,.12,.18);box(g,M.g,-.09,.05,-.19,.09,.08,.01)}else box(g,M.m,0,.07,-.1,.02,.05,.04);
  box(g,M.p,0,-.08,0,.03,.1,.04);box(g,M.p,0,-.07,-.25,.03,.08,.04);muz=new T.Vector3(0,0,-.78);g.userData={muz,sightY:.075,len:1};return g}
 // receiver
 if(c=='pistol'){box(g,M.m,0,0,-.05,.035,.04,.2);box(g,M.p,0,-.07,.02,.033,.11,.045,-.25);bar=.04;muz=new T.Vector3(0,.005,-.16);top=.025}
 else{const rl=c=='smg'?.22:.3;box(g,fut?M.p:M.m,0,0,-.02,.055,.075,rl);
  if(c=='energy'||fut){box(g,M.m,0,.0,-.2,.06,.06,.18);box(g,M.e,.031,.0,-.12,.004,.02,.2);box(g,M.e,-.031,.0,-.12,.004,.02,.2)}
  else box(g,era.id=='ww2'||/ak47|m21/.test(w.id)?M.w:M.p,0,-.005,-.24,.05,.06,c=='lmg'?.26:.18);// handguard
  if(c=='shotgun')cyl(g,M.m,0,-.03,-.3,.012,.3);
  box(g,M.p,0,-.07,.06,.032,.1,.045,-.3);// pistol grip
  muz=new T.Vector3(0,.005,-.17-bar)}
 cyl(g,M.m,0,.005,-.16-bar/2,c=='lmg'?.015:c=='shotgun'?.017:.011,bar);
 // magazine
 const mv=A('mag');if(c!='shotgun'&&!(c=='sniper'&&era.id=='ww2')){const mm=fut?M.p:(era.id=='ww2'?M.m:M.p);
  if(mv=='drum'){cyl(g,mm,0,-.12,-.08,.08,.06,'x')}else if(c=='pistol'){}
  else{const ml=(mv=='ext'?1.6:1)*(c=='lmg'?.1:.14);const mg=box(g,mm,0,-.04-ml/2,-.08,.03,ml,.05,c=='smg'||era.id=='ww2'?0:.25);if(mv=='fast'){box(g,mm,.035,-.04-ml/2,-.08,.03,ml,.05,.25)}}}
 if(c=='lmg'&&mv!='drum')box(g,M.p,.05,-.06,-.07,.06,.09,.1);
 // stock
 const sv=A('stock');if(c!='pistol'){const sm2=era.id=='ww2'||/ak47|m21/.test(w.id)?M.w:M.p;
  if(sv=='light'){box(g,M.m,0,-.01,.25,.012,.012,.18);box(g,M.m,0,-.05,.25,.012,.012,.18);box(g,sm2,0,-.03,.34,.03,.09,.02)}
  else{box(g,sm2,0,-.025,.25,.045,.075,.22);if(sv=='heavy')box(g,M.r,0,-.03,.37,.05,.09,.03);box(g,sm2,0,-.06,.17,.04,.04,.1,.4)}}
 // optic
 const ov=A('optic');let sightY=top+.015;
 if(c!='pistol')box(g,M.m,0,top-.005,-.04,.02,.01,.18);
 if(ov=='none'){box(g,M.m,0,top+.015,.06,.02,.025,.01);box(g,M.m,0,top+.012,-.15-bar*.8,.006,.022,.006)}
 else if(ov=='peep'){cyl(g,M.m,0,top+.02,.07,.012,.004);sightY=top+.02}
 else if(ov=='reflex'){box(g,M.m,0,top+.01,-.04,.03,.015,.05);box(g,M.m,0,top+.035,-.06,.03,.035,.005);box(g,M.g,0,top+.035,-.058,.026,.03,.002);sightY=top+.035}
 else if(ov=='holo'){box(g,M.m,0,top+.015,-.04,.04,.025,.08);box(g,M.m,0,top+.045,-.075,.045,.04,.008);box(g,M.m,0,top+.045,-.005,.045,.04,.008);box(g,M.g,0,top+.045,-.04,.035,.03,.07);sightY=top+.045}
 else if(ov=='smart'){box(g,M.p,0,top+.03,-.04,.05,.045,.12);box(g,M.e,0,top+.03,.022,.04,.03,.004);sightY=top+.03}
 else{const ln=ov=='scope_l'?.3:.16,r=ov=='scope_l'?.022:.019;cyl(g,M.m,0,top+.04,-.05,r,ln);cyl(g,M.m,0,top+.04,-.05-ln/2,r*1.4,.05);cyl(g,M.m,0,top+.04,-.05+ln/2,r*1.25,.04);box(g,M.m,0,top+.02,-.05,.02,.03,.03);box(g,M.g,0,top+.04,-.05+ln/2+.021,r*2.2,r*2.2,.002);sightY=top+.04}
 // muzzle
 const zv=A('muzzle');const mz=muz.z;if(zv=='supp'){cyl(g,M.r,0,muz.y,mz-.08,.02,.16);muz.z-=.16}else if(zv=='comp'){cyl(g,M.m,0,muz.y,mz-.025,.018,.05);muz.z-=.05}else if(zv=='brake'){box(g,M.m,0,muz.y,mz-.03,.04,.028,.06);muz.z-=.06}else if(zv=='flash'){cyl(g,M.m,0,muz.y,mz-.03,.016,.06)}else if(zv=='bayonet'){box(g,sm(0xb8bcc0,.25,.95),0,muz.y-.02,mz-.1,.006,.025,.2)}
 // underbarrel + grip
 const uv=A('under'),gv=A('grip'),uz=-.2-bar*.25;
 if(uv=='gl'){cyl(g,M.m,0,-.06,uz,.025,.2);box(g,M.p,0,-.035,uz,.03,.02,.16)}else if(uv=='bipod'){box(g,M.m,.015,-.07,muz.z+.12,.008,.1,.008,.3);box(g,M.m,-.015,-.07,muz.z+.12,.008,.1,.008,-.3)}
 else if(uv=='laser'){box(g,M.p,.035,-.01,uz,.025,.025,.06);box(g,sm(0x30ff30,.3,0,{emissive:0x30ff30,emissiveIntensity:3}),.035,-.01,uz-.032,.008,.008,.004)}else if(uv=='light'){cyl(g,M.m,.035,-.005,uz,.016,.08);box(g,sm(0xffffe0,.2,0,{emissive:0xffffc0,emissiveIntensity:2}),.035,-.005,uz-.041,.02,.02,.002)}
 else if(uv=='sling'){box(g,sm(0x4a4030,.9),0,-.04,.05,.008,.06,.3)}
 if(uv!='gl'&&c!='pistol'){if(gv=='vgrip')box(g,M.p,0,-.08,uz+.05,.025,.1,.03);else if(gv=='agrip')box(g,M.p,0,-.055,uz+.05,.025,.04,.07,.5);}
 if(gv=='wrap')box(g,sm(0x202020,.95),0,-.075,.065,.036,.06,.05,-.3);
 g.userData={muz,sightY,len:L};g.traverse(o=>{if(o.isMesh)o.castShadow=false});return g}
// ---------- soldiers ----------
function buildSoldier(era,kind,uo){const u=uo||era.uni,g=new T.Group(),B=sm(u.body,.85),Pm=sm(u.pants,.85),H=sm(u.helm,.55,.2),S=sm(u.skin,.7),G=sm(u.gear,.8),Bt=sm(0x1a1a1a,.7);
 const rob=u.helmT=='robot';const legs=[],arms=[];
 for(const s of[-1,1]){const l=new T.Group();l.position.set(s*.12,.9,0);g.add(l);box(l,rob?G:Pm,0,-.42,0,.15,.84,.17);box(l,Bt,0,-.85,-.04,.15,.1,.25);legs.push(l)}
 box(g,rob?B:B,0,1.22,0,.42,.6,.24);box(g,G,0,1.15,-.13,.38,.3,.06);box(g,G,0,.93,0,.44,.06,.26);
 if(u.emit){box(g,sm(u.emit,.3,0,{emissive:u.emit,emissiveIntensity:2}),0,1.32,-.125,.3,.03,.01)}
 for(const s of[-1,1]){const a=new T.Group();a.position.set(s*.26,1.48,0);g.add(a);box(a,B,0,-.25,-.08,.12,.5,.12,.6);arms.push(a)}
 const head=new T.Group();head.position.y=1.65;g.add(head);
 if(rob){box(head,H,0,0,0,.24,.22,.24);box(head,sm(u.emit,.3,0,{emissive:u.emit,emissiveIntensity:3}),0,0,-.125,.18,.04,.01)}
 else{sph(head,S,0,0,0,.2,.24,.22);
  if(u.helmT=='stahl'){const h=new T.Mesh(new T.SphereGeometry(.15,14,8,0,6.283,0,1.7),H);h.scale.set(1,.95,1.08);h.position.y=.02;h.castShadow=true;head.add(h);cyl(head,H,0,-.06,.02,.17,.04,'y',.2)}
  else if(u.helmT=='ssh'){const h=new T.Mesh(new T.SphereGeometry(.14,14,8,0,6.283,0,1.6),H);h.position.y=.03;h.castShadow=true;head.add(h);cyl(head,H,0,-.03,0,.145,.03,'y',.155)}
  else if(u.helmT=='mod'){const h=new T.Mesh(new T.SphereGeometry(.14,14,8,0,6.283,0,1.4),H);h.position.y=.03;h.castShadow=true;head.add(h);box(head,sm(0x111111,.3),0,.08,-.12,.06,.04,.04)}
  else if(u.helmT=='visor'){sph(head,H,0,.02,0,.27,.28,.29);box(head,sm(u.emit,.2,.3,{emissive:u.emit,emissiveIntensity:2.2}),0,0,-.13,.2,.06,.04)}}
 const gun=new T.Group();gun.position.set(.05,1.3,-.35);g.add(gun);box(gun,sm(0x181818,.4,.7),0,0,0,.06,.09,.7);box(gun,sm(era.id=='ww2'?0x6a4a2a:0x222222,.6),0,-.03,.32,.05,.08,.22);
 g.userData={legs,arms,head,gun};g.traverse(o=>{if(o.isMesh){o.castShadow=true}});return g}
// ---------- drones ----------
function buildDrone(era,kind,player){const g=new T.Group(),bm=sm(player?0x3a4a3a:(era.id=='future'?0x24262c:era.id=='space'?0xcfd3d8:0x2a2a2a),.5,.4),em=sm(player?0x30ff60:0xff3020,.3,0,{emissive:player?0x30ff60:0xff2010,emissiveIntensity:3});
 if(kind=='glider'){box(g,bm,0,0,0,.18,.12,.9);box(g,sm(0xc8c0a8,.8),0,.05,-.05,1.6,.02,.22);box(g,sm(0xc8c0a8,.8),0,.05,.4,.5,.02,.12);box(g,bm,0,.15,.42,.02,.2,.12);cyl(g,bm,0,0,-.5,.06,.05);return g}
 box(g,bm,0,0,0,.3,.1,.3);box(g,em,0,0,-.16,.08,.03,.02);const rot=[];for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1]]){box(g,bm,x*.18,0,z*.18,.3,.03,.04,0,x*z>0?.785:-.785);const r=cyl(g,sm(0x111111,.5,0,{transparent:true,opacity:.5}),x*.3,.05,z*.3,.14,.01,'y');rot.push(r)}
 if(kind=='fpv')box(g,sm(0x6a6a40,.7),0,-.1,0,.12,.12,.22);g.userData.rot=rot;return g}
// ---------- aircraft ----------
function buildAircraft(model,enemy,era){const g=new T.Group();const col=enemy?(era.id=='ww2'?0x707478:era.id=='cold'?0x8a9098:era.id=='space'?0xb0b4ba:0x5a5e66):(era.id=='ww2'?0x9aa0a4:era.id=='modern'?0x6c7076:era.id=='space'?0xe0e4ea:0x6a7258);
 const M=sm(col,.4,.6),D=sm(0x222428,.5,.5),Gl=sm(0x203040,.05,.8,{transparent:true,opacity:.7}),E=sm(0xffa040,.2,0,{emissive:0xff8030,emissiveIntensity:3});const rot=[];
 if(model=='prop'){cyl(g,M,0,0,0,.55,8.5);cyl(g,D,0,0,-4.4,.45,.4);const pr=new T.Group();pr.position.z=-4.7;g.add(pr);for(let i=0;i<4;i++)box(pr,D,0,0,0,.18,3.4,.05,0,0,i*Math.PI/4);rot.push(pr);
  box(g,M,0,-.15,-.6,11.3,.18,1.8);box(g,M,0,.1,3.8,4,.12,1);box(g,M,0,.9,3.9,.12,1.6,1.1);sph(g,Gl,0,.55,-.5,.7,.6,1.6);if(!enemy)box(g,D,0,-.6,.5,.5,.4,1.6)}
 else if(model=='jet'){cyl(g,M,0,0,0,.75,13,'z',.35);const n=new T.Mesh(CONEG,M);n.scale.set(1,2.6,1);n.rotation.x=-Math.PI/2;n.position.z=-7.7;g.add(n);
  const wing=new T.Shape();wing.moveTo(0,-2.5);wing.lineTo(5.5,1.5);wing.lineTo(5.5,2.6);wing.lineTo(0,2.8);const wg=new T.ExtrudeGeometry(wing,{depth:.15,bevelEnabled:false});wg.rotateX(Math.PI/2);
  for(const s of[1,-1]){const w=new T.Mesh(wg,M);w.scale.x=s;w.position.set(0,-.1,0);w.castShadow=true;g.add(w);box(g,M,s*1.2,1.1,5.5,.12,2,1.8,0,0,-s*.25);box(g,M,s*1.6,0,5.8,2.6,.1,1.2)}
  sph(g,Gl,0,.55,-3.4,.65,.55,2.2);cyl(g,D,0,0,6.6,.6,.4);const ab=cyl(g,E,0,0,6.85,.45,.05);rot.push(null)}
 else if(model=='heli'){sph(g,M,0,0,0,2.2,2.2,5);cyl(g,M,0,.4,5,.35,6,'z',.2);box(g,M,0,1.3,7.8,.12,1.8,1.2);sph(g,Gl,0,.3,-2,1.6,1.4,1.6);box(g,D,0,1.3,0,.3,.5,.3);
  const pr=new T.Group();pr.position.y=1.6;g.add(pr);for(let i=0;i<4;i++)box(pr,D,0,0,0,11,.05,.35,0,i*Math.PI/4);rot.push(pr);box(g,M,0,-.4,.3,4.2,.15,.6);
  for(const s of[-1,1]){cyl(g,D,s*2,-.5,.3,.25,1.5);box(g,D,s*.8,-1.4,0,.08,.08,3.6)}}
 else if(model=='vtol'){box(g,M,0,0,0,2.2,1.4,7);box(g,M,0,.1,-4,1.6,1,1.6);sph(g,Gl,0,.5,-4.2,1,.6,1.2);box(g,M,0,.2,1,8,.2,1.6);for(const s of[-1,1]){cyl(g,D,s*4.2,.2,1,.9,.6,'y');box(g,E,s*4.2,-.1,1,1.2,.05,1.2)}box(g,M,0,1,3.4,.15,1.6,1.2)}
 else if(model=='star'){box(g,M,0,0,0,1.6,.8,8);const n=new T.Mesh(CONEG,M);n.scale.set(1.6,3,.8);n.rotation.x=-Math.PI/2;n.position.z=-5.4;g.add(n);sph(g,Gl,0,.45,-2.4,.6,.45,1.6);
  for(const s of[-1,1]){box(g,M,s*3,0,1.5,4.5,.15,2.8,0,0,s*.08);box(g,D,s*5.2,0,1,.4,.4,3);box(g,E,s*5.2,0,2.55,.3,.3,.05)}box(g,E,0,0,4.05,1,.5,.05)}
 if(model=='bomber'){g.clear();cyl(g,M,0,0,0,1.3,22);sph(g,Gl,0,.3,-11,1.3,1.3,1.6);box(g,M,0,0,-1,34,.35,4);box(g,M,0,.2,10,10,.2,2);box(g,M,0,2,10.4,.25,3.6,2.4);for(const x of[-11,-5,5,11]){cyl(g,D,x,-.3,-2.5,.6,3);const pr=new T.Group();pr.position.set(x,-.3,-4.1);g.add(pr);for(let i=0;i<3;i++)box(pr,D,0,0,0,.25,3.6,.06,0,0,i*Math.PI/3*2);rot.push(pr)}}
 g.userData.rot=rot;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
// ---------- ground vehicles / bosses ----------
function buildTank(era,kind){const g=new T.Group();const col={ww2:0x5e6266,cold:0x4e5838,modern:0x8a7c5a}[era.id]||0x555a60;const M=pbr('metal',1,{color:col,metalness:.2}),D=sm(0x1e1e1e,.9),Tr=sm(0x2a2a2a,.95,.3);
 const L=kind=='ifv'?6.5:7,Wd=kind=='ifv'?3.2:3.6;box(g,M,0,1.1,0,Wd*.86,1.1,L);box(g,M,0,1.5,-L*.42,Wd*.86,.5,.8,.5);
 for(const s of[-1,1]){box(g,Tr,s*Wd/2,.6,0,.6,1.1,L*1.02);for(let i=0;i<6;i++)cyl(g,D,s*Wd/2,.45,-L*.4+i*L*.16,.42,.62,'x');}
 const tur=new T.Group();tur.position.set(0,1.75,kind=='ifv'?-.3:.4);g.add(tur);
 if(kind=='ifv'){box(tur,M,0,.35,0,2.2,.75,2.6);const gun=new T.Group();gun.position.set(.3,.4,-1.3);tur.add(gun);cyl(gun,D,0,0,-1.1,.07,2.2);box(tur,M,-1.25,.45,0,.5,.45,1.2);box(tur,M,0,.85,.5,.5,.3,.5);tur.userData.gun=gun;box(g,M,0,1.9,2.4,2.4,.6,1.4)}
 else{const tg=new T.Mesh(SPHG,M);tg.scale.set(3,1,3.4);tg.position.y=.45;tg.castShadow=true;tur.add(tg);const gun=new T.Group();gun.position.set(0,.5,-1.5);tur.add(gun);cyl(gun,M,0,0,-2.6,.13,5.2);cyl(gun,M,0,0,-5.3,.17,.5);box(tur,M,.5,.95,.4,.6,.3,.6);tur.userData.gun=gun}
 g.userData.tur=tur;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g}
function buildMech(era){const g=new T.Group(),M=pbr('panel',1,{color:era.id=='space'?0xd8dce2:0x50545c}),D=sm(0x222428,.5,.6),E=sm(era.id=='space'?0xff3020:0xff3040,.2,0,{emissive:era.id=='space'?0xff2010:0xff2030,emissiveIntensity:3});const legs=[];
 for(const s of[-1,1]){const l=new T.Group();l.position.set(s*1.6,5,0);g.add(l);box(l,M,0,-1.4,0,.9,2.8,1.1);box(l,D,0,-3,-.2,.7,.6,.7);box(l,M,0,-4.2,.3,.8,2.4,.9,-.3);box(l,D,0,-5,-.3,1.4,.4,2);legs.push(l)}
 const body=new T.Group();body.position.y=5.5;g.add(body);box(body,M,0,.6,0,3.6,2,3);box(body,D,0,.4,-1.55,2.2,.6,.2);box(body,E,0,.45,-1.66,1.8,.2,.05);
 for(const s of[-1,1]){box(body,M,s*2.3,.6,-.4,.9,1.1,2.6);cyl(body,D,s*2.3,.6,-2.2,.18,1.4);for(let i=0;i<4;i++)cyl(body,D,s*2.3+(i%2-.5)*.4,1.4,-.8+(i>>1)*.5,.12,.4,'y')}
 g.userData={legs,body};g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function buildMother(era){const g=new T.Group(),M=pbr('panel',2,{color:0x9aa0a8}),D=sm(0x1a1c20,.5,.7),E=sm(0xff3020,.2,0,{emissive:0xff2010,emissiveIntensity:4});
 box(g,M,0,0,0,10,4,34);box(g,M,0,2.5,6,6,3,10);box(g,M,0,-.8,-18,6,2,6);for(const s of[-1,1]){box(g,M,s*8,0,4,8,1,12);box(g,D,s*12,0,10,2.5,2.5,6)}
 const core=sph(g,E,0,-2.6,0,3.6,3.6,3.6);g.userData.core=core;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
// ---------- objective targets ----------
function buildTarget(t,era){const g=new T.Group(),M=pbr('metal',1,{color:era.id=='modern'?0x8a7c5a:era.id=='cold'?0x4e5838:0x606468}),D=sm(0x202020,.6,.5),E=sm(0xff4020,.2,0,{emissive:0xff3010,emissiveIntensity:3}),C=sm(0x30d0ff,.2,0,{emissive:0x20b0ff,emissiveIntensity:3});
 if(t=='flak'||t=='arty'){box(g,M,0,.4,0,2.4,.4,2.4);const h=new T.Group();h.position.y=.8;g.add(h);box(h,M,0,.5,0,1.2,1,1.2);const b=cyl(h,D,0,1.3,-1.6,.12,t=='arty'?4.5:3.5);b.rotation.x=Math.PI/2-.5;box(h,M,0,.9,-.6,1.8,1.2,.1)}
 else if(t=='sam'){box(g,M,0,.6,0,2.6,1.2,5);for(const s of[-1,1])cyl(g,sm(0xd0d0c8,.5),s*.5,2.2,0,.25,4.6).rotation.x=Math.PI/2-.6}
 else if(t=='radar'){box(g,M,0,1,0,2.4,2,4.5);const d=new T.Group();d.position.y=2.6;g.add(d);box(d,D,0,0,0,.2,1,.2);box(d,M,0,1,0,3.4,1.6,.15);g.userData.spin=d}
 else if(t=='tower'){for(let i=0;i<4;i++)box(g,D,0,1+i*2,0,.25,2,.25);box(g,M,0,.4,0,1.6,.8,1.6);box(g,M,0,8.4,0,1.4,.3,.2);box(g,E,0,8.8,0,.25,.25,.25)}
 else if(t=='hub'){cyl(g,M,0,1,0,1.6,2,'y');cyl(g,C,0,2.2,0,1.2,.4,'y');for(let i=0;i<3;i++)box(g,D,Math.cos(i*2.1)*1.6,1,Math.sin(i*2.1)*1.6,.4,2,.4)}
 else if(t=='pylon'){box(g,M,0,3,0,1,6,1);box(g,C,0,6.4,0,.6,.8,.6);box(g,M,0,.3,0,2.4,.6,2.4)}
 else if(t=='relay'||t=='node'){cyl(g,M,0,t=='node'?1.2:4,0,.3,t=='node'?2.4:8,'y');sph(g,E,0,t=='node'?2.8:8.4,0,.9,.9,.9);box(g,M,0,.3,0,2,.6,2)}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g}
