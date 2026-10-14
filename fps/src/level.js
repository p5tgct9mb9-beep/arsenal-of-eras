'use strict';
function genLevel(ei,li){const S=48;
 for(let tr=0;tr<500;tr++){const r=rng(1000+ei*131+li*17+tr*7919),ri=(a,b)=>a+Math.floor(r()*(b-a+1));
  const g=new Uint8Array(S*S).fill(1),n=6+li,boss=li==2,rooms=[];let ok=true;
  const wallAt=(x,y)=>x>0&&y>0&&x<S-1&&y<S-1&&g[y*S+x]>=1&&g[y*S+x]<=4;
  const carve=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)g[j*S+i]=0};
  for(let k=0;k<n;k++){let w=ri(5,9),h=ri(5,9);if(k==0){w=5;h=5}if(boss&&k==n-1){w=13;h=13}
   if(k==0){rooms.push({x:21,y:21,w,h,d:0});carve(21,21,w,h);continue}
   const pr=rooms[k-1];let placed=false;
   for(let a=0;a<40&&!placed;a++){const d=ri(0,3),gap=ri(2,4);let nx,ny,cells=[];
    if(d<2){ny=pr.y+ri(0,pr.h+h-2)-(h-1);nx=d==0?pr.x+pr.w+gap:pr.x-gap-w;const lo=Math.max(pr.y,ny),hi=Math.min(pr.y+pr.h,ny+h)-1;if(hi<lo)continue;const cy=ri(lo,hi);
     const x0=d==0?pr.x+pr.w:nx+w,x1=d==0?nx-1:pr.x-1;for(let x=x0;x<=x1;x++)cells.push([x,cy,0])}
    else{nx=pr.x+ri(0,pr.w+w-2)-(w-1);ny=d==2?pr.y+pr.h+gap:pr.y-gap-h;const lo=Math.max(pr.x,nx),hi=Math.min(pr.x+pr.w,nx+w)-1;if(hi<lo)continue;const cx=ri(lo,hi);
     const y0=d==2?pr.y+pr.h:ny+h,y1=d==2?ny-1:pr.y-1;for(let y=y0;y<=y1;y++)cells.push([cx,y,1])}
    if(nx<2||ny<2||nx+w>S-2||ny+h>S-2)continue;let bad=false;
    for(let j=ny-1;j<=ny+h&&!bad;j++)for(let i=nx-1;i<=nx+w;i++)if(!wallAt(i,j)){bad=true;break}
    for(const[x,y,v]of cells){if(!wallAt(x,y)||(v?(!wallAt(x-1,y)||!wallAt(x+1,y)):(!wallAt(x,y-1)||!wallAt(x,y+1))))bad=true}
    if(bad)continue;carve(nx,ny,w,h);for(const[x,y]of cells)g[y*S+x]=0;const dc=cells[cells.length>>1];g[dc[1]*S+dc[0]]=5;
    rooms.push({x:nx,y:ny,w,h,d,door:dc[1]*S+dc[0]});placed=true}
   if(!placed){ok=false;break}}
  if(!ok)continue;
  const redK=Math.max(2,Math.floor(n*.45)),blueK=Math.max(redK+1,Math.floor(n*.78));g[rooms[redK].door]=6;g[rooms[blueK].door]=7;
  // textures + pillars
  const pil=new Set();
  rooms.forEach((rm,k)=>{const t=ri(1,4);rm.tex=t;for(let j=rm.y-1;j<=rm.y+rm.h;j++)for(let i=rm.x-1;i<=rm.x+rm.w;i++){const v=g[j*S+i];if(v>=1&&v<=4)g[j*S+i]=t}
   if(k>0&&rm.w>=7&&rm.h>=7)for(const[i,j]of[[rm.x+2,rm.y+2],[rm.x+rm.w-3,rm.y+2],[rm.x+2,rm.y+rm.h-3],[rm.x+rm.w-3,rm.y+rm.h-3]]){g[j*S+i]=ri(1,4);pil.add(j*S+i)}});
  const last=rooms[n-1];let ex,ey;const d=last.d;
  if(d==0){ex=last.x+last.w;ey=last.y+(last.h>>1)}else if(d==1){ex=last.x-1;ey=last.y+(last.h>>1)}else if(d==2){ex=last.x+(last.w>>1);ey=last.y+last.h}else{ex=last.x+(last.w>>1);ey=last.y-1}
  g[ey*S+ex]=8;
  const used=new Set();const freeCell=(rm)=>{for(let t=0;t<60;t++){const i=ri(rm.x,rm.x+rm.w-1),j=ri(rm.y,rm.y+rm.h-1),id=j*S+i;if(g[id]===0&&!used.has(id)){used.add(id);return[i+.5,j+.5]}}return null};
  const r0=rooms[0],a=[0,Math.PI,Math.PI/2,-Math.PI/2][rooms[1].d];used.add((r0.y+2)*S+r0.x+2);
  const ents=[],picks=[];const addE=(type,rm)=>{const c=freeCell(rm);if(c)ents.push({type,x:c[0],y:c[1]})};const addP=(kind,rm)=>{const c=freeCell(rm);if(c)picks.push({kind,x:c[0],y:c[1]})};
  for(let k=1;k<n;k++){const rm=rooms[k];const isBoss=boss&&k==n-1;
   if(isBoss){used.add((rm.y+(rm.h>>1))*S+rm.x+(rm.w>>1));ents.push({type:'boss',x:rm.x+rm.w/2,y:rm.y+rm.h/2});addE('soldier',rm);addE('officer',rm);addP('ammo',rm);addP('ammo',rm);addP('hp',rm);addP('hp',rm);addP('gren',rm);addP('armor',rm);continue}
   const cnt=Math.min(6,1+ri(0,1+li));for(let i=0;i<cnt;i++)addE(r()<.2+li*.05?'officer':'soldier',rm);
   if(k==(n>>1))addE('turret',rm);if(li>=1&&k==n-2&&!boss)addE('vehicle',rm);if(boss&&k==n-3)addE('vehicle',rm);
   if(r()<.55)addP('hp',rm);if(r()<.6)addP('ammo',rm);if(r()<.18)addP('armor',rm);if(r()<.22)addP('gren',rm)}
  addP('keyR',rooms[ri(1,redK-1)]);addP('keyB',rooms[ri(redK,blueK-1)]);
  return{S,g,rooms,ents,picks,start:{x:r0.x+2.5,y:r0.y+2.5,a},exit:[ex,ey],door:new Float32Array(S*S),boss}}
 throw new Error('levelgen failed')}
