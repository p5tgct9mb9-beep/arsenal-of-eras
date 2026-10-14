'use strict';
// ---- Realism pass 2: hand-built soldiers (32x48, ~6.5 heads tall), enemy robots/drones, boss vehicles, terrain, particles.
// ===================== SOLDIERS =====================
function rSeg(pb,x0,y0,x1,y1,r0,r1,colf,dk=0){const K=pb.k||1;const dx=x1-x0,dy=y1-y0,L2=dx*dx+dy*dy||1;
 const bx0=Math.floor((Math.min(x0,x1)-r0-1)*K),bx1=Math.ceil((Math.max(x0,x1)+r0+1)*K),by0=Math.floor((Math.min(y0,y1)-r0-1)*K),by1=Math.ceil((Math.max(y0,y1)+r0+1)*K),ew=.8;
 for(let J=by0;J<=by1;J++)for(let I=bx0;I<=bx1;I++){const i=I/K,j=J/K,px=(I+.5)/K-x0,py=(J+.5)/K-y0;let t=(px*dx+py*dy)/L2;t=Math.max(0,Math.min(1,t));const qx=px-dx*t,qy=py-dy*t,d=Math.hypot(qx,qy),r=r0+(r1-r0)*t;if(d>r)continue;
  const side=(qx*.8-qy*.6)/(r||1);let l=.58+.24*side-dk;if(K>1){l+=(RSPEC[STYLE]||0)*Math.exp(-(((side-.55)/.25)**2))}if(d>r-ew/(K>1?1.4:1))l-=.12;pb.sr(I,J,rTone(colf(i,j),l,I,J))}}
function rBlob(pb,pts,colf,o={}){rPart(pb,pts,colf,Object.assign({top:.74,bot:.42,lx:.12},o))}
const SKINS=[[214,168,132],[176,124,92],[132,90,64],[224,184,150],[150,104,76]];
function rCamoU(u){const C0=u.col,seed=u.key.length*13+u.key.charCodeAt(0);return(i,j)=>{const v=fbm(i*.28+seed,j*.22),w=fbm(i*.33+seed+40,j*.3+9);switch(u.camo){
 case'mm14':{const q=fbm((i>>1)*.55+seed,(j>>1)*.5);return q>.63?[66,76,48]:q>.53?[116,108,76]:q<.32?[58,52,40]:[100,104,74]}
 case'multi':return v>.64?[106,92,64]:w>.66?[96,104,70]:v<.3?[150,138,104]:hash(i+seed,j)>.95?[186,174,138]:[132,122,90];
 case'frog':return v>.6?[92,76,52]:v<.34?[70,88,54]:[104,110,74];
 case'tiger':return Math.sin(i*.7+j*.18+v*5)>.4?[38,42,30]:v>.6?[112,104,66]:[80,88,56];
 case'erdl':return v>.63?[62,50,36]:w>.62?[118,108,74]:v<.32?[66,86,50]:[86,96,60];
 case'exo':return((i+j*3)%9==0)?mix(C0,[0,0,0],.25):C0;case'suit':return C0;default:return v>.62?mix(C0,[0,0,0],.12):C0}}}
function mkTrooperR(u,fr){const pb=new PB(32,48),seed=u.key.length*7+u.key.charCodeAt(1),SK=SKINS[seed%SKINS.length],cam=rCamoU(u),sci=u.camo=='exo'||u.camo=='suit',ww2=u.wpn=='garand'||u.wpn=='thompson'||u.wpn=='carbine',
 modern=!!u.plate,BOOT=sci?(u.camo=='suit'?[190,190,196]:[70,74,84]):modern?[150,124,88]:[64,48,36],GLV=modern?[84,76,60]:sci?mix(u.col,[0,0,0],.3):SK,WEB=ww2?[150,138,100]:[96,98,70];
 // pose
 let th=[6,-6],kn=[4,4],lean=0,bob=0;if(fr>=1&&fr<=4){const p=(fr-1)/4*6.283+.6;th=[Math.sin(p)*34,Math.sin(p+3.1416)*34];kn=[12+40*Math.max(0,Math.cos(p)),12+40*Math.max(0,Math.cos(p+3.1416))];lean=2;bob=(fr==2||fr==4)?-1:0}
 else if(fr==5){th=[48,-24];kn=[78,56];lean=1}else if(fr==6){th=[16,-12];kn=[10,6];lean=0}
 const hip=[15+lean*.5,29+bob],D=a=>a*Math.PI/180;const leg=(k,dk)=>{const a=D(th[k]),b=D(th[k]-kn[k]);const kx=hip[0]+Math.sin(a)*9,ky=hip[1]+Math.cos(a)*9,fx=kx+Math.sin(b)*9.5,fy=ky+Math.cos(b)*9.5;return{kx,ky,fx,fy,dk}};
 let L1=leg(1,.16),L0=leg(0,0);if(fr!=5){const lo=Math.max(L1.fy,L0.fy)+2.2,sh=47-lo;hip[1]+=sh;L1=leg(1,.16);L0=leg(0,0)}
 const drawLeg=L=>{rSeg(pb,hip[0],hip[1],L.kx,L.ky,2.6,2.2,cam,L.dk);rSeg(pb,L.kx,L.ky,L.fx,L.fy,2.2,1.9,ww2&&!sci?(i,j)=>j>L.fy-4?[150,138,100]:cam(i,j):cam,L.dk);
  rBlob(pb,[[L.fx-2.4,L.fy-1.6],[L.fx+1.6,L.fy-1.6],[L.fx+4.6,L.fy+.4],[L.fx+4.6,L.fy+2.2],[L.fx-2.4,L.fy+2.2]],BOOT,{top:.6,bot:.3})};
 const sx=hip[0]+lean+1,sy=hip[1]-14;// shoulder
 // back gear
 if(u.radio){rBlob(pb,[[sx-9,sy],[sx-3,sy-1],[sx-3,sy+11],[sx-9,sy+11]],sci?[90,94,104]:[76,78,60]);for(let y=sy-9;y<sy;y++)pb.set(sx-7,y,[34,34,34])}
 else if(u.chute||u.jet||u.life){rBlob(pb,[[sx-8,sy],[sx-3,sy-1],[sx-3,sy+12],[sx-8,sy+12]],u.jet?[120,124,134]:u.life?[200,202,208]:[112,108,80]);if(u.jet){pb.set(sx-7,sy+13,[255,190,80]);pb.set(sx-6,sy+13,[255,140,40])}}
 else if(!sci){rBlob(pb,[[sx-7,sy+1],[sx-3,sy],[sx-3,sy+10],[sx-7,sy+9]],ww2?[120,112,80]:modern?[128,112,82]:[86,92,60])}
 if(u.rope)rE(pb,sx-5,sy+12,3,3.5,[150,122,82],{top:.6});
 drawLeg(L1);
 // far arm (support)
 const ry=sy+4+(fr==6?0:0),rx=fr==6?-1:0;const fa=[sx+1,sy+1],fe=[sx+5,sy+6],fh=[sx+10+rx,ry+1];rSeg(pb,fa[0],fa[1],fe[0],fe[1],1.9,1.7,cam,.2);rSeg(pb,fe[0],fe[1],fh[0],fh[1],1.7,1.5,cam,.2);
 // torso
 rBlob(pb,[[hip[0]-3,hip[1]+1],[sx-3,sy-1],[sx+3,sy-2],[sx+5,sy+3],[hip[0]+4,hip[1]+1]],cam,{top:.76,bot:.46});
 drawLeg(L0);
 if(modern){rBlob(pb,[[sx-3,sy],[sx+4,sy-1],[sx+6,sy+4],[sx+6,sy+11],[sx-3,sy+11]],u.camo=='mm14'?[98,100,72]:[126,110,80],{top:.8,bot:.4});for(let q=0;q<3;q++)rR(pb,sx+1+q*2,sy+7,1.6,4,u.camo=='mm14'?[86,90,62]:[112,98,72],{top:.7,bev:.5});rLine(pb,sx-2,sy+3,sx+5,sy+3,1)}
 else if(u.camo=='exo'){rBlob(pb,[[sx-3,sy],[sx+5,sy-1],[sx+6,sy+10],[sx-3,sy+11]],u.col,{top:.92,bot:.42});pb.line(sx-2,sy+5,sx+5,sy+5,u.acc);pb.set(sx+3,sy+2,u.acc)}
 else if(u.camo=='suit'){rBlob(pb,[[sx-2,sy+1],[sx+5,sy],[sx+5,sy+7],[sx-2,sy+7]],[190,194,200],{top:.85});pb.set(sx,sy+3,u.acc);pb.set(sx+1,sy+3,u.acc);pb.set(sx+3,sy+3,[60,200,255])}
 else{pb.line(sx-1,sy,sx+1,hip[1]-2,WEB);pb.line(sx+3,sy-1,sx+3,hip[1]-2,WEB);if(ww2||u.camo!='default')rR(pb,hip[0]-3,hip[1]-3,8,2,WEB,{top:.7,bev:.4});rE(pb,hip[0]-2,hip[1]+1,1.8,2.2,[96,100,70],{top:.6})}
 rR(pb,hip[0]-3,hip[1]-1,8,1.5,sci?[150,150,160]:[58,52,40],{bev:0});
 if(u.medbag)rBlob(pb,[[hip[0]-4,hip[1]-6],[hip[0],hip[1]-6],[hip[0],hip[1]],[hip[0]-4,hip[1]]],u.camo=='multi'?[110,96,70]:[130,120,90]);
 if(u.armband)rR(pb,sx-1,sy+1,3,2,[240,240,236],{bev:.3});if(u.uaflag){rR(pb,sx-1,sy+1,3,1,[0,87,183],{bev:0});rR(pb,sx-1,sy+2,3,1,[255,215,0],{bev:0})}
 if(u.patch){pb.set(sx-1,sy+1,[22,22,22]);pb.set(sx,sy+1,[230,230,230]);pb.set(sx-1,sy+2,[22,22,22])}if(u.scroll){pb.set(sx-1,sy,[30,30,30]);pb.set(sx,sy,[200,170,60])}
 // head
 const hx=sx+1.5,hy=sy-6;rSeg(pb,sx+.5,sy-1,hx,hy+2,1.5,1.5,()=>SK,.05);
 if(u.head=='space'){rE(pb,hx,hy,5.2,5.6,u.hc,{top:.75});rE(pb,hx+2,hy,3,3.2,[40,60,110],{top:.7});pb.set(hx+1,hy-2,[230,240,255]);pb.line(hx-4,hy+5,hx+3,hy+5,u.acc)}
 else if(u.head=='exo'){rE(pb,hx,hy,4.4,4.8,u.hc,{top:.78});rR(pb,hx,hy-1,4.6,2,u.acc,{top:.9,bev:0});pb.set(hx+2,hy-1,[255,255,255]);rR(pb,hx-4,hy+3,6,2,mix(u.hc,[0,0,0],.35),{bev:0})}
 else{rE(pb,hx,hy+.5,3.2,3.8,SK,{top:.7});pb.set(hx+2,hy,[34,26,22]);pb.set(hx+3,hy+1,mix(SK,[0,0,0],.2));pb.set(hx-1,hy+.5,mix(SK,[0,0,0],.3));pb.set(hx+2,hy+3,mix(SK,[60,30,20],.3));
  if(!modern&&u.head!='band')pb.line(hx-2,hy+3,hx+1,hy+4,mix(SK,[0,0,0],.15));
  const hc=u.hc;
  if(u.head=='beret'){rE(pb,hx-.5,hy-2.6,4.2,1.9,hc,{top:.72});rE(pb,hx-3,hy-2,1.8,1.6,hc,{top:.5});pb.set(hx+1,hy-3,[230,200,90]);pb.line(hx-3,hy-1,hx+3,hy-1,mix(hc,[0,0,0],.4))}
  else if(u.head=='boonie'){rE(pb,hx,hy-2.4,3.6,2.6,hc,{top:.7});rR(pb,hx-6,hy-1,12,1.4,hc,{top:.7,bev:.6})}
  else if(u.head=='band'){rR(pb,hx-3.5,hy-3,7,2,(i,j)=>fbm(i*.6,j*.6)>.5?[44,48,32]:hc,{top:.7,bev:.4});pb.set(hx-4,hy-1,hc);pb.set(hx-5,hy,hc)}
  else{const m1=u.head=='m1'||u.head=='m1cov'||u.head=='pot',hcol=u.head=='m1cov'?(i,j)=>fbm(i*.7,j*.7)>.5?[90,76,50]:hc:u.head=='pot'?(i,j)=>hash(i,j)>.75?[60,70,40]:hc:hc;
   recP({t:'helmet',ell:[hx-.3,hy-1.4,m1?4.6:4.1,m1?3.8:3.5]});pb.ell(hx-.3,hy-1.4,m1?4.6:4.1,m1?3.8:3.5,(i,j,dx,dy)=>j>hy-(m1?.5:1.2)?pb.get(i,j):rTone(typeof hcol=='function'?hcol(i,j):hcol,.66-.3*dy-.1*dx,i,j));
   if(m1){pb.line(hx-5,hy-.5,hx+4,hy-.5,mix(hc,[0,0,0],.4));pb.line(hx+2,hy+1,hx+1,hy+4,[70,64,48])}else{rR(pb,hx-2.5,hy-.5,2,2.5,[50,50,46],{top:.5,bev:0});pb.set(hx+1,hy-4,[60,60,56]);pb.set(hx+2,hy-4,[60,60,56])}
   if(u.head=='pot')pb.line(hx-3,hy-3,hx+1,hy-3,[40,40,34]);if(u.diamond)rR(pb,hx-3,hy-3,1.6,1.6,[230,140,40],{bev:0});
   if(u.nvg){rR(pb,hx+1,hy-5,3,2.4,[44,44,44],{top:.6});pb.set(hx+4,hy-4,[100,150,100])}}}
 // weapon (stock at shoulder, muzzle ~x30)
 const W0=[46,46,46],WD=[118,78,44],MT=[54,54,52],wy=ry,X0=sx-2+rx;
 const gun={garand:()=>{rBlob(pb,[[X0-1,wy],[X0+12,wy-1],[X0+21,wy-1],[X0+21,wy+1],[X0+5,wy+2],[X0-1,wy+3]],WD,{top:.7});rR(pb,X0+6,wy-2,10,1.2,MT,{bev:0});pb.line(X0+21,wy-1,X0+29,wy-1,[60,60,58])},
  thompson:()=>{rBlob(pb,[[X0-1,wy],[X0+5,wy],[X0+5,wy+2],[X0-1,wy+3]],WD);rR(pb,X0+5,wy-1.5,10,3,MT,{top:.7});rR(pb,X0+8,wy+1.5,3,4,MT,{top:.6});rR(pb,X0+13,wy+1.5,2,3,WD,{top:.6});rR(pb,X0+15,wy-1,8,2,[70,70,66],{top:.7});for(let x=X0+16;x<X0+22;x+=2)pb.set(x,wy-1|0,[30,30,30])},
  carbine:()=>{rBlob(pb,[[X0-1,wy],[X0+10,wy-1],[X0+18,wy-1],[X0+18,wy+1],[X0+4,wy+2],[X0-1,wy+3]],WD);rR(pb,X0+8,wy+1,2,3,MT,{bev:0});pb.line(X0+18,wy-1,X0+26,wy-1,[60,60,58])},
  m16:()=>{rBlob(pb,[[X0-1,wy-.5],[X0+5,wy-.5],[X0+5,wy+2.5],[X0-1,wy+3]],W0);rR(pb,X0+5,wy-1.5,8,3.5,W0,{top:.7});rR(pb,X0+8,wy-4,1.4,2.6,W0,{bev:0});rR(pb,X0+8,wy+2,2.2,5,W0,{top:.6});rBlob(pb,[[X0+13,wy-1],[X0+21,wy-.5],[X0+21,wy+1.5],[X0+13,wy+2]],[60,60,58]);pb.line(X0+21,wy,X0+28,wy,[50,50,50]);pb.set(X0+24,wy-1,[50,50,50])},
  stoner:()=>{rBlob(pb,[[X0-1,wy-.5],[X0+5,wy-.5],[X0+5,wy+2.5],[X0-1,wy+3]],W0);rR(pb,X0+5,wy-1.5,11,3.5,W0,{top:.7});rR(pb,X0+7,wy+2,5,5,[78,80,56],{top:.6});rR(pb,X0+16,wy-.5,6,2,MT,{top:.7});pb.line(X0+22,wy,X0+30,wy,[50,50,50])},
  laser:()=>{rBlob(pb,[[X0-1,wy-1],[X0+4,wy-1],[X0+4,wy+2],[X0-1,wy+3]],[80,84,94]);rBlob(pb,[[X0+4,wy-2],[X0+20,wy-1.5],[X0+22,wy+1],[X0+20,wy+2.5],[X0+4,wy+2.5]],[150,156,170],{top:.85});pb.line(X0+7,wy,X0+18,wy,u.acc||[90,230,255]);rR(pb,X0+22,wy-.5,6,2,[90,94,104]);pb.set(X0+28,wy,[140,240,255])},
  blaster:()=>{rBlob(pb,[[X0,wy-1],[X0+4,wy-1],[X0+4,wy+2],[X0,wy+3]],[150,150,160]);rBlob(pb,[[X0+4,wy-2],[X0+18,wy-1.5],[X0+20,wy+1],[X0+18,wy+2.5],[X0+4,wy+2.5]],[210,212,220],{top:.85});pb.line(X0+7,wy,X0+15,wy,u.acc);rR(pb,X0+20,wy-.5,5,2,[120,120,130])},
  m4:()=>{rBlob(pb,[[X0-1,wy-.5],[X0+4,wy-1],[X0+4,wy+2.5],[X0,wy+3]],[60,58,50]);rR(pb,X0+4,wy-1.5,8,3.5,u.camo=='mm14'?[52,52,50]:[150,128,94],{top:.7});rR(pb,X0+7,wy-3.5,4,2,[36,36,36],{top:.6});pb.set(X0+9,wy-4,[120,200,255]);
   rBlob(pb,[[X0+7,wy+2],[X0+9.5,wy+2],[X0+10.5,wy+7],[X0+8,wy+7]],[52,52,50]);rR(pb,X0+5,wy+2,1.6,3,[40,40,40],{bev:0});rR(pb,X0+12,wy-1.5,9,3,[64,64,60],{top:.7});for(let x=X0+13;x<X0+21;x+=2)pb.set(x,wy-1|0,[36,36,36]);pb.line(X0+21,wy,X0+28,wy,[44,44,44]);rR(pb,X0+27,wy-.5,2,2,[40,40,40],{bev:0})}};
 (gun[u.wpn]||gun.m4)();
 // near arm (trigger hand)
 const na=[sx-.5,sy+1],ne=[sx-1,sy+7],nh=[sx+5+rx,wy+2];rSeg(pb,na[0],na[1],ne[0],ne[1],2,1.8,cam);rSeg(pb,ne[0],ne[1],nh[0],nh[1],1.8,1.6,cam);rE(pb,nh[0],nh[1],1.5,1.5,GLV,{top:.65});rE(pb,fh[0],fh[1],1.5,1.5,GLV,{top:.55});
 if(!sci)rWeather(pb,ww2?[150,136,100]:[150,138,110],.35);pb.outline(OUT);return pb}
// enemy combat robots (20x26) and recon drones (22x12)
function mkBotR(pal,fr){const pb=new PB(20,26),[B,Dk,E]=pal,lo=fr?1:0,M=mix(B,[90,92,96],.35).map(v=>v|0);
 rSeg(pb,10,15,7-lo,20,2,1.6,()=>Dk,.15);rSeg(pb,7-lo,20,8-lo,24,1.6,1.4,()=>Dk,.15);rR(pb,5-lo,23.5,6,2,[44,44,48],{top:.5});
 rBlob(pb,[[5,8],[14,7],[16,10],[15,17],[6,17],[4,12]],M,{top:.82,bot:.38});rLine(pb,6,12,15,12);rE(pb,10,14,1.6,1.6,[200,96,40],{top:.8});
 rSeg(pb,10,15,13+lo,20,2,1.6,()=>Dk);rSeg(pb,13+lo,20,12+lo,24,1.6,1.4,()=>Dk);rR(pb,10+lo,23.5,6,2,[54,54,58],{top:.6});
 rBlob(pb,[[7,1],[14,1],[15,4],[14,7],[7,7]],M,{top:.86,bot:.4});rR(pb,10,3,5,1.6,E,{top:.95,bev:0});pb.set(13,3,[255,255,255]);pb.line(9,0,9,1,[60,60,60]);
 rSeg(pb,6,9,3,13,1.6,1.4,()=>Dk,.1);rR(pb,-1,11,6,2.4,[46,46,50],{top:.7});pb.set(0,12,[20,20,20]);pb.outline([14,12,16]);return pb}
function mkDroneR(pal,fr){const pb=new PB(22,12),[B,Dk,E]=pal,M=mix(B,[90,92,96],.35).map(v=>v|0);for(const x of[1,14]){for(let i=0;i<7;i++)pb.set(x+i,2,(i+fr)%2?[70,70,70]:[160,160,160]);pb.set(x+3,3,[40,40,40])}
 rSeg(pb,4,4,9,6,1,1,()=>Dk);rSeg(pb,17,4,13,6,1,1,()=>Dk);rBlob(pb,[[5,5],[17,5],[18,8],[15,10],[7,10],[4,8]],M,{top:.84,bot:.38});rE(pb,11,9,1.6,1.6,E,{top:.9});rLine(pb,6,7,16,7);pb.outline([14,12,16]);return pb}
// ===================== scaled land designer (150x72 design space) =====================
function rLand(w,h,fn,o={}){const pb=new PB(w,h),dw=o.dw||150,s=Math.min(w/dw,h/72),oy=h-72*s;const X=x=>x*s,Y=y=>oy+y*s,S=p=>p.map(([x,y])=>[X(x),Y(y)]);
 const T={pb,s,P:(p,b,q)=>rPart(pb,S(p),b,q),R:(x,y,ww,hh,b,q)=>rPart(pb,S([[x,y],[x+ww,y],[x+ww,y+hh],[x,y+hh]]),b,q),E:(x,y,rx,ry,b,q)=>rE(pb,X(x),Y(y),rx*s,ry*s,b,q),L:(a,b,c,d,hl)=>rLine(pb,X(a),Y(b),X(c),Y(d),hl),
  Rv:(x0,y,x1,st)=>rRiv(pb,X(x0)|0,Y(y)|0,X(x1)|0,Math.max(3,st*s|0)),W:(x,y,r,b,q)=>rWheel(pb,X(x),Y(y),r*s,b,q),Ty:(x,y,r,b)=>rTyre(pb,X(x),Y(y),r*s,b),Trk:(x0,x1,a,b,q={})=>rTrack(pb,X(x0)|0,X(x1)|0,Y(a)|0,Y(b)|0,{ch:(q.ch||6)*s|0}),
  Sp:(x,y,r,b)=>rSprocket(pb,X(x),Y(y),r*s,b),Ant:(x,y0,y1)=>antenna(pb,X(x)|0,Y(y0)|0,Y(y1)|0,[44,44,42]),
  Gun:(x0,y,x1,r,b)=>{rPart(pb,S([[x0,y-r],[x1,y-r*.8],[x1,y+r*.8],[x0,y+r]]),b,{top:.85,bot:.3});return x1},Dk:(p,c)=>rSolid(pb,S(p),c)};
 fn(T);pb.piv=o.piv?[X(o.piv[0])|0,Y(o.piv[1])|0]:null;return pb}
function dAbrams(T,gun){const M=RP.tan;if(gun){T.Gun(124,27,206,2.4,[150,134,98]);T.R(176,24.8,10,4.4,[150,134,98],{top:.8})}T.Trk(6,144,56,71);for(let k=0;k<7;k++)T.W(20+k*18,65,6,M);T.Sp(14,61,5,M);
 T.P([[8,36],[124,36],[148,44],[146,52],[8,52]],M,{top:.82,bot:.45});T.P([[10,44],[142,44],[140,59],[12,59]],M,{top:.78,bot:.5});for(let x=30;x<140;x+=18)T.L(x,45,x,58);T.L(10,47,140,47);T.Rv(14,56,138,6);T.R(120,45,20,14,rLt(M,.04),{top:.8});
 T.P([[12,22],[34,22],[34,34],[12,34]],[120,108,80],{top:.6,bot:.4,bev:.5});for(let x=13;x<34;x+=2.4)T.L(x,23,x,33,0);T.P([[30,36],[36,22],[100,19],[128,26],[128,32],[110,36]],M,{top:.88,bot:.4});T.L(40,29,124,29);T.Rv(40,24,100,8);
 T.R(116,22,10,9,M,{top:.75});T.R(96,14,12,6,M,{top:.85});T.R(98,15,8,3,[40,46,50],{bev:0});T.R(62,14,14,6,M);T.R(64,10,6,4,[46,46,42]);T.R(66,11,18,1.4,[40,40,38],{bev:0});T.Ant(40,2,22);T.Ant(46,6,22);
 T.R(80,10,8,4,[70,70,66]);rWeather(T.pb,[170,150,110],.8)}
function dT62(T){const M=[86,98,64];T.Gun(116,24,206,2.2,[80,88,58]);T.R(176,22,8,4.4,[80,88,58]);T.Trk(8,142,54,71,{ch:7});for(let k=0;k<5;k++)T.W(26+k*24,62,9,M,{disc:.72});T.Sp(136,60,6,M);T.W(14,60,6,M);
 T.P([[10,38],[112,36],[146,46],[142,56],[10,56]],M,{top:.8,bot:.42});T.L(12,48,140,48);T.Rv(14,42,104,9);for(let x=24;x<112;x+=22)T.R(x,42,16,5,[70,78,50],{top:.7});T.R(16,30,20,8,[60,62,56],{top:.6});
 T.P([[40,36],[46,24],[62,15],[94,14],[112,22],[118,30],[110,36]],M,{top:.88,bot:.36,round:.18});T.R(64,10,10,5,M);T.R(84,10,8,4,M);T.E(100,22,3,2,[60,60,56]);T.Rv(54,30,110,9);T.Ant(52,0,24);rWeather(T.pb,[140,124,94],.9)}
function dT90(T){const M=[78,88,58],cam=rCamo([M,[120,110,74],[44,46,36]],.05,5);T.Gun(118,27,206,2.3,[70,76,52]);T.R(150,25,6,4.4,[60,64,48]);T.Trk(6,144,56,71);for(let k=0;k<6;k++)T.W(22+k*20,64,7.5,M);T.Sp(138,61,5.5,M);
 T.P([[8,38],[118,36],[148,46],[146,54],[8,54]],cam,{top:.82,bot:.45});T.P([[10,44],[144,44],[142,58],[12,58]],[60,58,48],{top:.6,bot:.4});for(let x=14;x<142;x+=8)T.L(x,45,x,57,0);
 T.P([[34,38],[40,26],[60,20],[100,20],[122,28],[122,34],[110,38]],cam,{top:.86,bot:.4,round:.12});for(let x=86;x<120;x+=7)T.P([[x,22],[x+6,24],[x+6,30],[x,28]],cam,{top:.9,bot:.5});
 T.R(56,14,14,6,cam);T.R(74,12,12,6,[40,46,50],{top:.6});T.R(60,10,18,1.4,[40,40,38],{bev:0});T.Ant(44,2,24);rWeather(T.pb,[140,124,94],.9)}
function mkRJeep2(){return rLand(150,72,T=>{const M=RP.od;T.P([[30,42],[88,42],[90,36],[128,37],[132,40],[134,56],[30,56]],M,{top:.86,bot:.44});T.P([[112,44],[136,44],[136,52],[128,52],[120,46],[112,46]],M,{top:.7});
 T.R(128,38,6,15,rDk(M,.12),{top:.6});for(let x=129;x<134;x+=1.6)T.L(x,40,x,52,0);T.E(132,40,1.6,1.6,[210,206,180]);T.Dk([[36,54],[70,54],[66,46],[40,46]],[30,30,28]);T.Dk([[96,54],[124,54],[120,46],[100,46]],[30,30,28]);
 T.R(88,22,2,16,[52,54,50]);T.R(88,22,8,2,[52,54,50]);T.R(90,24,5,12,[110,140,160],{bev:0});T.P([[44,36],[70,36],[72,42],[42,42]],[70,66,48]);T.E(26,47,7,7,[40,40,38],{top:.5});T.E(26,47,3.5,3.5,M);
 T.Ty(54,61,9.5,M);T.Ty(110,61,9.5,M);T.R(70,26,3,16,[52,52,50]);T.R(62,24,18,4,[40,40,38]);T.R(74,22,4,2,[60,60,56]);T.L(32,48,130,47);T.Rv(34,50,128,6);rStar(T.pb,58,48,3);rWeather(T.pb,RP.dust)},{piv:[78,26]})}
function mkRMQ9b(w,h){return rJetDone(rAir(w,h,A=>{const M=[170,174,180],D=rDk(M,.15);A.P([[4,18],[12,4],[18,4],[16,18]],D);A.P([[6,22],[14,22],[10,36],[6,36]],D);
 A.P([[4,17],[24,15],[66,14],[82,10],[94,12],[100,18],[98,23],[86,26],[30,25],[6,22]],M,{top:.9,bot:.42,round:.12});A.P([[30,18],[74,18],[74,21],[30,21]],D,{top:.7});A.prop(2,6,34);
 A.E(86,28,4,4,[60,62,64]);A.E(87,28,1.8,1.8,[40,60,90]);A.P([[50,25],[56,25],[56,30],[50,30]],[80,80,82]);A.L(24,19,94,18);A.Rv(14,22,92,8)}))}
function mkRMe262(w,h,o={}){return rJetDone(rAir(w,h,A=>{const M=o.col||[112,120,104],B=[150,166,176],cam=rCamo([M,[86,96,76],[132,136,118]],.08,2);A.P([[4,16],[10,0],[20,2],[22,16]],cam,{top:.86});A.P([[0,20],[20,19],[20,22],[0,23]],rDk(M,.1));
 A.P([[2,17],[30,14],[62,12],[86,14],[100,20],[86,24],[56,26],[30,24],[4,22]],(i,j)=>j>A.h*.58?B:cam(i,j),{top:.88,bot:.42,round:.1});A.can([[48,13],[54,7],[66,7],[70,13]]);
 A.P([[30,22],[64,21],[70,25],[36,27]],rLt(M,.04),{top:.7});A.P([[44,26],[76,26],[80,29],[76,32],[44,32]],[100,104,96],{top:.82,bot:.35,round:.15});A.E(78,29,2,2,[40,40,40]);A.dark([[42,27],[45,27],[45,31],[42,31]],[60,56,50]);A.L(30,19,90,18);A.Rv(10,21,90,7)}))}
function mkRZero(w,h){return rJetDone(rAir(w,h,A=>{const M=[176,178,160];A.P([[4,16],[10,3],[18,4],[19,17]],M,{top:.86});A.P([[0,20],[18,19],[18,23],[0,23]],rDk(M,.1));
 A.P([[2,17],[40,14],[78,13],[90,13],[90,27],[78,28],[40,26],[4,22]],M,{top:.9,bot:.42,round:.1});A.P([[84,11],[95,13],[95,29],[84,30]],[40,40,40],{top:.7,round:.2});A.prop(97,0,40);A.can([[44,13],[50,5],[70,5],[76,13]]);A.L(56,6,56,13,0);
 A.P([[34,23],[66,22],[72,28],[38,29]],M,{top:.7});A.L(40,20,84,19);A.Rv(10,21,82,6)}))}
function mkRMig21(w,h){return rJetDone(rAir(w,h,A=>{const M=[176,180,184];A.P([[4,16],[12,0],[22,2],[22,16]],M,{top:.86});A.P([[0,21],[16,20],[16,23],[0,23]],rDk(M,.1));
 A.P([[2,17],[30,14],[70,13],[96,17],[96,24],[70,26],[30,26],[4,23]],M,{top:.9,bot:.42,round:.1});A.E(97,20.5,2.5,2.5,[90,90,92]);A.dark([[96,18],[100,18],[100,23],[96,23]],[30,30,32]);A.can([[62,13],[68,8],[76,9],[80,14]]);
 A.P([[24,22],[62,20],[40,30],[26,30]],rLt(M,.04),{top:.7});A.L(30,20,92,19);A.Rv(10,22,90,7)}))}
function mkRSu57(w,h,o={}){return rJetDone(rAir(w,h,A=>{const M=o.col||[118,128,140],cam=rCamo([M,[94,104,118],[150,160,170]],.07,9);A.P([[8,15],[15,2],[23,2],[28,15]],cam);A.P([[0,22],[22,21],[24,26],[2,27]],rDk(M,.15));
 A.P([[2,17],[30,14],[58,13],[70,11],[86,15],[100,21],[86,24],[60,27],[30,27],[4,25]],cam,{top:.86,bot:.42});if(o.canard)A.P([[64,17],[72,16],[70,19]],rDk(M,.1));A.P([[26,22],[56,20],[62,26],[30,29]],rLt(M,.05),{top:.7});
 A.E(2,19,2,2,[70,66,60]);A.E(2,24,2,2,[70,66,60]);A.dark([[54,19],[62,18],[62,25],[54,25]],[40,42,48]);A.can([[66,12],[72,6],[84,8],[90,15]],[150,130,80]);A.L(30,21,84,19);A.Rv(20,24,88,9)}))}
function mkRHind(w,h){return rJetDone(rAir(w,h,A=>{const cam=rCamo([[110,104,72],[70,84,52],[150,134,96]],.06,4);const rot=y=>{recP({t:'rotor',x0:w*.08,x1:w*.96,y:y*h/40});for(let x=w*.08|0;x<w*.96;x++){A.pb.set(x,y*h/40|0,[40,40,40]);if(x%3)A.pb.set(x,(y*h/40|0)-1,[90,90,88])}};
 A.P([[2,15],[44,16],[44,22],[2,20]],cam,{top:.86});A.P([[0,6],[6,8],[8,21],[2,21]],cam);A.E(4,13,2.5,5.5,[50,50,48],{bev:0});A.P([[36,12],[76,10],[90,14],[100,22],[96,28],[84,31],[40,31]],cam,{top:.86,bot:.42,round:.1});
 A.can([[74,13],[80,8],[86,10],[88,15]],[80,104,118]);A.can([[86,17],[92,13],[98,17],[100,22]],[80,104,118]);A.P([[44,7],[70,7],[72,12],[42,12]],cam);rot(5);A.P([[50,24],[74,22],[76,27],[52,29]],rDk([110,104,72],.1));A.P([[52,29],[74,29],[74,33],[52,33]],[70,72,64]);
 A.dark([[54,18],[62,18],[62,24],[54,24]],[34,36,32]);A.E(96,30,2.5,2.5,[40,40,40]);A.L(46,31,46,37);A.L(86,31,86,37);A.E(46,37,2,2,[30,30,30]);A.E(86,37,2,2,[30,30,30]);A.Rv(38,20,88,6)}))}
function mkRShahed(w,h){return rJetDone(rAir(w,h,A=>{const M=[150,148,140];A.P([[0,10],[30,6],[100,18],[100,22],[30,30],[0,30]],M,{top:.86,bot:.4});A.P([[0,4],[6,4],[8,14],[2,14]],rDk(M,.1));A.prop(1,10,30);A.L(20,20,90,20)}))}
// ===================== backgrounds =====================
function rSkyGrad(w,h,top,bot,o={}){const pb=new PB(w,h),sun=o.sun;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=y/h,e=t*t*(3-2*t);let c=mix(top,bot,Math.pow(t,o.pw||1.1));c=mix(c,mix(bot,[255,236,200],.25),Math.max(0,(t-.7)/.3)*.35);
  if(sun){const dx=x-sun[0],dy=(y-sun[1])*1.3,d=Math.sqrt(dx*dx+dy*dy);c=mix(c,[255,240,200],Math.max(0,1-d/(sun[2]*6))*.35+(d<sun[2]?.9:0))}
  if(o.cirrus){const n=fbm(x*.012,y*.09+3);if(n>.62&&t<.6)c=mix(c,[250,250,248],(n-.62)*1.6*(1-t))}if(o.stars&&hash(x,y)>.996)c=[255,255,255];
  const d=(bay[(y&3)*4+(x&3)]/16-.5)*3;pb.set(x,y,c.map(v=>cl(v+d)))}return pb.canvas()}
const perN=(x,W,f,o)=>{let v=0,a=1,s=0;for(let k=0;k<4;k++){const P=Math.round(W*f*Math.pow(2.1,k)/W)||1;v+=a*Math.sin(x/W*P*6.283+o*(k+1)*1.7+k);s+=a;a*=.5}return v/s};
function rRidge(W,H,base,amp,col,haze,o={}){const pb=new PB(W,H),tops=[];for(let x=0;x<W;x++){let t=base-perN(x,W,o.f||3,o.seed||1)*amp;if(o.city){const b=Math.floor(x/(o.bw||18)),hh=hash(b,o.seed||3);t=base-20-hh*o.city;const bx=x%(o.bw||18);if(bx<2||hh<.15)t=base;if(hh>.5&&bx>(o.bw||18)*.5)t+=((bx*3)%7)+hash(b,9)*14}
  tops.push(t);for(let y=Math.max(0,t|0);y<H;y++){let c=col;if(o.city&&t<base-1){const bx=x%(o.bw||18);if(bx>3&&(bx%5<2)&&((y-(t|0))%7>2)&&y<base-2&&hash(x>>1,y>>2)>.35)c=mix(col,[10,10,14],.45)}
   if(o.snow&&y<t+5+hash(x,1)*4&&t<base-amp*.4)c=[236,240,246];const f=haze*(1-Math.min(1,(y-t)/80));pb.set(x,y,lit(mix(mix(c,[0,0,0],Math.min(.25,(y-t)*.004)),o.hz,f),1,x,y))}}
 if(o.trees){const R0=mulberry(o.seed||7);for(let k=0;k<o.trees;k++){const x=(R0()*W)|0,y=tops[x]+2,r=3+R0()*o.tr,pine=o.pine&&R0()>.3;
  for(let j=-r*2.4;j<=1;j++)for(let i=-r;i<=r;i++){const xx=((x+i)%W+W)%W;let inn=pine?Math.abs(i)<r*((j+r*2.4)/(r*2.4))+.5&&((j|0)%3!=0||Math.abs(i)<r*.6*((j+r*2.4)/(r*2.4))):(i*i)/(r*r)+((j+r)*(j+r))/(r*r*1.1)<1;if(!inn)continue;
   const l=pine?.55+.25*(-i/r):.6-.2*((j+r)/r)-.15*(i/r)+(fbm(xx*.4,j*.4)>.55?.15:0);pb.set(xx,y+j,mix(rTone(o.tc,l,xx,y+j),o.hz,haze*.8))}
  if(!pine)for(let j=0;j<4;j++)pb.set(x,y+j,mix([60,46,34],o.hz,haze))}}
 return pb.canvas()}
const BGSPEC={hills:{trees:70,tr:5,tc:[52,74,40],pine:1},peaks:{trees:60,tr:5,tc:[40,62,54],pine:1,snow:1},city:{city:60,bw:22},moon:{},towers:null};
// ===================== particles: muzzle smoke, dust, debris chunks =====================
// ===================== registration =====================
function rInstallFX(){if(rInstallFX.done)return;rInstallFX.done=1;
const _bt0=buildTiles;buildTiles=function(th){const T=_bt0(th);if(th.shape=='towers')return T;const hz=th.sky[1],sp=BGSPEC[th.shape]||{},OY=H-270;
 T.sky=rSkyGrad(W,H,th.sky[0],th.sky[1],{sun:th.shape=='city'?[470,190,10]:th.shape=='hills'?[520,70,8]:null,cirrus:th.shape=='hills'||th.shape=='peaks',stars:th.shape=='moon',pw:1.2});
 if(th.shape=='moon'){const s=T.sky.getContext('2d');s.drawImage(_bt0(th).sky,0,0,W,140,0,0,W,140)}
 T.far=rRidge(W,H,150+OY,th.shape=='peaks'?70:40,th.far,.55,Object.assign({},sp,{hz,seed:2,f:2,trees:0,city:sp.city?70:0,bw:30}));
 T.mid=rRidge(W,H,200+OY,th.shape=='peaks'?40:30,th.mid,.2,Object.assign({},sp,{hz,seed:5,f:4,city:sp.city?40:0,bw:20}));return T};
for(const e of ERAS){const b=e.bb,r=BBG[e.id];if(r&&!b.neon)r.sky=rSkyGrad(W,H,b.top,b.bot,{cirrus:!!b.clouds,stars:!!b.stars,sun:b.clouds?[500,80,8]:null})}
const _boom0=boom;boom=function(x,y,s=1){_boom0(x,y,s);for(let i=0;i<6*s;i++){const a=-Math.PI*R(),v=(1+R()*2.5)*s;spawn({k:'chunk',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.5,c:R()>.5?'#4a3a2a':'#6a5a44',sz:R()>.6?3:2,life:40+R()*20|0})}
 for(let i=0;i<8*s;i++)spawn({k:'dust',x:x+(R()-.5)*30*s,y:y+4,vx:(R()-.5)*1.2,vy:-.15-R()*.3,r:3+R()*4*s,life:70+R()*40|0});spawn({k:'smoke',x,y:y-6,vy:-.45,r:7*s,life:110})};
const _flash0=flash;flash=function(x,y,s=1){_flash0(x,y,s);if(R()<.5)spawn({k:'puff',x:x+2,y,vx:.3,vy:-.15,r:1.5+s,life:22})};
const _dp0=drawParts;drawParts=function(){for(const p of parts){const f=p.t/p.life;
 if(p.k=='dust'){const r=p.r*(1+f)|0,a=(1-f)*.45;G.fillStyle=`rgba(150,132,104,${a})`;G.fillRect(p.x-r|0,p.y-r*.6|0,r*2,r*1.2|0);G.fillStyle=`rgba(190,172,140,${a*.6})`;G.fillRect(p.x-r*.6|0,p.y-r*.8|0,r*1.2|0,r*.6|0)}
 else if(p.k=='puff'){const r=p.r*(1+f*2);G.fillStyle=`rgba(200,200,196,${(1-f)*.5})`;G.fillRect(p.x-r|0,p.y-r|0,r*2|0,r*2|0)}
 else if(p.k=='chunk'){p.vy+=.12;G.fillStyle=p.t<6?'#ffb040':p.c;G.fillRect(p.x|0,p.y|0,p.sz,p.sz);G.fillStyle='rgba(0,0,0,.35)';G.fillRect(p.x|0,(p.y|0)+p.sz-1,p.sz,1)}
 else if(p.k=='smoke'){const r=p.r*(1+f*1.6),a=(1-f)*.6,g=60+f*70|0;for(let k=0;k<3;k++){const ox=Math.sin(k*2.1+p.x)*r*.5,oy=Math.cos(k*1.7+p.y)*r*.35,rr=r*(.7+.15*k)|0;G.fillStyle=`rgba(${g+k*8},${g+k*8-2},${g+k*6-4},${a*(.7-.15*k)})`;G.fillRect(p.x+ox-rr|0,p.y+oy-rr|0,rr*2,rr*2);G.fillRect(p.x+ox-rr-1|0,p.y+oy-rr+2|0,rr*2+2,Math.max(1,rr*2-4))}}}
 const keep=parts;parts=keep.filter(p=>p.k!='dust'&&p.k!='puff'&&p.k!='chunk'&&p.k!='smoke');_dp0();parts=keep};
}
function buildRealArt2(mk){rInstallFX();for(const id in ROSTERS)for(const u of ROSTERS[id])SPR['u_'+u.key]=[0,1,2,3,4,5,6].map(f=>mk(mkTrooperR(u,f)));
 for(const id in LTH){if(!SPR['bot_'+id])continue;SPR['bot_'+id]=[0,1].map(f=>mk(mkBotR(LTH[id].bot,f)));SPR['drone_'+id]=[0,1].map(f=>mk(mkDroneR(LTH[id].bot,f)))}
 const SZ=k=>{const s=SPR[k];return s?[s.c.width,s.c.height]:null},A=(k,fn)=>{const z=SZ(k);if(z)SPR[k]=mk(fn(z[0],z[1]))},Lb=(k,fn)=>{const z=SZ(k);if(z)SPR[k]=mk(rLand(z[0],z[1],fn,{dw:208}))};
 Lb('abrams',T=>dAbrams(T,1));Lb('t62',dT62);Lb('mbt',dT90);{const pb=rLand(150,72,T=>dAbrams(T,0),{piv:[124,27]});const s=mk(pb);s.piv=pb.piv;SPR.abramsP=s}
 {const pb=mkRJeep2();const s=mk(pb);s.piv=pb.piv;SPR.jeep=s}A('mq9',mkRMQ9b);
 A('f22',mkRF22);A('f15',mkRF15);A('p47',mkRP47);A('f4',mkRF4);A('jet',mkRMe262);A('me262s',mkRMe262);A('apache',(w,h)=>mkRHeli(w,h,{k:'apache',col:[74,80,62]}));
 A('zero',mkRZero);A('mig21',mkRMig21);A('su57',mkRSu57);A('j20',(w,h)=>mkRSu57(w,h,{col:[70,76,86],canard:1}));A('j20B',(w,h)=>mkRSu57(w,h,{col:[70,76,86],canard:1}));
 A('hind',mkRHind);A('hindB',mkRHind);A('shahed',mkRShahed);A('me264',(w,h)=>mkRB25(w,h,{col:[100,110,96],bel:[140,156,166],enemy:1}))}
