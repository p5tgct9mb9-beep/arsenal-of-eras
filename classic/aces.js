'use strict';
// ---- Ace boss encounters: intro card + unique patterns. Real WW2/Cold War aces (no SS members); fictional aces for later eras. ----
function mkPortrait(o){const pb=new PB(48,48),SK=R5(o.skin||[214,170,138]),HR=R5(o.hair||[80,62,46]),C=R5(o.col),D=R5(mix(o.col,[0,0,0],.3));
 vRect(pb,6,36,36,12,C,.7,.3);vRect(pb,20,30,8,7,SK,.6,.3);
 if(o.ai){pb.ell(24,20,13,14,(i,j,dx,dy)=>tone(R5([70,74,86]),.8-.35*dy));vRect(pb,13,17,22,6,R5(o.eye||[255,60,200]),.95,.6);pb.outline(OUT);return pb}
 pb.ell(24,21,11.5,13,(i,j,dx,dy)=>tone(SK,.84-.32*dy-.18*dx));
 if(o.cap=='pilot'){pb.ell(24,12,13,9,(i,j,dx,dy)=>j>14?pb.get(i,j):tone(R5([92,64,44]),.75-.3*dy));vRect(pb,12,12,24,5,R5([60,62,66]),.8,.3);for(const x of[15,26])vEll(pb,x+3,14,4,3,R5([150,190,210]),.85)}
 else if(o.cap=='tank'){pb.ell(24,11,13,6,(i,j,dx,dy)=>tone(D,.7-.3*dy));vRect(pb,10,13,28,3,D,.6,.3);vRect(pb,9,18,4,7,R5([40,40,40]),.6,.3);vRect(pb,35,18,4,7,R5([40,40,40]),.6,.3)}
 else if(o.cap=='helmet'){pb.ell(24,12,13.5,9,(i,j,dx,dy)=>j>15?pb.get(i,j):tone(C,.75-.3*dy));vRect(pb,13,14,22,4,R5([30,34,40]),.9,.5)}
 else pb.ell(24,10,12,5.5,(i,j,dx,dy)=>tone(HR,.7-.3*dy));
 for(const x of[19,28]){pb.rect(x,21,3,2,()=>[34,34,40]);pb.set(x+1,21,[235,235,245])}pb.rect(23,24,2,3,()=>tone(SK,.45));pb.rect(20,29,8,1,()=>[140,86,78]);pb.outline(OUT);rimLight(pb,[210,232,255],.3);return pb}
const ACES={
 ww2:{air:[{id:'hartmann',name:'ERICH HARTMANN',craft:'Bf 109',spr:'bf109',hp:60,pat:'dive',por:{cap:'pilot',col:[70,72,74]},note:'Luftwaffe fighter pilot credited with 352 aerial victories, the highest total in history. Flew the Bf 109 on the Eastern Front.'},
   {id:'sakai',name:'SABURO SAKAI',craft:'A6M Zero',spr:'zero',hp:55,pat:'loop',por:{cap:'pilot',col:[60,70,56]},note:'Imperial Japanese Navy pilot with about 64 credited victories. Survived a severe head wound over Guadalcanal in 1942 and flew home.'}],
  land:[{id:'carius',name:'OTTO CARIUS',craft:'Tiger I',spr:'tank',dy:10,hp:70,pat:'ambush',por:{cap:'tank',col:[50,52,50]},note:'Tiger I commander (Heer, s.Pz.Abt. 502) credited with over 150 tank kills, many from ambush positions. Later became a pharmacist.'},
   {id:'knispel',name:'KURT KNISPEL',craft:'Tiger II',spr:'tiger2',hp:75,pat:'snipe',por:{cap:'tank',col:[56,56,52]},note:'Wehrmacht tank gunner and commander (s.Pz.Abt. 503) credited with 168 tank kills, many at long range. Killed in action in 1945.'}]},
 cold:{air:[{id:'coc',name:'NGUYEN VAN COC',craft:'MiG-21',spr:'mig21',hp:45,pat:'hitrun',por:{cap:'pilot',col:[70,80,62]},note:'North Vietnamese MiG-21 pilot and the top-scoring ace of the Vietnam War, with 9 credited victories.'}],
  land:[{id:'volkov',name:'MAJ. ANTON VOLKOV',craft:'T-62 (fictional ace)',spr:'t62',dy:10,hp:75,pat:'charge',por:{cap:'tank',col:[70,78,56]},note:'Fictional Warsaw Pact tank ace from the Fulda Gap exercises. Loves a flanking charge.'}]},
 mod:{air:[{id:'kestrel',name:'"KESTREL" ROSTOVA',craft:'Su-57 (fictional ace)',spr:'su57',hp:70,pat:'missile',por:{cap:'helmet',col:[90,100,116]},note:'Fictional stealth-fighter ace. Fires salvos of homing missiles from beyond visual range.'}],
  land:[{id:'zorin',name:'COL. ILYA ZORIN',craft:'T-90-type (fictional ace)',spr:'mbt',dy:10,hp:80,pat:'smoke',por:{cap:'tank',col:[80,90,60]},note:'Fictional armor ace. Pops smoke, relocates and fires ATGMs from the haze.'}]},
 fut:{air:[{id:'hivemind',name:'WING LEADER QIN (fictional)',craft:'Drone-wing command jet',spr:'fdrone',hp:80,pat:'swarmcall',por:{cap:'helmet',col:[80,86,96]},note:'Fictional future ace who commands a drone wing. Destroy the leader and the swarm scatters.'}],
  land:[{id:'longjump',name:'CMDR. HAO (fictional)',craft:'War-mech',spr:'mech',hp:85,pat:'leap',por:{cap:'helmet',col:[110,110,120]},note:'Fictional mech pilot. Jump-jets over cover and slams down with shockwaves.'}]},
 space:{air:[{id:'vex9',name:'VEX-9 HUNTER AI',craft:'AI interceptor',spr:'aiB',hp:90,pat:'warp',por:{ai:1,col:[50,50,62]},note:'Rogue AI combat routine. Phase-jumps across the field and fires spread beams.'}],
  land:[{id:'null7',name:'NULL-7 SIEGE AI',craft:'AI lander',spr:'lander',hp:90,pat:'beam',por:{ai:1,col:[60,60,70],eye:[90,220,255]},note:'Rogue AI siege unit. Charges a sweeping ground beam. Watch the warning line.'}]}};
TF.rot={};
function applyRotation(M,role){const id=ERA().id,list=ACES[id][role],k=id+role;let i=TF.forceAce!=null?TF.forceAce:(TF.rot[k]=(TF.rot[k]||0)+1)-1;TF.forceAce=null;i%=list.length+1;if(i==0)return; // 0 = standard boss
 const a=list[i-1],B=M.boss;Object.assign(B,{spr:a.spr,name:a.name+' · '+a.craft,hp:a.hp,max:a.hp,ace:a,dy:a.dy||0,pat:a.pat,ph:0})}
function drawAceCard(M){if(!(M.card>0)||!M.boss.ace)return;const a=M.boss.ace,k=Math.min(1,(240-M.card)/15);X.globalAlpha=k;panel(260,200,1400,560,.94);
 X.fillStyle='#24303c';X.fillRect(310,250,300,300);big(SPR['por_'+a.id].c,314,254,6);txt('ACE ENCOUNTER',660,300,36,'#ff9a60');txt(a.name,660,370,52,'#ffe060');txt(a.craft,660,430,32,'#9cf');
 const w=a.note.split(' ');let line='',y=500;for(const s of w){if((line+s).length>46){txt(line,660,y,26,'#e8e8e8');y+=42;line=''}line+=s+' '}txt(line,660,y,26,'#e8e8e8');
 txt('PATTERN: '+{dive:'BOOM-AND-ZOOM DIVES',loop:'TIGHT TURNING LOOPS',hitrun:'HIT-AND-RUN PASSES',ambush:'AMBUSH FROM COVER',snipe:'LONG-RANGE SNIPING',charge:'FLANKING CHARGE',missile:'HOMING SALVOS',smoke:'SMOKE + ATGM',swarmcall:'DRONE SWARM CALL',leap:'JUMP-JET SLAM',warp:'PHASE JUMPS',beam:'SWEEP BEAM'}[a.pat],310,700,28,'#ffb080');
 txt('A / Z: FIGHT',1620,720,24,'#9ab','right');X.globalAlpha=1}
// land patterns
function aceLand(D,B){B.t++;if(B.hit>0)B.hit--;const T=D.T,s=SPR[B.spr].c,top=T.gy(B.x+s.width/2)-s.height+B.dy,px=D.x+70,py=D.y-30,mz=[B.x+10,top+s.height*.35];
 const shell=(vx,vy,g,dmg=2)=>{D.bul.push({x:mz[0],y:mz[1],vx,vy,g,dmg,k:'e'});flash(mz[0],mz[1],1.4)},lob=(t=70)=>shell((px-mz[0])/t,-.5*.06*t+(py-mz[1])/t,.06);
 switch(B.pat){
  case'ambush':{const c=B.t%240;B.hide=c<100;if(c==120||c==160||c==200)lob(60);if(c==100)D.banner={t:40,s:'CARIUS BREAKS COVER!'};break}
  case'snipe':{const c=B.t%120;B.warn=c>70&&c<100?1:0;if(c==100)shell((px-mz[0])/22,(py-mz[1])/22,0,3);if(D.x>B.x-560)B.x=Math.min(DLEN-300,B.x+1);break}
  case'charge':{const c=B.t%300;if(c<90)B.x-=2.2;else if(c<180){if(c%30==0)lob(55)}else B.x+=1.4;if(B.x-D.x<170)B.x+=3,dHurt(D,1);break}
  case'smoke':{const c=B.t%200;if(c==0){for(let k=0;k<14;k++)spawn({k:'smoke',x:B.x+R()*s.width,y:top+R()*s.height,vy:-.1,r:8,life:140});B.hide=1}if(c==60){B.x+=(R()-.5)*120;B.x=Math.max(D.x+260,Math.min(DLEN-300,B.x))}
   if(c==100)B.hide=0;if(c==110||c==140)D.bul.push({x:mz[0],y:mz[1],vx:-3,vy:-1,g:0,dmg:2,k:'etow'});break}
  case'leap':{const c=B.t%200;B.dy=c<40?0:c<120?-80*Math.sin((c-40)/80*Math.PI):0;if(c==40)B.tx=D.x+220;if(c>40&&c<120)B.x+=((B.tx||B.x)-B.x)*.04;if(c==120){shake=8;for(const dir of[-1,1])D.bul.push({x:B.x+s.width/2,y:T.gy(B.x)-6,vx:3.2*dir,vy:0,g:0,dmg:2,k:'e',wave:1})}if(c%50==10&&c<40)lob(60);break}
  case'beam':{const c=B.t%220;B.warn=c>80&&c<130?1:0;if(c>=130&&c<170){const bx=B.x-(c-130)*10;if(Math.abs(bx-(D.x+75))<20)dHurt(D,2);B.beamX=bx}else B.beamX=null;if(c%60==0)lob(50);break}}
 for(const b of D.bul)if(b.k=='etow'){b.vx=Math.max(-4,b.vx-.05);b.vy+=(py-b.y)*.003;b.vy*=.96;if(D.t%2==0)spawn({k:'smoke',x:b.x,y:b.y,vy:-.1,r:2,life:24})}}
function drawAceLand(D,c){const B=D.boss;if(!B.ace||B.dead)return;const s=SPR[B.spr].c,top=D.T.gy(B.x+s.width/2)-s.height+B.dy;
 if(B.pat=='ambush'&&B.hide){G.fillStyle='#3e5a2c';for(let k=0;k<9;k++){const x=B.x-c-20+k*34;G.beginPath();G.arc(x,top+s.height*.55,26,0,6.3);G.fill()}G.fillStyle='#2c4420';for(let k=0;k<8;k++)G.fillRect(B.x-c+k*36,top+s.height*.4,20,4)}
 if(B.warn){G.strokeStyle=`rgba(255,40,40,${.4+.4*Math.sin(D.t*.6)})`;G.lineWidth=1;G.beginPath();G.moveTo(B.x-c+10,top+s.height*.35);G.lineTo(D.x-c+75,D.y-30);G.stroke()}
 if(B.beamX!=null){G.globalCompositeOperation='lighter';G.fillStyle='rgba(90,220,255,.7)';G.fillRect(B.beamX-c-6,0,12,D.T.gy(B.beamX));G.globalCompositeOperation='source-over'}}
// air patterns
function aceAir(Q,B){B.t++;if(B.hit>0)B.hit--;const bs=SPR[B.spr].c,aim=(x,y,sp,da=0)=>{const a=Math.atan2(Q.y+16-y,Q.x+50-x)+da;Q.bul.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp})};const c=B.t%200;
 switch(B.pat){
  case'dive':{if(c<70){B.x+=(W-160-B.x)*.05;B.y+=(-bs.height-10-B.y)*.08}else if(c<110){B.ty=B.ty??Q.y;B.x-=4.5;B.y+=(Q.y-B.y)*.12;if(c%5==0)aim(B.x,B.y+bs.height/2,4.2)}else{B.x+=2.5;B.y-=3.5;B.ty=null}if(B.x<20)B.x=20;break}
  case'loop':{const a=B.t*.045;B.x=W-230+Math.cos(a)*120;B.y=H/2-50+Math.sin(a)*95;if(B.t%28==0)aim(B.x,B.y+bs.height/2,3.4);break}
  case'hitrun':{if(c<60){B.x=-bs.width+c*4;B.y=Q.y-40}else if(c<100){B.x+=5;if(c%6==0)Q.bul.push({x:B.x+bs.width,y:B.y+bs.height/2,vx:6,vy:(Q.y+16-B.y)/40})}else if(c<130)B.x+=6;else{B.x+=(W-140-B.x)*.04;B.y+=(80-B.y)*.05;if(c%40==0)aim(B.x,B.y+10,3)}break}
  case'missile':{B.x+=(W-170-B.x)*.03;B.y=H/2-40+Math.sin(B.t*.02)*90;if(c%70==0)for(let k=-1;k<=1;k++)Q.bul.push({x:B.x,y:B.y+bs.height/2,vx:-2,vy:k,hmE:1});break}
  case'swarmcall':{B.x+=(W-140-B.x)*.03;B.y=H/2-40+Math.sin(B.t*.03)*80;if(c%90==0)for(let k=0;k<5;k++)Q.ens.push({k:'swarm',x:B.x,y:B.y+k*10-20,y0:B.y+k*14-30,hp:1,t:k*6,cd:999,ph:k});if(c%35==0)aim(B.x,B.y+10,3);break}
  case'warp':{if(c%60==0){boom(B.x+bs.width/2,B.y+bs.height/2,.4);B.x=W/2+R()*(W/2-bs.width-10);B.y=20+R()*(H-110)}if(c%60==20)for(let k=-3;k<=3;k++)aim(B.x,B.y+bs.height/2,3,k*.14);break}}
 for(const b of Q.bul)if(b.hmE){b.vx-=.05;b.vy+=Math.sign(Q.y+16-b.y)*.08;b.vy*=.97;if(Q.t%3==0)spawn({k:'smoke',x:b.x,y:b.y,vy:0,r:1.5,life:16})}}
function buildAceArt(mk){SPR.bf109=mk(mkAirG({w:84,h:30,col:[110,116,108],prop:1,camo:camoF([110,116,108],[86,96,84])}));
 SPR.tiger2=mk((()=>{const pb=mkLandG({hull:[186,160,98],camo:camoF([186,160,98],[100,108,56],[120,76,44],.05),turret:'box',wheels:9,wr:6});return pb})());
 for(const e in ACES)for(const r in ACES[e])for(const a of ACES[e][r])SPR['por_'+a.id]=mk(mkPortrait(a.por));SPR.helper=[0,1,2,3].map(f=>mk(mkHelper(f)));SPR.helperP=mkHelperPortrait().canvas()}
