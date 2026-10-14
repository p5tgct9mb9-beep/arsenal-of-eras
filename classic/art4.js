'use strict';
// ---- Role modes art: playable land vehicles + aircraft, enemy aircraft (reference ramp style) ----
// Land vehicles 150x72 native, facing right. Turret pivot exported as pb.piv, barrel drawn separately (aimable).
function camoF(base,alt,alt2,sc=.06,seed=0){const A=R5(base),B=alt?R5(alt):A,C=alt2?R5(alt2):A;return(i,j)=>{const v=fbm(i*sc+seed,j*sc*1.3+seed);return v>.63?B:v<.33?C:A}}
function mkLandG(o){const pb=new PB(150,72),T=R5([62,62,58]),M=R5(o.hull),cam=o.camo||M;
 if(o.type=='rover'){vRect(pb,22,34,104,10,M,.9,.3);vPoly(pb,[[30,34],[118,34],[110,24],[40,24]],M);vRect(pb,58,14,20,10,R5([200,220,230]),.95,.5);
  pb.line(40,24,30,8,[60,60,64]);vEll(pb,30,8,7,4,R5([210,210,215]),.9);for(const x of[32,66,98,122])wheelHD(pb,x,52,11,R5([150,146,136]),6);antenna(pb,110,2,24);
  rivets(pb,38,26,122,8,M);pb.outline(OUT);pb.piv=[86,28];return pb}
 if(o.type=='hover'){vPoly(pb,[[8,46],[140,46],[146,52],[130,60],[18,60],[4,52]],cam,(i,j,nx,ny)=>.85-.5*(ny+1)/2);vPoly(pb,[[22,34],[124,34],[140,46],[8,46]],cam);
  for(let x=24;x<130;x+=18)vRect(pb,x,60,12,4,R5([60,200,255]),.95,.6);panelH(pb,46,8,140,M);for(let x=30;x<130;x+=24)panelV(pb,x,35,58,M);
  vPoly(pb,[[52,20],[100,20],[110,34],[46,34]],cam);vRect(pb,60,24,8,3,R5([90,220,255]),.95,.7);antenna(pb,58,4,20);pb.outline(OUT);pb.piv=[96,26];return pb}
 const tw=o.trk||[10,140,48,66];trackHD(pb,tw[0],tw[1],tw[2],tw[3],T);const n=o.wheels||5,ws=(tw[1]-tw[0]-28)/(n-1);for(let k=0;k<n;k++)wheelHD(pb,tw[0]+14+k*ws,tw[2]+10,o.wr||8,M,6);
 wheelHD(pb,tw[0]+8,tw[2]+5,5,T,5);wheelHD(pb,tw[1]-8,tw[2]+5,5,T,5);
 if(o.bradley){vPoly(pb,[[8,30],[124,30],[144,44],[144,50],[8,50]],cam,(i,j,nx,ny)=>j<32?.95:.7-.35*(ny+1)/2);vRect(pb,16,36,110,10,cam,.8,.35); // applique
  for(let x=20;x<126;x+=14){panelV(pb,x,37,45,M);rivet(pb,x+5,39,M)}panelH(pb,30,8,124,M);
  vPoly(pb,[[56,16],[104,16],[112,30],[52,30]],cam);vRect(pb,60,8,36,8,cam,.9,.4);vRect(pb,44,12,14,12,R5([150,136,96]),.9,.3);for(let y=14;y<24;y+=3)panelH(pb,y,45,56,M);// TOW box
  vRect(pb,70,4,10,4,R5([70,70,66]),.9,.4);antenna(pb,64,0,14);antenna(pb,98,2,16);rivets(pb,33,14,120,9,M);pb.outline(OUT);pb.piv=[104,22];return pb}
 vPoly(pb,[[8,32],[128,32],[146,42],[138,50],[10,50]],cam,(i,j,nx,ny)=>j<34?.95:.75-.4*(ny+1)/2);vRect(pb,6,28,128,5,M,.9,.4);panelH(pb,42,10,140,M);rivets(pb,30,8,130,7,M);
 if(o.turret=='round')pb.ell(76,26,30,14,(i,j,dx,dy,r)=>j>30?pb.get(i,j):tone(typeof cam=='function'?cam(i,j):cam,r>.86?(dy<0?.6:.15):.9-.4*dy-.15*dx));
 else if(o.turret=='cast'){vPoly(pb,[[50,14],[92,12],[106,22],[104,30],[44,30],[42,20]],cam);pb.ell(66,14,8,4,(i,j,dx,dy)=>tone(M,.8-.3*dy))}
 else{vPoly(pb,[[46,14],[100,14],[116,22],[110,30],[40,30]],cam);vRect(pb,40,22,12,8,M,.8,.3);vRect(pb,58,8,16,6,M,.9,.4)}
 if(o.hull2)vRect(pb,22,34,20,8,R5(o.hull2),.8,.3);antenna(pb,52,0,14);if(o.ant2)antenna(pb,90,4,14);pb.outline(OUT);pb.piv=[100,22];return pb}
// Aircraft generator, facing right. w x h native.
function mkAirG(o){const w=o.w||110,h=o.h||40,pb=new PB(w,h),M=R5(o.col),D=R5(mix(o.col,[0,0,0],.25)),GL=R5([90,150,190]),cam=o.camo||M,X=(f)=>f*w|0,Y=(f)=>f*h|0;
 if(o.rotor){vPoly(pb,[[X(.02),Y(.42)],[X(.45),Y(.46)],[X(.45),Y(.56)],[X(.02),Y(.5)]],cam);vPoly(pb,[[X(.4),Y(.34)],[X(.8),Y(.34)],[X(.98),Y(.6)],[X(.86),Y(.86)],[X(.42),Y(.86)]],cam);
  vPoly(pb,[[X(.74),Y(.4)],[X(.9),Y(.48)],[X(.95),Y(.62)],[X(.78),Y(.62)]],GL,()=>.75);vRect(pb,X(.04),Y(.22),X(.05),Y(.26),D,.8,.3);vRect(pb,X(.45),Y(.6),X(.3),Y(.08),D,.8,.3);
  pb.rect(X(.2),Y(.16),X(.75),2,()=>[40,40,44]);vRect(pb,X(.56),Y(.2),X(.06),Y(.14),D);if(o.gun)pb.rect(X(.86),Y(.86),X(.12),3,()=>[40,40,40]);pb.outline(OUT);return pb}
 const nose=o.prop?.92:1;vPoly(pb,[[X(.02),Y(.42)],[X(.2),Y(.36)],[X(.72),Y(.34)],[X(nose),Y(.48)],[X(.72),Y(.62)],[X(.18),Y(.62)],[X(.02),Y(.56)]],cam,(i,j,nx,ny)=>.92-.55*(ny+1)/2);
 vPoly(pb,[[X(.62),Y(.36)],[X(.7),Y(.24)],[X(.8),Y(.24)],[X(.88),Y(.38)]],GL,(i,j)=>j<Y(.3)?.95:.6);
 if(o.delta)vPoly(pb,[[X(.25),Y(.56)],[X(.62),Y(.54)],[X(.3),Y(.94)],[X(.14),Y(.94)]],D,()=>.55);else vPoly(pb,[[X(.36),Y(.56)],[X(.56),Y(.56)],[X(.42),Y(.9)],[X(.32),Y(.9)]],D,()=>.55);
 if(!o.noTail){vPoly(pb,[[X(.03),Y(.42)],[X(.2),Y(.4)],[X(.12),Y(.04)],[X(.04),Y(.04)]],cam);if(o.twin)vPoly(pb,[[X(.1),Y(.42)],[X(.26),Y(.4)],[X(.19),Y(.1)],[X(.12),Y(.1)]],D,()=>.45)}
 vPoly(pb,[[X(.02),Y(.54)],[X(.2),Y(.56)],[X(.1),Y(.7)],[X(.0),Y(.7)]],D,()=>.5);
 if(o.prop){vRect(pb,X(.92),Y(.38),X(.06),Y(.22),D);pb.rect(X(.98),Y(.06),2,Y(.88),()=>[70,70,70])}else{vRect(pb,X(.48),Y(.46),X(.14),Y(.1),D,.4,.1);pb.rect(0,Y(.47),2,Y(.08),()=>[255,160,60])}
 for(let k=1;k<6;k++)panelV(pb,X(.12*k+.1),Y(.36),Y(.6),M);panelH(pb,Y(.5),X(.05),X(.8),M);rivets(pb,Y(.44),X(.1),X(.7),5,M);if(o.glow)pb.rect(0,Y(.45),3,Y(.1),()=>o.glow);
 if(o.pylon)vRect(pb,X(.38),Y(.68),X(.18),Y(.08),R5([200,200,196]),.9,.4);pb.outline(OUT);return pb}
const PV={ww2:[{k:'sherman',name:'M4 SHERMAN',gun:'75mm + .50 MG',hp:10,cd:38,mg:6}],cold:[{k:'m60',name:'M60 PATTON',gun:'105mm + M85 MG',hp:11,cd:36,mg:6}],
 mod:[{k:'abramsP',name:'M1 ABRAMS',gun:'120mm + M2 MG',hp:13,cd:34,mg:6},{k:'bradley',name:'M2 BRADLEY IFV',gun:'25mm BUSHMASTER',hp:10,cd:7,mg:0,tow:1,squad:1,fast:1}],
 fut:[{k:'hoverP',name:'HOVER TANK',gun:'RAIL CANNON + LASER',hp:12,cd:30,mg:5,hover:1}],space:[{k:'rover',name:'LUNAR ROVER',gun:'PULSE GUN',hp:9,cd:24,mg:5,lowg:1}]};
const PA={ww2:[{k:'p47A',name:'P-47 THUNDERBOLT'}],cold:[{k:'f4A',name:'F-4 PHANTOM II'}],mod:[{k:'f22A',name:'F-22 RAPTOR'},{k:'f15A',name:'F-15 EAGLE'}],fut:[{k:'gen6',name:'SIXTH-GEN FIGHTER'}],space:[{k:'starf',name:'STARFIGHTER'}]};
const EA={ww2:{air:['zero','me262s'],aa:'flak88',rocket:'V-2',boss:{k:'me264',name:'ME 264 AMERIKA BOMBER',hp:70}},cold:{air:['mig21','hind'],aa:'zsu',rocket:'SCUD',boss:{k:'hindB',name:'MI-24 HIND GUNSHIP',hp:80}},
 mod:{air:['su57','shahed','j20'],aa:'sam',rocket:'BALLISTIC',boss:{k:'j20B',name:'J-20 STEALTH LEADER',hp:90}},fut:{air:['swarm','fdrone'],aa:'laserAA',rocket:'HYPERSONIC',boss:{k:'carrier',name:'PLA DRONE CARRIER (fictional)',hp:100}},
 space:{air:['aiF','aiB'],aa:'turret',rocket:'TORPEDO',boss:{k:'orbital',name:'ORBITAL LASER PLATFORM',hp:110}}};
function buildModeArt(mk){
 const S=(k,pb)=>SPR[k]=mk(pb);
 S('sherman',mkLandG({hull:[112,112,74],camo:camoF([112,112,74],[96,96,62]),turret:'cast',wheels:5,wr:8}));
 S('m60',mkLandG({hull:[92,104,66],turret:'cast',wheels:6,wr:7,ant2:1}));
 S('abramsP',mkLandG({hull:[196,174,124],turret:'box',wheels:7,wr:6,ant2:1}));
 S('bradley',mkLandG({hull:[198,176,126],bradley:1,wheels:6,wr:7}));
 S('hoverP',mkLandG({type:'hover',hull:[176,180,188],camo:camoF([176,180,188],[120,126,136])}));S('rover',mkLandG({type:'rover',hull:[226,226,220]}));
 S('p47A',mkAirG({w:96,h:36,col:[112,116,80],prop:1,pylon:1}));S('f4A',mkAirG({w:108,h:38,col:[110,118,96],camo:camoF([110,118,96],[132,112,80],[70,80,60],.08)}));
 S('f22A',mkAirG({w:112,h:36,col:[150,156,162],twin:1}));S('f15A',mkAirG({w:112,h:40,col:[138,146,156],twin:1,pylon:1}));
 S('gen6',mkAirG({w:112,h:32,col:[70,76,86],noTail:1,delta:1,glow:[90,220,255]}));S('starf',mkAirG({w:100,h:36,col:[220,222,226],delta:1,glow:[90,200,255]}));
 S('zero',mkAirG({w:70,h:28,col:[196,194,170],prop:1}));S('me262s',mkAirG({w:80,h:28,col:[120,126,110],camo:camoF([120,126,110],[90,100,80])}));
 S('mig21',mkAirG({w:80,h:28,col:[176,180,184],delta:1}));S('hind',mkAirG({w:90,h:40,col:[110,112,80],rotor:1,gun:1}));
 S('su57',mkAirG({w:90,h:30,col:[120,134,150],camo:camoF([120,134,150],[90,104,126]),twin:1}));S('shahed',mkAirG({w:44,h:20,col:[150,150,140],delta:1,noTail:1,prop:1}));S('j20',mkAirG({w:94,h:30,col:[70,74,82],delta:1,twin:1}));
 S('swarm',mkAirG({w:34,h:16,col:[90,96,104],delta:1,noTail:1,glow:[255,80,60]}));S('fdrone',mkAirG({w:60,h:24,col:[80,86,96],delta:1,noTail:1,glow:[255,80,60]}));
 S('aiF',mkAirG({w:60,h:24,col:[60,60,72],delta:1,noTail:1,glow:[255,60,200]}));S('aiB',mkAirG({w:80,h:34,col:[50,50,62],delta:1,glow:[255,60,200]}));
 S('me264',mkAirG({w:240,h:80,col:[120,126,110],prop:1,camo:camoF([120,126,110],[96,104,84])}));S('hindB',mkAirG({w:220,h:96,col:[110,112,80],rotor:1,gun:1}));
 S('j20B',mkAirG({w:240,h:76,col:[70,74,82],delta:1,twin:1}));S('carrier',mkAirG({w:250,h:90,col:[86,90,100],delta:1,noTail:1,glow:[255,80,60]}))}
