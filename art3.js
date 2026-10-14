'use strict';
// ---- Style-matched vehicles (ref: user's Tiger I / M1 Abrams / F-22 / F-15 pixel art) ----
// Flat 5-tone ramps, crisp dark outline, panel lines, rivets, antennas. ~280px wide native.
function R5(b){return[mix(b,[24,26,34],.62),mix(b,[30,30,38],.36),b,mix(b,[255,246,214],.2),mix(b,[255,250,230],.42)]}
const tone=(r,l)=>r[Math.max(0,Math.min(4,Math.floor(l*5)))];
function vRect(pb,x,y,w,h,rf,top=.85,bot=.3){pb.rect(x,y,w,h,(i,j,nx,ny)=>{const r=typeof rf=='function'?rf(i,j):rf;const t=(ny+1)/2;let l=top+(bot-top)*t;if(j==y)l=.99;if(j==y+h-1)l=.05;return tone(r,l)})}
function vPoly(pb,pts,rf,lf){pb.poly(pts,(i,j,nx,ny)=>{const r=typeof rf=='function'?rf(i,j):rf;return tone(r,lf?lf(i,j,nx,ny):.8-.45*(ny+1)/2)})}
function vEll(pb,cx,cy,rx,ry,rf,amb=.75){pb.ell(cx,cy,rx,ry,(i,j,dx,dy,r)=>{const rr=typeof rf=='function'?rf(i,j):rf;let l=amb-.3*dy-.12*dx;if(r>.82)l=dy<0?.55:.12;return tone(rr,l)})}
const vLine=(pb,x0,y0,x1,y1,c)=>pb.line(x0,y0,x1,y1,c);
function panelH(pb,y,x0,x1,r){for(let x=x0;x<=x1;x++){const p=pb.get(x,y);if(p&&p!==OUT){pb.set(x,y,r[0]);if(pb.get(x,y+1))pb.set(x,y+1,r[4])}}}
function panelV(pb,x,y0,y1,r){for(let y=y0;y<=y1;y++){const p=pb.get(x,y);if(p&&p!==OUT){pb.set(x,y,r[0]);if(pb.get(x+1,y))pb.set(x+1,y,r[3])}}}
function rivet(pb,x,y,r){if(pb.get(x,y)){pb.set(x,y,r[4]);pb.set(x+1,y+1,r[0])}}
function rivets(pb,y,x0,x1,st,r){for(let x=x0;x<=x1;x+=st)rivet(pb,x,y,r)}
function trackHD(pb,x0,x1,y0,y1,rT){const rr=(y1-y0)/2;const link=(i,j)=>tone(rT,((i>>1)%2?.62:.38)+(j<y0+3?.3:j>y1-3?-.25:0));
 pb.ell(x0+rr,y0+rr,rr,rr,(i,j)=>link(i,j));pb.ell(x1-rr,y0+rr,rr,rr,(i,j)=>link(i,j));pb.rect(x0+rr,y0,x1-x0-2*rr,y1-y0,(i,j)=>link(i,j));
 pb.rect(x0+rr,y0+4,x1-x0-2*rr,y1-y0-8,(i,j)=>tone(rT,.1))}
function wheelHD(pb,x,y,r,rW,bolts=8,dark){if(typeof rW=='function')rW=R5([92,90,84]);vEll(pb,x,y,r,r,rW,dark?.5:.8);pb.ell(x,y,r*.82,r*.82,(i,j,dx,dy,q)=>q>.8?tone(rW,.2):tone(rW,(dark?.45:.66)-.25*dy));pb.ell(x,y,r*.34,r*.34,(i,j,dx,dy)=>tone(rW,.85-.4*dy));pb.set(x,y,rW[0]);
 for(let k=0;k<bolts;k++){const a=k/bolts*6.283;pb.set(Math.round(x+Math.cos(a)*r*.55),Math.round(y+Math.sin(a)*r*.55),rW[4])}}
function antenna(pb,x,y0,y1,c=[40,40,40]){for(let y=y0;y<=y1;y++)pb.set(x,y,c);pb.set(x,y0,[90,90,90])}
// --- Tiger I ---
function mkTigerHD(){const pb=new PB(284,122);const Y=R5([196,166,96]),O=R5([104,110,54]),B=R5([124,76,42]),T=R5([70,68,64]),M=R5([92,90,84]);
 const cam=(i,j)=>{const s=Math.sin(i*.105-j*.19+fbm(i*.03,j*.03)*2.4);return s>.55?O:s<-.7?B:Y};
 trackHD(pb,14,262,74,114,T);
 for(let k=0;k<8;k++)wheelHD(pb,62+k*24.5,94,14,cam,8,1); // inner row
 for(let k=0;k<8;k++)wheelHD(pb,50+k*24.5,98,15,cam,10);
 wheelHD(pb,250,86,13,M,10);for(let a=0;a<14;a++){const t=a/14*6.283;pb.set(250+Math.cos(t)*14,86+Math.sin(t)*14,T[0])}wheelHD(pb,28,90,12,M,6);
 vRect(pb,18,64,244,14,cam,.6,.25);
 vRect(pb,12,58,254,6,M,.9,.4);for(let x=14;x<264;x+=31)pb.rect(x,58,1,6,()=>M[0]);
 vPoly(pb,[[22,40],[244,40],[256,44],[256,58],[18,58]],cam,(i,j,nx,ny)=>j<43?.95:.72-.3*(ny+1)/2);
 vRect(pb,240,44,16,14,cam,.55,.3);pb.rect(242,47,10,3,()=>T[0]);pb.rect(243,47,8,1,()=>[150,200,210]);vEll(pb,250,54,3,3,M,.8);
 vLine(pb,30,52,120,54,T[1]);vLine(pb,120,54,200,52,T[1]); // tow cable
 for(let k=0;k<6;k++)vRect(pb,130+k*9,48,8,6,T,.8,.3);
 rivets(pb,41,26,240,9,Y);rivets(pb,61,16,262,12,M);
 // turret
 vPoly(pb,[[78,18],[196,16],[208,22],[210,44],[76,46],[70,30]],cam,(i,j,nx,ny)=>j<19?.95:.86-.5*(ny+1)/2);
 vRect(pb,58,22,20,22,cam,.7,.3);panelV(pb,68,23,42,Y); // stowage bin
 vRect(pb,98,8,26,10,M,.85,.35);vRect(pb,96,6,30,3,M,.95,.6);for(let x=99;x<124;x+=4)pb.set(x,10,M[0]);
 vRect(pb,150,12,14,4,M,.9,.5);vEll(pb,180,15,4,2,M,.9);
 for(let k=0;k<5;k++)vRect(pb,92+k*11,34,9,5,T,.75,.3);
 rivets(pb,20,82,194,8,Y);vEll(pb,140,28,3,3,M,.9);
 vEll(pb,214,33,8,13,cam,.75);vRect(pb,206,22,10,23,cam,.8,.3);
 vRect(pb,214,29,20,9,cam,.9,.3);vRect(pb,232,30,36,6,cam,.9,.25);vRect(pb,268,26,14,14,M,.85,.3);pb.rect(272,27,2,12,()=>T[0]);pb.rect(277,27,2,12,()=>T[0]);
 pb.outline(OUT);return pb}
// --- T-62 ---
function mkT62HD(){const pb=new PB(284,122);const G=R5([96,108,64]),T=R5([66,66,60]),M=R5([84,92,62]);const cam=(i,j)=>fbm(i*.05,j*.05)>.62?R5([78,86,52]):G;
 trackHD(pb,14,262,74,112,T);for(let k=0;k<5;k++)wheelHD(pb,52+k*44,96,17,M,10);wheelHD(pb,252,86,12,T,10);wheelHD(pb,26,88,11,T,6);
 vRect(pb,12,62,256,6,M,.9,.4);vPoly(pb,[[16,68],[240,68],[268,80],[260,84],[22,84]],cam,(i,j,nx,ny)=>.7-.4*(ny+1)/2);
 vPoly(pb,[[18,48],[236,48],[266,62],[16,62]],cam,(i,j,nx,ny)=>j<50?.95:.75);
 vEll(pb,30,46,10,8,M,.8);vEll(pb,52,46,10,8,M,.8);panelV(pb,30,40,52,M);panelV(pb,52,40,52,M); // fuel drums
 for(let k=0;k<4;k++)vRect(pb,80+k*30,52,24,8,M,.8,.3);rivets(pb,49,20,230,10,G);
 pb.ell(140,48,66,28,(i,j,dx,dy,r)=>j>50?pb.get(i,j):tone(cam(i,j),r>.86?(dy<0?.6:.15):.88-.4*dy-.15*dx));
 vRect(pb,118,14,18,8,M,.9,.4);vRect(pb,150,16,12,6,M,.9,.4);vRect(pb,156,12,22,3,T,.8,.3);
 vRect(pb,196,32,14,10,M,.85,.3);pb.rect(206,34,3,6,()=>[200,220,230]);
 vRect(pb,200,40,78,6,cam,.9,.25);vRect(pb,236,38,12,10,cam,.85,.3);vRect(pb,276,39,6,8,T,.8,.3);
 antenna(pb,112,0,20);pb.outline(OUT);return pb}
// --- T-90-type ---
function mkT90HD(){const pb=new PB(284,122);const G=R5([92,104,62]),S=R5([170,150,100]),D=R5([52,58,42]),T=R5([60,60,56]),M=R5([80,88,60]);
 const cam=(i,j)=>{const v=fbm(i*.045+9,j*.06);return v>.64?S:v<.32?D:G};
 trackHD(pb,14,262,76,112,T);for(let k=0;k<6;k++)wheelHD(pb,48+k*36,98,14,M,8);wheelHD(pb,30,88,11,T,6);wheelHD(pb,252,88,12,T,10);
 vRect(pb,22,62,236,26,cam,.75,.3);for(let x=22;x<258;x+=20)panelV(pb,x,63,86,G);for(let x=24;x<258;x+=10)pb.rect(x,86,8,3,()=>T[1]);
 vPoly(pb,[[14,48],[236,48],[272,60],[264,64],[14,64]],cam,(i,j,nx,ny)=>j<50?.95:.74);
 for(let k=0;k<5;k++)vPoly(pb,[[230+k*7,50],[236+k*7,50],[242+k*7,58],[236+k*7,58]],G,()=>.8); // ERA chevrons
 vPoly(pb,[[86,30],[196,28],[214,40],[208,52],[90,54],[80,44]],cam,(i,j,nx,ny)=>j<31?.95:.82-.45*(ny+1)/2);
 for(let k=0;k<3;k++)vPoly(pb,[[180+k*9,30],[190+k*9,30],[204+k*6,44],[194+k*6,44]],D,()=>.7);
 vRect(pb,58,32,30,18,cam,.7,.3);for(let x=60;x<88;x+=5)panelV(pb,x,33,48,G); // bustle
 vRect(pb,184,44,10,8,T,.8,.3);pb.set(188,47,[255,60,50]);pb.set(189,47,[255,60,50]); // Shtora
 vRect(pb,120,20,22,10,M,.9,.4);vRect(pb,140,16,26,3,T,.8,.3);vRect(pb,206,40,18,8,cam,.85,.3);vRect(pb,222,41,58,5,cam,.9,.25);vRect(pb,248,40,10,7,D,.8,.3);
 vRect(pb,66,22,4,12,T,.8,.3);antenna(pb,96,2,30);rivets(pb,49,20,226,11,G);pb.outline(OUT);return pb}
// --- M1 Abrams (player support / set piece) ---
function mkAbramsHD(){const pb=new PB(284,122);const D=R5([196,170,120]),T=R5([70,62,50]),M=R5([170,146,104]);
 trackHD(pb,16,262,78,112,T);for(let k=0;k<7;k++)wheelHD(pb,56+k*28,100,12,M,6);wheelHD(pb,30,90,12,T,9);wheelHD(pb,250,92,10,T,6);
 vRect(pb,28,64,232,26,D,.78,.32);for(let x=28;x<258;x+=22){panelV(pb,x,65,88,D);rivet(pb,x+11,68,D);rivet(pb,x+11,84,D)}panelH(pb,76,30,256,D);
 vPoly(pb,[[22,52],[240,52],[272,66],[260,70],[22,70]],D,(i,j,nx,ny)=>j<54?.95:.72);pb.rect(266,62,4,4,()=>[200,40,30]);
 vPoly(pb,[[92,32],[214,30],[232,42],[230,56],[98,58],[86,48]],D,(i,j,nx,ny)=>j<33?.95:.84-.45*(ny+1)/2);panelV(pb,170,31,56,D);panelH(pb,44,96,228,D);vRect(pb,206,44,14,8,D,.6,.3);
 vRect(pb,52,36,40,20,T,.55,.25);for(let x=54;x<92;x+=6)panelV(pb,x,37,54,D);for(let y=40;y<56;y+=5)panelH(pb,y,53,91,D); // bustle rack
 vRect(pb,118,18,16,12,M,.9,.4);vRect(pb,122,14,8,4,T,.8,.3);vRect(pb,146,22,20,8,M,.9,.4);vRect(pb,160,22,28,3,T,.8,.3);vRect(pb,104,24,10,8,M,.85,.4);
 vRect(pb,230,44,48,6,D,.9,.25);vRect(pb,242,42,14,10,D,.85,.3);vRect(pb,276,43,6,8,T,.8,.3);
 antenna(pb,64,0,36);antenna(pb,74,6,36);antenna(pb,140,12,24);pb.outline(OUT);return pb}
// --- F-22 Raptor ---
function mkF22HD(){const pb=new PB(286,96);const G=R5([142,146,152]),D=R5([104,108,116]);
 vPoly(pb,[[60,40],[96,24],[110,24],[96,58]],D,()=>.55);vPoly(pb,[[76,40],[110,16],[124,16],[108,58]],G,(i,j,nx,ny)=>.8-.3*(nx+1)/2); // twin canted tails
 vPoly(pb,[[6,58],[60,56],[68,64],[10,68]],D,()=>.45);
 vPoly(pb,[[12,52],[80,46],[160,40],[210,40],[284,54],[214,62],[150,68],[80,66],[12,62]],G,(i,j,nx,ny)=>j<48?.95:j<56?.75:.45);
 vPoly(pb,[[150,50],[184,50],[178,66],[140,66]],D,(i,j)=>j<52?.2:.4); // intake
 vPoly(pb,[[80,62],[168,60],[186,66],[124,80],[64,76]],G,(i,j,nx,ny)=>.7-.4*(ny+1)/2); // wing
 vPoly(pb,[[2,62],[46,62],[44,72],[0,74]],G,()=>.55);vRect(pb,4,54,12,8,D,.4,.15);
 pb.ell(194,40,26,7,(i,j,dx,dy)=>j>42?null:tone(R5([170,160,120]),.85-.4*dy+(dx<-.2&&dx>-.6&&dy<-.3?.3:0)));vLine(pb,182,34,184,42,D[0]);
 panelH(pb,56,40,200,G);panelV(pb,120,46,64,G);panelV(pb,232,46,58,G);for(let x=96;x<170;x+=18)pb.set(x,64,G[0]);pb.outline(OUT);return pb}
// --- F-15 Eagle ---
function mkF15HD(){const pb=new PB(286,100);const G=R5([150,156,160]),D=R5([112,118,124]);
 vPoly(pb,[[26,52],[38,10],[56,8],[52,52]],D,()=>.5);vPoly(pb,[[44,54],[58,12],[78,10],[74,54]],G,(i,j,nx,ny)=>.8-.3*(nx+1)/2);vRect(pb,58,8,20,3,G,.9,.5);
 vPoly(pb,[[4,62],[52,58],[64,64],[8,72]],G,()=>.55);
 vPoly(pb,[[16,52],[80,46],[160,44],[214,44],[284,56],[214,64],[160,66],[80,64],[16,62]],G,(i,j,nx,ny)=>j<48?.95:j<56?.75:.45);
 vRect(pb,140,48,30,18,D,.5,.2);pb.rect(141,49,6,16,()=>D[0]);
 vPoly(pb,[[80,60],[176,56],[150,70],[84,74]],G,(i,j,nx,ny)=>.72-.4*(ny+1)/2);
 pb.ell(110,74,40,5,(i,j,dx,dy)=>tone(G,.8-.4*dy));pb.rect(70,72,3,4,()=>G[0]);
 vEll(pb,20,58,6,6,D,.5);vEll(pb,22,62,6,6,D,.45);pb.ell(20,58,3,3,()=>[30,30,34]);
 pb.ell(196,42,24,8,(i,j,dx,dy)=>j>44?null:tone(R5([96,120,96]),.8-.4*dy+(dx<-.1&&dx>-.5&&dy<-.3?.3:0)));vLine(pb,196,34,196,44,D[0]);pb.ell(184,40,2,2,()=>[60,60,50]);pb.ell(206,40,2,2,()=>[60,60,50]);
 rivets(pb,58,90,200,14,G);panelV(pb,128,46,64,G);panelV(pb,224,46,60,G);pb.rect(230,58,10,2,()=>[200,170,60]);antenna(pb,170,38,44);pb.outline(OUT);return pb}
// style-match comparison sheet
function makeStyleSheet(){const c=document.createElement('canvas');c.width=1920;c.height=1220;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#1c1e24';g.fillRect(0,0,1920,1220);
 glyphs(g,'STYLE MATCH - REDRAWN VEHICLES (NATIVE PX, 2X) VS REFERENCE ART (RIGHT)',30,14,3,'#ffe060');
 const items=[['tank','TIGER I (BOSS WW2)'],['t62','T-62 (BOSS COLD WAR)'],['mbt','T-90-TYPE (BOSS MODERN)'],['abrams','M1 ABRAMS (MODERN SET PIECE)'],['f22','F-22 (MODERN STRIKE)'],['f15','F-15 (MODERN STRIKE)']];
 items.forEach(([k,n],i)=>{const x=30+(i%2)*600,y=60+(i>>1)*390;glyphs(g,n,x,y,2,'#fff');const s=SPR[k].c;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+20,y+30+s.height*2-10,s.width*2-40,12);g.drawImage(s,x,y+30,s.width*2,s.height*2)});
 return c}
