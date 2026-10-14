'use strict';
// ---- Opening tutorial: training range with a friendly helper NPC (stylized pixel caricature, no logos) ----
function mkHelper(fr){const pb=new PB(32,48),SK=R5([222,182,150]),HR=R5([74,56,44]),JK=R5([40,40,46]),PN=R5([44,48,62]),SH=R5([26,26,28]);const lg=fr==1?2:fr==2?-2:0;
 vRect(pb,11,33,4,11+(lg>0?0:1),PN,.8,.3);vRect(pb,17,33,4,11-(lg>0?1:0),PN,.7,.3);if(lg){pb.rect(11+lg,40,4,4,()=>tone(PN,.6));pb.rect(17-lg,40,4,4,()=>tone(PN,.5))}
 vRect(pb,9+lg,44,7,3,SH,.6,.2);vRect(pb,16-lg,44,7,3,SH,.6,.2);
 vRect(pb,9,17,14,17,JK,.75,.3);pb.rect(14,17,4,5,()=>tone(R5([70,70,78]),.6));panelV(pb,15,22,32,JK);vRect(pb,8,17,3,13,JK,.7,.3);
 if(fr==3){vRect(pb,22,6,3,12,JK,.8,.4);vRect(pb,22,3,3,4,SK,.8,.4)}else{vRect(pb,22,18,3,12,JK,.7,.3);vRect(pb,22,30,3,3,SK,.7,.3)}vRect(pb,8,30,3,3,SK,.7,.3);
 vRect(pb,14,15,4,3,SK,.6,.3);pb.ell(16,10,5.5,6.5,(i,j,dx,dy)=>tone(SK,.82-.3*dy-.15*dx));
 pb.ell(16,6,6,3.5,(i,j,dx,dy)=>tone(HR,.7-.3*dy));pb.rect(10,6,2,4,()=>tone(HR,.5));pb.set(18,10,[30,30,34]);pb.set(20,10,[30,30,34]);pb.rect(17,13,4,1,()=>[150,90,80]);
 pb.outline(OUT);rimLight(pb);return pb}
function mkHelperPortrait(){const pb=new PB(48,48),SK=R5([222,182,150]),HR=R5([74,56,44]),JK=R5([40,40,46]);
 vRect(pb,6,36,36,12,JK,.7,.3);pb.poly([[20,36],[28,36],[24,44]],()=>tone(R5([80,80,88]),.6));vRect(pb,20,30,8,7,SK,.6,.3);
 pb.ell(24,20,12,14,(i,j,dx,dy)=>tone(SK,.84-.32*dy-.18*dx));pb.ell(24,9,12.5,6,(i,j,dx,dy)=>tone(HR,.72-.35*dy));pb.rect(12,9,3,8,()=>tone(HR,.5));pb.rect(34,9,2,6,()=>tone(HR,.45));
 for(const x of[18,29]){pb.rect(x,19,3,2,()=>[34,34,40]);pb.set(x+1,19,[240,240,250])}pb.rect(17,16,5,1,()=>tone(HR,.3));pb.rect(28,16,5,1,()=>tone(HR,.3));
 pb.rect(23,22,2,4,()=>tone(SK,.45));pb.rect(19,28,10,1,()=>[150,86,78]);pb.set(18,27,[150,86,78]);pb.set(29,27,[150,86,78]);pb.outline(OUT);rimLight(pb,[210,232,255],.3);return pb}
const TUT_KEY='aoe_tut_seen';const tutSeen=()=>{try{return !!localStorage.getItem(TUT_KEY)}catch(e){return false}};const tutMark=()=>{try{localStorage.setItem(TUT_KEY,'1')}catch(e){}};
function ctrlKind(){const gp=navigator.getGamepads&&[...navigator.getGamepads()].some(g=>g);return gp?'pad':('ontouchstart' in window||navigator.maxTouchPoints>0)?'touch':'kb'}
const P_=(k)=>({kb:{move:'← →',jump:'Z / SPACE',fire:'X',sp:'C',ok:'Z',skip:'ENTER / ESC'},touch:{move:'STICK',jump:'A',fire:'B',sp:'R',ok:'A',skip:'START / BACK'},pad:{move:'L-STICK / D-PAD',jump:'A',fire:'B',sp:'X / RB',ok:'A',skip:'START / SELECT'}}[ctrlKind()][k]);
const TSTEPS=[{s:()=>`Welcome to the range, recruit! I'll keep this quick. Use ${P_('move')} to move.`,done:T=>Math.abs(T.p.x-T.x0)>90},
 {s:()=>`Nice. Now jump with ${P_('jump')}. Hop onto that crate.`,done:T=>T.jumped},
 {s:()=>`Fire with ${P_('fire')}. Knock down all three targets.`,done:T=>T.tg.every(t=>t.dead)},
 {s:()=>`Every unit has a special ability. Press ${P_('sp')} to try yours.`,done:T=>T.spUsed},
 {s:()=>`LAND VEHICLES: up/down aims the turret. Main gun lobs shells in an arc, MG fires straight. Bradley: TOW + deploy squad. (${P_('ok')})`,tip:1},
 {s:()=>`AIRCRAFT: guns and homing missiles. Watch for flak and rockets, and dodge the ace's attack pattern. (${P_('ok')})`,tip:1},
 {s:()=>`That's it. Pick an era and a role. Good luck out there!`,end:1}];
function startTut(){const gy=300;TF.tut={t:0,step:0,gy,p:{x:90,y:gy,vx:0,vy:0,face:1,on:1,cd:0},x0:90,jumped:0,spUsed:0,bul:[],
 tg:[{x:430,y:gy},{x:500,y:gy},{x:560,y:gy-26}],crate:{x:240,w:34,h:22},npc:{x:330,fr:0,leave:0,wave:0},st:0};TF.state='tut';parts=[]}
function endTut(){tutMark();TF.tut=null;parts=[];TF.state='era';fade=15}
function updTut(){const T=TF.tut;if(!T)return;T.t++;if(jp.has('Enter')||jp.has('Escape')||jp.has('pad_start')){endTut();return}
 const p=T.p,st=TSTEPS[T.step];T.st++;const sur=x=>x>T.crate.x-6&&x<T.crate.x+T.crate.w-6?T.gy-T.crate.h:T.gy;
 if(!T.npc.leave){p.vx=((held('right')?1:0)-(held('left')?1:0))*2;if(p.vx)p.face=Math.sign(p.vx)}else p.vx=0;p.x=Math.max(10,Math.min(600,p.x+p.vx));
 if((jp.has('KeyZ')||jp.has('Space')||jp.has('pad_a'))&&p.on&&!st.tip&&!st.end){p.vy=-6.4;p.on=0;T.jumped=1}
 p.vy+=.3;p.y+=p.vy;const g=sur(p.x+16);if(p.y>=g&&p.vy>=0){p.y=g;p.vy=0;p.on=1}else if(p.y<g)p.on=0;
 if(p.cd>0)p.cd--;if((keys.KeyX||keys.KeyK)&&p.cd==0){p.cd=12;T.bul.push({x:p.x+(p.face>0?30:0),y:p.y-28,vx:7*p.face});flash(p.x+(p.face>0?30:0),p.y-28,.6)}
 if(jp.has('KeyC')||jp.has('KeyL')){T.spUsed=1;for(let k=0;k<12;k++)spawn({k:'fire',x:p.x+16,y:p.y-20,vx:(R()-.5)*3,vy:-R()*3,life:25})}
 for(const b of T.bul){b.x+=b.vx;for(const t of T.tg)if(!t.dead&&b.x>t.x&&b.x<t.x+14&&b.y>t.y-30&&b.y<t.y){t.dead=1;b.dead=1;boom(t.x+7,t.y-16,.5)}if(b.x<0||b.x>W)b.dead=1}T.bul=T.bul.filter(b=>!b.dead);
 const adv=st.tip?(jp.has('KeyZ')||jp.has('pad_a'))&&T.st>20:st.done&&st.done(T)&&T.st>30;if(adv){T.step++;T.st=0}
 if(st.end){T.npc.wave=1;if(T.st>140)T.npc.leave=1}const n=T.npc;if(n.leave){n.x+=1.6;if(n.x>W+30)endTut()}}
function drawTut(){const T=TF.tut;if(!T)return;const bg=BBG.mod;G.drawImage(bg.sky,0,0);G.drawImage(bg.ground,0,H-170);G.fillStyle='#6a5a40';G.fillRect(0,T.gy,W,H-T.gy);G.fillStyle='#a08a60';G.fillRect(0,T.gy,W,3);
 G.fillStyle='#3a2e20';for(let x=0;x<W;x+=40)G.fillRect(x+10,T.gy-40,3,40);G.fillRect(0,T.gy-40,W,2); // range fence
 const c=T.crate;G.fillStyle='#7a5a34';G.fillRect(c.x,T.gy-c.h,c.w,c.h);G.fillStyle='#5a3e22';G.fillRect(c.x,T.gy-c.h,c.w,2);G.fillRect(c.x+c.w/2-1,T.gy-c.h,2,c.h);G.strokeStyle='#2a1c10';G.strokeRect(c.x+.5,T.gy-c.h+.5,c.w-1,c.h-1);
 for(const t of T.tg){if(t.dead){G.fillStyle='#4a3a2a';G.fillRect(t.x,t.y-4,14,4);continue}G.fillStyle='#3a2a1a';G.fillRect(t.x+6,t.y-30,2,30);G.fillStyle='#e8e0d0';G.beginPath();G.arc(t.x+7,t.y-24,7,0,6.3);G.fill();G.fillStyle='#c03020';G.beginPath();G.arc(t.x+7,t.y-24,4,0,6.3);G.fill();G.fillStyle='#fff';G.fillRect(t.x+6,t.y-25,2,2)}
 const n=T.npc,fr=n.leave?1+((T.t>>3)%2):n.wave&&(T.t>>4)%2?3:0;drawSprite(SPR.helper[fr],n.x,T.gy-48,n.leave?false:T.p.x>n.x?false:true);
 const p=T.p,u=SPR['u_mod_rgr'];drawSprite(u[!p.on?5:p.vx?1+(T.t>>2)%4:keys.KeyX?6:0],p.x,p.y-48,p.face<0);
 G.fillStyle='#ffe070';for(const b of T.bul)G.fillRect(b.x|0,b.y|0,4,2);drawParts();drawParts2()}
function drawTutHUD(){const T=TF.tut;if(!T)return;const st=TSTEPS[Math.min(T.step,TSTEPS.length-1)];
 panel(60,40,560,90,.8);txt('TRAINING RANGE · '+Math.min(T.step+1,7)+'/7',90,100,30,'#ffe060');txt(P_('skip')+': SKIP',1860,90,24,'#9ab','right');
 panel(60,160,1800,240,.9);X.fillStyle='#24303c';X.fillRect(90,185,190,190);big(SPR.helperP,95,190,3);
 txt('ELON',320,230,34,'#9cf');const s=st.s(),words=s.split(' ');let line='',y=290;for(const w of words){if((line+w).length>62){txt(line,320,y,28,'#fff');y+=46;line=''}line+=w+' '}txt(line,320,y,28,'#fff')}
