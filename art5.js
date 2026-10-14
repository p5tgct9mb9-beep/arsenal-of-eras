'use strict';
// ---- Expanded vehicle rosters (LAND + AIR, 3-6 per era) with stats + specials. Drawn with the art3/art4 ramp kit, then GBA+ pass. ----
// stats: spd/arm/fire 1..5. Land special on C (sp), optional second on V (sp2). Air special on X.
function mkLand2(o){const pb=new PB(150,72),T=R5([62,62,58]),M=R5(o.hull),cam=o.camo||M,GL=R5([120,160,190]),D=R5(mix(o.hull,[0,0,0],.3));let piv=[100,22];
 const tracks=(x0,x1,y0,y1,n,r)=>{trackHD(pb,x0,x1,y0,y1,T);const ws=(x1-x0-2*r-6)/(n-1);for(let k=0;k<n;k++)wheelHD(pb,x0+r+3+k*ws,y0+(y1-y0)/2+1,r,M,6)};
 const wheel=(x,y,r)=>wheelHD(pb,x,y,r,R5([54,54,52]),6,1);
 switch(o.type){
  case'jeep':vPoly(pb,[[40,40],[112,40],[118,48],[114,56],[36,56],[34,46]],cam);vRect(pb,92,30,4,10,GL,.9,.5);pb.line(92,30,104,40,[40,40,40]);vRect(pb,58,26,4,14,R5([60,60,58]),.8,.3);
   vRect(pb,46,24,26,4,R5([60,60,58]),.8,.3);wheel(52,58,10);wheel(104,58,10);vRect(pb,36,36,10,6,D,.8,.3);piv=[60,26];break;
  case'halftrack':vRect(pb,14,50,74,14,T,.6,.2);for(let k=0;k<4;k++)wheelHD(pb,24+k*18,58,7,M,5);wheel(122,58,10);vPoly(pb,[[12,30],[100,30],[100,52],[12,52]],cam);
   vPoly(pb,[[100,34],[124,38],[138,46],[138,54],[100,54]],cam);vRect(pb,104,30,4,8,GL,.9,.5);vRect(pb,44,18,4,12,R5([58,58,56]),.8,.3);vRect(pb,40,16,30,3,R5([58,58,56]),.8,.3);piv=[50,18];break;
  case'spg':tracks(10,140,48,66,6,7);vPoly(pb,[[8,32],[130,32],[146,44],[138,50],[10,50]],cam);vRect(pb,30,16,70,18,cam,.85,.35);vRect(pb,98,10,14,10,D,.8,.3);
   vRect(pb,30,14,70,3,D,.9,.4);antenna(pb,40,0,16);piv=[96,22];break;
  case'apcT':tracks(10,140,48,66,5,8);vPoly(pb,[[8,22],[118,22],[146,40],[146,50],[8,50]],cam,(i,j,nx,ny)=>j<24?.95:.75-.35*(ny+1)/2);panelH(pb,36,10,140,M);for(let x=20;x<120;x+=20)panelV(pb,x,23,48,M);
   vRect(pb,60,12,8,10,D,.8,.3);rivets(pb,26,12,112,8,M);piv=[66,14];break;
  case'wheeled':{const n=o.n||4;vPoly(pb,[[8,26],[124,26],[146,40],[140,54],[8,54]],cam,(i,j,nx,ny)=>j<28?.95:.75-.35*(ny+1)/2);panelH(pb,40,10,140,M);for(let x=22;x<130;x+=18)panelV(pb,x,27,52,M);
   for(let k=0;k<n;k++)wheel(26+k*(100/(n-1)),58,10);if(o.turret){vPoly(pb,[[60,14],[96,14],[104,26],[56,26]],cam);piv=[100,18]}else{vRect(pb,70,16,10,10,D,.8,.3);piv=[78,16]}antenna(pb,30,6,26);break}
  case'truck':vPoly(pb,[[104,22],[132,22],[144,36],[144,54],[104,54]],cam);vRect(pb,110,26,16,8,GL,.9,.5);vRect(pb,8,40,98,14,D,.8,.3);
   pb.poly([[14,20],[92,4],[98,16],[20,36]],(i,j,nx,ny)=>tone(cam,.85-.4*(ny+1)/2));for(let k=0;k<3;k++)for(let q=0;q<2;q++)pb.ell(86-k*8+q*0,10+k*2+q*6,2,2,()=>[30,30,30]);
   for(const x of[24,50,122])wheel(x,58,10);piv=[90,10];break;
  case'mrap':vPoly(pb,[[14,14],[122,14],[140,30],[134,52],[20,52],[10,30]],cam,(i,j,nx,ny)=>j<16?.95:.78-.4*(ny+1)/2);vRect(pb,100,20,20,10,GL,.9,.5);panelH(pb,32,12,136,M);for(let x=30;x<100;x+=22)panelV(pb,x,15,50,M);
   wheel(36,56,13);wheel(112,56,13);vRect(pb,58,4,14,10,D,.8,.3);piv=[70,8];break;
  case'walker':vRect(pb,40,10,74,30,cam,.85,.35);vPoly(pb,[[114,14],[134,22],[134,34],[114,40]],cam);vRect(pb,118,22,12,5,R5(o.eye||[90,220,255]),.95,.6);
   for(const[x,ph]of[[54,0],[96,1]]){vRect(pb,x,40,10,14,D,.8,.3);vRect(pb,x+(ph?-4:4),54,10,12,D,.8,.3);vRect(pb,x-4+(ph?-4:4),66,20,5,T,.8,.3)}vRect(pb,30,16,12,18,D,.8,.3);piv=[110,18];break;
  case'orbtank':vPoly(pb,[[6,38],[144,38],[148,46],[136,58],[14,58],[2,46]],cam,(i,j,nx,ny)=>.88-.5*(ny+1)/2);for(let x=20;x<134;x+=16)vRect(pb,x,58,10,4,R5([255,160,60]),.95,.6);
   vPoly(pb,[[40,20],[108,20],[122,38],[30,38]],cam);vRect(pb,50,26,30,4,R5([90,220,255]),.95,.7);panelH(pb,44,8,140,M);antenna(pb,46,4,20);piv=[110,28];break}
 pb.outline(OUT);pb.piv=piv;return pb}
function mkAir2(o){const w=o.w||110,h=o.h||40,X=f=>f*w|0,Y=f=>f*h|0,M=R5(o.col),D=R5(mix(o.col,[0,0,0],.28)),GL=R5([90,150,190]),cam=o.camo||M;
 if(o.type=='heli'||o.type=='tilt'){const pb=mkAirG(Object.assign({},o,{rotor:1}));if(o.type=='tilt'){vRect(pb,X(.5),Y(.06),X(.1),Y(.26),D,.8,.3);pb.rect(X(.38),Y(.04),X(.34),2,()=>[50,50,54])}if(o.pods)vRect(pb,X(.46),Y(.7),X(.24),Y(.1),R5([90,90,84]),.8,.3);pb.outline(OUT);return pb}
 const pb=mkAirG(o);
 if(o.pods)for(const fx of o.pods){vRect(pb,X(fx),Y(.5),X(.16),Y(.16),D,.85,.3);if(o.prop)pb.rect(X(fx+.16),Y(.4),2,Y(.36),()=>[60,60,60])}
 if(o.boom){vRect(pb,X(.04),Y(.6),X(.5),Y(.08),D,.8,.3);vRect(pb,X(.02),Y(.42),X(.06),Y(.26),D,.8,.3)}
 if(o.pusher)pb.rect(1,Y(.3),2,Y(.4),()=>[60,60,60]);if(o.longwing)vRect(pb,X(.28),Y(.5),X(.36),Y(.06),D,.8,.3);
 if(o.hump)vPoly(pb,[[X(.2),Y(.36)],[X(.4),Y(.2)],[X(.7),Y(.2)],[X(.8),Y(.36)]],cam);pb.outline(OUT);return pb}
const LV2=(k,name,gun,spd,arm,fire,sp,o={})=>Object.assign({k,name,gun,spd,arm,fire,sp,hp:4+arm*2,cd:o.cd||Math.round(46-fire*3),mg:o.mg===0?0:(o.mg||6),dmg:o.dmg||1+fire*.5},o);
const A_=(k,name,spd,arm,fire,sp,o={})=>Object.assign({k,name,spd,arm,fire,sp,gun:o.gun||'GUNS'},o);
const SPN={smoke:'SMOKE SCREEN',repair:'FIELD REPAIR',barrage:'ARTILLERY BARRAGE',rockets:'ROCKET SALVO',tow:'TOW MISSILE',squad:'DEPLOY SQUAD',overdrive:'OVERDRIVE',railshot:'RAIL SHOT',
 missile:'HOMING MISSILES',bomb:'BOMB DROP',burst:'GUN BURST',hellfire:'HELLFIRE',stealth:'STEALTH',salvo:'DRONE SALVO'};
Object.assign(PV,{
 ww2:[LV2('sherman','M4 SHERMAN','75mm + .50',3,3,3,'smoke'),LV2('hellcat','M18 HELLCAT','76mm',5,1,4,'overdrive'),LV2('halftrack','M3 HALFTRACK','.50 MG',4,2,2,'squad',{mgOnly:1,mg:4}),
  LV2('priest','M7 PRIEST','105mm HOWITZER',2,2,5,'barrage',{arty:1,cd:70,dmg:5}),LV2('jeep','WILLYS JEEP','M2 .50 MG',5,1,1,'overdrive',{mgOnly:1,mg:4})],
 cold:[LV2('m60','M60 PATTON','105mm + M85',3,4,3,'smoke'),LV2('m113','M113 APC','.50 MG',3,3,2,'squad',{mgOnly:1,mg:4}),LV2('sheridan','M551 SHERIDAN','152mm',4,2,4,'tow'),LV2('m109','M109 HOWITZER','155mm',2,3,5,'barrage',{arty:1,cd:72,dmg:5.5})],
 mod:[LV2('abramsP','M1 ABRAMS','120mm + M2',3,5,4,'smoke'),LV2('bradley','M2 BRADLEY IFV','25mm BUSHMASTER',4,3,3,'tow',{fast:1,cd:7,dmg:1,mg:0,sp2:'squad'}),LV2('stryker','STRYKER','30mm + RWS',4,3,3,'squad',{fast:1,cd:9,dmg:1}),
  LV2('himars','HIMARS','GMLRS ROCKETS',3,2,5,'rockets',{arty:1,cd:80,dmg:5,mg:0}),LV2('jltv','JLTV','RWS .50',5,2,2,'overdrive',{mgOnly:1,mg:4}),LV2('mrap','MRAP','RWS .50',3,4,2,'repair',{mgOnly:1,mg:4})],
 fut:[LV2('hoverP','HOVER TANK','RAIL CANNON + LASER',4,3,4,'overdrive',{hover:1}),LV2('walkerF','WALKER MECH','MISSILE PODS',2,4,4,'rockets'),LV2('railapc','RAILGUN APC','RAILGUN',3,3,5,'railshot',{cd:44,dmg:4})],
 space:[LV2('rover','LUNAR ROVER','PULSE GUN',4,1,2,'overdrive',{lowg:1}),LV2('walkerS','MECH WALKER','PLASMA PODS',2,4,4,'rockets'),LV2('orbtank','ORBITAL TANK','ION CANNON',3,4,4,'railshot',{hover:1})]});
Object.assign(PA,{
 ww2:[A_('p47A','P-47 THUNDERBOLT',3,4,4,'rockets'),A_('p51','P-51 MUSTANG',5,2,3,'rockets'),A_('p38','P-38 LIGHTNING',4,3,4,'burst'),A_('f4u','F4U CORSAIR',4,3,3,'bomb'),A_('b25','B-25 MITCHELL',2,5,3,'bomb')],
 cold:[A_('f4A','F-4 PHANTOM II',4,3,4,'missile'),A_('a10c','A-10 THUNDERBOLT II',2,5,5,'burst'),A_('f86','F-86 SABRE',5,2,3,'burst'),A_('huey','UH-1 HUEY',2,3,2,'rockets',{heli:1}),A_('cobra','AH-1 COBRA',3,3,4,'hellfire',{heli:1})],
 mod:[A_('f22A','F-22 RAPTOR',5,3,4,'missile'),A_('f15A','F-15 EAGLE',4,4,4,'missile'),A_('f35','F-35 LIGHTNING II',4,3,4,'stealth'),A_('a10m','A-10C WARTHOG',2,5,5,'burst'),A_('apacheA','AH-64 APACHE',3,4,4,'hellfire',{heli:1}),A_('mq9','MQ-9 REAPER',2,1,3,'hellfire')],
 fut:[A_('gen6','SIXTH-GEN FIGHTER',5,3,4,'missile'),A_('tiltg','TILTROTOR GUNSHIP',3,4,4,'rockets',{heli:1}),A_('dmother','DRONE MOTHERSHIP',2,5,3,'salvo')],
 space:[A_('starf','STARFIGHTER',4,3,4,'missile'),A_('interc','INTERCEPTOR',5,2,3,'burst'),A_('sgun','GUNSHIP',2,5,5,'rockets')]});
function buildModeArt2(mk){const S=(k,pb)=>{SPR[k]=mk(pb);SPR[k].piv=pb.piv};const sand=[196,174,124],od=[104,108,70],cg=[92,104,66];
 SPR.sherman.piv=[100,22];SPR.m60.piv=[100,22];SPR.abramsP.piv=[100,22];SPR.bradley.piv=[104,22];SPR.hoverP.piv=[96,26];SPR.rover.piv=[86,28];
 S('hellcat',mkLandG({hull:od,turret:'cast',wheels:5,wr:7}));S('halftrack',mkLand2({type:'halftrack',hull:od}));S('priest',mkLand2({type:'spg',hull:od}));S('jeep',mkLand2({type:'jeep',hull:od}));
 S('m113',mkLand2({type:'apcT',hull:cg}));S('sheridan',mkLandG({hull:cg,turret:'box',wheels:5,wr:7}));S('m109',mkLand2({type:'spg',hull:cg}));
 S('stryker',mkLand2({type:'wheeled',hull:sand,n:4,turret:1}));S('himars',mkLand2({type:'truck',hull:sand}));S('jltv',mkLand2({type:'jeep',hull:sand}));S('mrap',mkLand2({type:'mrap',hull:sand}));
 S('walkerF',mkLand2({type:'walker',hull:[150,156,166]}));S('railapc',mkLand2({type:'wheeled',hull:[150,156,166],n:4,turret:1}));
 S('walkerS',mkLand2({type:'walker',hull:[220,220,214],eye:[255,180,60]}));S('orbtank',mkLand2({type:'orbtank',hull:[214,216,222]}));
 const P=(k,o)=>SPR[k]=mk(mkAir2(o));
 P('p51',{w:90,h:32,col:[176,180,186],prop:1});P('p38',{w:104,h:36,col:[160,166,170],prop:1,boom:1,pods:[.46]});P('f4u',{w:94,h:34,col:[60,74,110],prop:1,pylon:1});P('b25',{w:150,h:48,col:[110,114,80],prop:1,pods:[.5],twin:1,hump:1});
 P('a10c',{w:110,h:40,col:[120,126,110],twin:1,pods:[.12]});P('f86',{w:92,h:32,col:[196,198,200]});P('huey',{type:'heli',w:96,h:42,col:[96,104,72]});P('cobra',{type:'heli',w:100,h:36,col:[96,104,72],gun:1,pods:1});
 P('f35',{w:110,h:36,col:[110,116,124],twin:1});P('a10m',{w:110,h:40,col:[140,146,152],twin:1,pods:[.12]});P('apacheA',{type:'heli',w:104,h:40,col:[82,90,70],gun:1,pods:1});P('mq9',{w:110,h:30,col:[170,174,178],pusher:1,longwing:1,noTail:1});
 P('tiltg',{type:'tilt',w:110,h:44,col:[100,106,116],gun:1});P('dmother',{w:150,h:50,col:[80,86,96],delta:1,noTail:1,glow:[90,220,255],hump:1});
 P('interc',{w:96,h:30,col:[236,236,240],delta:1,noTail:1,glow:[255,140,60]});P('sgun',{w:140,h:50,col:[200,204,210],delta:1,glow:[90,200,255],hump:1,pods:[.3]})}
