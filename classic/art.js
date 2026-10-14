// ---------- SPRITES ----------
const SPR={};
function mkTiger(){const pb=new PB(200,100);
 const DG=[200,166,98],ST=[64,60,54];
 const zebra=(i,j)=>{const s=Math.sin(i*.27+j*.11+fbm(i*.05,j*.07)*6);const dirt=j>56?Math.min(1,(j-56)/14)*.5:0;return mix(s>.3?ST:DG,[112,92,62],dirt*fbm(i*.2,j*.2)*1.6)};
 // track band
 const TR=[58,54,50];
 pb.ell(22,76,14,16,shE(TR,.95));pb.ell(178,74,14,16,shE(TR,.95));
 pb.rect(22,60,156,32,(i,j,nx,ny)=>lit(TR,(i%5==0?.75:1)-(ny>.85?.2:0)+(ny<-.85?.3:0),i,j));
 // roadwheels interleaved
 for(let k=0;k<8;k++){const x=36+k*18.5;pb.ell(x+9,74,10,10,shE([70,66,58],.85))}
 for(let k=0;k<8;k++){const x=36+k*18.5;pb.ell(x,77,11,11,shE(zebra,1));pb.ell(x,77,8,8,(i,j,dx,dy,r)=>r>.75?lit([60,55,48],.9,i,j):lit(zebra(i,j),1-.2*dy,i,j));pb.ell(x,77,3,3,shE([90,84,72],1.1));pb.set(x-1,76,[220,200,150])}
 pb.ell(176,70,9,9,shE([80,76,70],1));for(let a=0;a<10;a++){const t=a/10*6.283;pb.set(176+Math.cos(t)*10,70+Math.sin(t)*10,[40,38,36])}pb.ell(176,70,4,4,shE([110,104,92],1.1));
 pb.ell(22,72,8,8,shE([80,76,70],1));pb.ell(22,72,3,3,shE([110,104,92],1));
 // hull
 pb.poly([[12,48],[184,48],[194,58],[186,66],[16,66],[10,56]],shR(zebra,1.02,.3));
 pb.rect(14,58,174,4,(i,j)=>lit([80,74,62],.85+(j==58?.35:0),i,j)); // fender
 pb.poly([[22,40],[166,40],[182,50],[18,50]],shR(zebra,1.12,.25));
 pb.rect(160,42,10,5,(i,j)=>lit([40,40,38],1,i,j));pb.ell(176,45,3,3,shE([70,66,60],1)); // visor & ball mg
 pb.line(30,47,110,47,[90,84,70]);pb.line(26,52,96,52,[150,140,120]); // tow cable/tools
 for(let k=0;k<5;k++)pb.rect(124+k*7,50,6,6,shR([86,80,70],1));
 // turret
 pb.poly([[60,22],[132,20],[142,26],[144,42],[58,44],[54,30]],shR(zebra,1.1,.35));
 pb.rect(70,13,16,10,shR([92,88,80],1.1));pb.rect(68,11,20,3,shR([110,104,96],1.2)); // cupola
 pb.rect(104,16,10,5,shR([92,88,80],1.05));
 pb.rect(140,25,14,20,shR(zebra,1.05,.4)); // mantlet
 pb.rect(152,31,40,6,(i,j,nx,ny)=>lit(zebra(i,j),1.1-.4*ny,i,j)); // barrel
 pb.rect(186,29,13,10,shR([86,82,74],1.05,.45));pb.rect(191,29,2,10,()=>[30,28,26]);
 for(let k=0;k<4;k++)pb.rect(62+k*10,36,8,4,shR([80,74,66],1));// spare links
 pb.ell(106,62,3,3,shE([70,64,58],1)); // hook
 pb.rect(96,27,10,6,shR([90,84,72],1.05)); // pistol port (no insignia)
 // chipping
 for(let k=0;k<160;k++){const x=AR()*200|0,y=AR()*70|0,p=pb.get(x,y);if(p&&p!==OUT)pb.set(x,y,mix(p,[230,220,190],.35))}
 pb.outline(OUT);return pb}
function mkP47(){const pb=new PB(210,96);
 const OD=[96,98,56],NG=[150,152,150];
 const col=(i,j)=>{let c=j>52?NG:OD;const v=fbm(i*.08,j*.08);c=mix(c,[70,74,40],v*.35);
  if(i>=40&&i<62){c=(((i-40)/4.4|0)%2==0)?[236,234,222]:[30,30,32]} return c};
 pb.poly([[12,38],[200,40],[200,48],[12,44]],()=>null);
 // far wing
 pb.poly([[92,48],[138,46],[150,50],[100,54]],shR([70,72,42],.8));
 // tail
 pb.poly([[10,38],[30,36],[28,10],[18,8],[12,12]],shR(OD,1.05,.2));pb.poly([[12,36],[40,36],[36,40],[10,42]],shR(OD,1));
 pb.line(26,11,26,36,[70,72,40]);pb.rect(14,12,10,5,()=>[200,190,60]); // tail tip
 // fuselage
 pb.poly([[10,36],[40,33],[80,27],[112,22],[150,20],[176,20],[186,23],[186,68],[174,70],[150,70],[118,66],[80,56],[40,46],[10,42]],
  (i,j)=>{const top=i<112?36-(i-10)/102*14:21,bot=i<118?42+(i-10)/108*24:69,ny=(j-top)/(bot-top)*2-1;return lit(col(i,j),1.15-.42*ny-(ny>.9?.2:0),i,j)});
 for(const x of[70,98,128,158])for(let j=0;j<60;j++){const p=pb.get(x,j);if(p)pb.set(x,j,mix(p,[30,30,20],.35))}
 pb.ell(150,66,12,5,shE([80,82,52],.9));pb.ell(148,66,6,3,()=>[24,24,24]); // chin intake
 // canopy
 pb.ell(120,22,17,9,(i,j,dx,dy,r)=>j>24?null:lit([110,150,180],1.05-.3*dy+(dx<-.2&&dy<-.2&&dx>-.6?.5:0),i,j));pb.line(110,14,110,24,[40,44,40]);pb.line(130,14,130,24,[40,44,40]);
 pb.rect(100,22,40,2,()=>[70,72,44]);
 // near wing
 pb.poly([[76,54],[150,52],[160,58],[154,64],[84,64]],(i,j,nx,ny)=>{let c=i>=104&&i<128?((((i-104)/4.8|0)%2)?[30,30,32]:[236,234,222]):OD;return lit(c,1.15-.35*ny,i,j)});
 for(let k=0;k<4;k++)pb.rect(160,54+k*2,8,1,()=>[40,40,40]); // .50 cal barrels
 // insignia
 pb.ell(86,46,7,7,shE([28,48,110],1.1));pb.rect(72,43,28,6,(i,j)=>Math.abs(i-86)<7?null:lit([230,230,230],1,i,j));
 for(let a=0;a<5;a++){const t=-Math.PI/2+a*1.2566;pb.line(86,46,86+Math.cos(t)*6,46+Math.sin(t)*6,[240,240,240])}pb.ell(86,46,2,2,()=>[240,240,240]);
 // cowling (radial)
 pb.ell(181,45,9,25,shE([84,86,52],1.1));pb.ell(187,45,4,23,(i,j,dx,dy)=>lit([60,62,66],1-.3*dy,i,j));
 for(let k=0;k<6;k++)pb.rect(174,24+k*7,2,3,()=>[50,50,34]);
 for(let k=0;k<5;k++){pb.rect(188,27+k*8,3,4,shR([130,120,100],1))} // cylinder heads
 pb.ell(193,45,6,7,shE([200,190,60],1.1)); // spinner yellow
 pb.rect(60,48,12,2,()=>[60,50,40]); // exhaust
 pb.outline(OUT);return pb}
function mkMe262(){const pb=new PB(210,90);
 const G1=[96,110,84],G2=[70,86,68],B=[160,172,176];
 const mot=(i,j)=>{if(j>44)return B;const v=fbm(i*.11,j*.13);return v>.62?G2:v>.42?mix(G1,[120,124,110],.3):mix(B,G1,.45)};
 const pz=v=>v;
 // far nacelle (other side)
 pb.ell(112,50,26,5,shE([90,100,90],.75));
 pb.poly([[10,36],[24,34],[20,8],[10,8],[6,12]],shR(mot,1.05,.2)); // tail fin
 pb.poly([[6,34],[34,34],[30,38],[4,38]],shR(mot,1));
 // fuselage (triangular cross section shading)
 pb.poly([[4,36],[60,32],[110,28],[160,30],[186,34],[200,40],[186,46],[150,50],[100,50],[50,44],[4,40]],
  (i,j)=>{const mid=i<110?34+(i-4)/106*6:40,top=i<110?36-(i-4)/106*8:28+(i-110)/90*12,ny=(j-mid);const l=j<mid?1.22-(mid-j)*.02:.9-(j-mid)*.03;return lit(mot(i,j),l,i,j)});
 pb.line(8,37,196,40,[70,76,70]);
 // canopy
 pb.ell(104,28,16,6,(i,j,dx,dy)=>j>29?null:lit([120,160,184],1.1-.3*dy+(dx<0&&dx>-.5&&dy<-.3?.45:0),i,j));pb.line(96,23,96,29,[50,56,54]);pb.line(112,23,112,29,[50,56,54]);
 // MK108 ports
 for(let k=0;k<4;k++)pb.rect(190-(k%2)*6,36+(k>>1)*3,3,2,()=>[20,20,22]);
 // wing
 pb.poly([[80,48],[132,46],[110,62],[66,62]],shR(mix(B,G1,.4),1.1,.3));
 // near nacelle (Jumo 004)
 pb.ell(112,60,32,7,(i,j,dx,dy)=>lit(mot(i,j-16),1.1-.4*dy,i,j));
 pb.ell(143,60,4,6,(i,j,dx,dy)=>lit([40,40,40],1+.2*dx,i,j));pb.ell(144,60,2,3,()=>[150,150,140]); // intake bullet
 pb.rect(76,56,8,9,shR([60,58,56],1,.4));pb.ell(76,60,2,3,()=>[20,18,18]); // exhaust cone
 pb.line(100,54,100,66,[60,66,60]);pb.line(124,54,124,66,[60,66,60]);
 // tail stripe band (yellow fuselage band typical) - neutral
 pb.rect(26,34,4,6,()=>[210,190,70]);
 pb.outline(OUT);return pb}