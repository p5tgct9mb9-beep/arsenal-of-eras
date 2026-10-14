'use strict';
// ---- Role select + LAND VEHICLE (drive & shoot) + AIRCRAFT (shmup) modes ----
const ROLES=[{k:'inf',name:'INFANTRY',d:'Platformer · era roster'},{k:'land',name:'LAND VEHICLE',d:'Drive & shoot · cannon + MG'},{k:'air',name:'AIRCRAFT',d:'Side-scrolling shmup'}];
TF.roleSel=0;TF.vSel=0;
function roleIcon(k){return k=='inf'?SPR['u_'+ROSTERS[ERA().id][2].key][1]:k=='land'?SPR[PV[ERA().id][0].k]:SPR[PA[ERA().id][0].k]}
function drawRoleSelect(){txt('CHOOSE YOUR ROLE · '+ERA().name,960,130,64,'#ffe060','center');
 ROLES.forEach((r,i)=>{const x=110+i*590,y=230,s=i==TF.roleSel;panel(x,y,520,620,s?.92:.7);if(s){X.strokeStyle='#ffe060';X.lineWidth=8;X.strokeRect(x-8,y-8,536,636)}
  const c=roleIcon(r.k).c,sc=r.k=='inf'?6:Math.min(3,440/c.width);big(c,x+260-c.width*sc/2,y+300-c.height*sc/2,sc);
  txt(r.name,x+260,y+520,44,s?'#ffe060':'#fff','center');txt(r.d,x+260,y+580,20,'#bcd','center')});
 txt('< > choose · Enter/Z confirm · Esc back',960,1010,26,'#9ab','center')}
function vList(){return TF.role=='land'?PV[ERA().id]:PA[ERA().id]}
function drawVPick(){const L=vList(),n=L.length;txt('SELECT '+(TF.role=='land'?'VEHICLE':'AIRCRAFT')+' · '+ERA().name,960,120,56,'#ffe060','center');
 const cw=Math.min(560,Math.floor((1840-(n-1)*16)/n)),x0=960-(n*cw+(n-1)*16)/2;
 L.forEach((v,i)=>{const x=x0+i*(cw+16),y=200,s=i==TF.vSel;panel(x,y,cw,700,s?.94:.7);if(s){X.strokeStyle='#ffe060';X.lineWidth=8;X.strokeRect(x-8,y-8,cw+16,716)}
  const c=SPR[v.k].c,sc=Math.max(1,Math.floor((cw-40)/c.width*2)/2);big(c,x+cw/2-c.width*sc/2,y+190-c.height*sc/2,sc);
  const nm=v.name,fs=nm.length*13>cw-30?20:26;txt(nm,x+cw/2,y+340,fs,s?'#ffe060':'#fff','center');txt(v.gun||'',x+cw/2,y+378,18,'#9cf','center');
  [['SPD',v.spd],['ARM',v.arm],['FIRE',v.fire]].forEach(([l,val],r)=>{const yy=y+420+r*48;txt(l,x+24,yy+26,20,'#cde');for(let k=0;k<5;k++){X.fillStyle=k<val?(s?'#ffe060':'#c8b860'):'#2a3040';X.fillRect(x+110+k*Math.floor((cw-140)/5),yy+4,Math.floor((cw-140)/5)-6,22)}});
  const sl=(TF.role=='land'?'C: ':'X: ')+(SPN[v.sp]||v.sp);if(cw>=360){tag(sl,x+16,y+580,'#a84a20');if(v.sp2)tag('V: '+SPN[v.sp2],x+16,y+630,'#a84a20')}else{X.fillStyle='#a84a20';X.fillRect(x+12,y+566,cw-24,(v.sp2?84:44));txt(sl,x+cw/2,y+596,18,'#fff','center');if(v.sp2)txt('V: '+SPN[v.sp2],x+cw/2,y+636,18,'#fff','center')}});
 txt('< > choose · Enter/Z deploy · Esc back',960,1000,26,'#9ab','center')}
function roleConfirm(){TF.role=ROLES[TF.roleSel].k;if(TF.role=='inf'){TF.state='unit';return}TF.vSel=0;TF.state='vpick'}
function startMode(){parts=[];fade=12;TF.role=='land'?startDrive():startAir()}
// ================= LAND =================
const DLEN=3900;
function dTerr(eid){const r=mulberry(500+eid.charCodeAt(0)*7),br=[];for(let x=700;x<DLEN-700;x+=900+r()*300|0)br.push([x,x+150+r()*60|0]);
 const ph=r()*9,h=x=>262+22*Math.sin(x*.0042+ph)+10*Math.sin(x*.013+ph*2)+(x>DLEN-560?(Math.min(x,DLEN-300)-(DLEN-560))*0:0);
 const flat=DLEN-520,hf=h(flat),g=x=>x>flat?hf:h(x);return{br,h:g,gy:x=>{for(const b of br)if(x>b[0]&&x<b[1]){const t=(x-b[0])/(b[1]-b[0]);return g(b[0])*(1-t)+g(b[1])*t}return g(x)},inBr:x=>br.some(b=>x>b[0]&&x<b[1])}}
function startDrive(){const E=ERA(),v=PV[E.id][TF.vSel];const T=dTerr(E.id),b=E.boss;
 TF.md={k:'land',v,T,t:0,x:60,vx:0,cam:0,hp:v.hp,a:.12,cd:0,mg:0,tow:0,sq:0,inv:0,bul:[],ens:[],help:[],kills:0,done:0,banner:{t:120,s:E.name+' · '+v.name},
  boss:{spr:b.spr,name:b.name,hp:b.hp*2,max:b.hp*2,x:DLEN-320,t:0,active:0,dead:0,hit:0}};applyRotation(TF.md,'land');TF.state='drive'}
function dSpawn(D){const id=ERA().id;if(D.t%70==0&&D.x<DLEN-700){const ex=D.cam+W+20;D.ens.push({k:'bot',x:ex,y:D.T.gy(ex),hp:2,t:0,cd:60+R()*60|0})}
 if(D.t%260==130&&D.x<DLEN-700){const k=EA[id].air[R()*EA[id].air.length|0];D.ens.push({k:'air',spr:k,x:D.cam+W+40,y:40+R()*50,hp:3,t:0,cd:40})}}
function dHit(D,b,dmg){for(const e of D.ens){if(e.dead)continue;const s=e.k=='air'?SPR[e.spr].c:{width:24,height:36};const top=e.k=='air'?e.y:e.y-36;
  if(b.x>e.x-4&&b.x<e.x+s.width&&b.y>top&&b.y<top+s.height){e.hp-=dmg;flash(b.x,b.y,.8);if(e.hp<=0){e.dead=1;D.kills++;boom(e.x+10,top+12,e.k=='air'?1:.6)}return 1}}
 const B=D.boss;if(B.active&&!B.dead&&!B.hide){const s=SPR[B.spr].c,top=D.T.gy(B.x+s.width/2)-s.height+(B.ace?B.dy:(ERA().boss.dy||0))+(B.spr=='orbital'?-60:0);if(b.x>B.x&&b.x<B.x+s.width&&b.y>top&&b.y<top+s.height){B.hp-=dmg;B.hit=4;flash(b.x,b.y,1);
  if(B.hp<=0){B.dead=1;D.kills++;for(let k=0;k<8;k++)setTimeout(()=>boom(B.x+R()*s.width,top+R()*s.height,1.4),k*120);D.banner={t:200,s:'BOSS DESTROYED · MISSION COMPLETE'};D.done=1}return 1}}return 0}
function dHurt(D,n=1){if(D.inv>0)return;D.hp-=n;D.inv=50;shake=Math.max(shake,5);if(D.hp<=0){D.hp=0;D.done=2;D.banner={t:9999,s:'VEHICLE DESTROYED · ESC TO RETRY'}}}
function updDrive(){const D=TF.md;if(!D)return;if(D.card>0){D.card--;if((jp.has('KeyZ')||jp.has('pad_a'))&&D.card<220)D.card=0;return}D.t++;const v=D.v,T=D.T;if(D.inv>0)D.inv--;if(D.banner)D.banner.t--;
 if(D.done!=2){const sp=(1+(v.spd||3)*.28)*(D.od>0?1.7:1);D.vx+=((held('right')?1:0)-(held('left')?1:0))*.12;D.vx*=.92;D.vx=Math.max(-sp,Math.min(sp,D.vx));D.x=Math.max(20,Math.min(DLEN-480,D.x+D.vx));
  if(held('up'))D.a=Math.min(1.1,D.a+.02);if(held('down'))D.a=Math.max(-.12,D.a-.02)}
 D.cam=Math.max(0,Math.min(DLEN-W,D.x-180));const gy=T.gy(D.x+75),sl=Math.atan2(T.gy(D.x+120)-T.gy(D.x+30),90);D.y=gy;D.sl=sl;
 const s=SPR[v.k].c,piv=SPR[v.k].piv||[100,22],hov=v.hover?Math.sin(D.t*.08)*2-8:0;D.hov=hov;
 const px=D.x+piv[0],py=gy-s.height+piv[1]+hov+6,ang=-D.a+sl,L=v.fast?30:v.mgOnly?14:38,mx=px+Math.cos(ang)*L,my=py+Math.sin(ang)*L;D.mz=[mx,my,ang];
 if(D.cd>0)D.cd--;if(D.mg>0)D.mg--;if(D.tow>0)D.tow--;if(D.sq>0)D.sq--;if(D.od>0)D.od--;
 if(D.done!=2){if(keys.KeyZ||keys.KeyJ){if(v.mgOnly){if(D.mg==0){D.mg=D.od>0?2:v.mg;const a2=ang+(R()-.5)*.07;D.bul.push({x:mx,y:my,vx:Math.cos(a2)*8,vy:Math.sin(a2)*8,g:0,dmg:.5+v.fire*.12,p:1,k:'m'});flash(mx,my,.4)}}
   else if(D.cd==0){D.cd=v.cd;const spd=v.fast?7.5:v.arty?7:6;D.bul.push({x:mx,y:my,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,g:v.fast?.02:v.arty?.06:.05,dmg:v.dmg||3,p:1,k:v.fast?'r':'s'});flash(mx,my,v.fast?.6:1.3);if(!v.fast){shake=Math.max(shake,2.5);for(let k=0;k<3;k++)spawn({k:'smoke',x:mx,y:my,vy:-.2,r:3,life:40})}}}
  if((keys.KeyX||keys.KeyK)&&v.mg&&!v.mgOnly&&D.mg==0){D.mg=D.od>0?3:v.mg;const a2=ang+(R()-.5)*.06;D.bul.push({x:px-10,y:py-8,vx:Math.cos(a2)*8,vy:Math.sin(a2)*8,g:0,dmg:.5,p:1,k:'m'})}
  if((jp.has('KeyC')||jp.has('KeyL'))&&D.tow==0)D.tow=landSpecial(D,v.sp,px,py,ang,mx,my);
  if((jp.has('KeyV')||jp.has('KeyI'))&&v.sp2&&D.sq==0)D.sq=landSpecial(D,v.sp2,px,py,ang,mx,my)}
 for(const h of D.help){h.t++;h.life--;const tx=D.x+170+(h.cd%4)*16;if(h.t>0)h.x+=Math.max(-1.2,Math.min(1.2,(tx-h.x)*.05));h.cd++;if(h.cd%26==0&&h.t>0)D.bul.push({x:h.x+26,y:T.gy(h.x+12)-30,vx:7,vy:0,g:0,dmg:.6,p:1,k:'m'})}
 D.help=D.help.filter(h=>h.life>0);
 for(const b of D.bul){b.x+=b.vx;b.y+=b.vy;b.vy+=b.g;b.t=(b.t||0)+1;
  if(b.k=='tow'){b.vx=Math.min(7,b.vx+.15);const tg=D.boss.active&&!D.boss.dead?D.boss:D.ens.find(e=>!e.dead&&e.x>b.x);if(tg){const ty=tg===D.boss?T.gy(tg.x+100)-40:(tg.k=='air'?tg.y+10:tg.y-18);b.vy+=(ty-b.y)*.004;b.vy*=.95}if(b.t%2==0)spawn({k:'smoke',x:b.x,y:b.y,vy:-.1,r:2,life:30})}
  if(b.p){if(dHit(D,b,b.dmg)){b.dead=1;if(b.k=='s'||b.k=='tow')boom(b.x,b.y,.8)}else if(b.y>T.gy(b.x)&&!T.inBr(b.x)||b.y>T.gy(b.x)+2){b.dead=1;if(b.k=='s'||b.k=='tow')boom(b.x,b.y,.6)}}
  else{if(b.x>D.x+8&&b.x<D.x+144&&b.y>D.y-60&&b.y<D.y){b.dead=1;dHurt(D,b.dmg);boom(b.x,b.y,.5)}else if(b.y>T.gy(b.x)+2){b.dead=1;boom(b.x,b.y,.4)}}
  if(b.x<D.cam-50||b.x>D.cam+W+80||b.y<-200)b.dead=1}
 D.bul=D.bul.filter(b=>!b.dead);dSpawn(D);
 for(const e of D.ens){if(e.dead)continue;e.t++;
  if(e.k=='bot'){e.x-=.5;e.y=T.gy(e.x+12);if(--e.cd<=0&&e.x<D.cam+W){e.cd=110;D.bul.push({x:e.x,y:e.y-26,vx:-3.4,vy:-.6,g:.01,dmg:1,k:'e'})}}
  else{e.x-=2.2;e.y+=Math.sin(e.t*.05)*.6;if(--e.cd<=0&&Math.abs(e.x-D.x-60)<120){e.cd=50;D.bul.push({x:e.x+20,y:e.y+20,vx:-1,vy:1.5,g:.05,dmg:1,k:'bomb'})}}
  if(e.x<D.cam-120)e.dead=1}
 D.ens=D.ens.filter(e=>!e.dead);
 const B=D.boss;if(!B.active&&B.x-D.x<520){B.active=1;D.banner={t:120,s:(B.ace?'ACE: ':'BOSS: ')+B.name};if(B.ace)D.card=240}
 if(B.ace&&B.active&&!B.dead)aceLand(D,B);else if(B.active&&!B.dead){B.t++;if(B.hit>0)B.hit--;const s=SPR[B.spr].c,top=T.gy(B.x+s.width/2)-s.height;if(B.t%70==0){const mx=B.x+20,my=top+40,dx=D.x+70-mx;D.bul.push({x:mx,y:my,vx:dx/70,vy:-2.2,g:.06,dmg:2,k:'e'});flash(mx,my,1.4)}
  if(B.t%140==35&&ERA().boss.atk!='shell')for(let k=0;k<3;k++)D.bul.push({x:B.x+40,y:top+30,vx:-3-k*.6,vy:-1+k*.5,g:.02,dmg:1,k:'e'})}}
function drawDrive(){const D=TF.md;if(!D)return;const E=ERA(),bg=BBG[E.id],th=LTH[E.id],T=D.T,c=D.cam|0;G.drawImage(bg.sky,0,0);
 for(const cl of bg.clouds||[])G.drawImage(cl.c,((cl.x-c*.1)%(W+200)+W+200)%(W+200)-100|0,cl.y|0);
 const gw=bg.ground.width,o=-(c*.3)%gw;G.drawImage(bg.ground,o|0,H-200);G.drawImage(bg.ground,o+gw|0,H-200);
 const top=`rgb(${th.top})`,fill=`rgb(${th.fill})`,dk=`rgb(${mix(th.fill,[0,0,0],.35)})`;
 for(let sx=0;sx<W;sx+=2){const wx=sx+c;if(T.inBr(wx)){G.fillStyle='#3a6a90';G.fillRect(sx,322,2,H-322);G.fillStyle='#5a90b8';if((wx+D.t>>3)%5==0)G.fillRect(sx,322,2,1);continue}
  const y=T.h(wx)|0;G.fillStyle=top;G.fillRect(sx,y,2,4);G.fillStyle=fill;G.fillRect(sx,y+4,2,H-y);G.fillStyle=dk;if(hash(wx>>2,7)>.8)G.fillRect(sx,y+10+hash(wx,3)*40|0,2,2)}
 for(const b of T.br){const x0=b[0]-c,x1=b[1]-c;if(x1<0||x0>W)continue;const y0=T.gy(b[0]),y1=T.gy(b[1]);G.strokeStyle='#4a4038';G.lineWidth=3;G.beginPath();G.moveTo(x0,y0);G.lineTo(x1,y1);G.stroke();
  G.strokeStyle='#6a5a48';G.lineWidth=1;for(let x=x0;x<x1;x+=10){const t=(x-x0)/(x1-x0),y=y0*(1-t)+y1*t;G.beginPath();G.moveTo(x,y+2);G.lineTo(x+5,y+14);G.lineTo(x+10,y+2);G.stroke()}G.fillStyle='#3a3028';G.fillRect(x0+(x1-x0)/2-3,(y0+y1)/2,6,H)}
 const B=D.boss;if(B.x-c<W+20){const s=SPR[B.spr],ty=T.gy(B.x+s.c.width/2)-s.c.height+(B.ace?B.dy:(E.boss.dy||0))+(B.spr=='orbital'?-60:0);G.globalAlpha=B.dead?.4:B.hide?.3:1;drawSprite(s,B.x-c,ty,true,B.hit>0&&B.hit%2);G.globalAlpha=1;drawAceLand(D,c)}
 for(const e of D.ens){if(e.k=='bot'){const s=SPR['bot_'+E.id][(e.t>>3)%2];drawSprite(s,e.x-c,e.y-s.c.height,true)}else drawSprite(SPR[e.spr],e.x-c,e.y,true)}
 const v=D.v,s=SPR[v.k].c;G.fillStyle='rgba(0,0,0,.28)';G.fillRect(D.x-c+10,D.y-3,130,5);
 for(const h of D.help){const u=SPR['u_'+h.u];drawSprite(u[h.cd%26<6?6:1+(Math.max(0,h.t)>>2)%4],h.x-c,T.gy(h.x+16)-48,false)}
 G.save();G.translate(D.x-c+75|0,D.y+D.hov+6|0);G.rotate(D.sl);if(D.inv%6>2)G.globalAlpha=.6;
 const[mx,my,ang]=D.mz;G.restore();G.save();G.strokeStyle='#24262a';G.lineWidth=v.k=='bradley'?3:5;G.beginPath();const px=mx-Math.cos(ang)*(v.k=='bradley'?30:38),py=my-Math.sin(ang)*(v.k=='bradley'?30:38);G.moveTo(px-c,py);G.lineTo(mx-c,my);G.stroke();G.strokeStyle=v.k=='bradley'?'#6a6a62':'#7a7a70';G.lineWidth=v.k=='bradley'?1:2;G.beginPath();G.moveTo(px-c,py-1);G.lineTo(mx-c,my-1);G.stroke();G.restore();
 G.save();G.fillStyle='rgba(10,8,6,.28)';G.beginPath();G.ellipse(D.x-c+75|0,D.y+6|0,74,4,0,0,6.283);G.fill();G.fillStyle='rgba(10,8,6,.2)';G.beginPath();G.ellipse(D.x-c+75|0,D.y+6|0,64,2.5,0,0,6.283);G.fill();G.restore();G.save();G.translate(D.x-c+75|0,D.y+D.hov+6|0);G.rotate(D.sl);if(D.inv%6>2)G.globalAlpha=.6;G.drawImage(s,-75,-s.height);if(v.hover){G.globalCompositeOperation='lighter';G.fillStyle='rgba(80,200,255,.25)';G.fillRect(-60,0,120,4)}G.restore();
 for(const b of D.bul){G.fillStyle=b.k=='e'||b.k=='bomb'?'#ff6040':b.k=='tow'?'#fff':b.k=='m'?'#ffe070':'#ffd040';const z=b.k=='s'||b.k=='bomb'||b.k=='tow'?3:2;G.fillRect(b.x-c-1|0,b.y-1|0,z,z);if(b.k!='m'&&b.k!='r'){G.fillStyle='rgba(255,200,80,.5)';G.fillRect(b.x-c-b.vx|0,b.y-b.vy|0,2,2)}}
 G.save();G.translate(-c,0);drawParts();drawParts2();G.restore()}
function drawDriveHUD(){const D=TF.md;if(!D)return;const v=D.v;panel(40,30,820,170,.8);txt(v.name,80,90,40,'#ffe060');hpBar(80,120,420,Math.min(D.hp,v.hp),v.hp);txt('KO '+D.kills,560,150,32,'#fff');
 txt('Z: '+v.gun.split(' + ')[0]+(v.mg&&!v.mgOnly?' · X: MG':'')+' · C: '+SPN[v.sp]+(D.tow?' …':' READY')+(v.sp2?' · V: '+SPN[v.sp2]+(D.sq?' …':' READY'):'')+' · UP/DN aim',80,185,20,'#bcd');
 const B=D.boss;if(B.active&&!B.dead){panel(560,920,800,130,.85);txt(B.name,600,970,30,'#ffd0b0');hpBar(600,995,720,Math.max(0,B.hp),B.max)}
 if(D.banner&&D.banner.t>0&&!(D.card>0)){panel(460,420,1000,130,.85);txt(D.banner.s,960,500,40,'#ffe060','center')}drawAceCard(D)}
// ================= AIR =================
function startAir(){const E=ERA(),v=PA[E.id][TF.vSel],b=EA[E.id].boss;TF.md={k:'air',v,t:0,x:80,y:150,hp:4+(v.arm||2)*2,max:4+(v.arm||2)*2,cd:0,ms:0,inv:0,bul:[],ens:[],kills:0,done:0,scroll:0,banner:{t:120,s:E.name+' · '+v.name},
 boss:{spr:b.k,name:b.name,hp:b.hp,max:b.hp,x:W+60,y:110,t:0,active:0,dead:0,hit:0}};applyRotation(TF.md,'air');TF.state='air'}
function updAir(){const Q=TF.md;if(!Q)return;if(Q.card>0){Q.card--;if((jp.has('KeyZ')||jp.has('pad_a'))&&Q.card<220)Q.card=0;return}Q.t++;Q.scroll+=1.4;if(Q.inv>0)Q.inv--;if(Q.banner)Q.banner.t--;const id=ERA().id,s=SPR[Q.v.k].c;
 if(Q.done!=2){const asp=1.6+(Q.v.spd||3)*.3;Q.x+=((held('right')?1:0)-(held('left')?1:0))*asp;Q.y+=((held('down')?1:0)-(held('up')?1:0))*asp*.92;if(Q.burst>0)Q.burst--;Q.x=Math.max(4,Math.min(W-s.width-120,Q.x));Q.y=Math.max(10,Math.min(H-70,Q.y));
  if(Q.cd>0)Q.cd--;if(Q.ms>0)Q.ms--;if((keys.KeyZ||keys.KeyJ)&&Q.cd==0){Q.cd=Q.burst>0?2:Math.max(3,9-(Q.v.fire||3));for(const dy of[-3,3])Q.bul.push({x:Q.x+s.width,y:Q.y+s.height/2+dy,vx:9,vy:Q.burst>0?(R()-.5)*1.4:0,p:1,dmg:1});flash(Q.x+s.width,Q.y+s.height/2,.5)}
  if((keys.KeyX||keys.KeyK)&&Q.ms==0)Q.ms=airSpecial(Q,Q.v.sp||'missile',s)}
 const B=Q.boss;if(!B.active&&(Q.t>1500||Q.kills>=22)){B.active=1;Q.banner={t:120,s:(B.ace?'ACE: ':'AIR BOSS: ')+B.name};if(B.ace)Q.card=240}
 if(!B.active){if(Q.t%38==0){const k=EA[id].air[R()*EA[id].air.length|0],n=k=='swarm'?5:1,y0=30+R()*(H-160);for(let i=0;i<n;i++)Q.ens.push({k,x:W+10+i*26,y:y0+i*8,y0:y0+i*8,hp:k=='swarm'||k=='shahed'?1:3,t:i*10,cd:60+R()*60|0,ph:R()*6})}
  if(Q.t%170==90)Q.ens.push({k:'aa',x:W+10,y:H-34,hp:4,t:0,cd:40});if(Q.t%300==200)Q.ens.push({k:'rk',x:200+R()*300,y:H+10,hp:2,t:0})}
 for(const b of Q.bul){if(b.hm){const tg=B.active&&!B.dead?{x:B.x+60,y:B.y+40}:Q.ens.find(e=>!e.dead&&e.x>b.x);b.vx=Math.min(8,b.vx+.25);if(tg)b.vy+=Math.sign(tg.y-b.y)*.25;b.vy*=.92;if(Q.t%2==0)spawn({k:'smoke',x:b.x,y:b.y,vy:0,r:1.5,life:20})}
  b.x+=b.vx;b.y+=b.vy;if(b.g)b.vy+=b.g;if(b.bomb&&b.y>H-30){b.dead=1;boom(b.x,b.y,.7);for(const e of Q.ens)if(!e.dead&&Math.abs(e.x+10-b.x)<34&&e.y>H-80){e.hp-=6;if(e.hp<=0){e.dead=1;Q.kills++;boom(e.x+10,e.y,.8)}}}if(b.p){for(const e of Q.ens){if(e.dead)continue;const es=e.k=='aa'||e.k=='rk'?{width:20,height:24}:SPR[e.k].c;if(b.x>e.x&&b.x<e.x+es.width&&b.y>e.y&&b.y<e.y+es.height){e.hp-=b.dmg;b.dead=1;flash(b.x,b.y,.6);if(e.hp<=0){e.dead=1;Q.kills++;boom(e.x+es.width/2,e.y+es.height/2,.8)}break}}
   if(!b.dead&&B.active&&!B.dead){const bs=SPR[B.spr].c;if(b.x>B.x+10&&b.x<B.x+bs.width&&b.y>B.y+bs.height*.15&&b.y<B.y+bs.height*.9){B.hp-=b.dmg;B.hit=4;b.dead=1;flash(b.x,b.y,.8);if(B.hp<=0){B.dead=1;Q.done=1;Q.kills++;for(let k=0;k<8;k++)setTimeout(()=>boom(B.x+R()*bs.width,B.y+R()*bs.height,1.4),k*120);Q.banner={t:220,s:'AIR BOSS DOWN · MISSION COMPLETE'}}}}}
  else if(b.x>Q.x+8&&b.x<Q.x+s.width-8&&b.y>Q.y+6&&b.y<Q.y+s.height-4&&Q.inv==0&&Q.done!=1){b.dead=1;Q.hp--;Q.inv=60;shake=5;boom(b.x,b.y,.5);if(Q.hp<=0){Q.done=2;Q.banner={t:9999,s:'SHOT DOWN · ESC TO RETRY'};boom(Q.x+40,Q.y+16,1.5)}}
  if(b.x<-20||b.x>W+40||b.y<-40||b.y>H+20)b.dead=1}
 Q.bul=Q.bul.filter(b=>!b.dead);const aim=(x,y,sp)=>{const dx=Q.x+50-x,dy=Q.y+16-y,d=Math.hypot(dx,dy)||1;Q.bul.push({x,y,vx:dx/d*sp,vy:dy/d*sp})};
 for(const e of Q.ens){if(e.dead)continue;e.t++;
  if(e.k=='aa'){e.x-=1.4;if(--e.cd<=0){e.cd=60;aim(e.x+10,e.y,2.4);spawn({k:'flak',x:Q.x+60+(R()-.5)*80,y:Q.y+(R()-.5)*60,life:30})}}
  else if(e.k=='rk'){e.y-=2.6;if(e.t%2==0)spawn({k:'smoke',x:e.x+3,y:e.y+20,vy:.2,r:2.5,life:40})}
  else{const sp=e.k=='swarm'?3:e.k=='shahed'?1.8:e.k=='hind'?1.6:2.4;e.x-=sp;e.y=e.y0+Math.sin(e.t*.04+e.ph)*30;if(--e.cd<=0&&e.x<W-20&&e.k!='shahed'&&e.k!='swarm'){e.cd=90;aim(e.x,e.y+10,2.8)}
   if((e.k=='shahed'||e.k=='swarm')&&Math.abs(e.x-Q.x-40)<30&&Math.abs(e.y-Q.y)<24&&Q.inv==0){e.dead=1;boom(e.x,e.y,.7);Q.hp--;Q.inv=60}}
  if(e.x<-120||e.y<-60)e.dead=1}
 Q.ens=Q.ens.filter(e=>!e.dead);
 if(B.ace&&B.active&&!B.dead)aceAir(Q,B);else if(B.active&&!B.dead){B.t++;if(B.hit>0)B.hit--;const bs=SPR[B.spr].c;B.x+=(W-bs.width-20-B.x)*.02;B.y=H/2-bs.height/2-30+Math.sin(B.t*.02)*70;
  if(B.t%50==0)for(let k=-2;k<=2;k++)Q.bul.push({x:B.x+10,y:B.y+bs.height*.5,vx:-2.6,vy:k*.7});if(B.t%90==45)aim(B.x+30,B.y+bs.height*.4,3.4)}}
function drawAir(){const Q=TF.md;if(!Q)return;const E=ERA(),bg=BBG[E.id],th=LTH[E.id];G.drawImage(bg.sky,0,0);
 for(const cl of bg.clouds||[])G.drawImage(cl.c,((cl.x-Q.scroll*.4)%(W+200)+W+200)%(W+200)-100|0,cl.y|0);
 const gw=bg.ground.width,o=-(Q.scroll*.6)%gw;G.drawImage(bg.ground,o|0,H-170);G.drawImage(bg.ground,o+gw|0,H-170);
 G.fillStyle=`rgb(${th.fill})`;G.fillRect(0,H-26,W,26);G.fillStyle=`rgb(${th.top})`;G.fillRect(0,H-28,W,3);
 const B=Q.boss;if(B.active){G.globalAlpha=B.dead?.4:B.hide?.3:1;drawSprite(SPR[B.spr],B.x,B.y,B.spr!='orbital',B.hit>0&&B.hit%2);G.globalAlpha=1}
 for(const e of Q.ens){if(e.k=='aa'){G.fillStyle='#3a3a34';G.fillRect(e.x|0,H-40,20,14);G.fillStyle='#24241e';G.fillRect(e.x+6|0,H-50,3,12);G.fillRect(e.x+11|0,H-50,3,12)}
  else if(e.k=='rk'){G.fillStyle='#d8d8d0';G.fillRect(e.x|0,e.y|0,6,20);G.fillStyle='#a03020';G.fillRect(e.x|0,e.y|0,6,4);G.fillStyle='#ffb040';G.fillRect(e.x+1|0,e.y+20|0,4,4)}
  else drawSprite(SPR[e.k],e.x,e.y,true)}
 const s=SPR[Q.v.k];if(Q.done!=2&&!(Q.inv%6>3))drawSprite(s,Q.x,Q.y,false);
 for(const b of Q.bul){G.fillStyle=b.p?(b.hm?'#fff':'#ffe070'):'#ff5a60';G.fillRect(b.x-2|0,b.y-1|0,b.p&&!b.hm?6:3,b.p?2:3)}
 drawParts();drawParts2()}
function drawAirHUD(){const Q=TF.md;if(!Q)return;panel(40,30,820,150,.8);txt(Q.v.name,80,90,40,'#ffe060');hpBar(80,115,420,Math.max(0,Math.min(Q.hp,Q.max)),Q.max);txt('KO '+Q.kills,560,145,32,'#fff');txt('Z: guns · X: '+(SPN[Q.v.sp]||'MISSILES')+(Q.ms?' …':' READY')+' · arrows: fly',80,166,20,'#bcd');
 const B=Q.boss;if(B.active&&!B.dead){panel(560,920,800,130,.85);txt(B.name,600,970,30,'#ffd0b0');hpBar(600,995,720,Math.max(0,B.hp),B.max)}
 if(Q.banner&&Q.banner.t>0&&!(Q.card>0)){panel(460,420,1000,130,.85);txt(Q.banner.s,960,500,40,'#ffe060','center')}drawAceCard(Q)}

const SPCD={smoke:600,repair:900,barrage:420,rockets:480,tow:150,squad:600,overdrive:600,railshot:300,missile:45,bomb:50,burst:300,hellfire:70,stealth:420,salvo:240};
function landSpecial(D,sp,px,py,ang,mx,my){const v=D.v,T=D.T;
 switch(sp){case'smoke':D.inv=150;for(let k=0;k<16;k++)spawn({k:'smoke',x:D.x+R()*150,y:D.y-R()*50,vy:-.15,r:7,life:120});break;
  case'repair':D.hp=Math.min(v.hp,D.hp+3);for(let k=0;k<12;k++)spawn({k:'fire',x:D.x+40+R()*70,y:D.y-30-R()*20,vx:(R()-.5),vy:-R()*2,life:30});D.banner={t:50,s:'+3 ARMOR'};break;
  case'barrage':{const tx=D.boss.active&&!D.boss.dead?D.boss.x+60:D.x+300;for(let k=0;k<3;k++)setTimeout(()=>{if(TF.md===D)D.bul.push({x:tx+(k-1)*40,y:-20,vx:-.3,vy:4.5,g:.05,dmg:5,p:1,k:'s'})},k*220);D.banner={t:50,s:'FIRE MISSION!'};break}
  case'rockets':for(let k=0;k<6;k++)setTimeout(()=>{if(TF.md===D)D.bul.push({x:mx,y:my-6,vx:4.5+k*.4,vy:-4.2+k*.15,g:.06,dmg:3,p:1,k:'s'})},k*90);break;
  case'tow':D.bul.push({x:D.x+50,y:py-14,vx:3,vy:0,g:0,dmg:8,p:1,k:'tow',t:0});flash(D.x+50,py-14,1);break;
  case'squad':for(let k=0;k<4;k++)D.help.push({x:D.x+10-k*14,t:-k*8,life:420,u:ROSTERS.mod[[2,4,1,3][k]].key,cd:k*9});break;
  case'overdrive':D.od=180;D.banner={t:40,s:'OVERDRIVE!'};break;
  case'railshot':D.bul.push({x:mx,y:my,vx:Math.cos(ang)*14,vy:Math.sin(ang)*14,g:0,dmg:10,p:1,k:'r'});flash(mx,my,1.6);shake=Math.max(shake,4);break}
 return SPCD[sp]||300}
function airSpecial(Q,sp,s){const x=Q.x+40,y=Q.y+s.height*.7;
 switch(sp){case'missile':for(const dy of[-1,1])Q.bul.push({x,y,vx:3,vy:dy*.6,p:1,dmg:4,hm:1});break;
  case'rockets':for(const dy of[-4,-1,2,5])Q.bul.push({x:x+10,y:y+dy,vx:8,vy:0,p:1,dmg:3,hm:0});break;
  case'bomb':for(let k=0;k<3;k++)Q.bul.push({x:x-k*10,y,vx:1.6,vy:.4,g:.12,p:1,dmg:6,bomb:1});break;
  case'burst':Q.burst=90;break;case'hellfire':Q.bul.push({x,y,vx:2,vy:.5,p:1,dmg:10,hm:1});break;
  case'stealth':Q.inv=150;for(const dy of[-1,1])Q.bul.push({x,y,vx:3,vy:dy*.6,p:1,dmg:4,hm:1});break;
  case'salvo':for(let k=0;k<6;k++)Q.bul.push({x,y:y-10+k*4,vx:2+k*.2,vy:(k-2.5)*.5,p:1,dmg:3,hm:1});break}return SPCD[sp]||60}
