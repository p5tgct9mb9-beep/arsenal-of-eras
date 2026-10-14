const REC={on:0,depth:0,tag:null,parts:[]};const recP=p=>{if(REC.on&&!REC.depth)REC.parts.push(p)};
'use strict';
// ---- "Realistic pixel" pass: accurate side-view silhouettes for all picker vehicles/aircraft.
// 7-step ramps, top-light + edge highlights, panel lines, rivets, road wheels/tracks, weathering. Native 640x360.
const RLC=new Map();
function rRamp(b){const k=b.join();if(RLC.has(k))return RLC.get(k);const r=[mix(b,[14,16,22],.72),mix(b,[18,20,26],.52),mix(b,[24,26,32],.3),b,mix(b,[250,244,222],.13),mix(b,[255,250,232],.28),mix(b,[255,252,242],.46)].map(c=>c.map(v=>v|0));RLC.set(k,r);return r}
const rTone=(b,l,i,j)=>{const r=rRamp(b);if((PB.K||1)>1){const t=Math.max(0,Math.min(5.999,l*6)),a=t|0,f=t-a;const A=r[a],B=r[a+1];return[A[0]+(B[0]-A[0])*f|0,A[1]+(B[1]-A[1])*f|0,A[2]+(B[2]-A[2])*f|0]}l+=(bay[(j&3)*4+(i&3)]/16-.5)*.06;return r[Math.max(0,Math.min(6,Math.round(l*6)))]};
const RSPEC={psp:.3,vita:.22};
// filled part with ramp shading + bevel (top/left lit edge, bottom/right shadow edge)
function rPart(pb,pts,base,o={}){const S=new Map(),w=pb.w,K=pb.k||1,spec=K>1?(RSPEC[STYLE]||0):0,top=o.top!=null?o.top:.74,bot=o.bot!=null?o.bot:.36;
 const ix=(i,j)=>K==1?j*w+i:Math.round(j*K)*w+Math.round(i*K);const f=(i,j,nx,ny)=>{const t=(ny+1)/2;let l=top+(bot-top)*t+(o.lx||0)*nx;if(o.round)l-=Math.abs(ny)*o.round;if(spec)l+=spec*Math.exp(-(((t-.16)/.09)**2));S.set(ix(i,j),l);return[0,0,0]};
 if(o.ell)pb.ell(o.ell[0],o.ell[1],o.ell[2],o.ell[3],(i,j,dx,dy)=>{let l=(o.top!=null?o.top:.62)-.32*dy-.1*dx;if(spec)l+=spec*1.3*Math.exp(-(((dx+.35)/.3)**2+((dy+.45)/.25)**2));S.set(ix(i,j),l);return[0,0,0]});else pb.poly(pts,f);
 const bev=o.bev!=null?o.bev:1,bw=K>1?Math.max(1,Math.round(K*.7)):1,has=(q,d)=>{for(let z=1;z<=bw;z++)if(!S.has(q+d*z))return false;return true};
 for(const[idx,l0]of S){const i=idx%w,j=idx/w|0;let l=l0;if(bev){if(!has(idx,-w))l+=.28*bev;else if(!has(idx,w))l-=.22*bev;if(!has(idx,-1)&&S.has(idx-w))l+=.08*bev;if(!has(idx,1))l-=.1*bev}
  const b=typeof base=='function'?base(i/K,j/K):base;pb.d[idx]=rTone(b,l,i,j)}return S}
const rE=(pb,cx,cy,rx,ry,base,o={})=>rPart(pb,null,base,Object.assign({ell:[cx,cy,rx,ry]},o));
const rR=(pb,x,y,w,h,base,o)=>rPart(pb,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],base,o);
const rDk=(c,f=.35)=>mix(c,[10,10,14],f).map(v=>v|0),rLt=(c,f=.25)=>mix(c,[255,250,232],f).map(v=>v|0);
function rLine(pb,x0,y0,x1,y1,hl=1){if((pb.k||1)>1){const k=pb.k,X0=(x0+.5)*k,Y0=(y0+.5)*k,X1=(x1+.5)*k,Y1=(y1+.5)*k,n=Math.max(Math.abs(X1-X0),Math.abs(Y1-Y0))|0||1,vert=Math.abs(X1-X0)<Math.abs(Y1-Y0);for(let q=0;q<=n;q++){const x=Math.round(X0+(X1-X0)*q/n),y=Math.round(Y0+(Y1-Y0)*q/n),id=y*pb.w+x;if(x<0||y<0||x>=pb.w||y>=pb.h)continue;const p=pb.d[id];if(!p)continue;pb.d[id]=rDk(p,.45);if(hl){const id2=vert?id+1:id+pb.w,q2=pb.d[id2];if(q2)pb.d[id2]=rLt(q2,.16)}}return}const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n),p=pb.get(x,y);if(!p)continue;pb.set(x,y,rDk(p,.4));
 if(hl){const q=x0==x1?pb.get(x+1,y):pb.get(x,y+1);if(q)x0==x1?pb.set(x+1,y,rLt(q,.14)):pb.set(x,y+1,rLt(q,.14))}}}
function rRiv(pb,x0,y,x1,st){for(let x=x0;x<=x1;x+=st){const p=pb.get(x,y);if(p){pb.set(x,y,rLt(p,.35));const q=pb.get(x,y+1);if(q)pb.set(x,y+1,rDk(q,.35))}}}
function rSolid(pb,pts,c){pb.poly(pts,()=>c)}
// road wheel: tyre, dished disc, hub, bolts
function rWheel(pb,x,y,r,base,o={}){const tyre=o.tyre||[40,40,38];rE(pb,x,y,r,r,tyre,{top:.5,bev:0});rE(pb,x,y,r*(o.disc||.74),r*(o.disc||.74),base,{top:.55});pb.ell(x,y,r*.5,r*.5,(i,j,dx,dy)=>rTone(base,.42+.3*dy,i,j));
 rE(pb,x,y,Math.max(1.2,r*.24),Math.max(1.2,r*.24),base,{top:.75});const nb=o.bolts||(r>6?6:0);for(let k=0;k<nb;k++){const a=k/nb*6.283;pb.set(Math.round(x+Math.cos(a)*r*.38),Math.round(y+Math.sin(a)*r*.38),rRamp(base)[6])}}
function rTyre(pb,x,y,r,base){rE(pb,x,y,r,r,[38,38,36],{top:.55,bev:0});for(let k=0;k<12;k++){const a=k/12*6.283;pb.set(Math.round(x+Math.cos(a)*(r-.6)),Math.round(y+Math.sin(a)*(r-.6)),[22,22,22])}rE(pb,x,y,r*.56,r*.56,base,{top:.6});rE(pb,x,y,r*.2,r*.2,base,{top:.3,bev:0});
 for(let k=0;k<6;k++){const a=k/6*6.283;pb.set(Math.round(x+Math.cos(a)*r*.38),Math.round(y+Math.sin(a)*r*.38),rRamp(base)[1])}}
// track run: outer links with grousers, dark interior
function rTrack(pb,x0,x1,yt,yb,o={}){const ch=o.ch||6,fl=o.fl||0;const pts=[[x0+ch,yt],[x1-ch,yt+fl],[x1,yt+ch+fl],[x1-ch-2,yb],[x0+ch+2,yb],[x0,yt+ch]];const T=[58,56,52];
 rPart(pb,pts,T,{top:.4,bot:.3,bev:0});pb.poly(pts.map(([a,b])=>[a+(a<(x0+x1)/2?3:-3),b+(b<(yt+yb)/2?3:-3)]),()=>[20,20,20]);
 for(let x=x0+ch;x<x1-ch;x+=3){pb.set(x,yt,rRamp(T)[5]);pb.set(x,yb-1,rRamp(T)[1]);pb.set(x+1,yb,[22,22,22])}}
function rStar(pb,cx,cy,r){const p=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.42:r;p.push([cx+.5+Math.cos(a)*rr,cy+.5+Math.sin(a)*rr])}pb.poly(p,(i,j)=>pb.get(i,j)?[214,212,196]:null)}
// weathering: dust toward the bottom, noise mottling, paint chips
function rWeather(pb,dust,amt=1){const h=pb.h,K=pb.k||1;for(let j=0;j<h;j++)for(let i=0;i<pb.w;i++){const p=pb.d[j*pb.w+i];if(!p)continue;let c=p;const n=fbm(i/K*.07,j/K*.09),t=Math.max(0,(j/h-.6)/.4)*.38*amt+(n>.64?.1*amt:0);
 c=mix(c,dust,Math.min(.6,t*(.5+n)));const hh=hash((i/K|0)*7+3,(j/K|0)*13+5);if(hh<.004*amt)c=mix(c,[30,28,24],.45);else if(hh>1-.003*amt)c=mix(c,[230,224,200],.25);pb.d[j*pb.w+i]=c.map(v=>v|0)}}
function rCamo(cols,sc=.06,seed=0){return(i,j)=>{const a=fbm(i*sc+seed,j*sc*1.6+seed),b=fbm(i*sc*1.3+40+seed,j*sc*1.8+11);return a>.6?cols[1]:(cols[2]&&b>.63)?cols[2]:cols[0]}}
function rFin(pb,o){pb.outline(OUT);return pb}
// ---------------- palettes ----------------
const RP={od:[82,86,50],od2:[96,98,60],tan:[178,158,112],tan2:[194,176,130],nato:[[64,74,48],[88,72,50],[34,34,30]],grn:[70,80,52],steel:[96,96,92],dust:[156,138,104],
 fgray:[126,132,140],lgray:[150,158,166],dgray:[96,100,108],metal:[174,178,182],navy:[48,60,94],white:[214,216,220]};
// ===================== LAND (150x72, faces right, ground y=71) =====================
function rLandBase(){return new PB(150,72)}
function rVVSS(pb,M){for(const bx of[40,72,104]){rR(pb,bx-9,53,18,6,M,{top:.6});rE(pb,bx,53,2.2,2.2,RP.steel);rWheel(pb,bx-6,63,6,M,{disc:.7});rWheel(pb,bx+6,63,6,M,{disc:.7})}}
function rSprocket(pb,x,y,r,M){rE(pb,x,y,r,r,[50,50,48],{top:.5});for(let k=0;k<10;k++){const a=k/10*6.283;pb.set(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r),[30,30,28])}rE(pb,x,y,r*.6,r*.6,M);rE(pb,x,y,1.5,1.5,RP.steel)}
function mkRSherman(){const pb=rLandBase(),M=RP.od;rTrack(pb,10,140,52,71,{ch:7});rSprocket(pb,133,58,6,M);rWheel(pb,17,61,5.5,M);rVVSS(pb,M);
 rPart(pb,[[14,38],[110,36],[142,50],[142,54],[12,54],[10,42]],M,{top:.78,bot:.42});rPart(pb,[[110,36],[142,50],[140,52],[108,38]],M,{top:.9,bot:.8});
 rLine(pb,14,46,140,46);for(let x=30;x<110;x+=26)rLine(pb,x,38,x,46);rRiv(pb,16,40,104,8);rR(pb,12,51,130,2,rDk(M,.2),{bev:0});
 rPart(pb,[[114,40],[124,44],[124,47],[114,43]],rDk(M,.1));rR(pb,138,45,5,4,[200,196,170],{top:.8});rStar(pb,60,44,4);
 rPart(pb,[[18,32],[40,30],[44,36],[16,38]],[108,104,74],{top:.7}); // tarp
 rPart(pb,[[54,36],[58,20],[68,13],[94,12],[104,16],[108,28],[106,36]],M,{top:.86,bot:.34,round:.15});rR(pb,103,17,8,11,M,{top:.7});
 rR(pb,68,8,13,5,M,{top:.85});rR(pb,85,10,8,3,rDk(M,.1));pb.line(74,6,92,4,[34,34,32]);pb.line(74,5,92,3,[70,70,66]);rR(pb,72,6,3,3,[40,40,38]);antenna(pb,58,0,22,[46,46,44]);rRiv(pb,60,30,100,8);
 rWeather(pb,RP.dust);pb.piv=[106,22];return rFin(pb)}
function mkRHellcat(){const pb=rLandBase(),M=RP.od2;rTrack(pb,10,140,54,71,{ch:7});rSprocket(pb,134,59,6,M);rWheel(pb,16,61,5,M);for(let k=0;k<5;k++)rWheel(pb,30+k*23,63,7.5,M,{disc:.72});for(const x of[42,76,110])rE(pb,x,55,1.8,1.8,RP.steel);
 rPart(pb,[[10,38],[100,36],[144,48],[142,56],[10,56]],M,{top:.8,bot:.42});rLine(pb,12,48,138,48);rRiv(pb,14,40,96,9);rPart(pb,[[100,36],[144,48],[141,50],[99,38]],M,{top:.95,bot:.85});
 rPart(pb,[[48,36],[56,22],[100,21],[110,34]],M,{top:.84,bot:.4});rR(pb,58,21,40,3,[30,30,28],{bev:0});rR(pb,104,22,7,9,M,{top:.7});rR(pb,20,30,26,6,[110,104,76],{top:.7});rR(pb,64,14,6,8,[40,40,38]);
 rStar(pb,72,30,4);rWeather(pb,RP.dust);pb.piv=[106,26];return rFin(pb)}
function mkRHalftrack(){const pb=rLandBase(),M=RP.od;rTrack(pb,14,92,54,71,{ch:7});for(let k=0;k<4;k++)rWheel(pb,30+k*16,62,6.5,M);rSprocket(pb,86,59,5.5,M);rWheel(pb,20,60,5,M);
 rPart(pb,[[10,28],[100,28],[104,54],[12,56]],M,{top:.8,bot:.4});rLine(pb,12,40,102,40);for(let x=28;x<100;x+=24)rLine(pb,x,29,x,54);rRiv(pb,14,31,98,6);
 rPart(pb,[[100,36],[130,38],[142,44],[144,56],[100,56]],M,{top:.86,bot:.42});rR(pb,140,44,4,10,rDk(M,.25));for(let y=45;y<54;y+=2)pb.line(140,y,143,y,[30,30,28]);rR(pb,100,24,4,14,M,{top:.9});
 rR(pb,130,52,16,6,[60,58,52]);rR(pb,92,46,20,4,rDk(M,.15));rTyre(pb,124,61,10,M);rR(pb,92,20,10,6,[44,44,42]);rStar(pb,56,46,4);rWeather(pb,RP.dust);pb.piv=[96,20];return rFin(pb)}
function mkRPriest(){const pb=rLandBase(),M=RP.od;rTrack(pb,10,140,52,71,{ch:7});rSprocket(pb,133,58,6,M);rWheel(pb,17,61,5.5,M);rVVSS(pb,M);
 rPart(pb,[[14,30],[100,30],[142,50],[142,54],[12,54],[10,40]],M,{top:.78,bot:.42});rR(pb,16,30,84,2,[34,34,30],{bev:0});rLine(pb,14,44,138,44);rRiv(pb,18,34,96,8);
 rPart(pb,[[96,32],[112,32],[114,42],[96,42]],M,{top:.8});rPart(pb,[[106,12],[122,12],[122,36],[108,38]],M,{top:.86,bot:.4,round:.1});rR(pb,105,10,18,3,[44,44,40]);pb.line(110,8,128,6,[34,34,32]);
 rPart(pb,[[20,22],[60,22],[62,30],[18,30]],[104,100,70]);rStar(pb,56,44,4);rWeather(pb,RP.dust);pb.piv=[104,34];return rFin(pb)}
function mkRJeep(){const pb=rLandBase(),M=RP.od;rPart(pb,[[36,44],[86,44],[90,38],[128,40],[136,46],[134,58],[34,58]],M,{top:.86,bot:.42});
 rR(pb,128,42,8,14,rDk(M,.1));for(let x=129;x<136;x+=2)pb.line(x,43,x,54,[28,28,26]);rR(pb,126,44,3,3,[210,206,180]);rPart(pb,[[92,24],[96,24],[96,40],[92,40]],[52,54,50]);rR(pb,93,26,2,12,[120,150,170],{bev:0});
 rTyre(pb,54,61,9.5,M);rTyre(pb,110,61,9.5,M);rPart(pb,[[44,40],[66,40],[66,46],[44,46]],[60,60,56]);rE(pb,32,48,7,7,[38,38,36],{top:.5});rR(pb,70,26,4,16,[52,52,50]);rR(pb,64,24,16,5,[40,40,38]);rStar(pb,104,49,3);
 rWeather(pb,RP.dust);pb.piv=[78,26];return rFin(pb)}
function mkRM60(){const pb=rLandBase(),M=[78,84,56];rTrack(pb,8,142,54,71,{ch:7});rSprocket(pb,135,59,6,M);rWheel(pb,15,61,5.5,M);for(let k=0;k<6;k++)rWheel(pb,28+k*19,64,7,M,{disc:.72});for(const x of[44,74,104])rE(pb,x,55,2,2,RP.steel);
 rPart(pb,[[10,38],[112,36],[146,46],[142,56],[10,56]],M,{top:.8,bot:.42});rR(pb,12,50,130,3,rDk(M,.15),{bev:0});for(let x=20;x<100;x+=20)rR(pb,x,44,16,6,M,{top:.7});rPart(pb,[[112,36],[146,46],[143,48],[110,38]],M,{top:.95,bot:.85});
 rPart(pb,[[42,36],[50,24],[66,17],[100,16],[118,24],[120,30],[108,36]],M,{top:.86,bot:.36,round:.12});rR(pb,24,26,20,10,[90,86,62]);rLine(pb,52,30,112,30);rRiv(pb,56,22,104,10);
 rPart(pb,[[60,10],[82,10],[84,17],[58,17]],M,{top:.86});rR(pb,64,6,6,4,[40,40,38]);pb.line(72,8,90,7,[34,34,32]);rR(pb,90,10,10,7,[38,40,40]);rR(pb,91,11,8,5,[110,130,140],{bev:0});antenna(pb,46,0,24,[44,44,42]);
 rWeather(pb,RP.dust);pb.piv=[118,25];return rFin(pb)}
function mkRM113(){const pb=rLandBase(),M=[74,82,54];rTrack(pb,10,140,56,71,{ch:6});rSprocket(pb,134,60,5.5,M);rWheel(pb,16,62,5,M);for(let k=0;k<5;k++)rWheel(pb,30+k*22,64,6.5,M);
 rPart(pb,[[10,18],[114,18],[146,42],[146,52],[142,58],[10,58]],M,{top:.8,bot:.42,lx:.04});rPart(pb,[[114,18],[146,42],[143,44],[112,20]],M,{top:.95,bot:.85});rLine(pb,12,46,142,46);rLine(pb,30,19,30,57);rLine(pb,90,19,90,57);
 rPart(pb,[[118,30],[134,42],[134,46],[118,36]],rDk(M,.12));rRiv(pb,14,22,110,6);rRiv(pb,14,54,140,6);rR(pb,62,10,12,8,M,{top:.85});rPart(pb,[[68,6],[78,4],[78,12],[68,12]],M,{top:.8});antenna(pb,20,0,18,[44,44,42]);
 rWeather(pb,RP.dust);pb.piv=[72,10];return rFin(pb)}
function mkRSheridan(){const pb=rLandBase(),M=[72,80,52];rTrack(pb,10,140,54,71,{ch:7});rSprocket(pb,134,59,6,M);rWheel(pb,16,61,5,M);for(let k=0;k<5;k++)rWheel(pb,30+k*23,63,8,M,{disc:.7});
 rPart(pb,[[10,38],[106,36],[144,46],[142,56],[10,56]],M,{top:.8,bot:.42});rLine(pb,12,48,140,48);rRiv(pb,14,42,100,9);rPart(pb,[[106,36],[144,46],[141,48],[104,38]],M,{top:.95,bot:.85});
 rPart(pb,[[48,36],[54,22],[64,17],[100,17],[110,26],[108,36]],M,{top:.86,bot:.36,round:.1});rR(pb,106,20,8,12,M,{top:.7});rR(pb,66,10,14,7,M);rPart(pb,[[80,10],[92,10],[94,16],[80,16]],[60,62,58]);antenna(pb,52,0,22,[44,44,42]);rR(pb,22,28,22,8,[96,90,66]);
 rWeather(pb,RP.dust);pb.piv=[110,25];return rFin(pb)}
function mkRM109(){const pb=rLandBase(),M=[78,86,56];rTrack(pb,8,142,56,71,{ch:6});rSprocket(pb,136,60,5.5,M);rWheel(pb,14,62,5,M);for(let k=0;k<7;k++)rWheel(pb,26+k*17,64,6.5,M);
 rPart(pb,[[10,40],[112,40],[146,50],[144,58],[10,58]],M,{top:.8,bot:.42});rLine(pb,12,50,140,50);rRiv(pb,14,44,108,8);
 rPart(pb,[[16,40],[18,14],[96,12],[112,20],[116,30],[110,40]],M,{top:.84,bot:.42,lx:.03});rLine(pb,40,13,40,40);rLine(pb,70,13,70,40);rR(pb,26,22,10,12,rDk(M,.15));rRiv(pb,20,16,92,8);
 rR(pb,74,6,12,6,M);pb.line(80,4,96,3,[34,34,32]);rR(pb,108,20,10,10,M,{top:.7});antenna(pb,22,0,14,[44,44,42]);rWeather(pb,RP.dust);pb.piv=[114,24];return rFin(pb)}
function mkRAbrams(){const pb=rLandBase(),M=RP.tan;rTrack(pb,6,144,56,71,{ch:6});for(let k=0;k<7;k++)rWheel(pb,20+k*18,65,6,M);rSprocket(pb,14,61,5,M);
 rPart(pb,[[8,36],[124,36],[148,44],[146,52],[8,52]],M,{top:.82,bot:.45});rPart(pb,[[124,36],[148,44],[146,46],[122,38]],M,{top:.95,bot:.85});
 rPart(pb,[[10,44],[142,44],[140,59],[12,59]],M,{top:.78,bot:.5});for(let x=30;x<140;x+=18)rLine(pb,x,45,x,58);rLine(pb,10,47,140,47);rRiv(pb,14,56,138,6);rR(pb,120,45,20,14,rLt(M,.04),{top:.8});
 rPart(pb,[[30,36],[36,22],[100,19],[128,26],[128,32],[110,36]],M,{top:.88,bot:.4});rPart(pb,[[100,19],[128,26],[126,28],[98,21]],M,{top:.98,bot:.9});rLine(pb,40,29,124,29);
 for(let x=14;x<34;x+=3)for(let y=22;y<34;y+=3)pb.set(x,y,[54,50,40]);rPart(pb,[[12,22],[34,22],[34,34],[12,34]],null||M,{top:.6,bot:.4,bev:.5});for(let x=14;x<34;x+=3)for(let y=24;y<34;y+=3)pb.set(x,y,[60,54,44]);
 rR(pb,96,14,12,6,M,{top:.85});rR(pb,98,15,8,3,[40,46,50]);rR(pb,62,14,14,6,M);pb.line(66,12,86,11,[34,34,32]);rR(pb,64,10,6,4,[46,46,42]);antenna(pb,40,2,22,[44,44,42]);antenna(pb,46,6,22,[44,44,42]);
 rWeather(pb,[170,150,110],.8);pb.piv=[124,27];return rFin(pb)}
function mkRBradley(){const pb=rLandBase(),N=RP.nato,M=N[0],cam=rCamo(N,.05,3);rTrack(pb,8,142,58,71,{ch:5});for(let k=0;k<6;k++)rWheel(pb,24+k*20,65,5.5,M);rSprocket(pb,136,62,5,M);
 rPart(pb,[[10,24],[96,24],[144,44],[142,54],[10,54]],cam,{top:.82,bot:.44});rPart(pb,[[96,24],[144,44],[141,46],[94,26]],cam,{top:.95,bot:.85});rLine(pb,12,34,96,34);
 rPart(pb,[[12,38],[138,38],[138,60],[12,60]],cam,{top:.8,bot:.48});for(let y=38;y<60;y+=7)rLine(pb,12,y,138,y);for(let x=12;x<138;x+=14)rLine(pb,x,38,x,60);for(let y=41;y<60;y+=7)rRiv(pb,15,y,136,7);
 rPart(pb,[[54,24],[58,12],[98,11],[110,18],[110,24]],cam,{top:.88,bot:.42});rR(pb,104,15,8,9,cam,{top:.7});rPart(pb,[[40,12],[64,12],[64,22],[40,22]],cam,{top:.84});rR(pb,40,14,4,6,[30,30,28]);
 rR(pb,72,6,10,6,cam,{top:.85});rR(pb,74,7,6,3,[40,48,52]);antenna(pb,58,0,12,[40,40,38]);antenna(pb,90,2,12,[40,40,38]);rWeather(pb,[120,108,84],.7);pb.piv=[108,20];return rFin(pb)}
function mkRStryker(){const pb=rLandBase(),M=RP.grn;rPart(pb,[[8,22],[110,22],[146,36],[146,48],[136,54],[14,54],[8,46]],M,{top:.82,bot:.42});rPart(pb,[[110,22],[146,36],[143,38],[108,24]],M,{top:.95,bot:.85});
 rLine(pb,10,36,144,36);rPart(pb,[[14,40],[140,40],[134,52],[18,52]],rDk(M,.08),{top:.6});for(let x=26;x<138;x+=22)rLine(pb,x,23,x,40);rRiv(pb,12,26,106,6);for(let x=20;x<104;x+=16)rR(pb,x,27,6,3,[50,60,64],{bev:0});
 for(const x of[24,50,100,126])rTyre(pb,x,60,10.5,M);rPart(pb,[[64,22],[66,12],[96,11],[104,16],[104,22]],M,{top:.86,bot:.42});rR(pb,98,13,6,7,M);antenna(pb,16,2,22,[40,40,38]);
 rWeather(pb,RP.dust,.8);pb.piv=[102,16];return rFin(pb)}
function mkRHimars(){const pb=rLandBase(),M=RP.tan;rR(pb,8,46,128,6,[50,48,44]);rPart(pb,[[104,20],[132,20],[138,28],[146,34],[146,54],[104,54]],M,{top:.84,bot:.42});
 rPart(pb,[[112,23],[130,23],[136,32],[112,32]],[60,72,80],{top:.85,bev:.5});rLine(pb,104,40,146,40);rRiv(pb,106,36,144,6);rR(pb,140,42,6,10,rDk(M,.2));for(let y=43;y<52;y+=2)pb.line(141,y,145,y,[40,36,30]);
 rPart(pb,[[8,16],[100,14],[102,44],[8,44]],M,{top:.86,bot:.42});rLine(pb,10,30,100,30);rLine(pb,54,15,54,44);rRiv(pb,12,18,96,7);rR(pb,8,16,4,28,rDk(M,.15));
 for(const x of[26,52,122])rTyre(pb,x,60,10.5,M);rR(pb,90,10,6,6,[44,44,42]);rWeather(pb,[170,150,110],.9);pb.piv=[94,14];return rFin(pb)}
function mkRJltv(){const pb=rLandBase(),M=RP.tan;rPart(pb,[[30,30],[94,28],[116,36],[146,40],[146,54],[26,54],[22,40]],M,{top:.84,bot:.42});rPart(pb,[[94,28],[116,36],[146,40],[146,42],[116,38],[94,30]],M,{top:.95,bot:.9});
 rPart(pb,[[40,31],[62,31],[62,40],[40,40]],[54,66,74],{bev:.5});rPart(pb,[[66,31],[90,30],[100,36],[100,40],[66,40]],[54,66,74],{bev:.5});rLine(pb,64,30,64,52);rLine(pb,24,44,144,44);rRiv(pb,28,48,140,6);
 rTyre(pb,46,59,11.5,M);rTyre(pb,118,59,11.5,M);rPart(pb,[[64,18],[82,18],[84,28],[62,28]],M,{top:.86});rR(pb,72,14,8,5,[42,42,40]);antenna(pb,30,6,30,[40,40,38]);rWeather(pb,[170,150,110],.9);pb.piv=[78,20];return rFin(pb)}
function mkRMrap(){const pb=rLandBase(),M=RP.tan;rPart(pb,[[14,12],[108,12],[130,20],[146,34],[142,48],[18,48],[12,34]],M,{top:.86,bot:.46});
 rPart(pb,[[110,16],[128,22],[138,32],[110,32]],[54,66,74],{bev:.5});rPart(pb,[[36,18],[54,18],[54,30],[36,30]],[54,66,74],{bev:.5});rPart(pb,[[64,18],[82,18],[82,30],[64,30]],[54,66,74],{bev:.5});
 rLine(pb,14,36,142,36);for(let x=30;x<110;x+=24)rLine(pb,x,13,x,48);rRiv(pb,16,40,140,6);rPart(pb,[[26,44],[130,44],[118,54],[38,54]],rDk(M,.25),{top:.5});
 rTyre(pb,40,58,12.5,M);rTyre(pb,116,58,12.5,M);rPart(pb,[[56,4],[76,4],[78,12],[54,12]],M,{top:.86});rR(pb,64,0,10,5,[42,42,40]);antenna(pb,22,0,12,[40,40,38]);rWeather(pb,[170,150,110],.9);pb.piv=[72,4];return rFin(pb)}
function mkRHover(){const pb=rLandBase(),M=[124,132,140];rPart(pb,[[6,44],[130,40],[148,50],[136,60],[14,60],[4,52]],M,{top:.86,bot:.38});rLine(pb,8,50,146,50);for(let x=24;x<130;x+=18)rLine(pb,x,41,x,58);
 for(let x=18;x<134;x+=14)rR(pb,x,60,8,3,[110,210,240],{top:.9,bev:0});rPart(pb,[[34,40],[44,26],[100,24],[118,32],[114,40]],M,{top:.9,bot:.42});rR(pb,52,30,40,3,[90,200,236],{bev:0});rRiv(pb,40,36,110,8);antenna(pb,46,10,26,[40,40,44]);
 rWeather(pb,[130,130,126],.4);pb.piv=[110,32];return rFin(pb)}
function mkRWalker(col,eye){const pb=rLandBase(),M=col;for(const[x,ph]of[[54,0],[96,1]]){const d=ph?-4:4;rPart(pb,[[x,38],[x+10,38],[x+10+d,54],[x+d,54]],rDk(M,.15));rPart(pb,[[x+d,54],[x+d+10,54],[x+d+8,66],[x+d+2,66]],rDk(M,.25));rR(pb,x+d-4,66,18,5,[60,62,64])}
 rPart(pb,[[36,14],[112,12],[136,22],[134,36],[112,40],[38,40]],M,{top:.88,bot:.4});rR(pb,118,22,12,5,eye,{top:.9,bev:0});rLine(pb,40,26,132,26);for(let x=56;x<110;x+=18)rLine(pb,x,13,x,40);rRiv(pb,40,17,108,8);
 rPart(pb,[[24,16],[40,14],[40,34],[24,32]],rDk(M,.1));for(let y=18;y<32;y+=4)rR(pb,26,y,10,2,[40,40,44],{bev:0});rWeather(pb,[120,118,112],.4);pb.piv=[118,20];return rFin(pb)}
function mkRRailapc(){const pb=rLandBase(),M=[128,134,142];rPart(pb,[[8,24],[104,22],[146,36],[146,48],[136,54],[14,54],[8,46]],M,{top:.86,bot:.4});rLine(pb,10,38,144,38);for(let x=26;x<138;x+=22)rLine(pb,x,23,x,52);rRiv(pb,12,28,100,7);
 for(const x of[24,50,100,126])rTyre(pb,x,60,10.5,[150,156,164]);rPart(pb,[[58,22],[62,12],[96,10],[106,16],[106,22]],M,{top:.9,bot:.42});rR(pb,66,16,30,2,[90,210,240],{bev:0});rWeather(pb,[120,118,112],.4);pb.piv=[104,16];return rFin(pb)}
function mkRRover(){const pb=rLandBase(),M=[206,206,200];rR(pb,18,46,116,5,[90,90,92]);rPart(pb,[[24,38],[124,38],[132,46],[18,46]],M,{top:.86,bot:.5});rR(pb,50,28,10,10,[70,70,74]);rR(pb,76,30,12,8,[70,70,74]);rR(pb,40,26,6,12,[150,120,60],{top:.8});
 for(const x of[34,76,118])rTyre(pb,x,61,9.5,[176,170,150]);pb.line(100,36,112,20,[60,60,62]);rE(pb,112,18,6,3,[220,220,214]);rR(pb,82,26,10,4,[60,60,64]);rWeather(pb,[170,168,160],.6);pb.piv=[88,28];return rFin(pb)}
function mkROrbtank(){const pb=rLandBase(),M=[208,210,216];rPart(pb,[[4,40],[142,38],[148,46],[136,58],[14,58],[2,48]],M,{top:.9,bot:.4});rLine(pb,6,48,144,48);for(let x=22;x<136;x+=16)rLine(pb,x,39,x,57);for(let x=20;x<134;x+=16)rR(pb,x,58,10,4,[255,160,60],{top:.9,bev:0});
 rPart(pb,[[36,38],[46,22],[104,20],[122,30],[118,38]],M,{top:.92,bot:.42});rR(pb,52,26,34,3,[90,200,236],{bev:0});rRiv(pb,44,34,112,8);antenna(pb,46,4,22,[60,60,64]);rWeather(pb,[160,158,150],.4);pb.piv=[114,28];return rFin(pb)}
// ===================== AIR (faces right) — designed on a 100x40 grid, scaled to sprite size =====================
function rAir(w,h,fn){const pb=new PB(w,h),sx=w/100,sy=h/40,S=pts=>pts.map(([x,y])=>[x*sx,y*sy]);
 const A={pb,w,h,P:(pts,b,o)=>rPart(pb,S(pts),b,o),E:(x,y,rx,ry,b,o)=>rE(pb,x*sx,y*sy,rx*sx,ry*sy,b,o),L:(x0,y0,x1,y1,hl)=>rLine(pb,x0*sx,y0*sy,x1*sx,y1*sy,hl),
  Rv:(x0,y,x1,st)=>rRiv(pb,x0*sx|0,y*sy|0,x1*sx|0,st),dark:(pts,c=[26,28,32])=>rSolid(pb,S(pts),c),
  prop:(x,y0,y1)=>{recP({t:'prop',x:x*sx,y0:y0*sy,y1:y1*sy});REC.depth++;for(let y=y0*sy|0;y<=y1*sy;y++){pb.set(x*sx|0,y,(y&1)?[70,70,66]:[150,150,144]);if(y%3==0)pb.set((x*sx|0)+1,y,[110,110,104])}rE(pb,x*sx,(y0+y1)/2*sy,2.4,2.6,[150,40,30]);REC.depth--},
  can:(pts,tint=[70,96,118])=>{REC.tag='can';rPart(pb,S(pts),tint,{top:.9,bot:.45,bev:1});REC.tag=null;const b=S(pts);const x0=Math.min(...b.map(p=>p[0])),x1=Math.max(...b.map(p=>p[0])),y0=Math.min(...b.map(p=>p[1]));for(let x=x0+2;x<x0+(x1-x0)*.5;x++){const p=pb.get(x|0,(y0|0)+2);if(p)pb.set(x|0,(y0|0)+2,[220,232,240])}}};
 fn(A);return pb}
const rJetDone=(pb,dust=[110,110,108],a=.25)=>{rWeather(pb,dust,a);return rFin(pb)};
function mkRF22(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.fgray,D=rDk(M,.2);A.P([[10,14],[17,1],[25,1],[30,15]],D);A.P([[2,24],[22,22],[26,26],[4,28]],D);
 A.P([[2,17],[30,14],[56,12],[66,10],[84,14],[100,21],[86,24],[60,27],[30,27],[4,25]],M,{top:.86,bot:.42});A.P([[16,15],[22,2],[30,2],[34,15]],M,{top:.86,bot:.5});
 A.P([[26,22],[56,19],[64,25],[30,29]],rLt(M,.05),{top:.7,bot:.5});A.dark([[58,18],[66,17],[66,24],[58,24]],[40,42,48]);A.dark([[0,18],[4,18],[4,24],[0,24]],[54,52,50]);
 A.can([[66,12],[73,6],[84,9],[90,15]],[178,150,86]);A.L(30,21,84,19);A.L(46,13,46,27);A.L(76,15,76,22);A.Rv(20,24,90,9);A.P([[34,26],[48,26],[48,29],[34,29]],[86,90,96])}))}
function mkRF15(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.lgray,D=[118,126,138];A.P([[6,15],[10,0],[18,0],[22,15]],D);A.P([[0,22],[22,20],[24,25],[2,27]],D);
 A.P([[0,17],[28,14],[60,13],[70,11],[86,15],[100,22],[86,25],[62,28],[28,28],[0,25]],(i,j)=>fbm(i*.05,j*.08)>.55?D:M,{top:.86,bot:.42});A.P([[12,15],[16,1],[24,1],[28,15]],M,{top:.86,bot:.5});
 A.P([[48,18],[64,18],[66,28],[48,28]],D,{top:.7});A.dark([[60,19],[66,19],[66,26],[60,26]],[34,36,40]);A.P([[24,22],[52,20],[58,27],[28,30]],rLt(M,.05),{top:.7,bot:.5});
 A.E(2,19,2,2.2,[70,68,64]);A.E(2,24,2,2.2,[70,68,64]);A.can([[68,13],[74,6],[86,9],[92,15]]);A.L(28,22,86,20);A.L(40,14,40,28);A.Rv(14,24,88,8);A.P([[32,28],[44,28],[44,32],[32,32]],[200,200,196])}))}
function mkRF35(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.dgray;A.P([[8,15],[14,2],[22,2],[28,15]],rDk(M,.15));A.P([[0,22],[22,21],[24,26],[2,27]],rDk(M,.15));
 A.P([[2,16],[30,13],[60,12],[70,11],[86,15],[100,22],[86,25],[60,28],[30,28],[4,26]],M,{top:.84,bot:.4,round:.1});A.P([[26,22],[56,20],[62,26],[30,29]],rLt(M,.06),{top:.7,bot:.5});
 A.E(2,21,2.5,3.5,[70,66,60]);A.dark([[56,18],[64,17],[64,23],[56,23]],[40,42,46]);A.can([[66,12],[72,6],[84,8],[90,15]],[150,130,80]);A.L(30,21,84,19);A.Rv(20,24,88,9)}))}
function mkRA10(w,h,M){return rJetDone(rAir(w,h,A=>{const D=rDk(M,.15);A.P([[4,18],[8,2],[14,2],[16,18]],D);A.P([[0,20],[20,19],[20,23],[0,23]],D);A.P([[6,18],[10,4],[16,4],[18,18]],M,{top:.85});
 A.P([[4,18],[30,16],[70,15],[84,16],[96,22],[86,26],[60,27],[30,26],[6,24]],M,{top:.86,bot:.42});A.P([[16,9],[42,9],[44,17],[16,17]],M,{top:.82,bot:.4,round:.1});A.E(42,13,2,3.5,[50,50,48]);A.dark([[14,10],[17,10],[17,16],[14,16]],[40,40,40]);
 A.P([[30,22],[64,21],[68,26],[32,28]],rLt(M,.05),{top:.7});A.can([[72,15],[78,9],[86,12],[90,17]]);A.dark([[96,21],[100,21],[100,23],[96,23]],[40,40,40]);A.P([[44,26],[54,26],[54,32],[44,32]],[90,92,90]);A.P([[58,26],[64,26],[64,31],[58,31]],[90,92,90]);
 A.L(30,21,90,20);A.Rv(10,23,90,7);A.P([[78,24],[86,24],[86,29],[78,29]],[56,56,54])}))}
function mkRF4(w,h){return rJetDone(rAir(w,h,A=>{const cam=rCamo([[96,100,72],[140,124,92],[62,72,52]],.06,8),D=[60,70,52];A.P([[8,14],[14,1],[22,1],[26,16]],cam);A.P([[0,28],[18,22],[22,24],[4,32]],D);
 A.P([[2,18],[30,15],[56,14],[66,12],[86,15],[100,21],[86,24],[60,27],[30,26],[4,24]],cam,{top:.86,bot:.42});A.P([[52,17],[62,16],[62,25],[52,25]],cam,{top:.6});A.dark([[60,17],[63,17],[63,24],[60,24]],[34,34,30]);
 A.P([[26,22],[52,20],[58,26],[40,28],[28,26]],cam,{top:.7});A.P([[28,26],[36,26],[34,30],[26,30]],cam);A.can([[64,13],[68,8],[82,9],[86,14]]);A.L(74,8,74,13,0);A.E(2,20,2.4,3,[70,66,60]);A.L(30,20,86,19);A.Rv(14,23,88,8);A.P([[40,27],[54,27],[54,31],[40,31]],[150,150,146])}))}
function mkRF86(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.metal;A.P([[8,16],[16,0],[24,2],[24,16]],M,{top:.86});A.P([[2,18],[18,18],[20,21],[2,21]],rDk(M,.1));
 A.P([[2,17],[30,13],[64,12],[82,14],[98,18],[98,24],[84,27],[30,26],[4,23]],M,{top:.9,bot:.42,round:.08});A.dark([[96,18],[100,18],[100,24],[96,24]],[24,24,26]);A.P([[30,22],[56,20],[62,26],[34,28]],rLt(M,.04),{top:.7});
 A.can([[62,13],[66,6],[78,7],[84,13]]);A.P([[86,16],[96,17],[96,20],[86,20]],[200,170,60]);A.L(30,20,92,19);A.Rv(10,22,90,7);A.P([[44,26],[54,26],[54,30],[44,30]],[160,164,168])}))}
function mkRP47(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.od,B=[136,136,130];A.P([[2,16],[8,3],[16,3],[18,17]],M,{top:.86});A.P([[0,20],[16,19],[16,23],[0,23]],rDk(M,.1));
 A.P([[2,17],[40,13],[66,11],[86,11],[94,13],[94,29],[86,31],[60,30],[30,26],[4,23]],(i,j)=>j>A.h*.6?B:M,{top:.86,bot:.42,round:.08});A.P([[86,9],[96,11],[96,31],[86,32]],M,{top:.86,bot:.36,round:.2});
 A.dark([[92,13],[96,13],[96,16],[92,16]],[34,34,30]);for(let x=88;x<92;x+=1)A.L(x,12,x,30,0);A.prop(97,0,40);A.can([[54,12],[60,4],[72,4],[78,11]]);A.P([[32,23],[64,22],[70,28],[36,29]],M,{top:.7});
 A.P([[56,30],[72,30],[70,35],[58,35]],B);A.L(40,20,86,19);A.Rv(10,22,84,6);A.P([[30,16],[40,16],[40,19],[30,19]],[200,200,196],{bev:0});A.E(36,18,2.5,1.6,[40,60,120])}))}
function mkRP51(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.metal,G=[60,64,46];A.P([[4,16],[10,2],[18,3],[20,17]],M,{top:.86});A.P([[0,20],[18,19],[18,23],[0,23]],rDk(M,.1));
 A.P([[2,17],[36,14],[66,12],[90,14],[96,18],[96,24],[90,26],[60,26],[30,24],[4,22]],M,{top:.9,bot:.42,round:.08});A.P([[66,12],[90,14],[90,16],[66,15]],G);A.P([[42,24],[62,24],[60,31],[46,31]],M,{top:.7});
 A.prop(97,1,39);A.E(96,21,3,3,[160,40,34]);A.can([[50,13],[56,4],[66,4],[70,12]]);A.P([[30,21],[60,20],[66,26],[34,27]],rLt(M,.05),{top:.7});A.L(36,19,90,18);A.Rv(8,21,90,6);A.E(30,18,2.6,1.8,[40,60,120])}))}
function mkRP38(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.metal;A.P([[0,10],[6,2],[12,4],[12,26],[6,30],[0,28]],M,{top:.86});A.P([[4,15],[56,13],[80,14],[86,18],[80,22],[56,22],[4,21]],M,{top:.88,bot:.42,round:.1});
 A.P([[40,8],[70,7],[84,10],[86,13],[70,15],[40,13]],M,{top:.9,bot:.5});A.can([[54,7],[60,2],[70,3],[74,8]]);A.prop(88,4,32);A.E(87,18,2.4,2.6,[150,40,30]);A.dark([[60,19],[70,19],[70,22],[60,22]],[40,40,40]);
 A.P([[20,24],[64,23],[68,28],[24,29]],rLt(M,.04),{top:.7});A.L(20,18,80,17);A.Rv(14,20,80,6)}))}
function mkRF4U(w,h){return rJetDone(rAir(w,h,A=>{const M=RP.navy,B=[176,180,184];A.P([[2,16],[8,2],[16,3],[18,17]],M,{top:.86});A.P([[0,20],[18,19],[18,23],[0,23]],rDk(M,.1));
 A.P([[2,17],[40,13],[60,12],[84,12],[94,14],[94,28],[84,30],[60,28],[30,25],[4,23]],(i,j)=>j>A.h*.66?B:M,{top:.9,bot:.42,round:.08});A.P([[84,10],[95,12],[95,30],[84,31]],M,{top:.9,bot:.36,round:.2});A.prop(96,0,40);
 A.can([[44,12],[50,4],[62,4],[66,11]]);A.P([[40,24],[54,28],[64,26],[74,30],[70,33],[60,30],[50,32],[38,27]],M,{top:.75});A.L(40,20,84,19);A.Rv(10,22,82,6);A.E(30,19,3,2,[220,220,220])}))}
function mkRB25(w,h,o={}){return rJetDone(rAir(w,h,A=>{const M=o.col||RP.od,B=o.bel||[132,132,126];A.P([[0,8],[6,2],[12,4],[12,24],[6,26],[0,24]],M,{top:.86});A.P([[2,16],[16,16],[16,20],[2,20]],rDk(M,.1));
 A.P([[4,15],[40,12],[80,12],[92,14],[98,19],[92,24],[80,25],[40,25],[6,22]],(i,j)=>j>A.h*.55?B:M,{top:.88,bot:.42,round:.1});A.P([[90,13],[98,17],[98,22],[90,24]],[110,130,140],{top:.9});for(let x=91;x<98;x+=3)A.L(x,14,x,23,0);
 A.can([[70,11],[74,7],[84,8],[86,12]]);A.E(50,10,4,3,[100,120,130]);A.P([[46,15],[72,15],[78,19],[72,23],[46,23]],M,{top:.86,bot:.4,round:.1});A.prop(80,6,32);A.E(79,19,2,2,[60,60,56]);
 A.P([[30,21],[66,20],[72,26],[34,27]],rLt(M,.04),{top:.7});A.L(10,18,90,17);A.Rv(10,20,88,5);if(!o.enemy)rStar(A.pb,(26*w/100)|0,(18*h/40)|0,3)}))}
function mkRHeli(w,h,o){return rJetDone(rAir(w,h,A=>{const M=o.col;const rot=(y,x0,x1)=>{recP({t:'rotor',x0:x0*w/100,x1:x1*w/100,y:y*h/40});for(let x=x0*w/100|0;x<x1*w/100;x++){A.pb.set(x,y*h/40|0,[40,40,40]);if(x%3)A.pb.set(x,(y*h/40|0)-1,[90,90,88])}};
 if(o.k=='huey'){A.P([[2,14],[50,16],[50,22],[2,20]],M,{top:.86});A.P([[0,8],[6,8],[8,20],[2,20]],M);A.E(4,14,3,5,[60,60,58],{bev:0});A.P([[44,12],[86,10],[98,18],[98,30],[86,34],[44,34]],M,{top:.86,bot:.42,round:.1});
  A.P([[86,13],[96,18],[96,26],[86,26]],[90,110,118],{top:.9});A.P([[60,16],[74,16],[74,30],[60,30]],[30,32,30]);A.P([[56,6],[80,6],[82,12],[54,12]],M);rot(5,8,98);A.P([[48,36],[96,36],[96,38],[48,38]],[50,50,48]);A.L(56,34,54,37);A.L(88,34,90,37);A.Rv(48,26,84,6);if(o.pods)A.P([[60,30],[76,30],[76,34],[60,34]],[80,82,74])}
 else if(o.k=='cobra'){A.P([[2,18],[48,18],[48,22],[2,22]],M,{top:.86});A.P([[0,8],[6,8],[8,22],[2,22]],M);A.E(4,15,3,5,[60,60,58],{bev:0});A.P([[40,14],[80,12],[98,20],[94,28],[80,30],[44,28]],M,{top:.86,bot:.42,round:.1});
  A.can([[62,12],[70,6],[86,8],[92,16]],[80,100,110]);A.P([[46,8],[66,8],[68,13],[44,13]],M);rot(5,6,100);A.P([[50,24],[72,24],[72,32],[50,32]],[80,82,74]);A.P([[84,28],[90,28],[90,32],[96,32],[96,34],[84,34]],[50,50,48]);A.P([[46,36],[90,36],[90,38],[46,38]],[50,50,48]);A.Rv(44,22,80,6)}
 else if(o.k=='apache'){A.P([[2,16],[50,17],[50,23],[2,21]],M,{top:.86});A.P([[0,6],[6,8],[8,22],[2,22]],M);A.E(5,13,2.5,5,[50,50,48],{bev:0});A.P([[34,12],[76,10],[96,18],[96,26],[84,30],[40,30]],M,{top:.86,bot:.42,round:.1});
  A.can([[60,10],[68,4],[78,5],[82,10]],[70,90,100]);A.can([[78,11],[84,7],[92,10],[96,17]],[70,90,100]);A.P([[42,8],[64,8],[66,12],[40,12]],M);A.E(52,6,4,3,M);rot(4,4,100);
  A.P([[44,24],[66,22],[68,30],[44,30]],rDk(M,.08));A.P([[46,30],[66,30],[66,34],[46,34]],[70,72,64]);for(let x=48;x<66;x+=4)A.L(x,30,x,34,0);A.E(90,31,3,3,[50,50,48]);A.P([[90,32],[100,32],[100,34],[90,34]],[40,40,40]);
  A.L(80,30,78,38);A.L(50,30,52,38);A.E(78,38,2,2,[30,30,30]);A.E(52,38,2,2,[30,30,30]);A.Rv(36,20,88,6)}
 else{/* tiltrotor */A.P([[2,18],[30,18],[30,22],[2,22]],M);A.P([[0,8],[8,8],[10,22],[2,22]],M);A.P([[20,14],[86,12],[100,20],[94,28],[84,30],[24,30]],M,{top:.88,bot:.42,round:.1});A.can([[78,12],[84,8],[94,12],[98,18]],[70,90,110]);
  A.P([[44,2],[56,2],[56,20],[44,20]],rDk(M,.08));rot(2,24,76);A.P([[30,22],[70,21],[74,25],[32,26]],rLt(M,.05));A.P([[60,28],[80,28],[80,32],[60,32]],[70,72,74]);A.Rv(24,22,88,6);A.E(88,30,3,2.4,[50,52,54])}}))}
function mkRMQ9(w,h){return rJetDone(rAir(w,h,A=>{const M=[166,170,176];A.P([[2,6],[10,6],[14,18],[4,18]],M,{top:.86});A.P([[2,26],[12,22],[16,24],[6,34]],rDk(M,.1));A.P([[4,16],[30,14],[72,14],[90,13],[99,18],[96,24],[86,26],[30,26],[6,23]],M,{top:.9,bot:.42,round:.12});
 A.prop(2,8,32);A.P([[30,19],[70,19],[72,22],[30,22]],rDk(M,.1));A.P([[66,24],[74,24],[74,30],[66,30]],[60,62,64]);A.E(70,31,3,3,[40,42,44]);A.L(30,20,90,19);A.Rv(14,22,90,8)}))}
function mkRSci(w,h,o){return rJetDone(rAir(w,h,A=>{const M=o.col,D=rDk(M,.2),gl=o.glow;
 if(o.k=='gen6'){A.P([[0,18],[40,12],[70,11],[100,20],[70,26],[30,28],[0,24]],M,{top:.88,bot:.4,round:.1});A.P([[14,22],[60,18],[72,24],[24,30]],rLt(M,.05),{top:.7});A.can([[64,12],[72,7],[84,10],[90,16]],[150,130,80]);A.dark([[0,19],[4,19],[4,23],[0,23]],[50,50,54])}
 else if(o.k=='dmother'){A.P([[0,16],[30,6],[80,8],[100,20],[80,30],[30,34],[0,26]],M,{top:.88,bot:.38,round:.1});A.P([[24,14],[70,12],[82,18],[24,20]],rLt(M,.05));for(let x=14;x<80;x+=12)A.P([[x,28],[x+6,28],[x+6,31],[x,31]],gl,{top:.9,bev:0});A.can([[72,12],[80,10],[90,14],[94,18]],gl)}
 else if(o.k=='starf'){A.P([[6,10],[14,2],[20,2],[24,14]],D);A.P([[0,16],[30,13],[66,12],[100,20],[70,26],[30,27],[0,24]],M,{top:.9,bot:.4,round:.1});A.P([[20,22],[54,20],[64,30],[24,34]],D,{top:.7});A.can([[60,12],[68,6],[80,9],[86,15]],[60,120,160]);A.E(1,20,3,4,gl,{top:.9,bev:0})}
 else if(o.k=='interc'){A.P([[0,14],[40,14],[100,20],[40,26],[0,26]],M,{top:.9,bot:.42});A.P([[10,20],[60,18],[40,34],[16,32]],D);A.can([[54,15],[62,10],[74,13],[78,17]],[60,120,160]);A.E(1,20,3,4,gl,{top:.9,bev:0})}
 else{A.P([[0,12],[36,8],[84,10],[100,20],[86,30],[36,32],[0,28]],M,{top:.9,bot:.38,round:.1});A.P([[20,26],[60,26],[64,36],[24,36]],D);A.P([[24,4],[44,4],[46,10],[22,10]],D);A.can([[80,12],[88,10],[96,15],[98,19]],[60,120,160]);A.E(1,20,3,6,gl,{top:.9,bev:0});A.E(2,30,2,3,gl,{top:.9,bev:0})}
 A.L(10,20,90,20);A.Rv(8,22,90,9)}))}
// ===================== registration =====================
function buildRealArt(mk){const sz=k=>{const s=SPR[k];return[s.c.width,s.c.height]},L=(k,fn)=>{const pb=fn();const s=mk(pb);s.piv=pb.piv;SPR[k]=s},A=(k,fn)=>{const[w,h]=sz(k);SPR[k]=mk(fn(w,h))};
 L('sherman',mkRSherman);L('hellcat',mkRHellcat);L('halftrack',mkRHalftrack);L('priest',mkRPriest);L('jeep',mkRJeep);
 L('m60',mkRM60);L('m113',mkRM113);L('sheridan',mkRSheridan);L('m109',mkRM109);
 L('abramsP',mkRAbrams);L('bradley',mkRBradley);L('stryker',mkRStryker);L('himars',mkRHimars);L('jltv',mkRJltv);L('mrap',mkRMrap);
 L('hoverP',mkRHover);L('walkerF',()=>mkRWalker([140,146,156],[90,220,255]));L('railapc',mkRRailapc);L('rover',mkRRover);L('walkerS',()=>mkRWalker([214,214,208],[255,180,60]));L('orbtank',mkROrbtank);
 A('p47A',mkRP47);A('p51',mkRP51);A('p38',mkRP38);A('f4u',mkRF4U);A('b25',mkRB25);
 A('f4A',mkRF4);A('a10c',(w,h)=>mkRA10(w,h,[124,132,124]));A('f86',mkRF86);A('huey',(w,h)=>mkRHeli(w,h,{k:'huey',col:RP.od,pods:1}));A('cobra',(w,h)=>mkRHeli(w,h,{k:'cobra',col:RP.od}));
 A('f22A',mkRF22);A('f15A',mkRF15);A('f35',mkRF35);A('a10m',(w,h)=>mkRA10(w,h,[138,144,150]));A('apacheA',(w,h)=>mkRHeli(w,h,{k:'apache',col:[74,80,62]}));A('mq9',mkRMQ9);
 A('gen6',(w,h)=>mkRSci(w,h,{k:'gen6',col:[104,110,120]}));A('tiltg',(w,h)=>mkRHeli(w,h,{k:'tilt',col:[100,106,116]}));A('dmother',(w,h)=>mkRSci(w,h,{k:'dmother',col:[80,86,96],glow:[90,220,255]}));
 A('starf',(w,h)=>mkRSci(w,h,{k:'starf',col:[200,204,210],glow:[90,200,255]}));A('interc',(w,h)=>mkRSci(w,h,{k:'interc',col:[230,230,234],glow:[255,140,60]}));A('sgun',(w,h)=>mkRSci(w,h,{k:'sgun',col:[190,194,200],glow:[90,200,255]}))}
