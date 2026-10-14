'use strict';
// ---- "Enhanced GBA" art pass: native 320x180 (2:1 of the 640x360 gameplay space), integer-scaled & letterboxed.
// Every sprite is re-rasterised at half resolution (mode-of-block colour), quantised to a limited per-sprite palette,
// given a bold 1px dark outline, then stored at 2x blocks so all gameplay sizes/hitboxes stay identical.
const GBA={sprCols:56,bgCols:72,outline:[20,16,22],blk:1};
function gbaify(src,o={}){const w=src.width,h=src.height;if(!w||!h)return src;const B=GBA.blk,sw=Math.ceil(w/B),sh=Math.ceil(h/B);
 const sd=src.getContext('2d').getImageData(0,0,w,h).data,px=new Array(sw*sh);
 for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const cnt=new Map();let op=0,best=null,bn=0,lum=1e9;
  for(let dy=0;dy<B;dy++)for(let dx=0;dx<B;dx++){const X=x*B+dx,Y=y*B+dy;if(X>=w||Y>=h)continue;const i=(Y*w+X)*4;if(sd[i+3]<128)continue;op++;
   const k=(sd[i]>>3)<<10|(sd[i+1]>>3)<<5|(sd[i+2]>>3);const n=(cnt.get(k)||0)+1;cnt.set(k,n);const l=sd[i]*3+sd[i+1]*6+sd[i+2];
   if(n>bn||(n==bn&&l<lum)){bn=n;best=[sd[i],sd[i+1],sd[i+2]];lum=l}}
  px[y*sw+x]=(o.solid?op>0:op>=(B>1?2:1))?best:null}
 // limited palette (k-means on opaque pixels, seeded by most frequent colours)
 const K=o.cols||GBA.sprCols,cols=[],freq=new Map();for(const p of px)if(p){const k=p.join();freq.set(k,(freq.get(k)||0)+1)}
 if(freq.size>K){const seeds=[...freq.entries()].sort((a,b)=>b[1]-a[1]);const cen=[];for(const[k]of seeds){const c=k.split(',').map(Number);if(cen.every(q=>Math.abs(q[0]-c[0])+Math.abs(q[1]-c[1])+Math.abs(q[2]-c[2])>24))cen.push(c);if(cen.length>=K)break}
  const ent=[...freq.entries()].map(([k,n])=>[k.split(',').map(Number),n]);const near=c=>{let bi=0,bd=1e9;for(let i=0;i<cen.length;i++){const q=cen[i],d=(q[0]-c[0])**2*3+(q[1]-c[1])**2*4+(q[2]-c[2])**2*2;if(d<bd){bd=d;bi=i}}return bi};
  for(let it=0;it<6;it++){const acc=cen.map(()=>[0,0,0,0]);for(const[c,n]of ent){const a=acc[near(c)];a[0]+=c[0]*n;a[1]+=c[1]*n;a[2]+=c[2]*n;a[3]+=n}acc.forEach((a,i)=>{if(a[3])cen[i]=[a[0]/a[3]|0,a[1]/a[3]|0,a[2]/a[3]|0]})}
  const map=new Map();for(const[c]of ent)map.set(c.join(),cen[near(c)]);for(let i=0;i<px.length;i++)if(px[i])px[i]=map.get(px[i].join())}
 if(o.outline){const ol=GBA.outline,add=[];for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){if(px[y*sw+x])continue;const n=(X,Y)=>{const q=X>=0&&Y>=0&&X<sw&&Y<sh&&px[Y*sw+X];return q&&q!==ol&&q[0]*3+q[1]*6+q[2]>700};
   if(n(x-1,y)||n(x+1,y)||n(x,y-1)||n(x,y+1))add.push(y*sw+x)}for(const i of add)px[i]=ol;
  // darken interior pixels that touch the outline a touch (chunky shading edge)
 }
 const out=document.createElement('canvas');out.width=w;out.height=h;const g=out.getContext('2d'),id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=px[((y/B)|0)*sw+((x/B)|0)];if(!p)continue;const i=(y*w+x)*4;d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255}
 g.putImageData(id,0,0);return out}
const gbaDone=new WeakSet();
function gbaSpr(s,o){if(!s||gbaDone.has(s))return s;if(s instanceof HTMLCanvasElement){const r=gbaify(s,o);gbaDone.add(r);return r}
 if(Array.isArray(s))return s.map(x=>gbaSpr(x,o));if(s.c instanceof HTMLCanvasElement){gbaDone.add(s);s.c=gbaify(s.c,o);if(s.w instanceof HTMLCanvasElement)s.w=gbaify(s.w,Object.assign({},o,{cols:4}));return s}return s}
function gbaPass(){const t0=performance.now();for(const k in SPR){if(k=='logo'){SPR[k]=gbaify(SPR[k],{cols:32,solid:1});continue}if(k=='helperP'){SPR[k]=gbaify(SPR[k],{outline:1});continue}SPR[k]=gbaSpr(SPR[k],{outline:1})}
 for(const id in BBG){const b=BBG[id];if(b.ground&&b.sky)gbaHaze(b);for(const k in b){if(b[k] instanceof HTMLCanvasElement)b[k]=gbaify(b[k],{cols:GBA.bgCols,solid:1})}if(b.clouds)for(const c of b.clouds)c.c=gbaify(c.c,{cols:12})}
 if(!buildTiles.gba){const _bt=buildTiles;buildTiles=function(th){const T=_bt(th);for(const k in T)if(T[k] instanceof HTMLCanvasElement)T[k]=gbaify(T[k],{cols:k=='top'||k=='fill'||k=='blk'?12:GBA.bgCols,solid:1});return T};buildTiles.gba=1}
 GBA.ms=Math.round(performance.now()-t0)}
// crisp primitives in the half-res buffer: snap logical rects/blits to whole native pixels
{const fr=G.fillRect.bind(G),di=G.drawImage.bind(G);const s2=v=>Math.round(v*GBA_K)/GBA_K;
 G.fillRect=(x,y,w,h)=>{const X0=s2(x),Y0=s2(y);let X1=s2(x+w),Y1=s2(y+h);if(X1==X0)X1=X0+1/GBA_K;if(Y1==Y0)Y1=Y0+1/GBA_K;fr(X0,Y0,X1-X0,Y1-Y0)};
 G.drawImage=function(im,a,b,c,d,e,f,g,h){if(arguments.length==3)return di(im,s2(a),s2(b));if(arguments.length==5)return di(im,s2(a),s2(b),c,d);return di(im,a,b,c,d,s2(e),s2(f),g,h)}}
// integer scaling + letterbox (device pixels)
function gbaFit(){const c=document.getElementById('c');if(!c)return;const dpr=window.devicePixelRatio||1,iw=innerWidth*dpr,ih=innerHeight*dpr;let k=RETRO?Math.floor(Math.min(iw/(320/GBA.blk*2),ih/(180/GBA.blk*2))):Math.min(iw/640,ih/360);if(k<1)k=Math.min(iw/(320/GBA.blk*2),ih/(180/GBA.blk*2));
 const cw=640/GBA.blk*k/dpr,ch=360/GBA.blk*k/dpr;Object.assign(c.style,{width:cw+'px',height:ch+'px',left:((innerWidth-cw)/2)+'px',top:((innerHeight-ch)/2)+'px',maxWidth:'none',maxHeight:'none',margin:'0',inset:'auto'})}
addEventListener('resize',gbaFit);addEventListener('orientationchange',()=>setTimeout(gbaFit,200));setTimeout(gbaFit,0);

// atmospheric perspective: distant ridges in the ground strip fade toward the sky's horizon colour
function gbaHaze(b){const g=b.ground.getContext('2d'),w=b.ground.width,h=b.ground.height,id=g.getImageData(0,0,w,h),d=id.data;const sk=b.sky.getContext('2d').getImageData(0,b.sky.height-4,1,1).data;
 const top=[];for(let x=0;x<w;x++){let y=0;while(y<h&&d[(y*w+x)*4+3]<128)y++;top.push(y)}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<128)continue;const f=Math.max(0,.42-(y/h)*1.1);if(f<=0)continue;for(let c=0;c<3;c++)d[i+c]=d[i+c]+(sk[c]-d[i+c])*f}g.putImageData(id,0,0)}
