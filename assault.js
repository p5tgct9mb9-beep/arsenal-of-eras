'use strict';
// ---------- Assault Mode (side-scrolling platformer) ----------
const TS=16,LW=170,LH=22;
const LTH={ww2:{top:[86,140,60],fill:[110,84,58],blk:'crate',sky:[[120,170,220],[220,226,210]],far:[100,130,120],mid:[50,80,46],bot:[[96,100,110],[60,62,70],[255,140,40]],flag:[220,200,60],shape:'hills'},
 cold:{top:[236,240,246],fill:[100,96,92],blk:'bunker',sky:[[140,150,170],[220,224,230]],far:[176,186,200],mid:[60,86,74],bot:[[130,140,130],[74,84,78],[120,255,140]],flag:[220,60,60],shape:'peaks'},
 mod:{top:[220,186,130],fill:[176,140,96],blk:'hesco',sky:[[70,70,120],[250,180,110]],far:[190,130,110],mid:[110,80,70],bot:[[66,68,72],[34,36,40],[40,230,230]],flag:[60,200,90],shape:'city'},
 space:{top:[176,176,184],fill:[96,96,106],blk:'panel',sky:[[2,2,10],[16,14,30]],far:[120,120,130],mid:[70,70,80],bot:[[220,220,228],[120,120,132],[255,60,60]],flag:[255,140,40],shape:'moon'},
 fut:{top:[70,200,255],fill:[40,42,62],blk:'neon',sky:[[10,6,36],[80,30,110]],far:[60,30,100],mid:[30,20,60],bot:[[110,70,150],[60,40,90],[255,60,120]],flag:[255,80,200],shape:'towers'}};
const LV={};
function buildTiles(th){const mk=f=>{const pb=new PB(TS,TS);pb.rect(0,0,TS,TS,f);return pb.canvas()};
 const top=mk((i,j)=>j<4?lit(th.top,1.2-j*.08+(hash(i,j)>.8?.1:0),i,j):lit(mix(th.fill,[0,0,0],hash(i>>1,j>>1)*.25),1.05-j*.02,i,j));
 const fill=mk((i,j)=>lit(mix(th.fill,[0,0,0],hash(i>>1,(j>>1)+50)*.3),1-(j==15?.2:0),i,j));
 const b=th.blk;const blk=mk((i,j,nx,ny)=>{let c,l=1.1-ny*.25;
  if(b=='crate'){c=[150,110,64];if(i<2||i>13||j<2||j>13||Math.abs(i-j)<1.5)c=[110,78,44];}
  else if(b=='bunker'){c=[150,152,148];if(j%8==0||((i+(j>>3)*8)%16==0))c=[100,100,98]}
  else if(b=='hesco'){c=[196,172,120];if(i%5==0||j%5==0)c=[120,120,110]}
  else if(b=='panel'){c=[190,192,200];if(i%8==0||j%8==0)c=[120,122,130];if(i==3&&j==3)c=[255,140,40]}
  else{c=[40,44,70];if(i==0||j==0||i==15||j==15)c=[90,230,255];if(Math.abs(i-8)<2&&Math.abs(j-8)<2)c=[255,80,200]}
  if(Math.abs(nx)>.9||Math.abs(ny)>.9)l-=.25;return lit(c,l,i,j)});
 const s=new PB(W,H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix(th.sky[0],th.sky[1],y/H);if((th.shape=='towers'||th.shape=='moon')&&hash(x,y)>.993)c=[255,255,255];if(th.shape=='moon'){const dx=x-380,dy=y-60,r=dx*dx+dy*dy;if(r<900){const k=fbm(x*.15,y*.15);c=mix(k>.55?[70,150,80]:[40,90,200],[255,255,255],fbm(x*.3,y*.1)>.65?.8:0);c=mix(c,[0,0,0],Math.max(0,(dx+dy*.3)/40))}}s.set(x,y,lit(c,1,x,y))}
 const far=new PB(W,H),mid=new PB(W,H);
 const OY=H-270;for(let x=0;x<W;x++){let h1,h2;
  if(th.shape=='hills'){h1=150-fbm(x*.012,1)*60;h2=190-fbm(x*.03,4)*50}
  else if(th.shape=='peaks'){h1=170-Math.abs(((x*.9)%120)-60)*1.4-fbm(x*.05,1)*20;h2=200-fbm(x*.04,3)*40}
  else if(th.shape=='city'){h1=170-((hash(x>>4,1)*70)|0);h2=200-((hash(x>>3,7)*40)|0)}
  else if(th.shape=='moon'){h1=200-fbm(x*.02,1)*30;h2=226-fbm(x*.05,3)*20}
  else{h1=150-((hash(x>>4,2)*110)|0);h2=200-((hash(x>>3,9)*60)|0)}
  h1+=OY;h2+=OY;
  for(let y=Math.max(0,h1|0);y<H;y++){let c=th.far;if(th.shape=='peaks'&&y<h1+12)c=[240,244,250];if((th.shape=='city'||th.shape=='towers')&&(x%6<2)&&(y%8<3)&&hash(x>>1,y>>3)>.6)c=th.shape=='towers'?[255,220,120]:[255,210,150];far.set(x,y,lit(c,1.1-(y-h1)*.003,x,y))}
  for(let y=Math.max(0,h2|0);y<H;y++){let c=th.mid;if(th.shape=='towers'&&x%12==0)c=[90,230,255];mid.set(x,y,lit(c,1.05,x,y))}}
 if(th.shape=='hills'||th.shape=='peaks')for(let k=0;k<34;k++){const x=k*19+(hash(k,3)*10|0),y=190+OY-fbm(x*.03,4)*50,r=6+hash(k,5)*6;for(let j=0;j<r*2.4;j++)for(let i=-r;i<=r;i++)if(Math.abs(i)<r*(j/(r*2.4))+1)mid.set(x+i,y-r*2.4+j,lit(th.shape=='peaks'?[40,66,56]:[40,66,36],1,i,j))}
 const near=new PB(W,70);for(let x=0;x<W;x++){const h=50-fbm(x*.08,7)*30-(hash(x>>2,8)>.8?10:0);for(let y=h|0;y<70;y++)near.set(x,y,lit(mix(th.mid,[0,0,0],.55),1-(y-h)*.004,x,y))}
 return{top,fill,blk,sky:s.canvas(),far:far.canvas(),mid:mid.canvas(),near:near.canvas()}}
function buildLevel(eid){const r=mulberry(77+eid.length*13+eid.charCodeAt(0));const g=new Uint8Array(LW*LH),ents=[],picks=[];
 let gy=19,x=0;const setc=(x,y,v)=>{if(x>=0&&x<LW&&y>=0&&y<LH)g[y*LW+x]=v};
 while(x<LW){if(x>(ERA().setpiece?28:10)&&x<LW-40&&r()<.08){x+=2+(r()*2|0);continue}
  if(x>(ERA().setpiece?28:10)&&x<LW-40&&r()<.12)gy=Math.max(16,Math.min(20,gy+(r()<.5?-1:1)));
  for(let y=gy;y<LH;y++)setc(x,y,y==gy?1:2);
  if(x>12&&x<LW-44&&x%13==0){const py=gy-4-(r()*2|0),len=3+(r()*3|0);for(let k=0;k<len;k++)setc(x+k,py,3);picks.push({x:(x+1)*TS+8,y:(py-1)*TS+8,k:'intel'});if(r()<.5)ents.push({k:'drone',x:(x+2)*TS,y:(py-3)*TS})}
  if(x>14&&x<LW-44&&x%9==4)ents.push({k:'bot',x:x*TS+8,y:gy*TS});
  if(x>14&&x<LW-42&&x%17==8&&r()<.6){setc(x,gy-1,3);if(r()<.5)setc(x,gy-2,3)}
  if(x%31==20)picks.push({x:x*TS+8,y:(gy-1)*TS,k:'med'});
  x++}
 const fx=(LW-6)*TS;let ag=19;for(let y=0;y<LH;y++)if(g[y*LW+LW-30]){ag=y;break}
 return{arenaGy:ag,g,ents:ents.map(e=>Object.assign(e,{x0:e.x,vx:e.k=='bot'?-.5:0,vy:0,hp:2,stun:0,t:(r()*100)|0,dead:0})),picks,flag:{x:fx,y:0}}}
const solidAt=(L,px,py)=>{const tx=px/TS|0,ty=py/TS|0;if(tx<0||tx>=LW)return true;if(ty<0)return false;if(ty>=LH)return false;return L.g[ty*LW+tx]>0};
function groundY(L,px){const tx=px/TS|0;for(let y=0;y<LH;y++)if(L.g[y*LW+tx])return y*TS;return LH*TS+50}
function startAssault(){const E=ERA(),u=curRoster()[TF.unitSel];if(!LV[E.id])LV[E.id]={tiles:buildTiles(LTH[E.id])};
 const L=Object.assign(buildLevel(E.id),{tiles:LV[E.id].tiles,th:LTH[E.id]});
 TF.as={L,u,p:{x:40,y:19*TS-1,vx:0,vy:0,on:false,face:1,hp:5,max:5,inv:0,cd:0,fcd:0,jumps:0,sprint:0,revive:u.id=='pj'?1:0,hook:null,safe:40,fr:0},bul:[],marks:[],cam:0,intel:0,done:false,t:0,kills:0,flyby:null};
 const bs=ERA().boss;TF.as.boss=Object.assign({},bs,{x:(LW-21)*TS,y:L.arenaGy*TS,max:bs.hp,t:0,fl:0,dead:0,active:0});TF.as.jet=null;TF.as.jetT=420;
 TF.state='assault';parts=[];fade=20}
function hurtP(A,force){const p=A.p;if(p.inv>0&&!force)return;p.hp--;p.inv=70;p.vy=-3;p.vx=-p.face*2;shake=5;
 if(p.hp<=0){if(p.revive){p.revive=0;p.hp=3;for(let k=0;k<12;k++)spawn({k:'heal',x:p.x+(R()-.5)*30,y:p.y-20-R()*20,vy:-.5,vx:0,life:40});A.banner={t:90,s:'PJ AUTO-REVIVE!'}}
  else{p.hp=p.max;p.x=40;p.y=18*TS;p.vy=0;A.banner={t:90,s:'MISSION RESTART'}}}}
function killE(A,e,big){e.dead=1;A.kills++;boom(e.x,e.y-10,big?1:.6);for(let k=0;k<6;k++)spawn({k:'debris',x:e.x,y:e.y-10,vx:(R()-.5)*3,vy:-R()*3,life:30})}
function updAssault(){const A=TF.as;if(!A)return;const L=A.L,p=A.p,u=A.u;A.t++;
 if(A.done){if(conf()){TF.state='era';TF.as=null;fade=20}A.p.vx=0;return}
 const jumpK=jp.has('KeyZ')||jp.has('Space')||jp.has('ArrowUp')||jp.has('KeyW')||jp.has('pad_a'),jumpH=keys.KeyZ||keys.Space||keys.ArrowUp||keys.KeyW||gpState.a;
 const fireK=jp.has('KeyX')||jp.has('pad_b')||jp.has('KeyJ'),abK=jp.has('KeyC')||jp.has('pad_y')||jp.has('KeyK');
 const spd=p.sprint>0?3.3:1.9;let dx=(held('left')?-1:0)+(held('right')?1:0);
 if(p.hook){p.hook.t++;if(p.hook.t>=12){p.x=p.hook.x;p.y=p.hook.y;p.vy=0;p.hook=null}}
 else{p.vx+=(dx*spd-p.vx)*.3;if(dx)p.face=dx;
  if(jumpK){if(p.on){p.vy=-6.8;p.jumps=1;spawn({k:'smoke',x:p.x,y:p.y,vy:-.1,r:2,life:20})}else if(u.id=='abn'&&p.jumps<2){p.vy=-6.2;p.jumps=2;for(let k=0;k<5;k++)spawn({k:'smoke',x:p.x+(R()-.5)*10,y:p.y,vy:.3,r:2,life:20})}}
  if(!jumpH&&p.vy<-2)p.vy+=.35;
  p.vy+=ERA().id=='space'?.19:.28;p.glide=u.id=='abn'&&jumpH&&p.vy>0&&!p.on;if(p.glide)p.vy=Math.min(p.vy,.7);if(p.vy>7)p.vy=7;
  // x
  p.x+=p.vx;for(const oy of[-38,-26,-14,-2]){if(solidAt(L,p.x+5,p.y+oy)){p.x=Math.floor((p.x+5)/TS)*TS-5.01;p.vx=0}if(solidAt(L,p.x-5,p.y+oy)){p.x=Math.floor((p.x-5)/TS+1)*TS+5.01;p.vx=0}}
  p.y+=p.vy;p.on=false;if(p.vy>=0&&(solidAt(L,p.x-4,p.y)||solidAt(L,p.x+4,p.y))){p.y=Math.floor(p.y/TS)*TS-.01;p.vy=0;p.on=true;p.jumps=0;p.safe=p.x}
  if(p.vy<0&&(solidAt(L,p.x-4,p.y-40)||solidAt(L,p.x+4,p.y-40))){p.y=Math.floor((p.y-40)/TS+1)*TS+40;p.vy=0}}
 if(p.y>LH*TS+40){hurtP(A,true);if(p.hp>0&&A.banner?.s!='MISSION RESTART'){p.x=p.safe-p.face*20;p.y=13*TS;p.vy=0}}
 p.inv>0&&p.inv--;p.cd>0&&p.cd--;p.fcd>0&&p.fcd--;p.sprint>0&&p.sprint--;if(Math.abs(p.vx)>.3&&p.on)p.fr++;
 if(p.sprint>0&&A.t%3==0)spawn({k:'smoke',x:p.x-p.face*6,y:p.y-4,vy:-.1,r:2,life:14});
 // fire
 if(fireK&&p.fcd==0){const n=u.id=='rgr'?3:1;for(let k=0;k<n;k++)A.bul.push({x:p.x+p.face*(10+k*7),y:p.y-27+(k-1)*1.5,vx:p.face*7,from:'p',life:50,stun:u.id=='mr'});flash(p.x+p.face*16,p.y-27,.6);p.fcd=u.id=='rgr'?16:12}
 // ability
 if(abK&&p.cd==0){
  if(u.id=='pj'){p.hp=Math.min(p.max,p.hp+2);p.cd=300;for(let k=0;k<10;k++)spawn({k:'heal',x:p.x+(R()-.5)*24,y:p.y-12-R()*16,vx:0,vy:-.6,life:40});A.banner={t:60,s:'FIELD HEAL +2'}}
  else if(u.id=='cct'){const mx=p.x+p.face*90;A.marks.push({x:mx,y:groundY(L,mx),t:70});p.cd=240;A.banner={t:60,s:'AIR STRIKE INBOUND!'};A.flyby={x:A.cam+W+60,t:0,k:ERA().id=='mod'?(A.fk=A.fk=='f22'?'f15':'f22'):ERA().flyby};A.strikeBoss=1}
  else if(u.id=='rgr'){p.sprint=180;p.cd=300;A.banner={t:60,s:'RANGER SPRINT!'}}
  else if(u.id=='abn'){p.vy=-6.5;p.cd=120;A.banner={t:50,s:'AIRBORNE BOOST!'}}
  else if(u.id=='mr'){p.cd=60;let hit=null;for(let s=1;s<=8&&!hit;s++){const tx=(p.x/TS|0)+p.face*s,ty=((p.y-8)/TS|0)-s;for(let yy=ty;yy<=ty+2&&!hit;yy++)if(L.g[yy*LW+tx]&&!L.g[(yy-1)*LW+tx]&&!L.g[(yy-2)*LW+tx]&&yy>0)hit={x:tx*TS+8,y:yy*TS-.01}}
   if(hit){p.hook={x:hit.x,y:hit.y,t:0,sx:p.x,sy:p.y};A.banner={t:40,s:'GRAPPLE!'}}else A.banner={t:40,s:'NO ANCHOR'}}}
 // marks / air strike
 for(const m of A.marks){m.t--;if(m.t%3==0)spawn({k:'smoke',x:m.x+(R()-.5)*4,y:m.y-3,vy:-.6,r:2,life:40,red:1});
  if(m.t==0){for(let k=0;k<5;k++)setTimeout(()=>boom(m.x+(k-2)*18,m.y-8,1.3),k*90);for(const e of L.ents)if(!e.dead&&Math.abs(e.x-m.x)<70&&Math.abs(e.y-m.y)<90)killE(A,e,1);const B=A.boss;if(B&&B.active&&!B.dead&&m.x>B.x-40&&m.x<B.x+B.w+40){B.hp-=6;B.fl=12;if(B.hp<=0)killBoss(A)}}}
 A.marks=A.marks.filter(m=>m.t>0);if(A.flyby){A.flyby.x-=6;A.flyby.t++;if(A.flyby.t>140)A.flyby=null}
 // bullets
 for(const b of A.bul){if(b.g)b.vy+=b.g;b.x+=b.vx;b.y+=b.vy||0;b.life--;if(solidAt(L,b.x,b.y)){b.life=0;flash(b.x,b.y,.3)}
  if(b.from=='p'){for(const e of L.ents)if(!e.dead&&Math.abs(b.x-e.x)<10&&b.y>e.y-(e.k=='bot'?26:12)&&b.y<e.y+(e.k=='bot'?0:4)){b.life=0;e.hp--;flash(b.x,b.y,.5);if(b.stun)e.stun=90;if(e.hp<=0)killE(A,e)}
   const B=A.boss;if(b.life>0&&B&&B.active&&!B.dead&&b.x>B.x+10&&b.x<B.x+B.w-10&&b.y>B.y-B.h*.75&&b.y<B.y){b.life=0;B.hp--;B.fl=6;flash(b.x,b.y,.8);if(B.hp<=0)killBoss(A)}}
  else if(Math.abs(b.x-p.x)<6&&b.y>p.y-40&&b.y<p.y){b.life=0;hurtP(A)}}
 A.bul=A.bul.filter(b=>b.life>0);updEnemies(A);updBoss(A);updJet(A);
 // pickups
 for(const k of L.picks)if(!k.got&&Math.abs(k.x-p.x)<12&&Math.abs(k.y-(p.y-20))<22){k.got=1;if(k.k=='med'){p.hp=Math.min(p.max,p.hp+1);A.banner={t:50,s:'MEDKIT +1'}}else{A.intel++;A.banner={t:40,s:'INTEL +1'}}for(let i=0;i<6;i++)spawn({k:'fire',x:k.x,y:k.y,vx:(R()-.5)*2,vy:-R()*2,life:20})}
 if(p.x>L.flag.x&&A.boss.dead){A.done=true;A.banner=null}if(!A.boss.dead&&p.x>L.flag.x-30)p.x=L.flag.x-30;
 A.cam=Math.max(0,Math.min(LW*TS-W,p.x-240))}
function updEnemies(A){const L=A.L,p=A.p;for(const e of L.ents){if(e.dead)continue;e.t++;if(e.stun>0){e.stun--;if(e.t%6==0)spawn({k:'fire',x:e.x+(R()-.5)*8,y:e.y-24,vx:0,vy:-.4,life:12});continue}
 if(e.k=='bot'){if(Math.abs(e.x-A.cam-200)>400)continue;e.x+=e.vx;const ahead=e.x+Math.sign(e.vx)*8;if(!solidAt(L,ahead,e.y+4)||solidAt(L,ahead,e.y-8))e.vx=-e.vx;
  if(e.t%120==0&&Math.abs(p.x-e.x)<230&&Math.abs(p.y-e.y)<40){const d=Math.sign(p.x-e.x);e.vx=Math.abs(e.vx)*d;A.bul.push({x:e.x+d*10,y:e.y-15,vx:d*3.2,from:'e',life:90});flash(e.x+d*12,e.y-15,.4)}}
 else{e.x=e.x0+Math.sin(e.t*.02)*50;e.y+=Math.sin(e.t*.07)*.6;if(e.t%150==0&&Math.abs(p.x-e.x)<200){const a=Math.atan2(p.y-14-e.y,p.x-e.x);A.bul.push({x:e.x,y:e.y,vx:Math.cos(a)*2.6,vy:Math.sin(a)*2.6,from:'e',life:120})}}
 const top=e.k=='bot'?e.y-26:e.y-10,bot=e.k=='bot'?e.y:e.y+4;
 if(!A.done&&Math.abs(p.x-e.x)<12&&p.y>top&&p.y-40<bot){if(p.vy>0&&p.y<top+10){killE(A,e);p.vy=-4.5;p.jumps=1}else hurtP(A)}}}
function drawAssault(){const A=TF.as;if(!A)return;const L=A.L,T=L.tiles,c=A.cam|0;
 G.drawImage(T.sky,0,0);const fo=-(c*.2)%W,mo=-(c*.5)%W;G.drawImage(T.far,fo|0,0);G.drawImage(T.far,(fo+W)|0,0);const hz=L.th.sky[1];G.fillStyle=`rgba(${hz},.32)`;G.fillRect(0,0,W,H);G.drawImage(T.mid,mo|0,20);G.drawImage(T.mid,(mo+W)|0,20);G.fillStyle=`rgba(${hz},.12)`;G.fillRect(0,0,W,H);
 const x0=c/TS|0;for(let ty=0;ty<LH;ty++)for(let tx=x0;tx<x0+42&&tx<LW;tx++){const v=L.g[ty*LW+tx];if(!v)continue;const im=v==1?T.top:v==2?T.fill:T.blk;G.drawImage(im,tx*TS-c,ty*TS)}
 // flag + helipad
 const fx=L.flag.x-c,gyF=groundY(L,L.flag.x);G.fillStyle='#ddd';G.fillRect(fx,gyF-80,2,80);const fy=A.done?gyF-80:gyF-30;const fc=L.th.flag;G.fillStyle=`rgb(${fc})`;G.fillRect(fx+2,fy,18,11);G.fillStyle='#fff';G.fillRect(fx+6,fy+3,9,2);
 G.fillStyle='rgba(255,255,255,.8)';G.font='bold 10px monospace';G.fillText('EXTRACT',fx-14,gyF-86);G.fillStyle='#ffe040';G.fillRect(fx+24,gyF-2,40,2);G.fillRect(fx+38,gyF-12,2,10);G.fillRect(fx+48,gyF-12,2,10);G.fillRect(fx+38,gyF-8,12,2);
 for(const k of L.picks){if(k.got)continue;const by=Math.sin(TF.t*.1+k.x)*2;if(k.k=='med'){G.fillStyle='#f4f4f0';G.fillRect(k.x-c-5|0,k.y-9+by|0,10,8);G.fillStyle='#30a040';G.fillRect(k.x-c-1|0,k.y-8+by|0,2,6);G.fillRect(k.x-c-4|0,k.y-6+by|0,8,2)}
  else{G.fillStyle='#ffe040';G.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;G.lineTo(k.x-c+Math.cos(a)*r,k.y+by+Math.sin(a)*r)}G.fill();G.fillStyle='#fff';G.fillRect(k.x-c-1|0,k.y+by-3|0,2,2)}}
 const pal=L.th.bot;for(const e of L.ents){if(e.dead)continue;const s=e.k=='bot'?SPR['bot_'+ERA().id][(e.t>>3)%2]:SPR['drone_'+ERA().id][(e.t>>1)%2];const flip=e.k=='bot'?e.vx>0:false;
  if(e.k=='bot')drawSprite(s,e.x-c-10,e.y-26,!flip?false:true,e.stun%8>4);else drawSprite(s,e.x-c-11,e.y-10,false)}
 drawSetPiece(A,c);drawBoss(A,c);drawJet(A,c);
 for(const m of A.marks){G.fillStyle='#ff3030';G.fillRect(m.x-c-2|0,m.y-6|0,4,6)}
 const p=A.p;if(p.hook){const f=p.hook.t/12;G.strokeStyle='#d8c890';G.lineWidth=1;G.beginPath();G.moveTo(p.x-c,p.y-16);G.lineTo(p.hook.x-c,p.hook.y);G.stroke();p.x=p.hook.sx+(p.hook.x-p.hook.sx)*f;p.y=p.hook.sy+(p.hook.y-p.hook.sy)*f}
 if(!(p.inv>0&&p.inv%6<3)){const fr=!p.on?5:Math.abs(p.vx)>.3?1+((p.fr>>2)%4):(p.fcd>4?6:0);if(p.glide)drawSprite(SPR.chute,p.x-c-15,p.y-68,false);
  if(p.sprint>0){G.globalAlpha=.3;drawSprite(SPR['u_'+A.u.key][fr],p.x-c-16-p.face*10,p.y-48,p.face<0);G.globalAlpha=1}drawSprite(SPR['u_'+A.u.key][fr],p.x-c-16,p.y-48,p.face<0)}
 for(const b of A.bul){if(b.big){G.fillStyle=b.orb?'#ff60d0':'#3a3a36';G.fillRect(b.x-c-3|0,b.y-3|0,6,6);G.fillStyle=b.orb?'#fff':'#ffb040';G.fillRect(b.x-c-1|0,b.y-1|0,2,2);if(TF.t%3==0&&!b.orb)spawn({k:'smoke',x:b.x,y:b.y,vy:-.1,r:2,life:20});continue}
  if(b.laser){G.fillStyle='#ff40c0';G.fillRect(b.x-c-6|0,b.y|0,12,2);continue}G.fillStyle=b.from=='p'?'#ffe070':b.jetb?'#ffb050':`rgb(${pal[2]})`;G.fillRect(b.x-c-2|0,b.y|0,b.from=='p'?5:4,b.jetb?3:2)}
 if(A.flyby){const s=SPR[A.flyby.k||ERA().flyby].c;G.save();G.translate(A.flyby.x-c,30);G.scale(-.35,.35);G.drawImage(s,0,0);G.restore()}
 G.save();G.translate(-c,0);drawParts();drawParts2();G.restore();const no=-(c*1.35)%W;G.globalAlpha=.85;G.drawImage(T.near,no|0,H-46);G.drawImage(T.near,(no+W)|0,H-46);G.globalAlpha=1}
function drawAssaultHUD(){const A=TF.as;if(!A)return;const p=A.p,u=A.u;panel(40,30,760,150,.8);txt(u.name,70,85,36,'#ffe060');
 for(let i=0;i<p.max;i++){X.fillStyle=i<p.hp?'#ff5050':'#402020';X.fillRect(70+i*50,110,40,36);X.fillStyle=i<p.hp?'#ffb0a0':'#503030';X.fillRect(74+i*50,114,14,8)}
 txt('★ '+A.intel,380,142,32,'#ffe060');txt('KO '+A.kills,520,142,32,'#cde');
 panel(1380,30,500,150,.8);txt(u.ab,1410,85,28,'#ffd0a0');const f=1-p.cd/(u.id=='pj'||u.id=='rgr'?300:u.id=='cct'?240:u.id=='abn'?120:60);X.fillStyle='#111';X.fillRect(1410,110,440,30);X.fillStyle=f>=1?'#60e080':'#a08040';X.fillRect(1413,113,434*Math.min(1,f),24);txt(f>=1?'READY (C)':'...',1860,165,22,'#cde','right');
 txt(ERA().name,960,70,30,'#e8f0ff','center');
 if(A.banner&&A.banner.t>0){A.banner.t--;txt(A.banner.s,960,330,64,'#ffe060','center')}
 const B=A.boss;if(B&&B.active&&!B.dead){panel(460,940,1000,110,.85);txt(B.name,500,990,30,'#ffb080');hpBar(500,1005,920,Math.max(0,B.hp),B.max)}
 if(A.done){panel(460,330,1000,300,.92);txt('EXTRACTION COMPLETE!',960,440,64,'#7f7','center');txt(`Intel ${A.intel} · KOs ${A.kills}`,960,520,40,'#fff','center');if(TF.t%40<25)txt('Press Enter',960,590,32,'#ffe060','center')}}

// ---------- bosses & hazards ----------
function bossTop(B){return B.y-B.h+B.dy+(B.spr=='mech'?Math.abs(Math.sin(B.t*.05))*2:0)}
function bw(B,l){return{x:B.x+B.w-l[0],y:bossTop(B)+l[1]}}
function updBoss(A){const B=A.boss,p=A.p;if(!B)return;const s=SPR[B.spr].c;B.w=s.width;B.h=s.height;if(B.dead){if(A.t%5==0)spawn({k:'smoke',x:B.x+B.w*(.3+R()*.4),y:bossTop(B)+20,vy:-.5,r:5,life:70});return}
 if(!B.active){if(p.x>B.x-330){B.active=1;A.banner={t:100,s:'BOSS: '+B.name}}return}
 B.t++;B.fl>0&&B.fl--;B.x+=Math.sin(B.t*.012)*.45;const top=bossTop(B);
 const hb=B.y-B.h*.75;
 if(B.atk=='shell'||B.atk=='missile'){
  if(B.t%110==30){const m=bw(B,B.m);flash(m.x-3,m.y,2);for(let i=0;i<3;i++)spawn({k:'smoke',x:m.x,y:m.y,vy:-.3,r:4,life:40});
   if(B.atk=='shell')A.bul.push({x:m.x,y:m.y,vx:-(1.6+R()*1.8),vy:-2.2,g:.05,from:'e',life:220,big:1});
   else{const a=Math.atan2(p.y-14-m.y,p.x-m.x);A.bul.push({x:m.x,y:m.y,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,from:'e',life:220,big:1,mis:1})}B.recoil=8}
  if(B.t%110>=70&&B.t%110<86&&B.t%5==0){A.bul.push({x:B.x+12,y:B.y-16,vx:-3.6,from:'e',life:120});flash(B.x+10,B.y-16,.6)}}
 else{ if(B.t%100==40){for(let k=0;k<3;k++)A.bul.push({x:B.x+2-k*14,y:B.y-16,vx:-5,from:'e',life:120,laser:1});flash(B.x,B.y-16,1.5)}
  if(B.t%150==90){const m=bw(B,B.m);for(let k=0;k<3;k++)A.bul.push({x:m.x,y:m.y,vx:-1.2-k*.8,vy:-2.6,g:.05,from:'e',life:220,big:1,orb:1});flash(m.x,m.y,1.5)}}
 if(B.recoil)B.recoil--;
 if(p.x>B.x+8&&p.x<B.x+B.w-8&&p.y>hb-6){if(p.vy>0&&p.y<hb+10){B.hp-=2;B.fl=8;p.vy=-6.2;p.jumps=1;flash(p.x,p.y,1);if(B.hp<=0)killBoss(A)}else{hurtP(A);p.x=B.x+4;p.vx=-3}}}
function killBoss(A){const B=A.boss;if(B.dead)return;B.dead=1;A.kills++;A.banner={t:120,s:'BOSS DESTROYED!'};for(let k=0;k<10;k++)setTimeout(()=>boom(B.x+R()*B.w,bossTop(B)+R()*B.h*.8,1.5),k*120);setTimeout(()=>boom(B.x+B.w/2,B.y-B.h/2,2.5),1300)}
function drawBoss(A,c){const B=A.boss;if(!B||!B.w)return;const top=bossTop(B);if(B.dead)G.globalAlpha=.45;
 G.fillStyle='rgba(0,0,0,.25)';G.fillRect(B.x-c+10|0,B.y-4|0,B.w-20,6);drawSprite(SPR[B.spr],B.x-c+(B.recoil||0),top,true,B.fl%4>1);G.globalAlpha=1;
 if(B.spr=='mech'&&!B.dead&&B.t%30<15){G.fillStyle='rgba(255,40,80,.5)';G.fillRect(B.x-c+62|0,top+24|0,30,9)}}
function updJet(A){if(ERA().hazard!='jet'||A.boss.active)return;const p=A.p;
 if(!A.jet){if(--A.jetT<=0){A.jet={x:A.cam+W+30,t:0};A.jetT=600;A.banner={t:70,s:'Me 262 STRAFING RUN!'}}return}
 const J=A.jet;J.t++;J.x-=4.2;if(J.t%6==0&&J.x-A.cam>0&&J.x-A.cam<W)A.bul.push({x:J.x+30,y:58,vx:-1.2,vy:3.4,from:'e',life:80,laser:0,jetb:1});if(J.x<A.cam-260)A.jet=null}
function drawJet(A,c){if(!A.jet)return;const J=A.jet,s=SPR.jet;G.save();G.translate(J.x-c,20);G.scale(-.5,.5);G.drawImage(s.c,-210,0);G.restore();G.fillStyle=TF.t%4<2?'#ffd070':'#ff8030';G.fillRect(J.x-c+98|0,48,5,3)}

function drawSetPiece(A,c){const sp=ERA().setpiece;if(!sp)return;const s=SPR[sp].c,x=150,gy=groundY(A.L,x+140);const sx=x-c;if(sx<-300||sx>W)return;
 G.fillStyle='rgba(0,0,0,.25)';G.fillRect(sx+16,gy-6,s.width-30,7);G.drawImage(s,sx|0,gy-112|0);
 if(A.t%150==0){flash(sx+c+284,gy-112+46,2);A.bul.push({x:x+284,y:gy-66,vx:7,from:'p',life:60,big:1});shake=Math.max(shake,3)}}
