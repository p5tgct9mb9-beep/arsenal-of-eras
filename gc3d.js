'use strict';
// ---- GameCube style: live three.js 2.5D renderer. Gameplay/hitboxes untouched: every sprite the 2D draw code emits is captured
// (with its exact transform) and replaced by a 3D model placed on the z=0 gameplay plane. Models are generated from each sprite's
// procedural design: side-profile parts are extruded to real widths with bevels, wheels/tracks/limbs/rotors/props become true 3D
// primitives, and the hi-res paint is projected on as texture. Terrain, crates and bridges are real geometry; skies are skybox layers.
const GC3D=(()=>{const T3=window.THREE,U=1/16,R={lastT:-1,canvas:null,ok:false,info:{}};const X3=STYLE=='x360';if((STYLE!='gc'&&!X3)||!T3)return R;
 const MOB=/iPhone|iPad|iPod|Android/.test(navigator.userAgent)||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);const QP=/[?&]q=([012])/.exec(location.search);let TIER=X3?(QP?+QP[1]:MOB?1:2):0;const SIZES=[[854,480],[960,540],[1280,720]];let GW=X3?SIZES[TIER][0]:854,GH=X3?SIZES[TIER][1]:480;const YAW=-.3;let ren,scene,cam,hemi,sun,thumbR,thumbCam,thumbScene;const CAP={on:0,list:[],mode:''};const KMAP=new Map(),MODEL={},SRC={};
 try{const cv=document.createElement('canvas');ren=new T3.WebGLRenderer({canvas:cv,antialias:!X3,powerPreference:'high-performance'});ren.setPixelRatio(1);ren.setSize(GW,GH,false);ren.outputColorSpace=T3.SRGBColorSpace;R.canvas=cv;R.ok=true;if(X3){ren.shadowMap.enabled=true;ren.shadowMap.type=T3.PCFSoftShadowMap;ren.toneMapping=T3.NoToneMapping}
  const tc=document.createElement('canvas');thumbR=new T3.WebGLRenderer({canvas:tc,antialias:true,alpha:true,preserveDrawingBuffer:true});thumbR.setPixelRatio(1);thumbR.outputColorSpace=T3.SRGBColorSpace;thumbR.setClearColor(0,0);if(X3){thumbR.toneMapping=T3.ACESFilmicToneMapping;thumbR.toneMappingExposure=1.15}}catch(e){return R}
 scene=new T3.Scene();const d=11.25/Math.tan(15*Math.PI/180);cam=new T3.PerspectiveCamera(30,16/9,2,700);const LIFT=5.5;cam.position.set(20,11.25+LIFT,d);cam.setViewOffset(854,480,0,LIFT/22.5*480,854,480);
 hemi=new T3.HemisphereLight(0xe8f0ff,0x6a5a48,1.55);sun=new T3.DirectionalLight(0xfff0d8,2.1);sun.position.set(-30,60,50);const fill=new T3.DirectionalLight(0x9ab4ff,.5);fill.position.set(40,10,30);scene.add(hemi,sun,fill);
 thumbScene=new T3.Scene();thumbScene.add(hemi.clone(),sun.clone(),fill.clone());
 if(X3){hemi.intensity=.8;hemi.color.setHex(0xcfdcff);hemi.groundColor.setHex(0x5a4a38);sun.intensity=3.3;sun.color.setHex(0xffe0b4);fill.intensity=.3;sun.castShadow=true;const S2=TIER>=1?1024:512;sun.shadow.mapSize.set(S2,S2);const sc=sun.shadow.camera;sc.left=-34;sc.right=34;sc.top=24;sc.bottom=-24;sc.near=1;sc.far=220;sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;sun.target.position.set(20,8,0);sun.position.set(-8,60,48);scene.add(sun.target)}thumbCam=new T3.OrthographicCamera(0,1,0,-1,-2000,2000);thumbCam.position.set(0,0,500);
 // ---------- textures / materials ----------
 const texOf=c=>{if(c.__t3)return c.__t3;const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;t.anisotropy=4;t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;c.__t3=t;return t};
 const noiseTex=(a,b,sc=.08,n=128)=>{const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),id=g.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=(Math.sin(x/n*6.283*3+fbm(x*sc,y*sc)*4)*.25+fbm(x*sc*2.3,y*sc*2.3)*.75),C=mix(a,b,v),i=(y*n+x)*4;id.data[i]=C[0];id.data[i+1]=C[1];id.data[i+2]=C[2];id.data[i+3]=255}
  g.putImageData(id,0,0);const t=texOf(c);t.wrapS=t.wrapT=T3.RepeatWrapping;return t};
 const blob=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return texOf(c)})();
 const blobMat=new T3.MeshBasicMaterial({map:blob,transparent:true,depthWrite:false});
 // ---------- X360 (BF4-on-360 look): PBR maps, terrain dressing, particles, post ----------
 const ntex=c=>{const t=new T3.CanvasTexture(c);t.anisotropy=4;t.wrapS=t.wrapT=T3.RepeatWrapping;return t};
 const hsh=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)};
 function normFrom(H,w,h,str){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),id=g.createImageData(w,h),D=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const l=H[y*w+Math.max(0,x-1)],r=H[y*w+Math.min(w-1,x+1)],u=H[Math.max(0,y-1)*w+x],d=H[Math.min(h-1,y+1)*w+x];let nx=(l-r)*str,ny=(u-d)*str,nz=1;const L=Math.hypot(nx,ny,nz);const i=(y*w+x)*4;D[i]=(nx/L*.5+.5)*255;D[i+1]=(ny/L*.5+.5)*255;D[i+2]=(nz/L*.5+.5)*255;D[i+3]=255}
  g.putImageData(id,0,0);return c}
 // albedo grade (muted mil palette, dirt toward the bottom, worn paint edges, scratches) + height->normal + roughness
 function pbrMaps(src,metal){const w=src.width,h=src.height;let d;try{d=src.getContext('2d').getImageData(0,0,w,h).data}catch(e){return null}
  const A=document.createElement('canvas'),Rg=document.createElement('canvas');A.width=Rg.width=w;A.height=Rg.height=h;const ga=A.getContext('2d'),gr=Rg.getContext('2d'),ia=ga.createImageData(w,h),ir=gr.createImageData(w,h),H=new Float32Array(w*h);
  const al=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let r=d[i],g=d[i+1],b=d[i+2];const a=d[i+3];const lum=(r*.3+g*.59+b*.11)/255,n=fbm(x*.09,y*.09),n2=fbm(x*.31+7,y*.31);
   const dirt=Math.max(0,Math.min(1,(y/h-.45)*2))*(.5+n*.7),scr=metal&&hsh(Math.floor(x/2+y*.6),Math.floor(y/7))>.988?1:0;
   const edge=metal&&a>0&&(al(x-2,y)==0||al(x+2,y)==0||al(x,y-2)==0||al(x,y+2)==0)&&n2>.45?1:0;
   const L=r*.3+g*.59+b*.11;r=r*.84+L*.16;g=g*.84+L*.16;b=b*.84+L*.16;const dk=.35*dirt;r=r*(1-dk)+92*dk;g=g*(1-dk)+80*dk;b=b*(1-dk)+64*dk;
   if(edge||scr){r=Math.min(255,r*.6+120);g=Math.min(255,g*.6+118);b=Math.min(255,b*.6+112)}const m=.9+n2*.18;
   ia.data[i]=Math.min(255,r*m);ia.data[i+1]=Math.min(255,g*m);ia.data[i+2]=Math.min(255,b*m);ia.data[i+3]=a;
   H[y*w+x]=lum*.7+n2*.3-scr*.4-(a<8?.6:0);const rough=Math.max(.08,Math.min(1,(metal?.5:.82)+n*.22+dirt*.25-(scr||edge?.35:0)));ir.data[i]=ir.data[i+1]=ir.data[i+2]=rough*255;ir.data[i+3]=255}
  ga.putImageData(ia,0,0);gr.putImageData(ir,0,0);return{a:A,r:Rg,n:normFrom(H,w,h,metal?2.2:1.6)}}
 const NCACHE=new Map();function normOfImg(img){if(NCACHE.has(img))return NCACHE.get(img);let t=null;try{const w=img.width,h=img.height,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,w,h).data,H=new Float32Array(w*h);
   for(let i=0;i<w*h;i++)H[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)/255;t=ntex(normFrom(H,w,h,2.5))}catch(e){}NCACHE.set(img,t);return t}
 function upMat(root){root.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!(m.isMeshLambertMaterial||m.isMeshPhongMaterial))return;const wat=m.isMeshPhongMaterial&&m.transparent;
   const n=new T3.MeshStandardMaterial({map:m.map,color:m.color,roughness:wat?.12:.88,metalness:wat?.15:m.isMeshPhongMaterial?.3:0,transparent:m.transparent,opacity:m.opacity,normalMap:m.map&&m.map.image?normOfImg(m.map.image):null});if(n.normalMap&&m.map){n.normalMap.repeat.copy(m.map.repeat);n.normalMap.wrapS=m.map.wrapS;n.normalMap.wrapT=m.map.wrapT}
   o.material=n;o.receiveShadow=true;o.castShadow=!wat})}
 function skyCanvas(top,bot){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),id=g.createImageData(512,256),D=id.data;
  for(let y=0;y<256;y++)for(let x=0;x<512;x++){const t=Math.min(1,y/128);let col=y<128?mix(top,bot,Math.pow(t,1.4)):mix(bot,mix(bot,[60,56,50],.5),(y-128)/128);
   if(y<124&&y>20){const cl=Math.max(0,fbm(x*.02,y*.05)*1.6-.75)*Math.sin((y-20)/104*Math.PI);col=mix(col,mix([250,246,238],bot,.25),Math.min(.85,cl))}const i=(y*512+x)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255}
  g.putImageData(id,0,0);return c}
 function folAtlas(th){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d'),base=mix([78,92,54],th.mid||[60,80,50],.25),dk=mix(base,[20,24,14],.35),lt=mix(base,[190,196,130],.3);
  g.fillStyle='#3a2c20';g.fillRect(60,70,8,58);for(let i=0;i<60;i++){const a=Math.random()*6.28,r=Math.random()*44,x=64+Math.cos(a)*r*.9,y=58+Math.sin(a)*r*.75;const C=mix(dk,lt,Math.random()*.8+(y<50?.2:0));g.fillStyle=`rgb(${C.map(v=>v|0)})`;g.beginPath();g.arc(x,y,7+Math.random()*9,0,6.283);g.fill()}
  for(let i=0;i<70;i++){const x=136+Math.random()*112,C=mix(dk,lt,Math.random());g.strokeStyle=`rgb(${C.map(v=>v|0)})`;g.lineWidth=2+Math.random()*2;g.beginPath();g.moveTo(x,128);g.quadraticCurveTo(x+(Math.random()-.5)*10,100,x+(Math.random()-.5)*26,62+Math.random()*40);g.stroke()}
  const t=texOf(c);return t}
 function quad(P,N,UVv,cx,by,cz,w,h,rot,u0,u1){const c=Math.cos(rot)*w/2,s=Math.sin(rot)*w/2,a=[cx-c,by,cz-s],b=[cx+c,by,cz+s],b2=[cx+c,by+h,cz+s],a2=[cx-c,by+h,cz-s];
  for(const[v,uv]of[[a,[u0,0]],[b,[u1,0]],[b2,[u1,1]],[a,[u0,0]],[b2,[u1,1]],[a2,[u0,1]]]){P.push(...v);N.push(0,1,0);UVv.push(...uv)}}
 function boxG(list,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const g=new T3.BoxGeometry(sx,sy,sz).toNonIndexed();if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x,y,z);list.push(g)}
 // backfield dressing: displaced ground, ruined buildings, rubble, foliage cards
 function dress(root,x0,x1,hf,th,zNear){let sd=1;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  const segX=Math.max(20,(x1-x0)/2|0),segZ=22,zF=-90,PG=new T3.PlaneGeometry(x1-x0,zNear-zF,segX,segZ);PG.rotateX(-Math.PI/2);PG.translate((x0+x1)/2,0,(zNear+zF)/2);const P=PG.attributes.position;
  for(let i=0;i<P.count;i++)P.setY(i,hf(P.getX(i),P.getZ(i)));PG.computeVertexNormals();const gt=noiseTex(th.top,mix(th.fill,[0,0,0],.15),.06);gt.repeat.set((x1-x0)/6,(zNear-zF)/6);
  const gm=new T3.MeshStandardMaterial({map:gt,roughness:.95,normalMap:normOfImg(gt.image)});gm.normalMap.repeat.copy(gt.repeat);const gmesh=new T3.Mesh(PG,gm);gmesh.receiveShadow=true;root.add(gmesh);
  const con=[],rub=[];for(let x=x0+6;x<x1;x+=12+rnd()*16){const z=-13-rnd()*20,y=hf(x,z),bw=3+rnd()*4,bh=3+rnd()*5,dp=2.5+rnd()*2;
   for(const[wx,wz,len,rot]of[[x,z+dp/2,bw,0],[x-bw/2,z,dp,Math.PI/2],[x+bw/2,z,dp,Math.PI/2]]){const fl=Math.ceil(bh/1.6);for(let f=0;f<fl;f++){const yy=y+f*1.6,brk=f==fl-1;const segs=brk?1+(rnd()*3|0):3;for(let k=0;k<segs;k++){const sl=len/3;if(!brk&&k==1&&f>0){boxG(con,wx+(rot?0:-sl+k*sl),yy+.25,wz+(rot?-sl+k*sl:0),rot?.3:sl,.5,rot?sl:.3,0,0,0);continue}
      boxG(con,wx+(rot?0:-sl+k*sl),yy+.8,wz+(rot?-sl+k*sl:0),rot?.3:sl*.98,1.6*(brk?.4+rnd()*.6:1),rot?sl*.98:.3)}}}
   for(let k=0;k<8;k++){const s2=.2+rnd()*.7;boxG(rub,x+(rnd()-.5)*bw*1.6,y+s2*.3,z+dp/2+.6+rnd()*2,s2,s2*.6,s2,rnd()*3,rnd()*3,rnd()*3)}}
  for(let x=x0;x<x1;x+=1.4){const z=zNear-1-rnd()*7,s2=.15+rnd()*.45;if(rnd()<.45)boxG(rub,x,hf(x,z)+s2*.2,z,s2,s2*.5,s2*1.2,rnd()*3,rnd()*3,rnd()*3)}
  const ct=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const v=fbm(x*.08,y*.08)*.7+hsh(x,y)*.3,C=mix([92,88,82],[168,162,150],v),i=(y*128+x)*4;id.data[i]=C[0];id.data[i+1]=C[1];id.data[i+2]=C[2];id.data[i+3]=255}g.putImageData(id,0,0);return texOf(c)})();const cm=new T3.MeshStandardMaterial({map:ct,roughness:.92,normalMap:normOfImg(ct.image)});
  for(const[L2,mt]of[[con,cm],[rub,cm]])if(L2.length){const m=new T3.Mesh(merge(L2),mt);m.castShadow=m.receiveShadow=true;root.add(m)}
  const FP=[],FN=[],FU=[];for(let x=x0;x<x1;x+=1.3){for(let k=0;k<2;k++){if(th.top[0]>th.top[1]+8&&rnd()<.5)continue;const z=zNear-2-rnd()*55,y=hf(x,z),tree=z<-14&&rnd()<(th.top[0]>th.top[1]+8?.06:.22),sz=tree?3+rnd()*4:.7+rnd()*1.3,r0=rnd()*3;
    for(const rr of[r0,r0+Math.PI/2])quad(FP,FN,FU,x,y-.1,z,sz*(tree?1:1.6),sz,rr,tree?0:.5,tree?.5:1)}}
  const fm=new T3.Mesh(geoOf(FP,FN,FU),new T3.MeshStandardMaterial({map:folAtlas(th),alphaTest:.5,side:T3.DoubleSide,roughness:.9}));fm.receiveShadow=true;root.add(fm)}
 let skyM=null;function setSkyX(top,bot){if(skyM)scene.remove(skyM);skyM=new T3.Mesh(new T3.SphereGeometry(450,32,16),new T3.MeshBasicMaterial({map:texOf(skyCanvas(top,bot)),side:T3.DoubleSide,fog:false,depthWrite:false}));skyM.position.set(20,0,0);skyM.renderOrder=-10;scene.add(skyM);
  scene.background=new T3.Color(`rgb(${bot.map(v=>v|0)})`);scene.fog=new T3.Fog(new T3.Color(`rgb(${mix(bot,[200,190,170],.2).map(v=>v|0)})`),38,230)}
 // particles: soft smoke/dust sprites, debris chunks, muzzle-flash point lights
 const FXP={sm:[],db:[],li:[]};let smTex=null;
 function smokeTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),id=g.createImageData(64,64);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-32,y-32)/32,a=Math.max(0,1-r)**1.6*(.55+fbm(x*.12,y*.12)*.6);const i=(y*64+x)*4;id.data[i]=id.data[i+1]=id.data[i+2]=255;id.data[i+3]=Math.min(255,a*255)}g.putImageData(id,0,0);return texOf(c)}
 function puff(wx,wy,z,s,col,life,vy,vx=0){if(!smTex)smTex=smokeTex();let p=FXP.sm.find(q=>q.l<=0);if(!p){if(FXP.sm.length>70)return;const sp=new T3.Sprite(new T3.SpriteMaterial({map:smTex,transparent:true,depthWrite:false}));scene.add(sp);p={sp,l:0};FXP.sm.push(p)}
  Object.assign(p,{wx,wy,z,s,l:life,L:life,vy,vx});p.sp.material.color.setRGB(col[0]/255,col[1]/255,col[2]/255);p.sp.material.rotation=Math.random()*6.28;p.sp.visible=true}
 const dbG=new T3.BoxGeometry(1,1,1),dbM=new T3.MeshStandardMaterial({color:0x3a3632,roughness:.9});
 function debris(wx,wy,s){for(let k=0;k<6*s&&k<10;k++){let p=FXP.db.find(q=>q.l<=0);if(!p){if(FXP.db.length>50)return;const m=new T3.Mesh(dbG,dbM);m.castShadow=true;scene.add(m);p={m,l:0};FXP.db.push(p)}
  const a=Math.random()*6.28,v=(.5+Math.random()*1.6)*s;Object.assign(p,{wx,wy,z:(Math.random()-.5)*3,vx:Math.cos(a)*v,vy:-Math.abs(Math.sin(a))*v*1.5-1,vz:(Math.random()-.5)*.3,l:50+Math.random()*30,r:Math.random()*.2});const q=.25+Math.random()*.35;p.m.scale.set(q,q*.7,q);p.m.visible=true}}
 function flashL(wx,wy,int,col=0xffb060){if(FXP.li.length<3){const l=new T3.PointLight(col,0,16,1.6);scene.add(l);FXP.li.push({l,t:0})}const p=FXP.li.reduce((a,b)=>a.t<=b.t?a:b);Object.assign(p,{wx,wy,t:int,I:int});p.l.color.setHex(col)}
 let lastDX=null;function stepFX(mode,cpx){const toX=wx=>(wx-cpx)*U;
  for(const p of parts){if(p.__x3)continue;p.__x3=1;const s=p.s||1;if(p.k=='boom'){for(let k=0;k<5+s*2;k++)puff(p.x+(Math.random()-.5)*20*s,p.y-Math.random()*10,(Math.random()-.5)*3,(2.2+Math.random()*1.5)*s,k<2?[90,80,70]:[70,68,64],90+Math.random()*60,-.18-Math.random()*.15,(Math.random()-.5)*.2);debris(p.x,p.y,s);flashL(p.x,p.y-10,90*s,0xff9a40)}
   else if(p.k=='flash'){flashL(p.x,p.y,35*s)}else if(p.k=='fire'&&Math.random()<.04)puff(p.x,p.y-6,0,1,[110,106,100],50,-.3)}
  if(mode=='drive'&&TF.md&&TF.md.T){const D=TF.md;if(lastDX!=null&&Math.abs(D.x-lastDX)>.6&&TF.t%3==0)puff(D.x-50*(D.x>lastDX?1:-1),D.T.gy(D.x)-4,1.5+Math.random()*1.5,1.4+Math.random()*.8,[176,156,124],70,-.08,-.05*(D.x-lastDX));lastDX=D.x}else lastDX=null;
  for(const p of FXP.sm){if(p.l<=0){p.sp.visible=false;continue}p.l--;const f=1-p.l/p.L;p.wy+=p.vy;p.wx+=p.vx;p.sp.position.set(toX(p.wx),(360-p.wy)*U,p.z);const sc=p.s*(1+f*1.8);p.sp.scale.set(sc,sc,1);p.sp.material.opacity=Math.min(1,f*6)*(1-f)*.55}
  for(const p of FXP.db){if(p.l<=0){p.m.visible=false;continue}p.l--;p.vy+=.12;p.wx+=p.vx;p.wy+=p.vy;p.z+=p.vz;p.m.position.set(toX(p.wx),(360-p.wy)*U,p.z);p.m.rotation.x+=p.r;p.m.rotation.y+=p.r*.7}
  for(const p of FXP.li){p.t*=.72;p.l.intensity=p.t<.5?0:p.t;p.l.position.set(toX(p.wx),(360-p.wy)*U,2.5)}}
 // post: HDR target (MSAA when tier>=1) -> ACES, bloom from mips, lens dirt, warm/teal grade, CA, haze, vignette, grain
 let rt=null,post=null,postScene=null,postCam=null;
 function dirtCanvas(){const c=document.createElement('canvas');c.width=256;c.height=144;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,144);for(let i=0;i<70;i++){const x=Math.random()*256,y=Math.random()*144,r=3+Math.random()*16,gr=g.createRadialGradient(x,y,0,x,y,r);const a=.15+Math.random()*.5;gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(.7,`rgba(255,255,255,${a*.6})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}return c}
 function mkRT(){if(rt)rt.dispose();rt=new T3.WebGLRenderTarget(GW,GH,{type:T3.HalfFloatType,samples:0,generateMipmaps:true,minFilter:T3.LinearMipmapLinearFilter,magFilter:T3.LinearFilter});if(post)post.uniforms.tS.value=rt.texture}
 function mkPost(){post=new T3.ShaderMaterial({uniforms:{tS:{value:null},tD:{value:ntex(dirtCanvas())},uT:{value:0},uQ:{value:TIER>0?1:0},uR:{value:new T3.Vector2(GW,GH)}},depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tS,tD;uniform float uT,uQ;uniform vec2 uR;varying vec2 vUv;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=vUv;float hz=smoothstep(.42,.0,uv.y)*.0012;uv.x+=sin(uv.y*150.+uT*7.)*hz;uv.y+=cos(uv.x*95.+uT*5.)*hz*.5;
vec2 dc=uv-.5;float ca=uQ>.5?.0035:.0;vec3 col=vec3(texture2D(tS,uv+dc*ca).r,texture2D(tS,uv).g,texture2D(tS,uv-dc*ca).b);
vec3 bl=textureLod(tS,uv,2.5).rgb*.2+textureLod(tS,uv,4.).rgb*.35+textureLod(tS,uv,5.5).rgb*.45;vec3 br=max(bl-vec3(.62),0.);
float dirt=texture2D(tD,vUv).r;col+=br*(.7+dirt*3.);col+=vec3(1.,.8,.55)*max(dot(bl,vec3(.33))-.55,0.)*dirt*.6;
col=aces(col*1.08);float L=dot(col,vec3(.299,.587,.114));col=mix(col*vec3(.84,.98,1.06),col*vec3(1.09,1.,.84),smoothstep(.12,.72,L));col=mix(vec3(L),col,.86);
col=pow(col,vec3(1./2.2));col=mix(col,col*col*(3.-2.*col),.35);float v=smoothstep(1.,.3,length(dc*vec2(1.2,1.)));col*=mix(.58,1.,v);
if(uQ>.5)col+=(hs(floor(vUv*uR)+fract(uT*7.3)*91.)-.5)*.05;gl_FragColor=vec4(col,1.);}`});
  postScene=new T3.Scene();const q=new T3.Mesh(new T3.PlaneGeometry(2,2),post);q.frustumCulled=false;postScene.add(q);postCam=new T3.OrthographicCamera(-1,1,1,-1,0,1);mkRT()}
 function setTier(t){TIER=t;[GW,GH]=SIZES[t];ren.setSize(GW,GH,false);mkRT();post.uniforms.uQ.value=t>0?1:0;post.uniforms.uR.value.set(GW,GH);const S2=t>=1?1024:512;sun.shadow.mapSize.set(S2,S2);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}R.info.tier=t}
 const PERF={pt:0,acc:0,n:0};
 // ---------- recording hooks (wrap the procedural art kit) ----------
 const wrapRec=(name,fn)=>{const o=window[name];if(typeof o!='function')return;window[name]=function(){fn.apply(null,arguments);REC.depth++;try{return o.apply(null,arguments)}finally{REC.depth--}}};
 wrapRec('rPart',(pb,pts,base,o)=>recP(o&&o.ell?{t:'ell',ell:o.ell.slice(),tag:REC.tag}:{t:'poly',pts:pts.map(p=>p.slice()),tag:REC.tag}));
 wrapRec('rWheel',(pb,x,y,r)=>recP({t:'wheel',x,y,r}));wrapRec('rTyre',(pb,x,y,r)=>recP({t:'tyre',x,y,r}));wrapRec('rSprocket',(pb,x,y,r)=>recP({t:'wheel',x,y,r}));
 wrapRec('rTrack',(pb,x0,x1,yt,yb,o={})=>{const ch=o.ch||6,fl=o.fl||0;recP({t:'track',pts:[[x0+ch,yt],[x1-ch,yt+fl],[x1,yt+ch+fl],[x1-ch-2,yb],[x0+ch+2,yb],[x0,yt+ch]],yt,yb})});
 wrapRec('rSeg',(pb,x0,y0,x1,y1,r0,r1,colf,dk)=>recP({t:'seg',x0,y0,x1,y1,r0,r1,dk:dk||0}));wrapRec('antenna',(pb,x,y0,y1)=>recP({t:'ant',x,y0,y1}));
 wrapRec('vPoly',(pb,pts)=>recP({t:'poly',pts:pts.map(p=>p.slice())}));wrapRec('vRect',(pb,x,y,w,h)=>recP({t:'poly',pts:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]}));wrapRec('vEll',(pb,cx,cy,rx,ry)=>recP({t:'ell',ell:[cx,cy,rx,ry]}));
 wrapRec('trackHD',(pb,x0,x1,y0,y1)=>{const r=(y1-y0)/2;recP({t:'track',pts:[[x0+r,y0],[x1-r,y0],[x1,y0+r],[x1-r,y1],[x0+r,y1],[x0,y0+r]],yt:y0,yb:y1})});wrapRec('wheelHD',(pb,x,y,r)=>recP({t:'wheel',x,y,r}));
 // ---------- source pass: re-run the art at 2x with recording -> per sprite canvas: {tex canvas, parts} ----------
 function sourcePass(){const t0=performance.now(),keep=Object.assign({},SPR);let cur=[];const mk=pb=>{const o={c:pb.canvas(),w:pb.canvas(true)};o.c.__parts=REC.parts;REC.parts=[];return o};PB.K=2;REC.on=1;REC.parts=[];
  try{SPR.tank=mk(mkTigerHD());buildRealArt(mk);buildRealArt2(mk)}finally{PB.K=1;REC.on=0}
  const hi=Object.assign({},SPR);Object.assign(SPR,keep);
  const pair=(k,lo,h,fi)=>{if(!lo||!h)return;if(Array.isArray(lo)){lo.forEach((x,i)=>pair(k,x,h[i],i));return}if(lo.c&&h.c){const id=k+(fi!=null?'#'+fi:'');SRC[id]={tex:h.c,parts:h.c.__parts,w:lo.c.width,h:lo.c.height,k,fi};KMAP.set(lo.c,{id,hit:0});if(lo.w)KMAP.set(lo.w,{id,hit:1})}};
  for(const k in hi)if(hi[k]!==keep[k])pair(k,keep[k],hi[k]);
  // everything else drawable becomes a textured card (billboard) so nothing disappears
  for(const k in SPR){const s=SPR[k],reg=(o,fi)=>{if(!o||!o.c||KMAP.has(o.c))return;const id=k+(fi!=null?'#'+fi:'');SRC[id]={tex:o.c.__hd||o.c,parts:null,w:o.c.width,h:o.c.height,k,fi};KMAP.set(o.c,{id,hit:0});if(o.w)KMAP.set(o.w,{id,hit:1})};
   if(Array.isArray(s))s.forEach(reg);else if(s&&s.c)reg(s)}
  R.info.srcMs=Math.round(performance.now()-t0);R.info.models=Object.values(SRC).filter(s=>s.parts).length}
 // ---------- model generation ----------
 const PV_K=new Set(),PA_K=new Set();const TWIN=new Set(['f22A','f15A','f35','f22','f15','su57','j20','j20B','a10c','a10m','f4A','f4','b25','me264','gen6']),HELI=new Set(['huey','cobra','apacheA','apache','tiltg','hind','hindB']);
 const cat=k=>k.startsWith('u_')?'sold':k.startsWith('bot_')?'bot':k.startsWith('drone_')?'drone':PA_K.has(k)||/^(f22|f15|p47|jet|f4|apache|zero|me262s|mig21|su57|j20|j20B|hind|hindB|shahed|me264)$/.test(k)?'air':'land';
 const bb=pts=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)}return{x0,y0,x1,y1,w:x1-x0,h:y1-y0}};
 const ellPts=(cx,cy,rx,ry,n=18)=>{const p=[];for(let i=0;i<n;i++){const a=i/n*6.283;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry])}return p};
 function extr(pts,depth,z,bev){const sh=new T3.Shape(pts.map(([x,y])=>new T3.Vector2(x,-y)));const b=Math.max(0,Math.min(bev,depth*.3));const g=new T3.ExtrudeGeometry(sh,{depth:Math.max(.2,depth-2*b),bevelEnabled:b>.15,bevelThickness:b,bevelSize:b*.8,bevelSegments:2,curveSegments:4});g.translate(0,0,z-depth/2+b);return g}
 function cylBetween(x0,y0,z0,x1,y1,z1,r0,r1,seg=10){const L=Math.hypot(x1-x0,y1-y0,z1-z0)||.01,g=new T3.CylinderGeometry(r1,r0,L,seg,1);const v=new T3.Vector3(x1-x0,-(y1-y0),z1-z0).normalize(),q=new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),v);
  g.applyQuaternion(q);g.translate((x0+x1)/2,-(y0+y1)/2,(z0+z1)/2);return g}
 function sphereAt(x,y,z,rx,ry,rz,seg=12){const g=new T3.SphereGeometry(1,seg,Math.max(6,seg*.6|0));g.scale(rx,ry,rz);g.translate(x,-y,z);return g}
 function wheelGeo(x,y,r,len,z){const g=new T3.CylinderGeometry(r,r,len,Math.max(10,Math.min(22,r*2|0)),1);g.rotateX(Math.PI/2);g.translate(x,-y,z);return g}
 function taper(g,y0,y1,amt,dia){const P=g.attributes.position;for(let i=0;i<P.count;i++){let t=(-P.getY(i)-y0)/((y1-y0)||1);t=Math.min(1,Math.max(0,t));P.setZ(i,P.getZ(i)*(dia?1-amt*Math.abs(t-.5)*2:1-amt*(1-t)))}return g}
 function planarUV(g,w,h){g=g.index?g.toNonIndexed():g;g.computeVertexNormals();const P=g.attributes.position,N=g.attributes.normal,uv=new Float32Array(P.count*2);
  for(let i=0;i<P.count;i++){const x=P.getX(i),yd=-P.getY(i),nx=N.getX(i),nyd=-N.getY(i),ins=1.6*(Math.abs(N.getZ(i))<.7?1:0);uv[i*2]=Math.min(.999,Math.max(.001,(x-nx*ins)/w));uv[i*2+1]=Math.min(.999,Math.max(.001,1-(yd-nyd*ins)/h))}
  g.setAttribute('uv',new T3.BufferAttribute(uv,2));return g}
 function merge(list){let n=0;for(const g of list)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3),UV=new Float32Array(n*2);let o=0;
  for(const g of list){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);UV.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count}
  const m=new T3.BufferGeometry();m.setAttribute('position',new T3.BufferAttribute(P,3));m.setAttribute('normal',new T3.BufferAttribute(N,3));m.setAttribute('uv',new T3.BufferAttribute(UV,2));return m}
 function buildModel(id){const S=SRC[id];if(!S)return null;const w=S.w,h=S.h,tex=texOf(S.tex),grp=new T3.Group();grp.userData={w,h,spin:[]};
  const shin=cat(S.k)=='sold'?6:cat(S.k)=='air'?60:30,PBm=X3&&S.parts&&S.parts.length?pbrMaps(S.tex,cat(S.k)!='sold'):null,mat=PBm?new T3.MeshStandardMaterial({map:texOf(PBm.a),normalMap:ntex(PBm.n),roughnessMap:ntex(PBm.r),roughness:1,metalness:cat(S.k)=='sold'?0:cat(S.k)=='air'?.55:.42,alphaTest:.5}):new T3.MeshPhongMaterial({map:tex,shininess:shin,specular:cat(S.k)=='sold'?0x111111:0x555555,alphaTest:.5,side:T3.FrontSide});
  if(!S.parts||!S.parts.length){const g=new T3.PlaneGeometry(w,h);g.translate(w/2,-h/2,0);const m=new T3.Mesh(g,X3?new T3.MeshStandardMaterial({map:tex,alphaTest:.45,side:T3.DoubleSide,roughness:.8}):new T3.MeshLambertMaterial({map:tex,alphaTest:.45,side:T3.DoubleSide}));if(X3)m.castShadow=true;grp.add(m);grp.userData.card=1;grp.userData.mats=[m.material];return grp}
  const C=cat(S.k),parts=S.parts,G=[],glass=[];let W=C=='land'?w*.42:C=='air'?w*.16:C=='sold'?8:C=='bot'?9:16;
  if(C=='land'){const trk=parts.filter(p=>p.t=='track'),wh=parts.filter(p=>p.t=='wheel'||p.t=='tyre');const tTop=trk.length?Math.min(...trk.map(p=>p.yt)):wh.length?Math.min(...wh.map(p=>p.y-p.r)):h*.75;
   for(const p of parts){if(p.t=='track'){for(const s of[1,-1])G.push(extr(p.pts,W*.22,s*W*.39,1.2))}
    else if(p.t=='wheel'||p.t=='tyre'){const len=p.t=='tyre'?W*.2:W*.08;G.push(wheelGeo(p.x,p.y,p.r,len,W*.5-len/2));if(X3)G.push(wheelGeo(p.x,p.y,p.r*.42,len*.5,W*.5+len*.2));if(p.t=='tyre')G.push(wheelGeo(p.x,p.y,p.r,len,-W*.5+len/2))}
    else if(p.t=='ant')G.push(cylBetween(p.x+.5,p.y0,-W*.15,p.x+.5,p.y1,-W*.15,.45,.6,5));
    else if(p.t=='poly'||p.t=='ell'){const pts=p.t=='ell'?ellPts(...p.ell):p.pts,B=bb(pts),fr=B.w*B.h/(w*h);if(fr<.0015)continue;let dep;
     if(X3&&B.w>w*.14&&B.h<B.w*.16&&B.h<h*.12&&B.y1<tTop){const cy=(B.y0+B.y1)/2,r=Math.max(1.1,B.h*.48);G.push(cylBetween(B.x0,cy,-W*.05,B.x1,cy,-W*.05,r,r*.82,14));if(B.w>w*.25)G.push(cylBetween(B.x1-r*3.2,cy,-W*.05,B.x1,cy,-W*.05,r*1.3,r*1.3,12));continue}
     if(B.y1>tTop+3&&B.w>w*.4)dep=W*1.04;else if(B.y1<=tTop+5&&B.y1<h*.66&&B.w<w*.8)dep=fr<.02?W*.4:W*.64;else dep=fr<.02?W*.5:W*.86;{const g=extr(pts,dep,0,Math.min(X3?3:2.2,B.h*(X3?.24:.18)));if(X3)taper(g,B.y0,B.y1,dep<W*.8?.24:.12,0);G.push(g)}}}}
  else if(C=='air'){const polys=parts.filter(p=>p.t=='poly'||p.t=='ell');let fus=null,fa=0;for(const p of polys){const B=bb(p.t=='ell'?ellPts(...p.ell):p.pts);if(B.w*B.h>fa&&p.tag!='can'){fa=B.w*B.h;fus=B}}const heli=HELI.has(S.k);
   for(const p of parts){if(p.t=='prop'){const r=(p.y1-p.y0)/2,disc=new T3.Mesh(new T3.CircleGeometry(r,24).rotateY(Math.PI/2).translate(p.x+1,-(p.y0+p.y1)/2,0),new T3.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.22,depthWrite:false,side:T3.DoubleSide}));grp.add(disc);
      const bl=new T3.Mesh(new T3.BoxGeometry(.8,r*2,2.2),new T3.MeshPhongMaterial({color:0x2a2a28}));bl.position.set(p.x+1,-(p.y0+p.y1)/2,0);grp.add(bl);grp.userData.spin.push([bl,'x',.9]);continue}
    if(p.t=='rotor'){const L2=p.x1-p.x0,cx=(p.x0+p.x1)/2,hub=new T3.Group();hub.position.set(cx,-p.y,0);for(let k=0;k<(S.k.startsWith('hind')?5:2);k++){const b=new T3.Mesh(new T3.BoxGeometry(L2,.7,3.2),new T3.MeshPhongMaterial({color:0x2c2c2a}));b.rotation.y=k*Math.PI/(S.k.startsWith('hind')?2.5:1);hub.add(b)}
      const disc=new T3.Mesh(new T3.CircleGeometry(L2/2,28).rotateX(-Math.PI/2),new T3.MeshBasicMaterial({color:0x303030,transparent:true,opacity:.12,depthWrite:false,side:T3.DoubleSide}));hub.add(disc);grp.add(hub);grp.userData.spin.push([hub,'y',.5]);continue}
    if(p.t=='seg'){G.push(cylBetween(p.x0,p.y0,0,p.x1,p.y1,0,p.r0,p.r1,8));continue}
    if(p.t!='poly'&&p.t!='ell')continue;const pts=p.t=='ell'?ellPts(...p.ell):p.pts,B=bb(pts),cx=(B.x0+B.x1)/2;if(B.w*B.h/(w*h)<.001)continue;
    if(p.tag=='can'){const g=planarUV(sphereAt(cx,(B.y0+B.y1)/2+B.h*.15,0,B.w/2,B.h*.65,Math.max(3,W*.33)),w,h);glass.push(g);continue}
    let dep=W*.75,z=0;if(fus&&B===fus){dep=Math.min(W,B.h*1.05);const g=extr(pts,dep,0,Math.min(B.h*.32,dep*.3));if(X3&&!heli)taper(g,B.y0,B.y1,.42,1);G.push(planarUV(g,w,h));continue}
    if(X3&&!heli&&B.h<h*.22&&B.w>w*.14){const big=cx>=w*.3,ch=B.w,span=big?w*(S.k.startsWith('p47')||S.k.startsWith('zero')?.42:.33):w*.15,sw=Math.tan((big?(S.k.startsWith('p47')||S.k.startsWith('zero')?6:40):42)*Math.PI/180),LE=B.x1,TE=B.x0,tLE=LE-span*sw,tTE=Math.max(TE+span*(S.k.startsWith('f22')?.2:.06),tLE-ch*(big?.28:.38));
      const sh=new T3.Shape([[LE,0],[tLE,span],[tTE,span],[TE,0],[tTE,-span],[tLE,-span]].map(([a,b])=>new T3.Vector2(a,b)));const g=new T3.ExtrudeGeometry(sh,{depth:.9,bevelEnabled:true,bevelThickness:.35,bevelSize:.35,bevelSegments:1});g.rotateX(Math.PI/2);g.translate(0,-(B.y0+B.y1)/2+.45,0);G.push(planarUV(g,w,h));continue}
    if(B.h<h*.22&&B.w>w*.14){dep=cx<w*.3?w*.34:heli?w*.28:w*.82;G.push(planarUV(extr(pts,dep,0,.6),w,h));continue}
    if(fus&&B.y0<fus.y0-1&&cx<w*.38){const tw=Math.max(1.2,w*.025);if(TWIN.has(S.k)){for(const s of[1,-1]){const g=extr(pts,tw,0,.4);g.translate(0,B.y1,0);g.rotateX(s*(X3?.45:.18));g.translate(0,-B.y1,0);g.translate(0,0,s*w*.07);G.push(planarUV(g,w,h))}}else G.push(planarUV(extr(pts,tw,0,.4),w,h));continue}
    G.push(planarUV(extr(pts,W*.6,z,1),w,h))}}
  else{// soldiers, robots, drones
   for(const p of parts){if(p.t=='seg'){const z=p.dk>0?-W*.32:W*.32;G.push(cylBetween(p.x0,p.y0,z,p.x1,p.y1,z,p.r0*.95,p.r1*.95,8));G.push(sphereAt(p.x1,p.y1,z,p.r1*.95,p.r1*.95,p.r1*.95,8));continue}
    if(p.t=='helmet'){const[cx,cy,rx,ry]=p.ell;const g=new T3.SphereGeometry(1,14,8,0,6.283,0,Math.PI*.55);g.scale(rx,ry*1.05,rx*.95);g.translate(cx,-cy,0);G.push(g);continue}
    if(p.t=='ell'){const[cx,cy,rx,ry]=p.ell;G.push(sphereAt(cx,cy,0,rx,ry,Math.min(rx,ry)*1.05,12));continue}
    if(p.t=='wheel'||p.t=='tyre'){G.push(wheelGeo(p.x,p.y,p.r,3,W*.4));continue}
    if(p.t!='poly')continue;const B=bb(p.pts),fr=B.w*B.h/(w*h);if(fr<.004)continue;const thin=B.h<4&&B.w>6;{const g=extr(p.pts,thin?2.6:fr>.06?W:W*.7,thin?W*.3:0,Math.min(X3?1.8:1.2,B.h*.3));if(X3&&!thin)taper(g,B.y0,B.y1,.12,1);G.push(g)}}}
  const geos=G.map(g=>planarUV(g.attributes.uv&&g.userData.uvDone?g:g,w,h));if(geos.length){const m=new T3.Mesh(merge(geos),mat);grp.add(m)}
  if(glass.length){const gm=new T3.MeshPhongMaterial({map:tex,shininess:120,specular:0xffffff,transparent:true,opacity:.92});grp.add(new T3.Mesh(merge(glass),gm));grp.userData.glass=gm}
  grp.userData.mats=[mat];grp.userData.dep=W;if(X3)grp.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true}});return grp}
 const getModel=id=>MODEL[id]!==undefined?MODEL[id]:(MODEL[id]=buildModel(id));
 // ---------- instance pool + placement from captured 2D transforms ----------
 const pool={},used={},M4=new T3.Matrix4(),RY=new T3.Matrix4(),TX=new T3.Matrix4(),TXi=new T3.Matrix4();let blobs=[],nb=0;
 function inst(id){const P=pool[id]||(pool[id]=[]);const n=used[id]||0;used[id]=n+1;if(P[n])return P[n];const src=getModel(id);if(!src)return null;const c=src.clone(true);c.userData=Object.assign({},src.userData);
  c.userData.mat=src.userData.mats[0].clone();c.traverse(o=>{if(o.isMesh&&o.material===src.userData.mats[0])o.material=c.userData.mat});c.userData.spin=[];const map=new Map();src.traverse(o=>{});
  // re-link spinning parts on the clone (same child order)
  src.userData.spin.forEach(([o,ax,sp])=>{const i=src.children.indexOf(o);if(i>=0)c.userData.spin.push([c.children[i],ax,sp])});c.matrixAutoUpdate=false;scene.add(c);P.push(c);return c}
 function place(o,r){const{a,b,c,d,e,f}=r.m,s=Math.sqrt(Math.abs(a*d-b*c))||1,w=o.userData.w;
  M4.set(U*a,-U*c,0,U*e, -U*b,U*d,0,U*(360-f), 0,0,U*s,0, 0,0,0,1);if(!o.userData.card){const yaw=r.cat=='air'?YAW*.8:r.cat=='sold'?YAW*1.3:YAW;TX.makeTranslation(w/2,0,0);TXi.makeTranslation(-w/2,0,0);RY.makeRotationY(yaw);M4.multiply(TX).multiply(RY).multiply(TXi)}
  o.matrix.copy(M4);o.matrixWorldNeedsUpdate=true;o.visible=true;const mt=o.userData.mat;if(mt){mt.emissive.setHex(r.hit?0x886060:0);mt.opacity=r.al;mt.transparent=r.al<.99}
  for(const[p,ax,sp]of o.userData.spin)p.rotation[ax]=TF.t*sp;
  if(!X3&&r.cat!='air'&&!o.userData.card&&CAP.mode!='air'){const bx=r.m.a*w/2+r.m.c*o.userData.h+r.m.e,by=r.m.b*w/2+r.m.d*o.userData.h+r.m.f;const B=blobs[nb]||(blobs[nb]=(()=>{const m=new T3.Mesh(new T3.PlaneGeometry(1,1).rotateX(-Math.PI/2),blobMat);m.renderOrder=-1;scene.add(m);return m})());nb++;
   B.visible=true;B.position.set(bx*U,(360-by)*U+.04,0);const sw=Math.abs(w*s)*U*1.05;B.scale.set(sw,1,Math.max(1.2,(o.userData.dep||10)*s*U*1.6))}}
 // ---------- worlds ----------
 let world=null;const tiles=c=>{const t=texOf(c.__hd||c);t.wrapS=t.wrapT=T3.RepeatWrapping;return t};
 function card(c,x,y,z,ww,hh,fogged=true){const m=new T3.Mesh(new T3.PlaneGeometry(ww,hh),new T3.MeshBasicMaterial({map:texOf(c.__hd||c),transparent:true,depthWrite:false,fog:fogged}));m.position.set(x,y,z);return m}
 function strip(c,x0,len,y,z,ww,hh){const src=c.__hd||c,cc=document.createElement('canvas');cc.width=src.width*2;cc.height=src.height;const q=cc.getContext('2d');q.drawImage(src,0,0);q.translate(cc.width,0);q.scale(-1,1);q.drawImage(src,0,0);const t=texOf(cc);t.wrapS=T3.RepeatWrapping;t.repeat.set(len/(2*ww),1);
  const m=new T3.Mesh(new T3.PlaneGeometry(len,hh),new T3.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(x0+len/2,y,z);return m}
 function skyTex(c){const t=texOf(c.__hd||c);return t}
 function quadBox(P,N,UVv,x0,y0,z0,x1,y1,z1){const f=(a,b,c2,d2,n,uvs)=>{for(const[v,uv]of[[a,uvs[0]],[b,uvs[1]],[c2,uvs[2]],[a,uvs[0]],[c2,uvs[2]],[d2,uvs[3]]]){P.push(...v);N.push(...n);UVv.push(...uv)}};
  f([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);f([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],[[x0,z1],[x1,z1],[x1,z0],[x0,z0]]);
  f([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],[[z1,y0],[z0,y0],[z0,y1],[z1,y1]]);f([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],[[z0,y0],[z1,y0],[z1,y1],[z0,y1]])}
 const geoOf=(P,N,UVv)=>{const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('normal',new T3.Float32BufferAttribute(N,3));g.setAttribute('uv',new T3.Float32BufferAttribute(UVv,2));return g};
 function setSky(top,bot,horizonCanvas){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,`rgb(${top})`);gr.addColorStop(.75,`rgb(${bot})`);gr.addColorStop(1,`rgb(${mix(bot,[255,255,255],.25).map(v=>v|0)})`);g.fillStyle=gr;g.fillRect(0,0,4,256);
  const t=texOf(c);scene.background=t;scene.fog=new T3.Fog(new T3.Color(`rgb(${bot.map(v=>v|0)})`),70,330)}
 function buildAssault(A){const L=A.L,T=L.tiles,root=new T3.Group(),wy=py=>(360-py)*U;setSky(L.th.sky[0],L.th.sky[1]);
  const P=[],N=[],UVv=[],Pt=[],Nt=[],UVt=[],Pb=[],Nb=[],UVb=[];
  for(let tx=0;tx<LW;tx++){let ty=0;while(ty<LH){const v=L.g[ty*LW+tx];if(!v){ty++;continue}if(v==3){quadBox(Pb,Nb,UVb,tx,wy((ty+1)*16),-1.4,tx+1,wy(ty*16),1.4);ty++;continue}
    let e=ty;while(e<LH&&L.g[e*LW+tx]&&L.g[e*LW+tx]!=3)e++;const top=wy(ty*16);quadBox(P,N,UVv,tx,wy(e*16)-6,-5,tx+1,top-.35,3);quadBox(Pt,Nt,UVt,tx,top-.35,-5,tx+1,top,3);ty=e}}
  const lam=c=>new T3.MeshLambertMaterial({map:tiles(c)});root.add(new T3.Mesh(geoOf(P,N,UVv),lam(T.fill)),new T3.Mesh(geoOf(Pt,Nt,UVt),lam(T.top)));const bm=new T3.Mesh(geoOf(Pb,Nb,UVb),new T3.MeshPhongMaterial({map:tiles(T.blk),shininess:10}));root.add(bm);
  root.add(strip(T.far,-60,LW+200,14,-120,40*3.2,22.5*3.2));root.add(strip(T.mid,-40,LW+120,12,-55,40*1.9,22.5*1.9))
  scene.add(root);return{root,ref:A,cam:()=>A.cam|0}}
 function buildDrive(D){const e=ERA(),bg=BBG[e.id],th=LTH[e.id],Tt=D.T,root=new T3.Group(),wy=py=>(360-py)*U;setSky(e.bb.top,e.bb.bot);
  const gt=noiseTex(th.top,mix(th.top,[0,0,0],.25),.07),ft=noiseTex(th.fill,mix(th.fill,[0,0,0],.3),.05);const P=[],N=[],UVv=[],Pf=[],Nf=[],UVf=[];
  for(let x=0;x<DLEN;x+=8){if(Tt.inBr(x+4))continue;const x0=x*U,x1=(x+8)*U,y0=wy(Tt.h(x)),y1=wy(Tt.h(x+8));
   for(const[a,b,c2,d2]of[[[x0,y0,3],[x1,y1,3],[x1,y1,-9],[x0,y0,-9]]]){for(const v of[a,b,c2,a,c2,d2]){P.push(...v);N.push(0,1,0);UVv.push(v[0]*.5,v[2]*.5)}}
   for(const v of[[x0,-2,3],[x1,-2,3],[x1,y1,3],[x0,-2,3],[x1,y1,3],[x0,y0,3]]){Pf.push(...v);Nf.push(0,0,1);UVf.push(v[0]*.4,v[1]*.4)}}
  root.add(new T3.Mesh(geoOf(P,N,UVv),new T3.MeshLambertMaterial({map:gt})),new T3.Mesh(geoOf(Pf,Nf,UVf),new T3.MeshLambertMaterial({map:ft})));
  const wat=new T3.MeshPhongMaterial({color:0x3a78a8,shininess:90,specular:0xbbddff,transparent:true,opacity:.86}),stl=new T3.MeshPhongMaterial({color:0x5a4a3a,shininess:30});
  for(const b of Tt.br){const x0=b[0]*U,x1=b[1]*U,y0=wy(Tt.gy(b[0])),y1=wy(Tt.gy(b[1]));const w=new T3.Mesh(new T3.BoxGeometry(x1-x0,.3,12),wat);w.position.set((x0+x1)/2,wy(322),-3);root.add(w);
   const Lb=Math.hypot(x1-x0,y1-y0),deck=new T3.Mesh(new T3.BoxGeometry(Lb,.4,4.6),stl);deck.position.set((x0+x1)/2,(y0+y1)/2-.2,0);deck.rotation.z=Math.atan2(y1-y0,x1-x0);root.add(deck);
   for(const s of[-1,1])for(let k=0;k<=8;k++){const t=k/8,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,p=new T3.Mesh(new T3.BoxGeometry(.18,1.7,.18),stl);p.position.set(x,y+.85,s*2.2);root.add(p)}
   const pier=new T3.Mesh(new T3.BoxGeometry(.9,14,.9),stl);pier.position.set((x0+x1)/2,(y0+y1)/2-7,0);root.add(pier)}
  root.add(strip(bg.ground,-60,DLEN*U+160,6,-70,40*1.6,152/16*1.6))
  scene.add(root);return{root,ref:D,cam:()=>D.cam|0}}
 function buildAir(Q){const e=ERA(),bg=BBG[e.id],th=LTH[e.id],root=new T3.Group();setSky(e.bb.top,e.bb.bot);const gt=noiseTex(th.top,mix(th.fill,[0,0,0],.2),.05);gt.repeat.set(8,2);
  const gp=new T3.Mesh(new T3.PlaneGeometry(400,40).rotateX(-Math.PI/2),new T3.MeshLambertMaterial({map:gt}));gp.position.set(20,1.6,-14);root.add(gp);root.userData.gp=gt;
  root.add(strip(bg.ground,-120,600,7,-90,40*1.8,152/16*1.8));if(bg.clouds)bg.clouds.forEach((c,i)=>{const m=card(c.c,i*12,15+i%3*2,-30-i*6,c.c.width*U*2,c.c.height*U*2);m.userData.cl=1;root.add(m)});
  scene.add(root);return{root,ref:Q,cam:()=>Q.scroll*.6}}
 // ---------- frame ----------
 function xUp(w,mode){if(!X3)return w;const root=w.root;upMat(root);const e=ERA(),th=LTH[e.id];
  if(mode=='assault'){const A=w.ref,L=A.L,ys=[];for(let tx=0;tx<LW;tx++)for(let ty=0;ty<LH;ty++)if(L.g[ty*LW+tx]&&L.g[ty*LW+tx]!=3){ys.push(ty);break}ys.sort((a,b)=>a-b);const yb=(360-(ys[ys.length>>1]||18)*16)*U;
   setSkyX(L.th.sky[0],L.th.sky[1]);dress(root,-30,LW+30,(x,z)=>yb-.6+Math.max(0,(-z-12))*.06*(1+fbm(x*.05,z*.05)*4)+fbm(x*.13,z*.13)*.8,L.th,-5.2)}
  else if(mode=='drive'){const D=w.ref,Tt=D.T,base=x=>(360-Tt.h(Math.max(0,Math.min(DLEN,x/U))))*U;setSkyX(e.bb.top,e.bb.bot);
   dress(root,-10,DLEN*U+30,(x,z)=>{const f=Math.min(1,Math.max(0,(-z-9)/30));return base(x)*(1-f)+(base(x)*.4+3+fbm(x*.04,z*.04)*9)*f-.3},th,-9)}
  else{setSkyX(e.bb.top,e.bb.bot);const gp=root.children.find(o=>o.geometry&&o.geometry.type=='PlaneGeometry'&&o.material.map&&o.material.map.repeat.x==8);if(gp)gp.visible=false;dress(root,-140,180,(x,z)=>1.2+Math.max(0,-z-20)*.05*fbm(x*.03,z*.03)*3+fbm(x*.1,z*.1)*.6,th,8)}
  return w}
 function render(mode){const ref=TF.md||TF.as;if(!world||world.ref!==ref){if(world)scene.remove(world.root);world=xUp(mode=='assault'?buildAssault(TF.as):mode=='drive'?buildDrive(TF.md):buildAir(TF.md),mode)}
  const c=world.cam();world.root.position.x=-c*U;if(mode=='air'){world.root.position.x=-(c%640)*U*.3;world.root.userData.gp&&(world.root.userData.gp.offset.x=c*.004)}
  for(const k in pool)for(const o of pool[k])o.visible=false;for(const k in used)used[k]=0;for(const b of blobs)b.visible=false;nb=0;
  for(const r of CAP.list){const o=inst(r.id);if(o)place(o,r)}
  // barrel for player land vehicle (2D stroke suppressed)
  if(mode=='drive'&&TF.md&&TF.md.mz){const D=TF.md,[mx,my,ang]=D.mz,c0=D.cam|0,len=D.v.k=='bradley'?30:D.v.mgOnly?14:38,b=R.barrel||(R.barrel=(()=>{const m=new T3.Mesh(new T3.CylinderGeometry(1,1,1,10).rotateZ(Math.PI/2).translate(.5,0,0),new T3.MeshPhongMaterial({color:0x34362f,shininess:50,specular:0x666666}));scene.add(m);return m})());
   const px=mx-Math.cos(ang)*len-c0,py=my-Math.sin(ang)*len,rad=D.v.k=='bradley'?1.6:D.v.mgOnly?1.1:2.6;b.position.set(px*U,(360-py)*U,.6);b.rotation.set(0,0,-ang);b.scale.set(len*U,rad*U,rad*U);b.visible=D.done!=2}
  else if(R.barrel)R.barrel.visible=false;
  if(X3){stepFX(mode,mode=='air'?0:(world.cam()));if(!post)mkPost();const now=performance.now();if(PERF.pt){const dt=now-PERF.pt;if(dt<250){PERF.acc+=dt;PERF.n++}}PERF.pt=now;
   if(PERF.n>=120){const avg=PERF.acc/PERF.n;PERF.acc=PERF.n=0;R.info.avgMs=Math.round(avg);if(!QP&&avg>24&&TIER>0)setTier(TIER-1)}
   post.uniforms.uT.value=TF.t/60;ren.setRenderTarget(rt);ren.render(scene,cam);ren.setRenderTarget(null);ren.render(postScene,postCam)}else ren.render(scene,cam);R.lastT=TF.t;R.info.tier=TIER;R.info.calls=ren.info.render.calls;R.info.tris=ren.info.render.triangles}
 // ---------- capture layer on the 2D context ----------
 const tmp=document.createElement('canvas').getContext('2d'),norm=s=>{tmp.fillStyle='#000';tmp.fillStyle=s;return tmp.fillStyle};let SKIPF=new Set(),SKIPS=new Set(['#4a4038','#6a5a48','#24262a','#6a6a62','#7a7a70']);
 const prevDI=G.drawImage;G.drawImage=function(im,a,b,c,d,e,f,g,h){const k=KMAP.get(im);
  if(CAP.on){if(k){const m=G.getTransform(),K=GBA_K,n=arguments.length;let x=a,y=b,sx=1,sy=1;if(n==5){sx=c/im.width;sy=d/im.height}else if(n==9){x=e;y=f;sx=g/c;sy=h/d}
    const M={a:m.a/K*sx,b:m.b/K*sx,c:m.c/K*sy,d:m.d/K*sy,e:(m.a*x+m.c*y+m.e)/K,f:(m.b*x+m.d*y+m.f)/K};CAP.list.push({id:k.id,hit:k.hit,m:M,al:G.globalAlpha,cat:cat(SRC[k.id].k)})}return}
  if(k&&SRC[k.id]&&SRC[k.id].parts&&!im.__gcT&&!k.hit){im.__gcT=1;const t=thumb(k.id);if(t){im.__hd=t;t.__isHd=1}}return prevDI.apply(G,arguments)};
 const prevX=X.drawImage;X.drawImage=function(im){const k=KMAP.get(im);if(k&&SRC[k.id]&&SRC[k.id].parts&&!im.__gcT&&!k.hit){im.__gcT=1;const t=thumb(k.id);if(t){im.__hd=t;t.__isHd=1}}return prevX.apply(X,arguments)};
 const pFR=G.fillRect,pF=G.fill,pS=G.stroke;G.fillRect=function(x,y,w,h){if(CAP.on&&(w>=W*.9||(CAP.mode=='drive'&&SKIPF.has(G.fillStyle))))return;return pFR.apply(this,arguments)};
 G.fill=function(){if(CAP.on&&CAP.mode=='drive')return;return pF.apply(this,arguments)};G.stroke=function(){if(CAP.on&&CAP.mode=='drive'&&SKIPS.has(G.strokeStyle))return;return pS.apply(this,arguments)};
 // thumbnails: 3D render of a model framed exactly on its sprite rect (menus, picker, title, HUD all show the 3D look)
 function thumb(id){const src=getModel(id);if(!src)return null;const S=SRC[id],w=S.w,h=S.h,sc=2.5,tw=Math.round(w*sc),th2=Math.round(h*sc);thumbR.setSize(tw,th2,false);const o=src.clone(true);
  const yaw=cat(S.k)=='air'?YAW*.8:cat(S.k)=='sold'?YAW*1.3:YAW;o.position.set(0,0,0);const g=new T3.Group();o.position.x=-w/2;g.add(o);g.rotation.y=yaw;g.position.x=w/2;thumbScene.add(g);
  thumbCam.left=0;thumbCam.right=w;thumbCam.top=0;thumbCam.bottom=-h;thumbCam.updateProjectionMatrix();thumbR.render(thumbScene,thumbCam);thumbScene.remove(g);
  const c=document.createElement('canvas');c.width=tw;c.height=th2;c.getContext('2d').drawImage(thumbR.domElement,0,0);return c}
 // ---------- hook game draw functions ----------
 function hook(name,mode){const o=window[name];if(typeof o!='function')return;window[name]=function(){G.save();G.setTransform(1,0,0,1,0,0);G.clearRect(0,0,L.width,L.height);G.restore();CAP.on=1;CAP.mode=mode;CAP.list.length=0;
   if(mode=='drive'){const th=LTH[ERA().id];SKIPF=new Set([`rgb(${th.top})`,`rgb(${th.fill})`,`rgb(${mix(th.fill,[0,0,0],.35)})`,'#3a6a90','#5a90b8','#3a3028'].map(norm))}
   try{o.apply(null,arguments)}finally{CAP.on=0}try{render(mode)}catch(e){R.err=String(e)}}}
 const _gp=gbaPass;gbaPass=function(){_gp();for(const e in PV)PV[e].forEach(v=>PV_K.add(v.k));for(const e in PA)PA[e].forEach(v=>PA_K.add(v.k));sourcePass();hook('drawAssault','assault');hook('drawDrive','drive');hook('drawAir','air')};
 R.info.ok=1;R.dbg={SRC,KMAP,getModel,thumb,post:()=>post,sun:()=>sun};return R})();
window.GC3D=GC3D;
