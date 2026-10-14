'use strict';
// ===== world building: terrain, sky, lights, props, colliders =====
const WORLD={boxes:[],root:null,H:()=>0,bound:145,start:new T.Vector3(0,0,112),spots:[]};
function makeH(era,seed,water){const a=era.amp,sp=era.id=='space',cr=[];const r=mulberry(seed);if(sp)for(let i=0;i<26;i++)cr.push([r()*300-150,r()*300-150,6+r()*18]);
 return(x,z)=>{let h=a*(Math.sin(x*.021+1.3)*Math.cos(z*.017)+.5*Math.sin(x*.052+z*.041)+.25*Math.cos(x*.11-z*.09));
  const d=Math.max(Math.abs(x),Math.abs(z));if(d>135){const q=d-135;h+=Math.min(q*q*.02,q*.45)*(.65+.35*Math.sin(x*.013+z*.017))}
  if(sp)for(const[cx,cz,R]of cr){const q=Math.hypot(x-cx,z-cz)/R;if(q<1.25)h+=q<1?-(1-q*q)*R*.18:Math.sin((q-1)*12.5)*R*.05}
  const sd=Math.hypot(x-WORLD.start.x,z-WORLD.start.z);if(sd<20)h*=.4+.6*sd/20;if(water&&x<-90)h=Math.min(h,-(x+90)*-.35-0)-Math.min(8,(-90-x)*.4);return h}}
const sRGB=a=>new T.Color().setRGB(a[0]/255,a[1]/255,a[2]/255,T.SRGBColorSpace);
function envTex(top,bot,gnd,sunDir,sunCol){const W=256,H=128,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,H);const f=a=>`rgb(${a.map(v=>v|0)})`;gr.addColorStop(0,f(top));gr.addColorStop(.48,f(bot));gr.addColorStop(.52,f(gnd.map(v=>v*.7)));gr.addColorStop(1,f(gnd.map(v=>v*.4)));g.fillStyle=gr;g.fillRect(0,0,W,H);
 const u=(Math.atan2(sunDir.x,-sunDir.z)/(2*Math.PI)+.5)*W,v=(.5-Math.asin(sunDir.y)/Math.PI)*H;const sg=g.createRadialGradient(u,v,0,u,v,26);sg.addColorStop(0,`rgba(255,250,235,1)`);sg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);g.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<8;i++)g.fillRect(i*32+6,H*.42,18,H*.08);
 const t=new T.CanvasTexture(c);t.mapping=303;t.colorSpace=T.SRGBColorSpace;return t}
function skyMat(top,bot,sunDir,sunCol,space){return new T.ShaderMaterial({side:1,depthWrite:false,fog:false,uniforms:{uT:{value:sRGB(top)},uB:{value:sRGB(bot)},uS:{value:sunDir.clone()},uC:{value:new T.Color(...sunCol)},uSp:{value:space?1:0}},
 vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}',
 fragmentShader:`uniform vec3 uT,uB,uC,uS;uniform float uSp;varying vec3 vD;float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
 void main(){vec3 d=normalize(vD);float y=max(d.y,0.);vec3 c=mix(uB,uT,pow(y,.55));if(d.y<0.)c=uB*.85;float s=max(dot(d,normalize(uS)),0.);c+=uC*(pow(s,600.)*30.+pow(s,24.)*.5+pow(s,4.)*.12*(1.-uSp));
 if(uSp>.5){vec3 q=floor(d*420.);float st=step(.9975,h(q));c+=vec3(st)*(.6+h(q+1.)*1.4);c+=vec3(.25,.2,.4)*pow(max(1.-abs(d.y-d.x*.4),0.),12.)*.25;}
 gl_FragColor=vec4(c,1.);}`})}
function addBox(x,z,w,d,h,mat,y0,par){const H=WORLD.H(x,z);const b={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:(y0!=null?y0:H-.5),y1:(y0!=null?y0:H)+h};WORLD.boxes.push(b);
 if(mat){const m=new T.Mesh(BOXG,mat);m.position.set(x,(b.y0+b.y1)/2,z);m.scale.set(w,b.y1-b.y0,d);m.castShadow=m.receiveShadow=true;(par||WORLD.root).add(m);b.mesh=m}return b}
function instanced(geo,mat,list,shadow=true){if(!list.length)return;const im=new T.InstancedMesh(geo,mat,list.length);const o=new T.Object3D();list.forEach((t,i)=>{o.position.set(t[0],t[1],t[2]);o.scale.set(t[3],t[4],t[5]);o.rotation.set(0,t[6]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.castShadow=shadow;im.receiveShadow=true;WORLD.root.add(im);return im}
function buildWorld(scene,era,mis,mi){if(WORLD.root){scene.remove(WORLD.root);WORLD.root.traverse(o=>{if(o.geometry&&o.geometry!==BOXG&&o.geometry!==CYLG&&o.geometry!==SPHG&&o.geometry!==CONEG)o.geometry.dispose()})}
 const root=WORLD.root=new T.Group();scene.add(root);WORLD.boxes=[];WORLD.spots=[];const seed=(ERAS.indexOf(era)+1)*100+mi*7+3,r=mulberry(seed);WORLD.H=makeH(era,seed,mis.water);const H=WORLD.H,sp=era.id=='space';
 // lighting
 const tm=mis.time;const sunDir=tm=='dusk'?new T.Vector3(-.8,.22,-.5):tm=='night'?new T.Vector3(.4,.6,-.5):tm=='space'?new T.Vector3(-.6,.45,-.4):new T.Vector3(-.45,.75,-.35);sunDir.normalize();
 const sunCol=tm=='dusk'?[1,.62,.38]:tm=='night'?[.55,.65,.9]:era.sun;let sky=era.sky,fog=era.fog;if(tm=='dusk'){sky=[[70,80,120],[235,150,100]];fog=[190,140,115]}if(tm=='night'){sky=[[8,12,26],[30,38,60]];fog=[22,28,42]}
 const skyM=new T.Mesh(new T.SphereGeometry(900,32,16),skyMat(sky[0],sky[1],sunDir,sunCol,sp));skyM.renderOrder=-1;skyM.frustumCulled=false;root.add(skyM);WORLD.sky=skyM;
 scene.fog=new T.Fog(sRGB(fog),sp?120:tm=='night'?25:40,sp?700:tm=='night'?220:tm=='dusk'?300:360);
 /* env maps via PMREM produced NaNs on some GPUs (SwiftShader) - use lights only */
 const hemi=new T.HemisphereLight(sRGB(era.hemi[0]),sRGB(era.hemi[1]),tm=='night'?.7:sp?.8:1.7);root.add(hemi);
 const sun=new T.DirectionalLight(new T.Color(...sunCol),tm=='night'?.9:tm=='dusk'?2.2:era.sunI);sun.castShadow=true;sun.shadow.camera.left=sun.shadow.camera.bottom=-45;sun.shadow.camera.right=sun.shadow.camera.top=45;sun.shadow.camera.far=300;sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
 sun.shadow.mapSize.set(QUAL.shadow,QUAL.shadow);root.add(sun);root.add(sun.target);WORLD.sun=sun;WORLD.sunDir=sunDir;
 if(sp){const earth=new T.Mesh(new T.SphereGeometry(60,32,20),new T.MeshStandardMaterial({color:0x3a6ab0,roughness:.6,emissive:0x0a1a40,fog:false}));earth.position.set(300,330,-650);root.add(earth)}
 // terrain
 const tg=new T.PlaneGeometry(900,900,180,180);tg.rotateX(-Math.PI/2);const P=tg.attributes.position;for(let i=0;i<P.count;i++)P.setY(i,H(P.getX(i),P.getZ(i)));tg.computeVertexNormals();
 const uv=tg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*150,uv.getY(i)*150);
 const gm=pbr(era.ground,1,{color:0xffffff});gm.map.repeat.set(1,1);[gm.map,gm.normalMap,gm.roughnessMap].forEach(t=>t&&t.repeat.set(1,1));
 const ter=new T.Mesh(tg,gm);ter.receiveShadow=true;root.add(ter);
 if(mis.water){const wm=new T.Mesh(new T.PlaneGeometry(260,900),new T.MeshStandardMaterial({color:0x1d4a63,roughness:.08,metalness:.1,transparent:true,opacity:.88}));wm.rotation.x=-Math.PI/2;wm.position.set(-220,-1.2,0);root.add(wm);WORLD.water=wm}
 // grass/detail scatter
 const occ=[];const free=(x,z,rad)=>{if(Math.hypot(x-WORLD.start.x,z-WORLD.start.z)<16+rad)return false;for(const o of occ)if(Math.hypot(x-o[0],z-o[1])<o[2]+rad)return false;return true};
 const place=(rad,minZ=-140,maxZ=95)=>{for(let k=0;k<60;k++){const x=r()*270-135;if(mis.water&&x<-85)continue;const z=minZ+r()*(maxZ-minZ);if(free(x,z,rad)){occ.push([x,z,rad]);return[x,z]}}return null};
 // objective spots first (spread in north half)
 for(let i=0;i<6;i++){const s=place(8,-120,40);if(s)WORLD.spots.push(s)}
 const pr=era.prop;const wallM=pbr(pr=='farm'?'plaster':pr=='forest'?'wood':pr=='town'?'plaster':pr=='city'?'concrete':'panel',2,{color:pr=='town'?0xe8dcc0:0xffffff}),roofM=pbr(pr=='farm'?'brick':pr=='city'||pr=='moon'?'metal':'wood',2,{color:pr=='farm'?0x9a5a48:0xffffff});
 const nB=pr=='city'?16:pr=='moon'?10:pr=='town'?18:9;
 for(let i=0;i<nB;i++){const w=6+r()*8,d=6+r()*8,h=pr=='city'?10+r()*26:pr=='moon'?3.5+r()*3:4+r()*4;const s=place(Math.max(w,d)*.75);if(!s)continue;const[x,z]=s;const b=addBox(x,z,w,d,h,wallM);
  if(pr=='farm'||pr=='forest'){const rf=new T.Mesh(new T.ConeGeometry(Math.hypot(w,d)/2*1.05,3,4),roofM);rf.rotation.y=Math.PI/4;rf.scale.set(w/Math.hypot(w,d)*1.41,1,d/Math.hypot(w,d)*1.41);rf.position.set(x,b.y1+1.5,z);rf.castShadow=true;root.add(rf)}
  else if(pr=='town'){box(root,wallM,x,b.y1+.3,z,w+.3,.6,d+.3);for(let k=0;k<3;k++)box(root,sm(0x1a1a1a,.3,.2),x-w/2-.01,b.y0+2+k*1.0*(h>6?2:1),z-d/4+k*d/4,.05,1.1,.8)}
  else if(pr=='city'){const em=sm(0x30e0ff,.3,0,{emissive:era.id=='future'?0x20d0ff:0xffc060,emissiveIntensity:2});for(let k=1;k<h/4;k++)box(root,em,x,b.y0+k*4,z-d/2-.02,w*.9,.15,.05);box(root,sm(0xff3040,.3,0,{emissive:0xff2030,emissiveIntensity:3}),x,b.y1+.3,z,.4,.6,.4)}
  else if(pr=='moon'){cyl(root,wallM,x,b.y1,z,Math.min(w,d)*.45,1,'y');box(root,sm(0xffe0a0,.3,0,{emissive:0xffd080,emissiveIntensity:2}),x-w/2-.02,b.y0+2,z,.05,.6,d*.6)}}
 // cover props
 const crateM=pbr(pr=='city'||pr=='moon'?'metal':'wood',1,{color:pr=='modern'?0xb0a080:0xffffff}),sandM=pbr('sand',1,{color:pr=='moon'?0x9a9a98:0xc8b890});
 for(let i=0;i<40;i++){const s=place(2.2);if(!s)continue;const[x,z]=s;const k=r();
  if(k<.4)addBox(x,z,1.4,1.4,1.4,crateM);else if(k<.75){const horiz=r()<.5;addBox(x,z,horiz?4:1,horiz?1:4,1.1,sandM)}else{addBox(x,z,.6,6,1.6+r()*1.4,pbr(pr=='farm'||pr=='forest'?'plaster':'concrete',1,{color:0xb8b0a0}))}}
 // vehicles wrecks
 const wreckM=pbr('rust',1);for(let i=0;i<6;i++){const s=place(3);if(!s)continue;addBox(s[0],s[1],2,4.4,1.5,wreckM);}
 // trees/rocks
 const trunks=[],leaves=[],rocks=[];const nT=pr=='forest'?160:pr=='farm'?90:pr=='town'?20:0;
 for(let i=0;i<nT;i++){const s=place(1.2,-150,150);if(!s)continue;const[x,z]=s,y=H(x,z),h=pr=='forest'?7+r()*6:5+r()*4;trunks.push([x,y+h/4,z,.35,h/2,.35]);leaves.push([x,y+h*.6,z,h*.45,h*.85,h*.45,r()*6]);WORLD.boxes.push({x0:x-.25,x1:x+.25,z0:z-.25,z1:z+.25,y0:y-1,y1:y+h})}
 instanced(CYLG,sm(0x4a3828,.9),trunks);instanced(pr=='town'?new T.SphereGeometry(.5,8,6):new T.ConeGeometry(.5,1,8),pbr('grass',1,{color:pr=='forest'?0x7a9a8a:0x88aa66}),leaves);
 const nR=pr=='moon'?90:40;for(let i=0;i<nR;i++){const x=r()*300-150,z=r()*300-150;if(Math.hypot(x-WORLD.start.x,z-WORLD.start.z)<14)continue;const s=.4+r()*(pr=='moon'?2.2:1.2);rocks.push([x,H(x,z)+s*.2,z,s*1.4,s,s*1.2,r()*6]);if(s>1)WORLD.boxes.push({x0:x-s*.6,x1:x+s*.6,z0:z-s*.5,z1:z+s*.5,y0:H(x,z)-1,y1:H(x,z)+s*.6})}
 const rg=new T.SphereGeometry(.6,6,4);instanced(rg,pbr(era.ground=='snow'?'concrete':pr=='moon'?'regolith':'concrete',1,{color:0x9a9890,flatShading:true}),rocks);
 // grass tufts
 if(era.ground=='grass'||pr=='forest'){const gr=[];for(let i=0;i<900;i++){const x=r()*260-130,z=r()*260-130;gr.push([x,H(x,z)+.15,z,.4+r()*.4,.3+r()*.3,.4+r()*.4,r()*6])}instanced(new T.ConeGeometry(.5,1,4),sm(pr=='forest'?0x6a7a5a:0x5a7a34,.95),gr,false)}
 // perimeter fence/boundary markers
 if(mis.station){const mm=pbr('panel',2,{color:0xd0d4da});for(const[x,z,w,d]of[[-40,-60,30,12],[40,-60,30,12],[0,-90,12,40],[-60,20,12,30],[60,20,12,30]]){addBox(x,z,w,d,8,mm);cyl(root,mm,x,H(x,z)+8,z,Math.min(w,d)*.5,Math.max(w,d),w>d?'x':'z')}
  for(let i=0;i<10;i++){const x=-80+i*18,z=-30;const y=H(x,z);box(root,pbr('metal',1,{color:0x203060}),x,y+2.5,z,6,.1,3,.5);box(root,sm(0x888888,.5,.8),x,y+1.2,z,.2,2.4,.2)}}
 // lights at night
 WORLD.lamps=[];if(tm=='night'||tm=='dusk'){for(let i=0;i<4;i++){const s=WORLD.spots[i]||[0,0];const l=new T.PointLight(0xffb060,tm=='night'?40:15,40,1.5);l.position.set(s[0]+4,H(s[0],s[1])+6,s[1]+4);root.add(l);sph(root,sm(0xffd090,.3,0,{emissive:0xffc070,emissiveIntensity:4}),l.position.x,l.position.y,l.position.z,.4,.4,.4)}}
 return root}
function groundAt(x,z,y){let g=WORLD.H(x,z);if(y!=null)for(const b of WORLD.boxes)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&b.y1<=y+.5&&b.y1>g)g=b.y1;return g}
function pushOut(p,r,h){for(const b of WORLD.boxes){if(p.y+h<b.y0||p.y>b.y1-.5)continue;const cx=Math.max(b.x0,Math.min(p.x,b.x1)),cz=Math.max(b.z0,Math.min(p.z,b.z1));let dx=p.x-cx,dz=p.z-cz;const d2=dx*dx+dz*dz;
 if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r}else{const o=[[p.x-b.x0+r,-1,0],[b.x1-p.x+r,1,0],[p.z-b.z0+r,0,-1],[b.z1-p.z+r,0,1]].sort((a,c)=>a[0]-c[0])[0];p.x+=o[1]*o[0];p.z+=o[2]*o[0]}}}
 const B=WORLD.bound+3;p.x=Math.max(-B,Math.min(B,p.x));p.z=Math.max(-B,Math.min(B,p.z))}
// ray vs world boxes + terrain; returns distance or Infinity
function rayWorld(o,d,maxD){let best=maxD;for(const b of WORLD.boxes){if(o.x>b.x0&&o.x<b.x1&&o.z>b.z0&&o.z<b.z1&&o.y>b.y0&&o.y<b.y1)continue;let t0=0,t1=best;for(const[a,lo,hi]of[['x','x0','x1'],['y','y0','y1'],['z','z0','z1']]){const inv=1/(d[a]||1e-9);let ta=(b[lo]-o[a])*inv,tb=(b[hi]-o[a])*inv;if(ta>tb){const q=ta;ta=tb;tb=q}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)break}if(t0<=t1&&t0<best)best=t0}
 const st=2;for(let t=st;t<best;t+=st){const x=o.x+d.x*t,z=o.z+d.z*t,y=o.y+d.y*t;if(y<WORLD.H(x,z)){let a=t-st,b=t;for(let k=0;k<6;k++){const m=(a+b)/2;if(o.y+d.y*m<WORLD.H(o.x+d.x*m,o.z+d.z*m))b=m;else a=m}return b}}return best}
