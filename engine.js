'use strict';
// Arsenal of Eras - HD preview. 640x360 pixel scene, 3x scaled to 1920x1080, HUD at full res.
const W=640,H=360,S=3;
const C=document.getElementById('c'),X=C.getContext('2d');
const STYLES=['retro','hd','psp','vita'];const STYLE=(()=>{const m=/style=(retro|hd|psp|vita)/.exec(location.search);if(m)return m[1];if(/retro=1/.test(location.search))return'retro';try{const s=localStorage.getItem('aoe_style');if(STYLES.includes(s))return s;if(localStorage.getItem('aoe_retro')=='1')return'retro'}catch(e){}return'hd'})();const RETRO=STYLE=='retro',NATIVE=STYLE=='psp'||STYLE=='vita';const GBA_K={retro:1,hd:3,psp:.75,vita:1.5}[STYLE];const L=document.createElement('canvas');L.width=W*GBA_K;L.height=H*GBA_K;const G=L.getContext('2d');
X.imageSmoothingEnabled=false;G.imageSmoothingEnabled=false;
// ---------- RNG / noise ----------
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const qs=new URLSearchParams(location.search);
let R=mulberry(+(qs.get('seed')||Date.now()%100000));
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
function n2(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y)=>n2(x,y)*.6+n2(x*2.1,y*2.1)*.3+n2(x*4.3,y*4.3)*.1;
const cl=v=>v<0?0:v>255?255:v|0;
const bay=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function lit(c,l,i,j){let b=l;if((PB.K||1)==1){b=l+(bay[(j&3)*4+(i&3)]/16-.5)*.16;b=Math.round(b*8)/8}
 return[cl(c[0]*b+(b>1?(b-1)*60:0)),cl(c[1]*b+(b>1?(b-1)*45:0)),cl(c[2]*b+(b<1?(1-b)*28:0))]}
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
// ---------- pixel buffer ----------
class PB{constructor(w,h){const k=PB.K||1;this.k=k;this.lw=w;this.lh=h;this.w=Math.round(w*k);this.h=Math.round(h*k);this.d=new Array(this.w*this.h).fill(null)}
 sr(x,y,c){if(x>=0&&y>=0&&x<this.w&&y<this.h)this.d[y*this.w+x]=c}
 set(x,y,c){const k=this.k;if(k==1){x|=0;y|=0;if(x>=0&&y>=0&&x<this.w&&y<this.h)this.d[y*this.w+x]=c;return}x=Math.floor(x);y=Math.floor(y);const X0=Math.round(x*k),Y0=Math.round(y*k),X1=Math.round((x+1)*k),Y1=Math.round((y+1)*k);for(let j=Y0;j<Y1;j++)for(let i=X0;i<X1;i++)this.sr(i,j,c)}
 get(x,y){const k=this.k;if(k!=1){x=Math.floor((Math.floor(x)+.5)*k);y=Math.floor((Math.floor(y)+.5)*k)}return(x>=0&&y>=0&&x<this.w&&y<this.h)?this.d[y*this.w+x]:null}
 ell(cx,cy,rx,ry,f){const k=this.k;if(k!=1){cx*=k;cy*=k;rx*=k;ry*=k}for(let j=Math.floor(cy-ry);j<=cy+ry;j++)for(let i=Math.floor(cx-rx);i<=cx+rx;i++){const dx=(i+.5-cx)/rx,dy=(j+.5-cy)/ry,r=dx*dx+dy*dy;if(r<=1)this.sr(i,j,f(i/k,j/k,dx,dy,r))}}
 rect(x,y,w,h,f){const k=this.k;if(k==1){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)this.set(i,j,f(i,j,(i-x)/(w-1||1)*2-1,(j-y)/(h-1||1)*2-1));return}
  const X0=Math.round(x*k),Y0=Math.round(y*k),X1=Math.round((x+w)*k),Y1=Math.round((y+h)*k);for(let j=Y0;j<Y1;j++)for(let i=X0;i<X1;i++)this.sr(i,j,f(i/k,j/k,(i-X0)/(X1-X0-1||1)*2-1,(j-Y0)/(Y1-Y0-1||1)*2-1))}
 poly(p,f){const k=this.k;if(k!=1)p=p.map(([a,b])=>[a*k,b*k]);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[a,b]of p){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)}
  for(let j=Math.floor(y0);j<=y1;j++)for(let i=Math.floor(x0);i<=x1;i++){const px=i+.5,py=j+.5;let ins=false;
   for(let q=0,m=p.length-1;q<p.length;m=q++){const[xa,ya]=p[q],[xb,yb]=p[m];if((ya>py)!=(yb>py)&&px<(xb-xa)*(py-ya)/(yb-ya)+xa)ins=!ins}
   if(ins)this.sr(i,j,f(i/k,j/k,(i-x0)/(x1-x0||1)*2-1,(j-y0)/(y1-y0||1)*2-1))}}
 line(x0,y0,x1,y1,c){const k=this.k;if(k!=1){x0=(x0+.5)*k;y0=(y0+.5)*k;x1=(x1+.5)*k;y1=(y1+.5)*k;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1,t=Math.max(1,Math.round(k*.7));for(let q=0;q<=n;q++){const X=Math.floor(x0+(x1-x0)*q/n-t/2),Y=Math.floor(y0+(y1-y0)*q/n-t/2);const cc=typeof c=='function'?c(q/k):c;for(let a=0;a<t;a++)for(let b=0;b<t;b++)this.sr(X+a,Y+b,cc)}return}
  const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let q=0;q<=n;q++)this.set(Math.round(x0+(x1-x0)*q/n),Math.round(y0+(y1-y0)*q/n),typeof c=='function'?c(q):c)}
 outline(c){const passes=this.k>1?Math.max(1,Math.round(this.k*.75)):1;for(let p=0;p<passes;p++){const o=this.d.slice();for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++)if(!o[y*this.w+x]){
  if((x>0&&o[y*this.w+x-1])||(x<this.w-1&&o[y*this.w+x+1])||(y>0&&o[(y-1)*this.w+x])||(y<this.h-1&&o[(y+1)*this.w+x]))this.d[y*this.w+x]=c}}}
 canvas(white){const c=document.createElement('canvas');c.width=this.w;c.height=this.h;c.__lw=this.lw;c.__lh=this.lh;const g=c.getContext('2d'),id=g.createImageData(this.w,this.h);
  for(let k=0;k<this.d.length;k++){const p=this.d[k];if(p){id.data[k*4]=white?255:p[0];id.data[k*4+1]=white?255:p[1];id.data[k*4+2]=white?255:p[2];id.data[k*4+3]=p[3]==null?255:p[3]}}
  g.putImageData(id,0,0);return c}}
const OUT=[22,16,14];
// light helpers
const shE=(base,amb=1.05)=>(i,j,dx,dy,r)=>lit(typeof base=='function'?base(i,j):base,amb-.38*dy-.12*dx-(r>.78?.22:0),i,j);
const shR=(base,amb=1.05,k=.32)=>(i,j,nx,ny)=>lit(typeof base=='function'?base(i,j):base,amb-k*ny-(Math.abs(ny)>.92?(ny<0?-.18:.25):0),i,j);
function cog(pb,cx,cy,r,col,hub){for(let a=0;a<12;a++){const t=a/12*Math.PI*2;for(let s=-1;s<=1;s++)for(let q=r-1;q<=r+2;q++)pb.set(cx+Math.cos(t+s*.09)*q,cy+Math.sin(t+s*.09)*q,lit(col,.8,0,0))}
 pb.ell(cx,cy,r,r,shE(col,1.1));pb.ell(cx,cy,r*.5,r*.5,()=>hub);pb.ell(cx,cy,r*.25,r*.25,shE(col,1.2))}
const AR=mulberry(1234);let parts=[],shake=0,fade=0;
// ---------- input ----------
const keys={},jp=new Set();
addEventListener('keydown',e=>{if(!keys[e.code])jp.add(e.code);keys[e.code]=true;if(e.code.startsWith('Arrow')||e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);
let gpPrev={};const gpState={};
function pollPad(){const pads=navigator.getGamepads?navigator.getGamepads():[];const p=pads&&pads[0];const n={};
 if(p){n.up=p.axes[1]<-.5||p.buttons[12]?.pressed;n.down=p.axes[1]>.5||p.buttons[13]?.pressed;n.left=p.axes[0]<-.5||p.buttons[14]?.pressed;n.right=p.axes[0]>.5||p.buttons[15]?.pressed;n.a=p.buttons[0]?.pressed||p.buttons[9]?.pressed;n.b=p.buttons[1]?.pressed}
 for(const k in n)if(n[k]&&!gpPrev[k])jp.add('pad_'+k);Object.assign(gpState,n);gpPrev=n}
const held=d=>({up:keys.ArrowUp||keys.KeyW,down:keys.ArrowDown||keys.KeyS,left:keys.ArrowLeft||keys.KeyA,right:keys.ArrowRight||keys.KeyD}[d]||gpState[d]);
const conf=()=>jp.has('Enter')||jp.has('Space')||jp.has('KeyZ')||jp.has('pad_a');
const pr=d=>jp.has({up:'ArrowUp',down:'ArrowDown'}[d])||jp.has({up:'KeyW',down:'KeyS'}[d])||jp.has('pad_'+d);
// ---------- particles ----------
function spawn(p){parts.push(Object.assign({t:0,life:30},p))}
function flash(x,y,s=1){spawn({k:'flash',x,y,s,life:5})}
function boom(x,y,s=1){shake=Math.max(shake,6*s);spawn({k:'boom',x,y,s,life:28});for(let i=0;i<10*s;i++){const a=R()*6.283,v=(.5+R()*2)*s;spawn({k:'debris',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:30+R()*20|0})}
 for(let i=0;i<4*s;i++)spawn({k:'smoke',x:x+(R()-.5)*14*s,y:y+(R()-.5)*10*s,vy:-.3,r:4*s,life:60+R()*30|0})}
function updParts(){for(const p of parts){p.t++;if(p.vx!=null){p.x+=p.vx;p.y+=p.vy}if(p.k=='debris')p.vy+=.08;
 if(p.k=='tracer'||p.k=='rocket'||p.k=='shell'){if(p.k=='rocket'&&p.t%2==0)spawn({k:'smoke',x:p.x,y:p.y,vy:-.1,r:2.5,life:30});if(p.t>=p.life&&p.onHit)p.onHit(p)}}
 parts=parts.filter(p=>p.t<p.life)}
function drawParts(){for(const p of parts){const f=p.t/p.life;
 if(p.k=='smoke'){G.fillStyle=`rgba(${60+f*60|0},${58+f*60|0},${56+f*60|0},${(1-f)*.7})`;const r=p.r*(1+f*1.5)|0;G.fillRect(p.x-r|0,p.y-r|0,r*2,r*2);G.fillRect((p.x-r-1)|0,(p.y-r+2)|0,r*2+2,r*2-4)}
 else if(p.k=='flash'){const r=(6*p.s*(1-f*.5))|0;G.fillStyle='#fff6c0';G.fillRect(p.x-r|0,p.y-1|0,r*2,3);G.fillRect(p.x-1|0,p.y-r|0,3,r*2);G.fillStyle='#ffb030';G.fillRect(p.x-r/2|0,p.y-r/2|0,r,r);G.fillStyle='#fffbe8';G.fillRect(p.x-1|0,p.y-1|0,3,3)}
 else if(p.k=='boom'){const r=(4+f*14)*p.s|0;const cols=['#fff8d0','#ffd050','#ff8a20','#c43a10','#4a2a20'];G.fillStyle=cols[Math.min(4,f*5|0)];
  for(let a=0;a<8;a++){const t=a*.785+p.x,rr=r*(.6+hash(a,p.x|0)*.5);G.fillRect(p.x+Math.cos(t)*rr*.5-rr/2|0,p.y+Math.sin(t)*rr*.4-rr/2|0,rr|0,rr|0)}
  if(f<.5){G.fillStyle='#fff';G.fillRect(p.x-r/4|0,p.y-r/4|0,r/2|0,r/2|0)}}
 else if(p.k=='debris'){G.fillStyle=p.t<10?'#ffd060':'#3a2a20';G.fillRect(p.x|0,p.y|0,2,2)}
 else if(p.k=='tracer'||p.k=='shell'){const dx=p.vx,dy=p.vy,n=p.k=='shell'?3:2.5;G.strokeStyle=p.c||'#ffe070';G.lineWidth=p.w||1;G.beginPath();G.moveTo(p.x|0,p.y|0);G.lineTo((p.x-dx*n)|0,(p.y-dy*n)|0);G.stroke();G.fillStyle='#fff';G.fillRect(p.x|0,p.y|0,p.w||1,p.w||1)}
 else if(p.k=='rocket'){G.fillStyle='#d8d8d0';G.fillRect(p.x-4|0,p.y-1|0,6,2);G.fillStyle='#ffb040';G.fillRect(p.x-7|0,p.y-1|0,3,2)}
 else if(p.k=='flak'){const r=(3+f*10)|0;G.fillStyle=`rgba(20,20,20,${1-f})`;G.fillRect(p.x-r|0,p.y-r|0,r*2,r*2);if(f<.2){G.fillStyle='#ff9030';G.fillRect(p.x-2|0,p.y-2|0,4,4)}}
 else if(p.k=='fire'){G.fillStyle=['#fff0a0','#ffa030','#d04010'][Math.min(2,f*3|0)];G.fillRect(p.x|0,p.y|0,2,2)}}}
// ---------- HUD (full res) ----------
function panel(x,y,w,h,a=.85){X.fillStyle=`rgba(12,16,24,${a})`;X.strokeStyle='#e8d8a0';X.lineWidth=6;X.beginPath();X.roundRect(x,y,w,h,18);X.fill();X.stroke();X.strokeStyle='#3a3020';X.lineWidth=2;X.beginPath();X.roundRect(x+8,y+8,w-16,h-16,12);X.stroke()}
function hpBar(x,y,w,v,m){const f=v/m;X.fillStyle='#111';X.fillRect(x,y,w,30);const c=f>.5?['#5ef070','#2aa040']:f>.2?['#ffe060','#c09010']:['#ff6050','#b02010'];
 const g=X.createLinearGradient(0,y,0,y+30);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);X.fillStyle=g;X.fillRect(x+3,y+3,(w-6)*f,24);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(x+3,y+3,(w-6)*f,6);
 for(let i=1;i<10;i++){X.fillStyle='rgba(0,0,0,.35)';X.fillRect(x+w*i/10,y+3,2,24)}}
