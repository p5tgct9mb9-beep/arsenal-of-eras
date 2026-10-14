'use strict';
// ---- HD illustration mode (default; RETRO toggle = old crisp pixels). Internal render 1920x1080 (3x of the 640x360 gameplay space,
// same game coords via transform). Every sprite gets a cached hi-res twin (__hd): EPX/Scale2x edge-directed upscale (4x small, 2x large),
// dither melted into smooth gradients, soft anti-aliased alpha. Large backdrops get a smoothed twin and bilinear filtering.
function hdUp(src){const w=src.width,h=src.height;if(!w||!h)return null;const big=w*h>90000,f=big?1:(w>200?2:4);
 let d=src.getContext('2d').getImageData(0,0,w,h).data,W0=w,H0=h;
 const epx=(s,w,h)=>{const o=new Uint8ClampedArray(w*h*16),W2=w*2,px=(x,y)=>{x=x<0?0:x>=w?w-1:x;y=y<0?0:y>=h?h-1:y;return(y*w+x)*4},eq=(a,b)=>s[a]==s[b]&&s[a+1]==s[b+1]&&s[a+2]==s[b+2]&&s[a+3]==s[b+3],
  cp=(dx,dy,si)=>{const di=(dy*W2+dx)*4;o[di]=s[si];o[di+1]=s[si+1];o[di+2]=s[si+2];o[di+3]=s[si+3]};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const P=px(x,y),A=px(x,y-1),B=px(x+1,y),C=px(x-1,y),D=px(x,y+1);
   cp(2*x,2*y,(eq(C,A)&&!eq(C,D)&&!eq(A,B))?A:P);cp(2*x+1,2*y,(eq(A,B)&&!eq(A,C)&&!eq(B,D))?B:P);cp(2*x,2*y+1,(eq(D,C)&&!eq(D,B)&&!eq(C,A))?C:P);cp(2*x+1,2*y+1,(eq(B,D)&&!eq(B,A)&&!eq(D,C))?D:P)}return o};
 if(f>=2){d=epx(d,W0,H0);W0*=2;H0*=2}if(f>=4){d=epx(d,W0,H0);W0*=2;H0*=2}
 // soften: colour = mix(orig, mean of opaque 3x3 (5x5 for 4x)), alpha = light blur for AA edges
 const r=f>=4?2:1,o=new Uint8ClampedArray(d.length),mixK=big?.7:.55;
 for(let y=0;y<H0;y++)for(let x=0;x<W0;x++){let R=0,G2=0,B=0,n=0,A=0,m=0;for(let j=-r;j<=r;j++){const yy=y+j;if(yy<0||yy>=H0)continue;for(let i=-r;i<=r;i++){const xx=x+i;if(xx<0||xx>=W0)continue;const q=(yy*W0+xx)*4;A+=d[q+3];m++;if(d[q+3]>127){R+=d[q];G2+=d[q+1];B+=d[q+2];n++}}}
  const p=(y*W0+x)*4;if(!n){continue}const a=d[p+3]>127;const k=a?mixK:1;o[p]=a?d[p]*(1-k)+R/n*k:R/n;o[p+1]=a?d[p+1]*(1-k)+G2/n*k:G2/n;o[p+2]=a?d[p+2]*(1-k)+B/n*k:B/n;o[p+3]=big?d[p+3]:Math.min(255,a?255-(255-A/m)*.35:A/m*.9)}
 const c=document.createElement('canvas');c.width=W0;c.height=H0;c.getContext('2d').putImageData(new ImageData(o,W0,H0),0,0);return c}
function hdTag(c){if(RETRO||!(c instanceof HTMLCanvasElement)||c.__hd||c.__isHd)return c;const h=hdUp(c);if(h){h.__isHd=1;c.__hd=h}return c}
function hdWalk(s){if(!s)return;if(s instanceof HTMLCanvasElement)return hdTag(s);if(Array.isArray(s))return s.forEach(hdWalk);if(s.c instanceof HTMLCanvasElement)hdTag(s.c)}
function hdBlur(c,r){const w=c.width,h=c.height,g=c.getContext('2d'),id=g.getImageData(0,0,w,h),d=id.data,t=new Float32Array(d.length);
 const pass=(src,dst,hor)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){let a=[0,0,0,0],n=0;for(let k=-r;k<=r;k++){const X2=hor?x+k:x,Y2=hor?y:y+k;if(X2<0||Y2<0||X2>=w||Y2>=h)continue;const q=(Y2*w+X2)*4,al=src[q+3]/255;a[0]+=src[q]*al;a[1]+=src[q+1]*al;a[2]+=src[q+2]*al;a[3]+=src[q+3];n++}
  const p=(y*w+x)*4,A=a[3]/n;dst[p+3]=A;const s=A>0?255/(a[3]):0;dst[p]=a[0]*s;dst[p+1]=a[1]*s;dst[p+2]=a[2]*s}};pass(d,t,1);const o=new Uint8ClampedArray(d.length);pass(t,o,0);
 const c2=document.createElement('canvas');c2.width=w;c2.height=h;c2.getContext('2d').putImageData(new ImageData(o,w,h),0,0);return c2}
function hdSat(c,s=1.16,ct=1.06){const g=c.getContext('2d'),id=g.getImageData(0,0,c.width,c.height),d=id.data;for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const L2=d[i]*.3+d[i+1]*.59+d[i+2]*.11;for(let k=0;k<3;k++)d[i+k]=((L2+(d[i+k]-L2)*s)-128)*ct+128}g.putImageData(id,0,0);return c}
function hdNative(){const t0=performance.now(),keep=Object.assign({},SPR),mk=pb=>({c:pb.canvas(),w:pb.canvas(true)});PB.K=2;let n=0;
 try{SPR.tank=mk(mkTigerHD());buildRealArt(mk);buildRealArt2(mk)}finally{PB.K=1}
 const hi=Object.assign({},SPR);Object.assign(SPR,keep);
 const pair=(lo,h)=>{if(!lo||!h)return;if(Array.isArray(lo)){lo.forEach((x,i)=>pair(x,h[i]));return}if(lo.c&&h.c){lo.c.__hd=STYLE=='psp'?hdSat(h.c):h.c;h.c.__isHd=1;if(lo.w&&h.w){lo.w.__hd=h.w;h.w.__isHd=1}n++}};
 for(const k in hi)if(hi[k]!==keep[k])pair(keep[k],hi[k]);GBA.native=n;GBA.nativeMs=Math.round(performance.now()-t0)}
if(!RETRO){
 const _gp=gbaPass;gbaPass=function(){_gp();if(NATIVE)hdNative();const t0=performance.now();for(const k in SPR)hdWalk(SPR[k]);for(const id in BBG){const b=BBG[id];for(const k in b)if(b[k] instanceof HTMLCanvasElement)hdTag(b[k]);if(b.clouds)b.clouds.forEach(c=>hdTag(c.c))}
  const _bt=buildTiles;buildTiles=function(th){const T=_bt(th);for(const k in T)if(T[k] instanceof HTMLCanvasElement){if(STYLE=='vita'&&(k=='far'||k=='mid'||k=='sky')){T[k].__hd=hdBlur(T[k],k=='far'?3:k=='mid'?1:2);T[k].__hd.__isHd=1}else hdTag(T[k])}return T};GBA.hdms=Math.round(performance.now()-t0)};
 const wrap=(ctx)=>{const di=ctx.drawImage.bind(ctx);ctx.drawImage=function(im,a,b,c,d,e,f,g,h){const H2=im&&im.__hd;if(!H2)return di.apply(null,arguments);const sm=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(arguments.length==3)di(H2,a,b,im.width,im.height);else if(arguments.length==5)di(H2,a,b,c,d);else{const k=H2.width/im.width;di(H2,a*k,b*k,c*k,d*k,e,f,g,h)}ctx.imageSmoothingEnabled=sm}};
 wrap(G);wrap(X)}
// per-frame post FX (PSP: soft bloom; Vita: bloom + vignette + light grade). Cheap: two small blits.
const PFX={};if(SMOOTHBLIT){PFX.b=document.createElement('canvas');PFX.b.width=120;PFX.b.height=68;PFX.bg=PFX.b.getContext('2d');
 if(STYLE=='vita'||STYLE=='gc'){const v=document.createElement('canvas');v.width=480;v.height=270;const g=v.getContext('2d'),gr=g.createRadialGradient(240,135,60,240,135,290);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,10,.45)');g.fillStyle=gr;g.fillRect(0,0,480,270);PFX.v=v}}
function postFX(){if(!SMOOTHBLIT)return;if(STYLE=='x360'&&window.GC3D&&GC3D.lastT===TF.t)return;const SRC=window.GC3D&&GC3D.lastT===TF.t?GC3D.canvas:L;const g=PFX.bg;g.imageSmoothingEnabled=true;g.globalCompositeOperation='copy';g.drawImage(SRC,0,0,120,68);g.globalCompositeOperation='source-over';
 X.save();X.imageSmoothingEnabled=true;X.globalCompositeOperation='lighter';X.globalAlpha=STYLE=='psp'?.13:STYLE=='gc'?.14:.1;X.drawImage(PFX.b,0,0,1920,1080);X.globalCompositeOperation='source-over';X.globalAlpha=1;if(PFX.v)X.drawImage(PFX.v,0,0,1920,1080);X.restore()}
// retro toggle: P on title/era screens (or ?retro=1)
addEventListener('keydown',e=>{if(e.code=='KeyP'&&typeof TF!='undefined'&&(TF.state=='title'||TF.state=='era')){try{localStorage.setItem('aoe_style',STYLES[(STYLES.indexOf(STYLE)+1)%STYLES.length]);localStorage.removeItem('aoe_retro')}catch(_){}location.href=location.pathname}});
addEventListener('pointerdown',e=>{if(typeof TF!='undefined'&&(TF.state=='title'||TF.state=='era')&&e.clientX>innerWidth*.6&&e.clientY>innerHeight*.9){try{localStorage.setItem('aoe_style',STYLES[(STYLES.indexOf(STYLE)+1)%STYLES.length])}catch(_){}location.href=location.pathname}});
addEventListener('load',()=>{if(typeof drawHUD!='function')return;const _dh=drawHUD;drawHUD=function(){_dh();if(TF.state=='title'||TF.state=='era')txt('STYLE: '+STYLE.toUpperCase()+'   (P / TAP HERE: '+STYLES.map(s=>s==STYLE?'['+s.toUpperCase()+']':s.toUpperCase()).join(' / ')+')',24,1062,22,'#c8c8c8','left')}});
