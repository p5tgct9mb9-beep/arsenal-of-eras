'use strict';
// ---- extra sprites for Cold War / Modern / Future eras + Assault Mode ----
function diamondEmblem(pb,cx,cy,r,c1,c2){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const d=Math.abs(i)+Math.abs(j);if(d<=r)pb.set(cx+i,cy+j,d>=r-1?c2:lit(c1,1.1-j/r*.3,i,j))}pb.rect(cx-1,cy-r+2,2,r*2-3,()=>c2)}
function hexEmblem(pb,cx,cy,r,c1,c2){pb.poly([[cx-r,cy],[cx-r/2,cy-r],[cx+r/2,cy-r],[cx+r,cy],[cx+r/2,cy+r],[cx-r/2,cy+r]],(i,j,nx,ny)=>lit(c1,1.1-ny*.3,i,j));pb.ell(cx,cy,r*.4,r*.4,()=>c2)}
function wheelsRow(pb,n,x0,step,y,r,col,rim){for(let k=0;k<n;k++){const x=x0+k*step;pb.ell(x,y,r,r,shE(col,1));pb.ell(x,y,r*.7,r*.7,(i,j,dx,dy,rr)=>rr>.7?lit(rim,.85,i,j):lit(col,1.05-.25*dy,i,j));pb.ell(x,y,r*.28,r*.28,shE([120,120,112],1.15))}}
function trackBand(pb,x0,x1,y0,y1,c=[50,48,46]){const r=(y1-y0)/2;pb.ell(x0+r,y0+r,r,r,shE(c,.95));pb.ell(x1-r,y0+r,r,r,shE(c,.95));pb.rect(x0+r,y0,x1-x0-2*r,y1-y0,(i,j,nx,ny)=>lit(c,(i%5==0?.72:1)-(ny>.85?.2:0)+(ny<-.85?.3:0),i,j))}
function mkF4(){const pb=new PB(210,90);const T=[176,152,108],G1=[92,102,62],G2=[58,72,48],LG=[178,182,184];
 const camo=(i,j)=>{if(j>50)return LG;const v=fbm(i*.045,j*.07+3);return v>.6?G2:v>.42?G1:T};
 pb.poly([[6,44],[18,8],[34,8],[46,40]],shR(camo,1.05,.2));pb.rect(18,10,12,3,()=>[30,30,30]);
 pb.poly([[4,46],[40,44],[44,48],[8,58]],shR(camo,.9)); // anhedral stabilator
 pb.poly([[8,40],[60,36],[120,30],[160,32],[196,40],[206,46],[196,50],[150,56],[90,56],[40,52],[8,48]],(i,j)=>{const ny=(j-44)/12;return lit(camo(i,j),1.12-.36*ny,i,j)});
 pb.ell(118,30,26,7,(i,j,dx,dy)=>j>31?null:lit([110,150,176],1.05-.3*dy+(dx>-.6&&dx<-.2&&dy<-.2?.45:0),i,j));pb.line(118,23,118,31,[40,42,40]);pb.line(104,25,104,31,[40,42,40]);
 pb.poly([[92,40],[118,40],[118,54],[96,54]],shR([60,62,58],.8));pb.rect(116,41,3,12,()=>[200,200,196]); // intake + splitter
 pb.poly([[56,52],[120,50],[140,60],[64,62]],shR(mix(LG,G1,.3),1.05));
 pb.ell(110,64,26,4,shE(LG,1.05));pb.ell(136,64,2,3,()=>[60,60,60]); // centerline tank
 for(let k=0;k<3;k++)pb.rect(70+k*12,62,6,3,shR([210,210,200],1));
 pb.rect(6,46,10,7,shR([70,64,58],.9));pb.ell(6,50,2,3,()=>[30,24,20]); // J79 exhaust
 pb.ell(150,44,5,5,shE([28,48,110],1.1));pb.rect(141,42,18,4,(i,j)=>Math.abs(i-150)<5?null:[232,232,232]);pb.ell(150,44,2,2,()=>[240,240,240]);
 pb.ell(203,46,4,4,shE([60,60,60],1));for(let x=60;x<190;x+=22)for(let j=34;j<56;j++){const p=pb.get(x,j);if(p)pb.set(x,j,mix(p,[30,30,26],.3))}
 pb.outline(OUT);return pb}
function mkT62(){const pb=new PB(200,100);const OL=[86,98,62];const cam=(i,j)=>mix(OL,[60,70,46],fbm(i*.06,j*.06)>.55?.6:0);
 trackBand(pb,16,186,62,92);wheelsRow(pb,5,40,30,76,13,[78,88,60],[52,58,44]);pb.ell(176,70,9,9,shE([70,70,64],1));pb.ell(24,72,8,8,shE([70,70,64],1));
 pb.poly([[10,48],[180,48],[196,60],[188,66],[14,66],[8,56]],shR(cam,1.02,.3));pb.rect(12,58,178,4,(i,j)=>lit([66,74,50],.85+(j==58?.35:0),i,j));
 for(let k=0;k<4;k++)pb.ell(30+k*14,52,6,4,shE([90,96,70],1)); // fuel drums
 pb.ell(98,40,44,20,(i,j,dx,dy,r)=>j>48?null:lit(cam(i,j),1.15-.45*dy-.1*dx-(r>.8?.2:0),i,j)); // dome turret
 pb.rect(84,16,14,6,shR([80,90,64],1.1));pb.ell(118,22,8,4,shE([80,90,64],1.1));
 pb.rect(140,33,58,5,(i,j,nx,ny)=>lit(cam(i,j),1.1-.4*ny,i,j));pb.rect(160,31,10,9,shR(cam,1.05,.4)); // 115mm + fume extractor
 pb.rect(136,30,8,12,shR([70,78,56],1));
 for(let k=0;k<120;k++){const x=AR()*200|0,y=AR()*68|0,p=pb.get(x,y);if(p&&p!==OUT)pb.set(x,y,mix(p,[220,220,200],.3))}pb.outline(OUT);return pb}
function mkApache(){const pb=new PB(210,96);const OD=[66,72,54];const c=(i,j)=>mix(OD,[50,56,42],fbm(i*.08,j*.08)*.5);
 pb.poly([[6,40],[100,42],[100,50],[10,50]],shR(c,1)); // tail boom
 pb.poly([[2,22],[14,22],[18,48],[6,50]],shR(c,1.05));pb.ell(10,30,9,9,(i,j,dx,dy,r)=>r>.6?null:null);pb.rect(14,40,16,3,shR(c,1)); // fin + stab
 pb.poly([[90,34],[150,30],[180,38],[196,52],[192,62],[150,66],[96,62],[84,48]],(i,j)=>lit(c(i,j),1.15-.4*(j-48)/18,i,j));
 pb.poly([[140,30],[176,30],[192,46],[170,46],[150,40]],(i,j,nx,ny)=>lit([100,140,160],1.1-.3*ny+(nx<-.2&&nx>-.6?.4:0),i,j));pb.line(160,30,166,46,[40,44,38]);pb.line(150,30,152,40,[40,44,38]);
 pb.rect(112,20,40,12,shR(c,1.1));pb.ell(106,26,10,8,shE([60,64,52],1));pb.ell(158,26,8,6,shE([60,64,52],1)); // engine nacelles
 pb.rect(128,10,6,12,shR([50,52,48],1));pb.ell(131,10,8,3,shE([70,70,66],1.1)); // rotor mast + mast radar
 pb.rect(170,64,8,6,shR([50,50,48],1));pb.rect(176,66,16,2,()=>[34,34,34]); // M230 chin gun
 pb.rect(116,54,40,4,shR(c,1.05));pb.rect(118,58,16,8,shR([70,70,64],1));pb.ell(126,62,10,4,shE([90,90,80],1));pb.ell(136,62,1,3,()=>[30,30,30]); // rocket pod
 for(let k=0;k<2;k++){pb.rect(140,58+k*5,20,3,shR([150,150,140],1.05));pb.rect(160,58+k*5,3,3,()=>[180,60,40])} // Hellfires
 pb.ell(120,74,4,4,shE([40,40,40],1));pb.ell(170,74,4,4,shE([40,40,40],1));pb.line(120,64,120,72,[50,50,50]);pb.line(170,64,170,72,[50,50,50]);
 pb.rect(60,44,10,3,()=>[180,180,170]);pb.outline(OUT);return pb}
function mkMBT(){const pb=new PB(200,100);const BL=[78,78,80],SA=[178,160,120];const cam=(i,j)=>(((i>>3)+(j>>3)*3+(hash(i>>3,j>>3)*3|0))%4==0)?[44,44,46]:mix(SA,BL,fbm(i*.05,j*.05)>.5?.85:.1);
 trackBand(pb,14,186,64,92,[44,42,40]);wheelsRow(pb,7,34,22,80,9,[60,60,58],[40,40,40]);
 pb.rect(14,56,174,18,(i,j,nx,ny)=>lit(cam(i,j),1.05-.3*ny-(i%24==0?.25:0),i,j)); // side skirts
 pb.poly([[8,42],[176,42],[198,52],[190,58],[12,58]],shR(cam,1.1,.3));
 pb.poly([[50,22],[140,20],[160,30],[156,44],[54,44],[44,32]],shR(cam,1.12,.35));pb.rect(60,12,22,10,shR([66,66,68],1.1));pb.rect(66,6,4,7,()=>[40,40,40]); // RWS
 pb.rect(156,29,42,5,(i,j,nx,ny)=>lit(cam(i,j),1.1-.4*ny,i,j));pb.rect(176,28,6,7,shR([60,60,60],1));
 for(let k=0;k<6;k++)pb.rect(54+k*14,36,12,7,shR([90,90,86],1)); // ERA blocks
 pb.outline(OUT);return pb}
function mkHover(){const pb=new PB(210,96);const WH=[214,220,228],BLU=[60,110,200];
 pb.poly([[10,50],[30,36],[170,34],[200,50],[190,64],[20,66]],(i,j)=>lit(((i>>4)%3==0&&j<44)?BLU:WH,1.15-.4*(j-50)/16-(j==50?.3:0),i,j));
 pb.poly([[50,22],[130,18],[146,30],[140,38],[56,38]],shR(WH,1.15,.35));pb.rect(60,26,60,2,()=>BLU);
 pb.rect(140,26,66,6,(i,j,nx,ny)=>lit([70,74,84],1.1-.35*ny,i,j));for(let k=0;k<5;k++)pb.rect(148+k*11,24,4,10,(i,j)=>lit([60,200,255],1.2,i,j)); // rail coils
 for(let k=0;k<3;k++){pb.ell(46+k*56,68,16,5,shE([60,62,70],1));pb.ell(46+k*56,70,10,2,()=>[120,230,255])}
 pb.rect(84,10,4,10,()=>[40,40,48]);pb.ell(86,9,3,2,()=>[255,80,80]);pb.outline([16,18,30]);return pb}
function mkMech(){const pb=new PB(170,160);const DK=[64,56,78],PU=[120,70,150],RU=[200,96,40];
 const plate=(i,j)=>mix(DK,[40,36,52],fbm(i*.08,j*.08)*.6);
 // legs (back then front)
 pb.poly([[60,92],[78,92],[84,130],[70,150],[50,150],[56,128]],shR(mix(plate(0,0),[0,0,0],.25),.9));
 pb.poly([[92,92],[112,92],[118,128],[128,150],[100,152],[98,128]],shR(plate,1.05));pb.rect(94,150,40,8,shR([50,46,60],1));pb.rect(44,150,34,8,shR([44,40,52],.9));
 pb.ell(104,122,9,9,shE([90,84,104],1.1));pb.ell(66,124,8,8,shE([70,64,84],.9));
 pb.poly([[46,40],[126,36],[140,60],[130,96],[52,96],[40,64]],shR(plate,1.15,.4)); // torso
 pb.rect(60,50,56,6,()=>PU);pb.ell(88,74,12,12,shE(RU,1.1));for(let a=0;a<8;a++){const t=a*.785;pb.rect(88+Math.cos(t)*14-1,74+Math.sin(t)*14-1,3,3,()=>RU)}pb.ell(88,74,5,5,()=>[50,50,60]); // CURATOR cog core
 pb.poly([[70,20],[110,18],[118,36],[66,38]],shR(plate,1.2));pb.rect(78,26,30,5,()=>[255,40,80]);pb.rect(82,27,8,2,()=>[255,210,220]); // head visor
 pb.poly([[126,46],[150,44],[156,64],[132,66]],shR(plate,1.1));pb.rect(140,62,30,10,(i,j,nx,ny)=>lit([80,74,96],1.1-.3*ny,i,j));pb.rect(164,60,6,14,()=>[255,60,200]); // laser arm
 pb.poly([[30,48],[50,46],[52,70],[28,72]],shR(mix(plate(0,0),[0,0,0],.2),.95));pb.rect(18,70,24,12,shR([70,64,84],.95));
 for(let k=0;k<4;k++)pb.rect(54,40+k*12,4,6,()=>[120,230,255]);pb.outline([12,8,20]);return pb}
// map props
// ---- soldiers (side view, 20x28) ----
const UNITS=[
 {id:'pj',name:'PARARESCUE (PJ)',branch:'US Air Force',head:'beret',hc:[112,22,44],ab:'HEAL / REVIVE',desc:'C: heal 2 HP. Auto-revives once.',col:[150,140,104]},
 {id:'cct',name:'COMBAT CONTROLLER',branch:'US Air Force',head:'beret',hc:[196,32,30],ab:'AIR STRIKE',desc:'C: throw smoke marker, strike lands 1s later.',col:[150,140,104]},
 {id:'rgr',name:'75th RANGER',branch:'US Army',head:'beret',hc:[196,174,124],ab:'SPRINT + BURST',desc:'C: 3s sprint. Fire shoots 3-round bursts.',col:[150,140,104]},
 {id:'abn',name:'101st AIRBORNE',branch:'US Army',head:'helmet',hc:[112,108,80],ab:'DOUBLE JUMP / GLIDE',desc:'Jump twice. Hold jump to parachute-glide.',col:[150,140,104],patch:true},
 {id:'mr',name:'MARINE RAIDER',branch:'USMC MARSOC',head:'helmet',hc:[150,124,84],ab:'GRAPPLE + SUPPRESS',desc:'C: grapple up-forward. Shots stun foes.',col:[120,116,84]}];
function mkTrooper(u,fr){const pb=new PB(20,28);const SK=[214,166,128],BT=[90,74,54],GL=[60,56,48];
 const cam=(i,j)=>{const v=hash(i>>1,(j>>1)+u.id.length*7);return v>.8?[94,84,58]:v>.6?mix(u.col,[190,180,140],.4):v<.15?[70,74,50]:u.col};
 const run=fr==1?2:fr==2?-2:0,jump=fr==3;
 // legs
 const lb=jump?[[6,18],[11,18]]:[[7-run,18],[10+run,18]];
 pb.rect(lb[0][0],18,3,jump?6:8,shR(cam,.85));pb.rect(lb[1][0],18,3,jump?7:8,shR(cam,1));
 pb.rect(lb[0][0]-1,jump?23:25,5,3,shR(BT,.9));pb.rect(lb[1][0],jump?24:25,5,3,shR(BT,1));
 pb.rect(6,10,9,9,shR(cam,1.05));pb.rect(6,11,9,6,shR([96,92,70],1.05)); // plate carrier
 pb.rect(7,13,2,3,()=>[70,66,50]);pb.rect(10,13,2,3,()=>[70,66,50]);pb.rect(6,17,9,2,()=>[60,56,44]);
 if(u.id=='pj'){pb.rect(12,12,3,3,()=>[60,140,70]);pb.set(13,13,[240,240,240])} // green medic pouch
 if(u.id=='cct'){pb.rect(4,8,3,8,shR([70,70,64],1));pb.line(4,8,2,1,[40,40,40])} // radio + antenna
 if(u.id=='rgr'){pb.rect(7,10,4,2,()=>[30,30,30]);pb.rect(7,10,4,1,()=>[210,180,60])} // scroll tab
 if(u.patch){pb.rect(6,11,3,4,()=>[20,20,20]);pb.set(7,12,[240,240,240]);pb.set(8,13,[230,180,40])} // eagle-style patch
 if(u.id=='mr'){pb.ell(5,14,3,3,shE([150,120,80],1));pb.set(5,14,[90,70,50])} // rope coil
 // head
 pb.rect(8,4,6,6,shR(SK,1.1));pb.set(12,6,[30,24,20]);pb.rect(8,8,6,2,()=>[170,124,96]);
 if(u.head=='beret'){pb.ell(10,4,5,2.6,shE(u.hc,1.15));pb.rect(13,3,2,2,()=>[220,190,80])}
 else{pb.ell(10.5,4.5,5,3.5,shE(u.hc,1.1));pb.rect(6,5,10,1,()=>mix(u.hc,[0,0,0],.3));if(u.id=='mr'){pb.rect(12,1,3,2,()=>[40,40,40])}}
 pb.rect(13,8,2,1,()=>[60,50,40]);
 // arms + rifle
 pb.rect(10,12,6,3,shR(cam,1.1));pb.rect(15,12,2,3,shR(GL,1));
 pb.rect(9,12,11,2,(i,j)=>lit([44,44,42],1+(j==12?.2:0),i,j));pb.rect(12,14,2,3,()=>[40,40,40]);pb.set(19,12,[90,90,90]);
 pb.outline(OUT);return pb}
function mkBot(pal,fr){const pb=new PB(20,26);const [B,D,E]=pal;const lo=fr?1:0;
 pb.rect(6-lo,18,3,7,shR(D,1));pb.rect(11+lo,18,3,7,shR(D,1));pb.rect(4-lo,24,5,2,shR(D,.9));pb.rect(10+lo,24,5,2,shR(D,.9));
 pb.rect(4,9,12,10,shR(B,1.1));pb.ell(10,14,3,3,shE([200,96,40],1.1));pb.rect(5,2,10,7,shR(B,1.2));pb.rect(6,4,8,2,()=>E);pb.set(7,4,[255,255,255]);
 pb.rect(0,11,6,3,shR(D,1));pb.rect(-1,10,3,2,()=>[30,30,30]);pb.rect(8,0,1,2,()=>D);pb.outline([14,12,16]);return pb}
function mkDrone(pal,fr){const pb=new PB(22,12);const [B,D,E]=pal;pb.rect(0,2,8,1,()=>fr?[60,60,60]:[140,140,140]);pb.rect(14,2,8,1,()=>fr?[140,140,140]:[60,60,60]);
 pb.rect(3,3,2,2,()=>D);pb.rect(17,3,2,2,()=>D);pb.ell(11,7,7,4,shE(B,1.1));pb.ell(11,8,2,2,()=>E);pb.rect(4,5,14,1,()=>D);pb.outline([14,12,16]);return pb}
function mkChute(){const pb=new PB(30,18);pb.ell(15,8,14,8,(i,j,dx,dy)=>j>9?null:lit((i>>2)%2?[200,200,190]:[110,120,80],1.1-.3*dy,i,j));pb.line(2,9,12,17,[40,40,40]);pb.line(28,9,18,17,[40,40,40]);pb.outline(OUT);return pb}

// ---- SPACE era ----
function mkOrbital(){const pb=new PB(200,130);const WH=[214,218,226],GR=[110,112,124],GO=[220,170,60];
 for(const y of[4,96])pb.rect(70,y,110,30,(i,j)=>lit(((i-70)%14<1||(j-y)%10<1)?[40,50,90]:[60,90,170],1.2-(j-y)/30*.4+(hash(i,j)>.95?.3:0),i,j)); // solar arrays
 pb.rect(118,30,10,70,shR(GR,1));pb.ell(122,65,40,34,(i,j,dx,dy,r)=>lit(fbm(i*.1,j*.1)>.55?GO:WH,1.2-.4*dy-.2*dx-(r>.8?.25:0),i,j)); // hub w/ gold foil
 pb.poly([[84,48],[40,40],[20,58],[20,72],[40,90],[84,82]],shR(GR,1.1,.4));pb.ell(20,65,9,16,(i,j,dx,dy)=>lit([255,60,80],1.3-.3*dy,i,j));pb.ell(18,62,3,5,()=>[255,220,230]); // laser emitter
 pb.rect(140,52,40,4,()=>[90,90,100]);pb.ell(186,54,8,8,shE([200,200,210],1.1));pb.rect(150,20,2,12,()=>[60,60,60]);
 pb.ell(122,65,7,7,()=>[255,40,60]);pb.ell(121,63,2,2,()=>[255,255,255]); // AI eye
 pb.outline([10,10,20]);return pb}
function mkLander(){const pb=new PB(90,70);pb.poly([[20,14],[70,14],[78,36],[12,36]],(i,j,nx,ny)=>lit(fbm(i*.2,j*.2)>.5?[220,170,60]:[200,200,206],1.2-.3*ny,i,j));
 pb.rect(26,36,38,14,shR([150,150,156],1));pb.rect(36,4,18,10,shR([210,210,216],1.1));pb.rect(40,6,8,5,()=>[60,90,130]);
 pb.line(26,48,10,66,[160,160,160]);pb.line(64,48,80,66,[160,160,160]);pb.rect(6,66,10,2,()=>[180,180,180]);pb.rect(74,66,10,2,()=>[180,180,180]);pb.rect(40,50,10,6,shR([90,90,96],1));pb.outline(OUT);return pb}
// ---- HD soldiers 32x48: frames 0 idle,1-4 run,5 jump,6 shoot ----
const POSES=[[[-4,2],[5,-2]],[[-35,45],[32,8]],[[-12,70],[18,4]],[[32,8],[-35,45]],[[18,4],[-12,70]],[[-25,75],[70,80]],[[-6,3],[8,-2]]];
function rimLight(pb,col=[210,232,255],k=.4){const o=pb.d.slice();for(let y=0;y<pb.h;y++)for(let x=0;x<pb.w;x++){const p=o[y*pb.w+x];if(!p||p===OUT)continue;const r=x+1<pb.w?o[y*pb.w+x+1]:null,u=y>0?o[(y-1)*pb.w+x]:null;
 if(!r||r===OUT)pb.d[y*pb.w+x]=mix(p,col,k);else if(!u||u===OUT)pb.d[y*pb.w+x]=mix(p,[255,250,220],k*.6)}}
function limb(pb,x0,y0,ang,len,w,col,dark){const a=ang*Math.PI/180,dx=Math.sin(a),dy=Math.cos(a);for(let s=0;s<=len;s+=.5){const cx=x0+dx*s,cy=y0+dy*s;
 for(let j=-w;j<=w;j++)for(let i=-w;i<=w;i++){if(i*i+j*j>w*w+.5)continue;const px=Math.round(cx+i),py=Math.round(cy+j);const base=typeof col=='function'?col(px,py):col;pb.set(px,py,lit(base,(dark?.82:1.06)-(i/w)*.2-(j/w)*.12,px,py))}}return[x0+dx*len,y0+dy*len]}
function mkTrooperHD(u,fr){const pb=new PB(32,48);const SK=[214,166,128],BT=[96,78,56],GL=[58,54,46];const seed=u.id.charCodeAt(0)*7;
 const cam=(i,j)=>{const v=fbm(i*.35+seed,j*.35);const w=hash(i+seed,j);return v>.66?[96,84,58]:v>.54?[120,110,76]:v<.3?[88,98,62]:w>.93?[184,172,134]:u.col};
 const pose=POSES[fr],hip=[15,28],bob=(fr==2||fr==4)?-1:0;hip[1]+=bob;
 if(u.id=='cct'){for(let y=2;y<18;y++)pb.set(9-(y<8?1:0),y,[40,40,40]);pb.rect(7,16,5,9,shR([70,72,64],1))}
 if(u.id=='abn')pb.rect(6,15,6,11,shR([100,104,76],.95));if(u.id=='mr'){pb.ell(9,21,4,5,shE([150,122,82],1));pb.ell(9,21,2,3,()=>[110,88,60])}
 // back leg
 let k=limb(pb,hip[0]-1,hip[1],pose[0][0],9,2.2,cam,1);k=limb(pb,k[0],k[1],pose[0][0]-pose[0][1],10,2,cam,1);pb.rect(Math.round(k[0])-2,Math.round(k[1])-1,7,3,shR(mix(BT,[0,0,0],.2),.9));
 // back arm
 limb(pb,17,18+bob,95,8,1.8,cam,1);
 // torso
 pb.rect(11,15+bob,11,14,(i,j,nx,ny)=>lit(cam(i,j),1.08-.25*nx-.1*ny,i,j));
 pb.rect(11,17+bob,11,9,(i,j,nx,ny)=>lit([98,94,72],1.12-.3*nx-.1*ny+((i+j)%5==0?-.1:0),i,j)); // plate carrier
 for(let q=0;q<3;q++)pb.rect(12+q*3,21+bob,2,4,shR([84,80,60],1.1));pb.rect(11,26+bob,11,2,()=>[64,58,44]);pb.set(16,26+bob,[150,140,90]);
 if(u.id=='pj'){pb.rect(19,24+bob,4,4,shR([60,140,70],1.1));pb.set(20,25+bob,[240,240,240]);pb.set(21,25+bob,[240,240,240]);pb.set(20,26+bob,[240,240,240]);pb.set(21,26+bob,[240,240,240])}
 if(u.id=='rgr'){pb.rect(11,15+bob,5,2,()=>[30,30,30]);pb.rect(12,15+bob,3,1,()=>[210,180,60])}
 if(u.patch){pb.rect(11,17+bob,4,5,()=>[22,22,22]);pb.set(12,18+bob,[245,245,245]);pb.set(13,18+bob,[245,245,245]);pb.set(13,19+bob,[230,180,40]);pb.set(12,19+bob,[245,245,245])}
 // front leg
 k=limb(pb,hip[0]+1,hip[1],pose[1][0],9,2.3,cam);k=limb(pb,k[0],k[1],pose[1][0]-pose[1][1],10,2.1,cam);pb.rect(Math.round(k[0])-2,Math.round(k[1])-1,7,3,shR(BT,1));pb.rect(Math.round(k[0])-2,Math.round(k[1])+1,7,1,()=>[40,32,24]);
 // head
 const hx=17,hy=9+bob;pb.ell(hx,hy,4.6,5,(i,j,dx,dy)=>lit(SK,1.1-.25*dx-.15*dy,i,j));pb.rect(hx+1,hy+3,4,2,()=>[176,128,98]);pb.set(hx+3,hy,[30,24,20]);pb.set(hx+2,hy-1,[90,60,40]);pb.set(hx-2,hy+1,[180,130,100]);
 pb.rect(hx-4,hy+4,4,2,()=>[150,110,84]);
 if(u.head=='beret'){pb.ell(hx-.5,hy-3.6,5.4,2.6,(i,j,dx,dy)=>lit(u.hc,1.15-.3*dy-.15*dx,i,j));pb.ell(hx-3,hy-3.2,2.6,2.4,shE(u.hc,1.0));pb.rect(hx+2,hy-5,2,2,()=>[230,200,90]);pb.rect(hx-5,hy-2,10,1,()=>mix(u.hc,[0,0,0],.4))}
 else{pb.ell(hx-.5,hy-2.4,5.6,4.4,(i,j,dx,dy)=>j>hy-1?null:lit(fbm(i*.5,j*.5)>.55?mix(u.hc,[60,56,40],.4):u.hc,1.15-.3*dy-.15*dx,i,j));pb.rect(hx-6,hy-1,12,1,()=>mix(u.hc,[0,0,0],.35));pb.rect(hx-5,hy,2,3,()=>[60,56,44]);
  if(u.id=='mr'){pb.rect(hx+1,hy-7,4,3,shR([44,44,44],1));pb.rect(hx+4,hy-6,2,2,()=>[90,140,90])}}
 // rifle (M4 profile) + front arm
 const rx=fr==6?-1:0,ry=19+bob;pb.rect(9+rx,ry,5,3,shR(GL,1));pb.rect(13+rx,ry-1,11,4,shR([50,50,48],1.1));pb.rect(18+rx,ry+3,3,5,shR([44,44,42],1));pb.rect(24+rx,ry,7,2,shR([60,60,58],1.1));pb.rect(17+rx,ry-3,5,2,shR([36,36,36],1.1));pb.set(30+rx,ry,[120,120,120]);pb.set(19+rx,ry-3,[120,200,255]);
 limb(pb,15,18+bob,70,6,1.8,cam);pb.rect(20,20+bob,4,3,shR(GL,1.05));pb.rect(13,22+bob,3,3,shR(GL,1));
 pb.outline(OUT);rimLight(pb);return pb}
function addRivets(pb,y,x0,x1,step){for(let x=x0;x<=x1;x+=step){const p=pb.get(x,y);if(p&&p!==OUT){pb.set(x,y,mix(p,[255,250,220],.45));pb.set(x,y+1,mix(p,[0,0,0],.45))}}}
// ---- per-era rosters (archetype id drives ability; key drives sprite) ----
const ARCH={pj:{ab:'HEAL / REVIVE',desc:'C: heal 2 HP. Auto-revives once.'},cct:{ab:'AIR STRIKE',desc:'C: mark target, strike lands 1s later.'},rgr:{ab:'SPRINT + BURST',desc:'C: 3s sprint. Fire shoots 3-round bursts.'},abn:{ab:'2X JUMP + GLIDE',desc:'Jump twice. Hold jump to glide.'},mr:{ab:'GRAPPLE + STUN',desc:'C: grapple up-forward. Shots stun foes.'}};
const U=(id,key,name,branch,o)=>Object.assign({id,key,name,branch},ARCH[id],o);
const ROSTERS={
 ww2:[U('abn','ww2_abn','101st AIRBORNE','US Army 1944',{head:'m1',hc:[96,98,70],col:[150,140,102],camo:'solid',wpn:'garand',patch:1,chute:1,desc:'M1 Garand. Jump twice; hold jump to glide by chute.'}),
  U('rgr','ww2_rgr','2nd RANGER BN','US Army 1944',{head:'m1',hc:[92,96,66],col:[110,104,70],camo:'solid',wpn:'thompson',diamond:1,desc:'Thompson SMG. C: sprint. Bursts.'}),
  U('mr','ww2_mr','MARINE RAIDER','USMC 1942',{head:'m1cov',hc:[110,116,70],col:[104,112,72],camo:'frog',wpn:'carbine',rope:1}),
  U('cct','ww2_oss','OSS JEDBURGH','OSS 1944',{head:'beret',hc:[70,56,44],col:[120,110,80],camo:'solid',wpn:'carbine',radio:1,ab:'P-47 STRIKE',desc:'C: radio a P-47 strike on the marker.'}),
  U('pj','ww2_med','COMBAT MEDIC','US Army 1944',{head:'m1',hc:[96,98,70],col:[112,106,72],camo:'solid',wpn:'carbine',armband:1,medbag:1,desc:'White armband. C: heal 2 HP. Revives once.'})],
 cold:[U('pj','cold_pj','PARARESCUE','USAF Vietnam',{head:'beret',hc:[112,22,44],col:[92,102,62],camo:'solid',wpn:'m16',medbag:1}),
  U('cct','cold_cct','COMBAT CONTROLLER','USAF 1968',{head:'beret',hc:[196,32,30],col:[92,102,62],camo:'erdl',wpn:'m16',radio:1,ab:'F-4 STRIKE',desc:'C: mark target, F-4 Phantom strike.'}),
  U('rgr','cold_lrrp','RANGER LRRP','US Army 1969',{head:'boonie',hc:[80,90,56],col:[88,96,58],camo:'tiger',wpn:'m16'}),
  U('abn','cold_abn','101st AIRMOBILE','US Army 1968',{head:'pot',hc:[84,96,60],col:[92,102,62],camo:'solid',wpn:'m16',patch:1,rope:1,desc:'Heli rappel: jump twice, hold to glide.'}),
  U('mr','cold_seal','NAVY SEAL','USN 1969',{head:'band',hc:[60,70,44],col:[88,96,58],camo:'tiger',wpn:'stoner',desc:'Stoner LMG. C: grapple. Shots stun.'})],
 mod:[U('pj','mod_pj','PARARESCUE (PJ)','US Air Force',{head:'beret',hc:[112,22,44],col:[150,140,104],camo:'multi',wpn:'m4',medbag:1,plate:1}),
  U('cct','mod_cct','COMBAT CONTROLLER','US Air Force',{head:'beret',hc:[196,32,30],col:[150,140,104],camo:'multi',wpn:'m4',radio:1,plate:1,ab:'F-22 / F-15 STRIKE',desc:'C: laser-mark target for an F-22/F-15 strike.'}),
  U('rgr','mod_rgr','75th RANGER','US Army',{head:'beret',hc:[196,174,124],col:[150,140,104],camo:'multi',wpn:'m4',plate:1,scroll:1}),
  U('abn','mod_abn','101st AIR ASSAULT','US Army',{head:'helmet',hc:[112,108,80],col:[150,140,104],camo:'multi',wpn:'m4',plate:1,patch:1}),
  U('mr','mod_mr','MARINE RAIDER','USMC MARSOC',{head:'helmet',hc:[150,124,84],col:[120,116,84],camo:'multi',wpn:'m4',plate:1,rope:1,nvg:1})],
 fut:[U('pj','fut_pj','EXO RESCUE','USAF 2089',{head:'exo',hc:[220,224,230],col:[200,204,212],acc:[60,200,90],camo:'exo',wpn:'laser',drone:1,ab:'DRONE HEAL',desc:'C: med-drone heals 2 HP. Revives once.'}),
  U('cct','fut_cct','EXO CONTROLLER','USAF 2089',{head:'exo',hc:[220,224,230],col:[200,204,212],acc:[230,50,50],camo:'exo',wpn:'laser',radio:1,ab:'RAILGUN STRIKE',desc:'C: mark target for an orbital railgun.'}),
  U('rgr','fut_rgr','EXO RANGER','US Army 2089',{head:'exo',hc:[190,180,150],col:[176,168,140],acc:[220,180,60],camo:'exo',wpn:'laser'}),
  U('abn','fut_abn','EXO SKY TROOPER','US Army 2089',{head:'exo',hc:[150,156,120],col:[140,146,112],acc:[90,200,255],camo:'exo',wpn:'laser',jet:1,desc:'Jetpack: double jump, hold to hover-glide.'}),
  U('mr','fut_mr','EXO RAIDER','USMC 2089',{head:'exo',hc:[150,130,96],col:[140,122,90],acc:[255,140,40],camo:'exo',wpn:'laser',rope:1})],
 space:[U('pj','sp_res','RESCUE TROOPER','Orbital Corps',{head:'space',hc:[236,236,240],col:[226,228,232],acc:[60,200,90],camo:'suit',wpn:'blaster',life:1}),
  U('cct','sp_str','STRIKE CONTROLLER','Orbital Corps',{head:'space',hc:[236,236,240],col:[226,228,232],acc:[230,60,50],camo:'suit',wpn:'blaster',life:1,radio:1,ab:'ORBITAL STRIKE',desc:'C: mark target for an orbital strike.'}),
  U('rgr','sp_rgr','VOID RANGER','Orbital Corps',{head:'space',hc:[236,236,240],col:[210,206,190],acc:[220,180,60],camo:'suit',wpn:'blaster',life:1}),
  U('abn','sp_drop','DROP TROOPER','Orbital Corps',{head:'space',hc:[236,236,240],col:[214,218,224],acc:[90,200,255],camo:'suit',wpn:'blaster',jet:1,desc:'Thrusters: double jump, hold to glide.'}),
  U('mr','sp_grp','GRAPPLER','Orbital Corps',{head:'space',hc:[236,236,240],col:[214,210,200],acc:[255,140,40],camo:'suit',wpn:'blaster',life:1,rope:1})]};
ROSTERS.ua=[U('rgr','ua_azov','12th SF BDE AZOV','National Guard of Ukraine',{head:'helmet',hc:[96,100,70],col:[120,116,84],camo:'multi',wpn:'m4',plate:1,uaflag:1,desc:'Assault lead. C: sprint. Rifle fires 3-round bursts.'}),
 U('mr','ua_sso','SSO OPERATOR','Special Operations Forces',{head:'helmet',hc:[90,94,66],col:[104,108,76],camo:'multi',wpn:'m4',plate:1,nvg:1,rope:1,uaflag:1,desc:'C: grapple up-forward. Shots stun foes.'}),
 U('cct','ua_gur','GUR SPECIAL UNIT','Defence Intelligence',{head:'band',hc:[70,76,52],col:[92,98,66],camo:'mm14',wpn:'m4',radio:1,plate:1,uaflag:1,ab:'DRONE STRIKE',desc:'C: mark target for an FPV drone strike.'}),
 U('abn','ua_dshv','79/95 AIR ASSAULT','Air Assault Forces',{head:'helmet',hc:[88,92,62],col:[100,96,66],camo:'mm14',wpn:'m4',plate:1,uaflag:1,desc:'Jump twice. Hold jump to glide.'})];
function mkTrooperE(u,fr){const pb=new PB(32,48);const SK=[214,166,128],BT=[90,72,52],GL=[58,54,46];const seed=u.key.length*13+u.key.charCodeAt(0);
 const C0=u.col,dk=mix(C0,[0,0,0],.3),lt=mix(C0,[255,255,230],.25);
 const cam=(i,j)=>{const v=fbm(i*.35+seed,j*.35),h=hash(i+seed,j);switch(u.camo){
  case'mm14':{const q=fbm((i>>1)*.5+seed,(j>>1)*.5);return q>.64?[70,80,50]:q>.52?[112,104,72]:q<.3?[60,54,40]:C0}
  case'multi':return v>.66?[96,84,58]:v>.54?[120,110,76]:v<.3?[88,98,62]:h>.93?[184,172,134]:C0;
  case'frog':return v>.62?[86,70,46]:v<.34?[66,86,50]:C0;
  case'tiger':return Math.sin(i*.9+j*.25+v*4)>.35?[40,44,30]:v>.6?[120,110,70]:C0;
  case'erdl':return v>.64?[60,48,34]:v<.32?[70,90,50]:v>.5?[130,120,80]:C0;
  case'exo':return((i+j*3)%11==0)?dk:C0;
  case'suit':return C0;default:return mix(C0,dk,v>.6?.4:0)}};
 const pose=POSES[fr],bob=(fr==2||fr==4)?-1:0,hip=[15,28+bob];
 if(u.radio){pb.rect(7,15+bob,6,10,shR(u.camo=='exo'||u.camo=='suit'?[90,94,104]:[78,80,64],1));for(let y=1;y<16;y++)pb.set(8+(y<6?-1:0),y+bob,[40,40,40])}
 if(u.chute){pb.rect(6,14+bob,6,12,shR([110,108,80],1));pb.rect(6,19+bob,6,1,()=>[60,56,40])}
 if(u.jet){pb.rect(6,14+bob,6,12,shR([120,124,134],1));pb.rect(7,26+bob,4,3,()=>[255,170,60])}
 if(u.life){pb.rect(7,14+bob,6,13,shR([200,202,208],1.05));pb.rect(8,16+bob,4,2,()=>u.acc)}
 if(u.rope){pb.ell(9,22+bob,4,5,shE([150,122,82],1));pb.ell(9,22+bob,2,3,()=>[110,88,60])}
 let k=limb(pb,hip[0]-1,hip[1],pose[0][0],9,2.2,cam,1);k=limb(pb,k[0],k[1],pose[0][0]-pose[0][1],10,2,cam,1);pb.rect(Math.round(k[0])-2,Math.round(k[1])-1,7,3,shR(u.camo=='suit'?[180,180,186]:u.camo=='exo'?[80,84,94]:mix(BT,[0,0,0],.2),.9));
 limb(pb,17,18+bob,95,8,1.8,cam,1);
 pb.rect(11,15+bob,11,14,(i,j,nx,ny)=>lit(cam(i,j),1.08-.25*nx-.1*ny,i,j));
 if(u.plate){pb.rect(11,17+bob,11,9,(i,j,nx,ny)=>lit([98,94,72],1.12-.3*nx-.1*ny,i,j));for(let q=0;q<3;q++)pb.rect(12+q*3,21+bob,2,4,shR([84,80,60],1.1))}
 else if(u.camo=='exo'){pb.rect(11,16+bob,11,10,(i,j,nx,ny)=>lit(C0,1.2-.35*nx-.2*ny,i,j));pb.rect(12,20+bob,9,1,()=>u.acc);pb.ell(16,18+bob,2,2,()=>u.acc)}
 else if(u.camo=='suit'){pb.rect(12,17+bob,9,6,shR([190,194,200],1.1));pb.rect(13,19+bob,3,2,()=>u.acc);pb.rect(17,19+bob,2,2,()=>[60,200,255])}
 else{pb.line(13,15+bob,15,26+bob,[70,64,44]);pb.line(19,15+bob,17,26+bob,[70,64,44]);pb.rect(12,24+bob,9,3,shR([120,110,76],1.1))} // webbing
 pb.rect(11,26+bob,11,2,()=>u.camo=='suit'?[150,150,160]:[64,58,44]);pb.set(16,26+bob,[160,150,100]);
 if(u.medbag){pb.rect(19,23+bob,4,5,shR(u.camo=='multi'?[60,140,70]:[150,140,104],1.1))}
 if(u.armband){pb.rect(12,17+bob,4,3,()=>[244,244,240])}
 if(u.uaflag){pb.rect(11,17+bob,5,2,()=>[0,87,183]);pb.rect(11,19+bob,5,2,()=>[255,215,0])} // Ukrainian flag patch only
 if(u.scroll){pb.rect(11,15+bob,5,2,()=>[30,30,30]);pb.rect(12,15+bob,3,1,()=>[210,180,60])}
 if(u.patch){pb.rect(11,17+bob,4,5,()=>[22,22,22]);pb.set(12,18+bob,[245,245,245]);pb.set(13,18+bob,[245,245,245]);pb.set(13,19+bob,[230,180,40])}
 k=limb(pb,hip[0]+1,hip[1],pose[1][0],9,2.3,cam);k=limb(pb,k[0],k[1],pose[1][0]-pose[1][1],10,2.1,cam);pb.rect(Math.round(k[0])-2,Math.round(k[1])-1,7,3,shR(u.camo=='suit'?[200,200,206]:u.camo=='exo'?[90,94,104]:BT,1));
 // head
 const hx=17,hy=9+bob;
 if(u.head=='space'){pb.ell(hx,hy-1,6.5,6.5,(i,j,dx,dy)=>lit(u.hc,1.2-.3*dx-.25*dy,i,j));pb.ell(hx+2,hy-1,4,3.5,(i,j,dx,dy)=>lit([40,60,110],1.1-.3*dy+(dx<-.2&&dy<-.3?.6:0),i,j));pb.rect(hx-5,hy+4,10,2,()=>u.acc)}
 else if(u.head=='exo'){pb.ell(hx,hy-1,5.5,5.8,(i,j,dx,dy)=>lit(u.hc,1.2-.3*dx-.25*dy,i,j));pb.rect(hx,hy-2,6,2,()=>u.acc);pb.rect(hx+1,hy-2,3,1,()=>[255,255,255]);pb.rect(hx-5,hy+3,8,2,()=>mix(u.hc,[0,0,0],.4))}
 else{pb.ell(hx,hy,4.6,5,(i,j,dx,dy)=>lit(SK,1.1-.25*dx-.15*dy,i,j));pb.rect(hx+1,hy+3,4,2,()=>[176,128,98]);pb.set(hx+3,hy,[30,24,20]);pb.set(hx+2,hy-1,[90,60,40]);pb.rect(hx-4,hy+4,4,2,()=>[150,110,84]);
  const hc=u.hc;
  if(u.head=='beret'){pb.ell(hx-.5,hy-3.6,5.4,2.6,(i,j,dx,dy)=>lit(hc,1.15-.3*dy-.15*dx,i,j));pb.ell(hx-3,hy-3.2,2.6,2.4,shE(hc,1));pb.rect(hx+2,hy-5,2,2,()=>[230,200,90]);pb.rect(hx-5,hy-2,10,1,()=>mix(hc,[0,0,0],.4))}
  else if(u.head=='boonie'){pb.ell(hx,hy-3,4.5,3,shE(hc,1.1));pb.rect(hx-8,hy-1,16,2,(i,j)=>lit(hc,1-(j-hy+1)*.15,i,j))}
  else if(u.head=='band'){pb.rect(hx-5,hy-4,10,3,(i,j)=>lit(fbm(i*.6,j*.6)>.5?[40,44,30]:hc,1.05,i,j));pb.rect(hx-7,hy-3,3,2,()=>hc)}
  else{const m1=u.head=='m1'||u.head=='m1cov'||u.head=='pot';pb.ell(hx-.5,hy-2.4,m1?6:5.6,m1?4.8:4.4,(i,j,dx,dy)=>j>hy-1?null:lit(u.head=='m1cov'?(fbm(i*.6,j*.6)>.5?[86,70,46]:hc):u.head=='pot'&&hash(i,j)>.7?[60,70,40]:hc,1.18-.3*dy-.15*dx,i,j));
   pb.rect(hx-(m1?7:6),hy-1,m1?13:12,1,()=>mix(hc,[0,0,0],.35));if(m1){pb.line(hx+3,hy,hx+4,hy+5,[60,56,44])}else{pb.rect(hx-5,hy,2,3,()=>[60,56,44])}
   if(u.diamond)pb.rect(hx-5,hy-4,2,2,()=>[230,140,40]);if(u.nvg){pb.rect(hx+1,hy-7,4,3,shR([44,44,44],1));pb.rect(hx+4,hy-6,2,2,()=>[90,140,90])}
   if(u.head=='pot')pb.rect(hx-4,hy-5,3,1,()=>[230,230,220])}}
 // weapon
 const rx=fr==6?-1:0,ry=19+bob,WD=[120,76,40],MT=[50,50,48];
 switch(u.wpn){
  case'garand':pb.rect(5+rx,ry,10,3,shR(WD,1.05));pb.rect(14+rx,ry-1,10,3,shR(WD,1));pb.rect(15+rx,ry-2,8,1,()=>MT);pb.rect(24+rx,ry-1,8,1,shR(MT,1.1));break;
  case'thompson':pb.rect(7+rx,ry,7,3,shR(WD,1.05));pb.rect(14+rx,ry-1,9,3,shR(MT,1.1));pb.rect(17+rx,ry+2,3,4,shR(MT,1));pb.rect(21+rx,ry+2,2,3,shR(WD,1));pb.rect(23+rx,ry-1,5,2,(i,j)=>lit(MT,(i%2)?1.1:.8,i,j));break;
  case'carbine':pb.rect(8+rx,ry,7,3,shR(WD,1.05));pb.rect(14+rx,ry-1,9,3,shR(WD,1));pb.rect(16+rx,ry+2,2,3,shR(MT,1));pb.rect(23+rx,ry-1,6,1,shR(MT,1.1));break;
  case'm16':pb.rect(9+rx,ry,5,3,shR([40,40,40],1));pb.rect(13+rx,ry-1,10,4,shR([46,46,46],1.1));pb.rect(16+rx,ry-3,4,2,()=>[40,40,40]);pb.rect(18+rx,ry+3,2,5,shR(MT,1));pb.rect(23+rx,ry,6,2,shR([60,60,58],1.1));pb.rect(29+rx,ry,2,1,()=>[90,90,90]);break;
  case'stoner':pb.rect(8+rx,ry,6,3,shR([40,40,40],1));pb.rect(13+rx,ry-1,12,4,shR([46,46,46],1.1));pb.rect(15+rx,ry+3,5,5,shR([70,74,50],1));pb.rect(25+rx,ry,7,2,shR(MT,1.1));break;
  case'laser':pb.rect(9+rx,ry,5,3,shR([80,84,94],1));pb.rect(13+rx,ry-1,12,4,shR([150,156,170],1.15));pb.rect(25+rx,ry,6,2,shR([90,94,104],1.1));pb.rect(15+rx,ry,8,1,()=>u.acc||[90,230,255]);pb.set(30+rx,ry,[140,240,255]);break;
  case'blaster':pb.rect(10+rx,ry,4,3,shR([150,150,160],1));pb.rect(13+rx,ry-1,11,4,shR([210,212,220],1.15));pb.rect(24+rx,ry,5,2,shR([120,120,130],1.1));pb.rect(16+rx,ry,6,1,()=>u.acc);break;
  default:pb.rect(9+rx,ry,5,3,shR(GL,1));pb.rect(13+rx,ry-1,11,4,shR(MT,1.1));pb.rect(18+rx,ry+3,3,5,shR([44,44,42],1));pb.rect(24+rx,ry,7,2,shR([60,60,58],1.1));pb.rect(17+rx,ry-3,5,2,shR([36,36,36],1.1));pb.set(19+rx,ry-3,[120,200,255])}
 limb(pb,15,18+bob,70,6,1.8,cam);const gl=u.camo=='suit'?[200,200,206]:u.camo=='exo'?[90,94,104]:u.camo=='multi'?GL:SK;pb.rect(20,20+bob,4,3,shR(gl,1.05));pb.rect(13,22+bob,3,3,shR(gl,1));
 if(u.drone){pb.rect(0,2,8,1,()=>[120,120,130]);pb.ell(4,4,3,2,shE([200,204,212],1.1));pb.set(4,5,u.acc)}
 pb.outline(OUT);rimLight(pb);return pb}
