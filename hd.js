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
if(!RETRO){
 const _gp=gbaPass;gbaPass=function(){_gp();const t0=performance.now();for(const k in SPR)hdWalk(SPR[k]);for(const id in BBG){const b=BBG[id];for(const k in b)if(b[k] instanceof HTMLCanvasElement)hdTag(b[k]);if(b.clouds)b.clouds.forEach(c=>hdTag(c.c))}
  const _bt=buildTiles;buildTiles=function(th){const T=_bt(th);for(const k in T)if(T[k] instanceof HTMLCanvasElement)hdTag(T[k]);return T};GBA.hdms=Math.round(performance.now()-t0)};
 const wrap=(ctx)=>{const di=ctx.drawImage.bind(ctx);ctx.drawImage=function(im,a,b,c,d,e,f,g,h){const H2=im&&im.__hd;if(!H2)return di.apply(null,arguments);const sm=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(arguments.length==3)di(H2,a,b,im.width,im.height);else if(arguments.length==5)di(H2,a,b,c,d);else{const k=H2.width/im.width;di(H2,a*k,b*k,c*k,d*k,e,f,g,h)}ctx.imageSmoothingEnabled=sm}};
 wrap(G);wrap(X)}
// retro toggle: P on title/era screens (or ?retro=1)
addEventListener('keydown',e=>{if(e.code=='KeyP'&&typeof TF!='undefined'&&(TF.state=='title'||TF.state=='era')){try{localStorage.setItem('aoe_retro',RETRO?'0':'1')}catch(_){}location.reload()}});
addEventListener('load',()=>{if(typeof drawHUD!='function')return;const _dh=drawHUD;drawHUD=function(){_dh();if(TF.state=='title'||TF.state=='era')txt('P: '+(RETRO?'HD ILLUSTRATED MODE':'RETRO PIXEL MODE'),1900,1062,22,'#c8c8c8','right')}});
