'use strict';
// ---------- procedural hi-bit pixel art ----------
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const thr=(x,y)=>(B4[(y&3)*4+(x&3)]+.5)/16;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function hx(c){c=c.replace('#','');return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
function rgb(a){return'rgb('+(a[0]|0)+','+(a[1]|0)+','+(a[2]|0)+')'}
function mix(a,b,t){return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]}
function hs(i,j,s=0){let h=Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s,982451653);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function n2(x,y,s=0){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=hs(i,j,s),b=hs(i+1,j,s),c=hs(i,j+1,s),d=hs(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y,s=0)=>(n2(x,y,s)*.5+n2(x*2.1,y*2.1,s+1)*.25+n2(x*4.3,y*4.3,s+2)*.125)/.875;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mk(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');f(g,(x,y,w2,h2,col)=>{g.fillStyle=col;g.fillRect(x,y,w2,h2)},c);return c}
function pix(g,w,h,fn){const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=fn(x,y);if(!c)continue;const k=(y*w+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=c[3]==null?255:c[3]}g.putImageData(id,0,0)}

const WHITE=['#ffffff','#e4e8ee','#bfc6d0','#868ea0'],STEEL=['#f4f6f8','#cdd2d8','#a3aab4','#68707c'],DARK=['#62666e','#3e424a','#2a2d33','#15171b'],GOLD=['#fff0a0','#e0b040','#b07a20','#6a4410'];
function cyl(r,x0,y0,w,h,p){for(let i=0;i<w;i++){const t=w<2?.4:i/(w-1);r(x0+i,y0,1,h,t<.18?p[0]:t<.55?p[1]:t<.82?p[2]:p[3])}}
function ogive(r,cx,y0,h,wMax,p){for(let y=0;y<h;y++){const ww=Math.max(1,Math.round(wMax*Math.sqrt((y+1)/h)));cyl(r,Math.round(cx-ww/2),y0+y,ww,1,p)}}
function soot(r,x0,y0,w,h,seed){const R=rng(seed);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(R()<(y/h)*.75)r(x0+x,y0+y,1,1,R()<.5?'#6e655c':'#4a443e')}
function bells(r,x0,y,n,bw,bh){for(let i=0;i<n;i++){r(x0+i*(bw+1),y,bw,bh,'#4a4f58');r(x0+i*(bw+1),y+bh-1,bw,1,'#2a2d33');r(x0+i*(bw+1),y,1,bh,'#7a808a')}}

function buildVehicles(){
 const F={name:'FALCON-CLASS',agile:1.15,eco:1,shield0:0,fw:5,uw:3};
 F.full=mk(11,62,(g,r)=>{ogive(r,5.5,0,10,7,WHITE);cyl(r,2,10,7,11,WHITE);cyl(r,2,21,7,4,DARK);
  r(0,22,2,3,'#5c6068');r(9,22,2,3,'#5c6068');r(0,23,2,1,'#2a2d33');r(9,23,2,1,'#2a2d33');
  cyl(r,2,25,7,31,WHITE);r(2,39,7,1,'#9aa2ae');soot(r,2,46,7,10,7);
  r(1,42,1,15,'#2a2d33');r(9,42,1,15,'#2a2d33');r(1,42,1,1,'#5c6068');r(9,42,1,1,'#5c6068');
  cyl(r,2,56,7,3,DARK);bells(r,2,59,3,1,3);r(3,59,1,3,'#4a4f58');r(5,59,1,3,'#4a4f58');r(7,59,1,3,'#4a4f58')});
 F.upper=mk(11,27,(g,r)=>{ogive(r,5.5,0,10,7,WHITE);cyl(r,2,10,7,11,WHITE);r(2,13,7,1,'#c8ced8');cyl(r,3,21,5,2,DARK);
  r(4,23,3,1,'#5a5f68');r(3,24,5,1,'#4a4f58');r(3,25,5,1,'#3a3e45');r(2,26,7,1,'#2a2d33');r(3,24,1,2,'#8a909a')});
 F.boost=mk(11,38,(g,r)=>{cyl(r,2,0,7,4,DARK);r(0,1,2,3,'#5c6068');r(9,1,2,3,'#5c6068');cyl(r,2,4,7,31,WHITE);r(2,18,7,1,'#9aa2ae');soot(r,2,22,7,13,9);
  r(1,21,1,15,'#2a2d33');r(9,21,1,15,'#2a2d33');cyl(r,2,35,7,3,DARK)});
 const S={name:'STARSHIP-CLASS',agile:.9,eco:.75,shield0:1,fw:9,uw:5};
 S.full=mk(13,67,(g,r)=>{ogive(r,6.5,0,11,9,STEEL);cyl(r,2,11,9,20,STEEL);for(let y=13;y<31;y+=4)r(2,y,9,1,'#b8bec6');
  r(0,7,2,5,'#2a2d33');r(11,7,2,5,'#2a2d33');r(1,6,1,1,'#2a2d33');r(11,6,1,1,'#2a2d33');
  r(0,24,2,7,'#2a2d33');r(11,24,2,7,'#2a2d33');r(1,23,1,1,'#2a2d33');r(11,23,1,1,'#2a2d33');
  cyl(r,2,31,9,3,DARK);for(let x=3;x<10;x+=2)r(x,32,1,1,'#7a4a2a');
  cyl(r,2,34,9,29,STEEL);for(let y=38;y<62;y+=4)r(2,y,9,1,'#b8bec6');r(0,35,2,2,'#5c6068');r(11,35,2,2,'#5c6068');r(0,36,2,1,'#2a2d33');r(11,36,2,1,'#2a2d33');
  soot(r,2,55,9,8,11);cyl(r,2,63,9,1,DARK);bells(r,2,64,4,1,3);r(3,64,1,3,'#4a4f58');r(5,64,1,3,'#4a4f58');r(7,64,1,3,'#4a4f58');r(9,64,1,3,'#4a4f58')});
 S.upper=mk(13,34,(g,r)=>{ogive(r,6.5,0,11,9,STEEL);cyl(r,2,11,9,20,STEEL);for(let y=13;y<31;y+=4)r(2,y,9,1,'#b8bec6');
  r(0,7,2,5,'#2a2d33');r(11,7,2,5,'#2a2d33');r(0,24,2,7,'#2a2d33');r(11,24,2,7,'#2a2d33');r(3,16,1,2,'#26303e');
  cyl(r,2,31,9,1,DARK);bells(r,3,32,3,1,2);r(4,32,1,2,'#4a4f58');r(6,32,1,2,'#4a4f58')});
 S.boost=mk(13,33,(g,r)=>{cyl(r,2,0,9,3,DARK);cyl(r,2,3,9,26,STEEL);for(let y=6;y<29;y+=4)r(2,y,9,1,'#b8bec6');r(0,4,2,2,'#5c6068');r(11,4,2,2,'#5c6068');soot(r,2,20,9,9,12);cyl(r,2,29,9,1,DARK);bells(r,2,30,4,1,3)});
 return[F,S]}

function buildSat(){return mk(26,14,(g,r)=>{for(let p of[0,17]){r(p,3,9,8,'#1c2c5a');for(let x=0;x<9;x+=3)for(let y=0;y<8;y+=2)r(p+x,3+y,2,1,'#3a5cb0');r(p,3,9,1,'#8a96aa');r(p,10,9,1,'#5a6478');r(p+2,5,1,1,'#7aa0f0')}
 r(9,6,2,2,'#8a909a');r(15,6,2,2,'#8a909a');cyl(r,11,3,4,9,GOLD);r(11,6,4,1,'#8a5a18');r(12,0,2,3,'#c8ccd2');r(11,0,4,1,'#e8ecf0');r(13,12,1,2,'#5a5f68');r(20,6,3,2,'#2a1a10');r(12,9,1,1,'#3a2a10')})}
function buildStage(){return mk(9,28,(g,r)=>{cyl(r,1,0,7,2,DARK);cyl(r,1,2,7,22,WHITE);soot(r,1,6,7,18,21);r(1,10,7,1,'#a07050');r(3,14,2,1,'#b0703a');cyl(r,2,24,5,2,DARK);r(1,26,7,2,'#3a3e45');r(2,27,5,1,'#16181c')})}
function buildAst(R,seed){const S=R*2+4;const rr=rng(seed);const cr=[];for(let i=0;i<3+R/3;i++)cr.push([rr()*1.4-.7,rr()*1.4-.7,.18+rr()*.25]);
 const pal=[hx('#d2c2a8'),hx('#a09080'),hx('#706458'),hx('#463c34'),hx('#241e1a')];
 return mk(S,S,(g)=>pix(g,S,S,(x,y)=>{const dx=(x-S/2+.5)/R,dy=(y-S/2+.5)/R,a=Math.atan2(dy,dx),rad=.82+.22*n2(Math.cos(a)*1.6+5,Math.sin(a)*1.6+seed,seed);const d=Math.hypot(dx,dy)/rad;if(d>1)return null;
  const nz=Math.sqrt(1-d*d);let l=-.55*dx-.5*dy+.75*nz;for(const c of cr){const cd=Math.hypot(dx-c[0],dy-c[1])/c[2];if(cd<1)l+=cd<.8?(-(dx-c[0])*.9-(dy-c[1])*.9)*1.4-.15:.2}
  l+=(fbm(dx*3+seed,dy*3)-.5)*.35;const q=clamp(Math.floor((1-l)*3.2+thr(x,y)),0,4);return d>.93?pal[4]:pal[q]}))}
function buildFuel(){return mk(9,13,(g,r)=>{r(3,0,3,2,'#c0c6d0');r(2,1,5,1,'#8a909a');cyl(r,1,2,7,10,['#d6ffb0','#62e048','#2c9a2a','#145a1c']);r(1,5,7,1,'#e8ecf0');r(1,9,7,1,'#e8ecf0');r(3,6,2,3,'#fff6a0');r(4,6,1,3,'#ffd040');r(1,12,7,1,'#2a2d33')})}
function buildShield(){return mk(13,13,(g,r)=>{const H=[[4,0,5],[2,1,9],[1,2,11],[0,3,13],[0,4,13],[0,5,13],[0,6,13],[0,7,13],[0,8,13],[1,9,11],[2,10,9],[3,11,7],[5,12,3]];
 for(const[x,y,w]of H){r(x,y,w,1,'#1a3a8a')}for(const[x,y,w]of H.slice(1,-1)){r(x+1,y,w-2,1,y<5?'#7ad0ff':y<9?'#3a8ae8':'#2a5ac0')}r(3,2,2,1,'#e8f8ff');r(2,3,1,2,'#e8f8ff');r(6,4,1,5,'#ffffff');r(4,6,5,1,'#ffffff')})}

const PT={
 earth:(dx,dy)=>{if(Math.abs(dy)>.86)return hx('#f4f8ff');if(fbm(dx*2.6+40,dy*2.6+3)>.6)return hx('#ffffff');const n=fbm(dx*2.2+11,dy*2.2+7);return n>.56?(n>.66?hx('#a89058'):hx('#4a9a3a')):hx('#2a62c8')},
 earthb:(dx,dy)=>{if(fbm(dx*7+40,dy*7+3)>.6)return hx('#f4f8ff');const n=fbm(dx*5+11,dy*5+7);return n>.55?(n>.66?hx('#a89058'):hx('#4a9a3a')):hx('#2a62c8')},
 moon:(dx,dy)=>{const n=fbm(dx*3+2,dy*3+9);return n>.58?hx('#8a8a88'):hx(fbm(dx*9,dy*9)>.62?'#a8a8a4':'#c8c8c4')},
 mars:(dx,dy)=>{if(dy<-.84)return hx('#fff4ee');const n=fbm(dx*2.7+5,dy*2.7+1);return n>.6?hx('#8a3a22'):n>.48?hx('#c4602e'):hx('#e0864a')},
 phobos:(dx,dy)=>{const n=fbm(dx*4+8,dy*4);return n>.6?hx('#6a5a4c'):hx('#94826e')},
 europa:(dx,dy)=>{const n=fbm(dx*3+1,dy*3+5);if(Math.abs(Math.sin(dx*7+dy*3+n*7))<.07||Math.abs(Math.sin(dy*9-dx*2+n*5))<.05)return hx('#a8603a');return n>.55?hx('#d8cbb0'):hx('#f2eee4')},
 titan:(dx,dy)=>{const n=fbm(dx*2+3,dy*6);return mix(hx('#e8a040'),hx('#c07a28'),n>.5?.7:.1)},
 jupiter:(dx,dy)=>{if(Math.hypot((dx-.3)*1.6,(dy-.35)*3)<.3)return hx('#c8583a');const b=Math.sin(dy*13+fbm(dx*3,dy*6)*2.4);return b>.5?hx('#f0e2c8'):b>-.2?hx('#d8a878'):b>-.7?hx('#a86a48'):hx('#ece4d4')},
 saturn:(dx,dy)=>{const b=Math.sin(dy*11+fbm(dx*2,dy*5)*1.2);return b>.3?hx('#f0dca0'):hx('#d4b878')}};
function planet(R,kind,ring){const P=R+2,S=2*P,cw=ring?Math.round(R*2.3)*2+4:S,ox=(cw-S)/2;
 return mk(cw,S,(g)=>{const id=g.createImageData(cw,S),d=id.data;const put=(x,y,c)=>{if(x<0||y<0||x>=cw||y>=S)return;const k=(y*cw+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255};
  const ringPts=(front)=>{if(!ring)return;const rc=[hx('#e8d8a8'),hx('#b89a68'),hx('#d8c490')];for(let k=0;k<3;k++){const rx=R*(1.55+k*.28),ry=rx*.28;for(let t=0;t<6.283;t+=.6/rx){const s=Math.sin(t);if((s>0)!=front)continue;put(Math.round(cw/2+Math.cos(t)*rx-.5),Math.round(P+s*ry-.5),rc[k])}}};
  ringPts(false);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(x-P+.5)/R,dy=(y-P+.5)/R,d2=dx*dx+dy*dy;if(d2>1)continue;const nz=Math.sqrt(1-d2);
   const l=clamp(-.6*dx-.45*dy+.65*nz+.12,0,1.2),q=Math.floor(l*4+thr(x,y))/4;const c=PT[kind](dx,dy,nz);put(x+ox,y,c.map(v=>clamp(v*(.12+.9*q),0,255)))}
  ringPts(true);g.putImageData(id,0,0)})}
