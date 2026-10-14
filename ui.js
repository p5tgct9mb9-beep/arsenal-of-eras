'use strict';
// ===== UI: menus, HUD, input (keyboard/mouse, touch, gamepad) =====
const $=s=>document.querySelector(s);const KEYS=new Set();const STICK={id:null,x:0,y:0,ox:0,oy:0},LOOK={};
function loadLO(){for(const e of ERAS){try{LO[e.id]=Object.assign(defaultLoadout(e),JSON.parse(localStorage.getItem('aoe3d.lo.'+e.id)||'null')||{})}catch(x){LO[e.id]=defaultLoadout(e)}}}
function saveLO(e){localStorage.setItem('aoe3d.lo.'+e.id,JSON.stringify(LO[e.id]))}
const setT=(el,t)=>{if(el&&el._t!==t){el._t=t;el.textContent=t}};
const UI={hurtV:0,scr:null,focus:0,selEra:2,selSlot:'p',selCat:null,
 show(name,arg){this.scr=name;const m=$('#menu');if(!name){m.style.display='none';$('#hud').style.display='block';$('#touch').style.display=TOUCH?'block':'none';return}
  m.style.display='flex';$('#hud').style.display='none';$('#touch').style.display='none';  m.innerHTML=this['s_'+name](arg);this.focus=0;this.bind();},
 bind(){const bs=[...document.querySelectorAll('#menu .b')];bs.forEach((b,i)=>{b.onclick=ev=>{audioInit();this.focus=i;this.act(b.dataset.a,b.dataset.v)};b.onmouseenter=()=>{this.focus=i;this.hl()}});this.hl()},
 hl(){const bs=[...document.querySelectorAll('#menu .b')];bs.forEach((b,i)=>b.classList.toggle('f',i==this.focus));const f=bs[this.focus];if(f&&f.scrollIntoView)f.scrollIntoView({block:'nearest'});if(f&&f.dataset.h)this.hover(f.dataset.h)},
 hover(h){const[k,v]=h.split(':');if(k=='era'){const e=ERAS[+v];SHOW.set('era'+v,()=>{const g=new T.Group();const a=buildAircraft(e.air.model,0,e);a.position.set(2.5,3.2,-3);a.rotation.set(.15,2.4,.2);g.add(a);const s=buildSoldier(e);s.position.set(-1.6,0,0);s.rotation.y=.5;s.userData.spinMe=0;g.add(s);
   if(e.bradley){const b=buildTank(e,'ifv');b.position.set(-1,0,-6);b.rotation.y=.8;g.add(b)}return g},[0,2.4,8],[0,1.6,0])}},
 act(a,v){const e=ERAS[this.selEra],lo=LO[e.id];
  if(a=='go')this.show(v);else if(a=='era'){this.selEra=+v;this.show('mission')}else if(a=='play'){this.show('brief',[this.selEra,+v])}else if(a=='br'){this.show('brief',v.split(',').map(Number))}else if(a=='deploy'){const[e,m]=v.split(',').map(Number);startMission(e,m)}else if(a=='lo'){this.loBack=this.scr=='brief'?'campaign':'title';this.show('loadout')}else if(a=='eracyc'){this.selEra=(this.selEra+1)%ERAS.length;this.selCat=null;this.show(v)}else if(a=='mp'){MP.start(v,this.selEra)}
  else if(a=='slot'){this.selSlot=v;this.selCat=null;this.show('loadout')}else if(a=='pick'){const sl=this.selSlot;lo[{p:'p',s:'s',l:'l',le:'le',ta:'ta',g:'g'}[sl]]=v;saveLO(e);this.show('loadout')}
  else if(a=='cat'){this.selCat=v;this.show('loadout')}else if(a=='att'){const wid=lo[this.selSlot];lo.att[wid]=lo.att[wid]||{};lo.att[wid][this.selCat]=v;saveLO(e);this.show('loadout')}
  else if(a=='armor'){lo.armor=lo.armor?0:1;saveLO(e);this.show('loadout')}
  else if(a=='resume'){G.mode='play';this.show(null);lockPtr()}else if(a=='restart'){if(G.mp)MP.start(G.mp.id,G.ei);else startMission(G.ei,G.mi)}else if(a=='quit'){clearMission();G.mp=null;G.mode='menu';this.show('title')}
  else if(a=='next'){const i=CAMPAIGN.findIndex(c=>c[0]==G.ei&&c[1]==G.mi);const n=CAMPAIGN[(i+1)%CAMPAIGN.length];G.mode='menu';this.show('brief',n)}
  else if(a=='q'){SET.q=v;localStorage.setItem('aoe3d.set',JSON.stringify(SET));QUAL.auto=v=='auto';if(v!='auto')setTier(+v);this.show('settings')}
  else if(a=='sens'){SET.sens=clamp(+(SET.sens+ +v).toFixed(2),.3,3);localStorage.setItem('aoe3d.set',JSON.stringify(SET));this.show('settings')}
  else if(a=='inv'){SET.inv=SET.inv?0:1;localStorage.setItem('aoe3d.set',JSON.stringify(SET));this.show('settings')}
  else if(a=='vol'){SET.vol=SET.vol>0?0:.7;localStorage.setItem('aoe3d.set',JSON.stringify(SET));this.show('settings')}
  else if(a=='classic')location.href='./classic/'},
 back(){const s=this.scr;if(s=='campaign'||s=='mp'){this.show('title');return}if(s=='brief'){this.show('campaign');return}if(s=='mission'||s=='settings'||s=='controls')this.show(s=='mission'?'era':G.mode=='pause'?'pause':'title');else if(s=='era')this.show('title');else if(s=='loadout'){if(this.selCat){this.selCat=null;this.show('loadout')}else this.show('mission')}else if(s=='pause')this.act('resume')},
 s_title(){SHOW.set('title',()=>{const g=new T.Group(),e=ERAS[2];const b=buildTank(e,'ifv');b.rotation.y=-.6;g.add(b);const s=buildSoldier(ERAS[0]);s.position.set(3.4,0,1.5);s.rotation.y=-.9;s.visible=false;g.add(s);
   const a=buildAircraft('jet',0,e);a.position.set(-3,6,-8);a.rotation.set(.1,-2.2,-.3);g.add(a);const gun=buildGun(e.prim[0],{optic:'holo',muzzle:'supp',under:'peq',grip:'vgrip'},e);gun.scale.setScalar(5);gun.position.set(2.6,1.1,2.6);gun.rotation.set(0,-.9,.05);g.add(gun);return g},[7,2.6,8],[0,1.5,0]);
  return `<div class="ttl"><h1>ARSENAL OF ERAS</h1><h2>FRONTLINE · 3D FPS</h2></div><div class="col">
  <div class="b" data-a="go" data-v="campaign">▶ Campaign</div><div class="b" data-a="go" data-v="mp">⚔ Multiplayer (vs bots)</div><div class="b" data-a="lo">🔧 Loadout</div><div class="b" data-a="go" data-v="era">☰ Mission select</div><div class="b" data-a="go" data-v="settings">⚙ Settings</div><div class="b" data-a="go" data-v="controls">🎮 Controls</div><div class="b" data-a="classic">↩ Classic 2D side-scroller</div></div>
  <div class="foot">WW2 · Cold War · Modern · Futuristic · Space — touch, keyboard+mouse or gamepad</div>`},
 s_campaign(){const pr=JSON.parse(localStorage.getItem('aoe3d.prog')||'{}');const nx=CAMPAIGN.find(([e,m])=>!pr[ERAS[e].id+m])||CAMPAIGN[0];this.hover('era:'+nx[0]);
  return `<h3>CAMPAIGN — TASK FORCE IRONCLAD</h3><p class="sub">WW2 → Cold War → Modern → Futuristic → Space (epilogue). Missions are chained with briefings.</p><div class="col wide"><div class="b" data-a="br" data-v="${nx}">▶ Continue: ${ERAS[nx[0]].n} — ${ERAS[nx[0]].missions[nx[1]].n}</div>${CAMPAIGN.map(([e,m],i)=>`<div class="b opt" data-a="br" data-v="${e},${m}">${pr[ERAS[e].id+m]?'★':'☆'} ${i+1}. ${ERAS[e].n}: ${ERAS[e].missions[m].n}${e==4?' <small>(optional epilogue)</small>':''}</div>`).join('')}<div class="b back" data-a="go" data-v="title">◀ Back</div></div>`},
 s_brief([e,m]){this.selEra=e;this.hover('era:'+e);const E=ERAS[e],M=E.missions[m];return `<h3>${E.n.toUpperCase()} · ${E.yr}</h3><div class="col wide"><p class="sub" style="text-align:left">${m==0?STORY[e]:''}</p><div class="mis b" data-a="deploy" data-v="${e},${m}"><b>▶ DEPLOY — Mission ${m+1}: ${M.n}</b><span>${M.brief}</span><em>Objectives: eliminate ${M.kill} · destroy ${M.tgt.n} ${M.tgt.name}s · BOSS: ${M.boss.n}</em></div><div class="b" data-a="lo">🔧 Loadout</div><div class="b back" data-a="go" data-v="campaign">◀ Campaign</div></div>`},
 s_mp(){this.hover('era:'+this.selEra);return `<h3>MULTIPLAYER</h3><p class="sub">Offline vs AI bots (online play is planned; the game is structured for it). Map/era: <b>${ERAS[this.selEra].n}</b></p><div class="b" data-a="eracyc" data-v="mp">⟳ Change era/map</div><div class="cards">${MODES.map(m=>`<div class="b card" data-a="mp" data-v="${m.id}"><b>${m.n}</b><i>${m.size}</i><span>${m.d}</span></div>`).join('')}</div><div class="b back" data-a="go" data-v="title">◀ Back</div>`},
 s_era(){const pr=JSON.parse(localStorage.getItem('aoe3d.prog')||'{}');this.hover('era:'+this.selEra);return `<h3>SELECT ERA</h3><div class="cards">${ERAS.map((e,i)=>`<div class="b card" data-a="era" data-v="${i}" data-h="era:${i}"><b>${e.n}</b><i>${e.yr}</i><span>vs ${e.foe}</span><em>${e.missions.map((m,j)=>pr[e.id+j]?'★':'☆').join('')}</em></div>`).join('')}</div><div class="b back" data-a="go" data-v="title">◀ Back</div>`},
 s_mission(){const e=ERAS[this.selEra];this.hover('era:'+this.selEra);return `<h3>${e.n.toUpperCase()} · ${e.yr}</h3><p class="sub">Enemy: ${e.foeNote}</p><div class="col wide">${e.missions.map((m,i)=>`<div class="b mis" data-a="play" data-v="${i}"><b>Mission ${i+1}: ${m.n}</b><span>${m.brief}</span><em>Objectives: eliminate ${m.kill} · destroy ${m.tgt.n} ${m.tgt.name}s · BOSS: ${m.boss.n}</em></div>`).join('')}
  <div class="b" data-a="go" data-v="loadout" onclick="UI.loBack='mission'">🔧 Loadout & Attachments</div><div class="b back" data-a="go" data-v="era">◀ Back</div></div>`},
 s_loadout(){const e=ERAS[this.selEra],lo=LO[e.id],sl=this.selSlot;const f=(arr,id)=>arr.find(x=>x.id==id)||arr[0];
  const slots=[['p','Primary',f(e.prim,lo.p).n],['s','Secondary',f(e.sec,lo.s).n],['l','Launcher',f(e.lau,lo.l).n],['le','Lethal',f(e.lethal,lo.le).n],['ta','Tactical',f(e.tact,lo.ta).n],['g','Gadget',f(e.gadgets,lo.g).n]];
  const list={p:e.prim,s:e.sec,l:e.lau,le:e.lethal,ta:e.tact,g:e.gadgets}[sl];const isW=sl=='p'||sl=='s'||sl=='l';const w=isW?f(list,lo[sl]):null;const att=w?(lo.att[w.id]||{}):{};
  if(w)SHOW.set('gun'+w.id+JSON.stringify(att),()=>{const g=buildGun(w,att,e);g.scale.setScalar(w.c=='launcher'?2.6:4);g.position.y=1.3;const o=new T.Group();o.add(g);o.userData.spinMe=1;return o},[0,2.2,4.6],[0,1.25,0]);
  let mid='';if(this.selCat&&w){const opts=e.att[this.selCat];mid=`<h4>${ATT_LABEL[this.selCat]}</h4>`+opts.map(a=>`<div class="b opt ${att[this.selCat]==a.id||(!att[this.selCat]&&a===opts[0])?'on':''}" data-a="att" data-v="${a.id}">${a.n}<small>${modTxt(a)}</small></div>`).join('')+`<div class="b back" data-a="cat" data-v="">◀ Done</div>`}
  else{mid=`<h4>${slots.find(s=>s[0]==sl)[1]}</h4>`+list.map(x=>`<div class="b opt ${lo[sl]==x.id?'on':''}" data-a="pick" data-v="${x.id}">${x.n}${x.c?`<small>${x.c}</small>`:''}</div>`).join('');
   if(w&&w.att)mid+=`<h4>Attachments</h4>`+ATT_CATS.map(c=>{const a=e.att[c].find(x=>x.id==att[c])||e.att[c][0];return `<div class="b opt" data-a="cat" data-v="${c}">${ATT_LABEL[c]}: <b>${a.n}</b></div>`}).join('')}
  let stats='';if(w){const s=wStats(w,att,e),b=wStats(w,{},e);const bar=(n,v,mx,bv)=>`<div class="st"><span>${n}</span><i><u style="width:${clamp(v/mx,0,1)*100}%"></u><s style="left:${clamp(bv/mx,0,1)*100}%"></s></i></div>`;
   stats=bar('Damage',s.d,w.c=='launcher'?900:110,b.d)+bar('Fire rate',s.rof,1200,b.rof)+bar('Accuracy',1/(s.sp+.004),1/(.006),1/(b.sp+.004))+bar('Control',1/s.rec,2.5,1/b.rec)+bar('Range',s.rng,w.c=='launcher'?500:220,b.rng)+bar('Mobility',s.mob,1.2,b.mob)+bar('ADS speed',1/s.ads,1.3,1/b.ads)+`<div class="st"><span>Magazine</span><b>${s.mag}</b> · Zoom ${s.z.toFixed(1)}x${s.q?' · Suppressed':''}${s.gl?' · Underbarrel GL':''}</div>`}
  return `<div class="lo"><div class="pane"><h3>${e.n.toUpperCase()} LOADOUT</h3><div class="b slot" data-a="eracyc" data-v="loadout"><small>Era</small>⟳ ${e.n} (tap to change)</div>${slots.map(s=>`<div class="b slot ${s[0]==sl?'on':''}" data-a="slot" data-v="${s[0]}"><small>${s[1]}</small>${s[2]}</div>`).join('')}<div class="b slot" data-a="armor"><small>Armor</small>${lo.armor?'Body armor ON (+50)':'No armor (faster regen feel)'}</div><div class="b back" data-a="go" data-v="${this.loBack||'mission'}">✔ Save & Back</div></div>
  <div class="pane mid">${mid}</div><div class="pane stats">${stats}<p class="sub">Loadouts save automatically on this device.</p></div></div>`},
 s_settings(){return `<h3>SETTINGS</h3><div class="col">${['auto','0','1','2','3'].map(q=>`<div class="b opt ${SET.q==q?'on':''}" data-a="q" data-v="${q}">Graphics: ${q=='auto'?'Auto (scales for iPhone)':TIERS[+q].n}</div>`).join('')}
  <div class="b" data-a="sens" data-v="0.1">Look sensitivity + (${SET.sens.toFixed(1)})</div><div class="b" data-a="sens" data-v="-0.1">Look sensitivity −</div><div class="b" data-a="inv">Invert look: ${SET.inv?'ON':'OFF'}</div><div class="b" data-a="vol">Sound: ${SET.vol>0?'ON':'OFF'}</div><div class="b back" data-a="go" data-v="${G.mode=='pause'?'pause':'title'}">◀ Back</div></div>`},
 s_controls(){return `<h3>CONTROLS</h3><div class="ctl"><div><b>Touch</b>Left thumb: move stick · Right side: drag to look · FIRE (drag while firing to aim) · ADS · RLD · SWAP · 💣 grenade · TAC · GAD gadget/drone · USE enter vehicle · ⤒ jump · ⤓ crouch · ✚ medkit</div>
  <div><b>Keyboard + mouse</b>WASD move · mouse look (click to lock) · LMB fire · RMB aim · R reload · Q / wheel swap · 1-3 weapons · G grenade · T tactical · E gadget · F use/enter/exit · H medkit · Space jump/up · C crouch/down · Shift sprint · Esc pause</div>
  <div><b>Gamepad</b>LS move · RS look · RT fire · LT aim · X reload · Y swap · RB grenade · LB gadget · A jump · B crouch · D-pad ↑ use/enter · ↓ medkit · → tactical · Start pause</div>
  <div><b>Vehicles</b>Aircraft: drag/RS to steer, stick ↑↓ throttle, FIRE guns, ADS missiles. Helicopters: jump/crouch = up/down. Bradley: stick drives, look aims turret, FIRE 25mm, ADS TOW. Drones: FIRE spots (recon) or detonates (FPV), USE returns.</div></div><div class="b back" data-a="go" data-v="title">◀ Back</div>`},
 s_pause(){return `<h3>PAUSED</h3><div class="col"><div class="b" data-a="resume">▶ Resume</div><div class="b" data-a="restart">↻ Restart mission</div><div class="b" data-a="go" data-v="settings">⚙ Settings</div><div class="b" data-a="quit">✖ Quit to menu</div></div>`},
 s_end(win){const acc=G.shots?Math.round(G.hits/G.shots*100):0;return `<h3>${win?'MISSION COMPLETE':'MISSION FAILED'}</h3><p class="sub">${G.era.n} · ${G.mission.n}</p><div class="col"><div class="res">Score ${G.score} · Kills ${G.kills} · Accuracy ${acc}%</div>${G.mp&&G.mp.result?`<div class="res">${G.mp.result}</div>`:''}${win&&!G.mp?'<div class="b" data-a="next">▶ Next mission (briefing)</div>':''}<div class="b" data-a="restart">↻ Retry</div><div class="b" data-a="quit">☰ Main menu</div></div>`},
 pause(){if(G.mode!='play')return;G.mode='pause';document.exitPointerLock&&document.exitPointerLock();this.show('pause')},
 end(win){this.show('end',win)},
 // ---- HUD ----
 initHUD(){this.el={};for(const id of['hp','hpb','ar','ammo','wn','eq','obj','mm','prompt','boss','bossn','bossb','feed','toast','mk','scope','drone','xh','hm','fb','lock','alt','brief'])this.el[id]=$('#'+id);this.mmc=this.el.mm.getContext('2d');this.mpool=[]},
 brief(e,m){const b=this.el.brief;b.innerHTML=`<b>${e.n} · ${m.n}</b><span>${m.brief}</span>`;b.style.opacity=1;clearTimeout(this.bt);this.bt=setTimeout(()=>b.style.opacity=0,5000)},
 toast(t){const el=this.el&&this.el.toast;if(!el)return;el.textContent=t;el.style.opacity=1;clearTimeout(this.tt);this.tt=setTimeout(()=>el.style.opacity=0,2200)},
 feed(t){const el=this.el.feed;const d=document.createElement('div');d.textContent=t;el.prepend(d);while(el.children.length>4)el.lastChild.remove();setTimeout(()=>d.remove(),3500)},
 hitMark(){const h=this.el.hm;h.style.opacity=1;clearTimeout(this.ht);this.ht=setTimeout(()=>h.style.opacity=0,120);sfx('hit',.3)},
 hurt(){this.hurtV=Math.min(.8,this.hurtV+.35)},flashbang(){const f=this.el.fb;f.style.transition='none';f.style.opacity=1;requestAnimationFrame(()=>{f.style.transition='opacity 3s';f.style.opacity=0})},
 scope(on){if(this.el)this.el.scope.style.display=on?'block':'none'},bossBar(e){this.el.boss.style.display='block';this.el.bossn.textContent=e.name},
 hudWeapon(){},
 mode(){const m=P.mode;document.body.dataset.mode=m;if(this.el){this.el.drone.style.display=m=='drone'?'block':'none';if(m!='boss')this.el.boss.style.display=G.boss&&G.boss.alive?'block':'none'}
  const L={foot:['ADS','⤒','⤓','FIRE'],air:['MSL',P.air&&P.air.heli?'UP':'—',P.air&&P.air.heli?'DN':'—','GUN'],veh:['TOW','—','—','25mm'],drone:['—','UP','DN',P.dr&&P.dr.kind=='fpv'?'BOOM':'SPOT']}[m];
  ['ads','jump','crouch','fire'].forEach((k,i)=>{const b=document.querySelector(`#touch [data-k="${k}"]`);if(b)b.textContent=L[i]});if(post)post.uniforms.uNV.value=m=='drone'&&G.mission.time=='night'?1:0},
 hud(dt){const el=this.el;this.hurtV=Math.max(0,this.hurtV-dt*1.2);if(P.mode=='veh'){setT(el.hp,'BRADLEY '+Math.ceil(P.veh.hp));el.hpb.style.width=P.veh.hp/9+'%'}else if(P.mode=='air'){setT(el.hp,P.air.e.info.n+' '+Math.ceil(P.air.e.hp));el.hpb.style.width=P.air.e.hp/P.air.e.max*100+'%'}
  else{setT(el.hp,'HP '+Math.ceil(P.hp)+(P.shield>0?' · SHIELD '+Math.ceil(P.shield):''));el.hpb.style.width=P.hp+'%'}setT(el.ar,P.armor>0?'ARMOR '+Math.ceil(P.armor):'');
  const w=curW();if(P.mode=='foot'){setT(el.ammo,P.relT>0?'RELOADING':w.mag+' / '+w.res);setT(el.wn,w.def.n+(w.st.gl?' · GL '+w.gl:''))}else if(P.mode=='air'){setT(el.ammo,'MSL '+P.air.msl);setT(el.wn,P.air.heli?'Chain gun · rockets':'Guns · missiles · SPD '+Math.round(P.air.spd*3.6)+' km/h')}else if(P.mode=='veh'){setT(el.ammo,'TOW '+P.veh.tow);setT(el.wn,'25mm Bushmaster · TOW')}else if(P.mode=='drone'){setT(el.ammo,'BAT '+Math.ceil(P.dr.bat)+'s');setT(el.wn,P.dr.kind=='fpv'?'FPV kamikaze':'Recon')}
  setT(el.eq,`${P.leT.n} ×${P.le}  ·  ${P.taT.n} ×${P.ta}  ·  ${P.gadT.n} ×${P.gad}  ·  Med ×${P.med}`);
  const m=G.mission;setT(el.obj,G.mp?MP.hudText():G.phase==0?`☐ Eliminate hostiles ${Math.min(G.kills,m.kill)}/${m.kill}\n${G.tgtLeft<=0?'☑':'☐'} Destroy ${m.tgt.name}s ${m.tgt.n-G.tgtLeft}/${m.tgt.n}\n☐ Defeat the boss`:`☑ Area secured\n☐ DEFEAT: ${m.boss.n}`);
  if(G.boss){el.bossb.style.width=Math.max(0,G.boss.hp/G.boss.max*100)+'%';if(!G.boss.alive)el.boss.style.display='none'}
  const u=nearUse();setT(el.prompt,u?(TOUCH?'Tap USE':'[F]')+' Enter '+u.n:P.mode=='air'||P.mode=='veh'?(TOUCH?'USE':'[F]')+' to exit':'');
  el.lock.style.display=P.lock?'block':P.lockC&&P.lockT>0?'block':'none';el.lock.textContent=P.lock?'LOCKED':'LOCKING…';
  setT(el.alt,P.mode=='air'?'ALT '+Math.round(P.air.e.p.y-WORLD.H(P.air.e.p.x,P.air.e.p.z))+' m':'');
  // crosshair spread
  const sp=P.mode=='foot'?w.st.sp*(1-P.ads*.85)*(Math.hypot(P.v.x,P.v.z)>1?1.6:1)*500+P.rec*12:6;el.xh.style.setProperty('--g',(4+sp)+'px');el.xh.style.opacity=P.mode=='foot'&&P.ads>.6?(w.st.z>1.35?0:.4):1;
  this.markers();this.minimap();I.lx=I.ly=0},
 markers(){const L=[];if(G.phase==0)for(const e of ENTS)if(e.k=='tgt'&&e.alive)L.push([e.p,e.hy+2,'◆','#ffd040',e.name]);if(G.boss&&G.boss.alive)L.push([G.boss.p,(G.boss.hy||1)+3,'✖','#ff4040','BOSS']);
  for(const e of ENTS)if(e.spot>0&&e.alive&&e.team=='e')L.push([e.p,2.3,'▼','#ff5050','']);
  if(P.mode=='foot'){if(G.pair&&G.pair.alive&&!G.pair.flying)L.push([G.pair.p,3,'✈','#60c0ff',G.pair.info.n]);if(G.brad&&G.brad.alive)L.push([G.brad.p,3.5,'▣','#60c0ff','Bradley'])}
  const v=V3();let i=0;for(const[p,h,ic,col,lab]of L){v.copy(p);v.y+=h;v.project(cam);const beh=v.z>1;let x=(v.x*.5+.5)*innerWidth,y=(-v.y*.5+.5)*innerHeight;if(beh){x=innerWidth-x;y=innerHeight-20}x=clamp(x,20,innerWidth-20);y=clamp(y,40,innerHeight-20);
   let d=this.mpool[i];if(!d){d=document.createElement('div');d.className='mk';this.el.mk.appendChild(d);this.mpool.push(d)}d.style.display='block';d.style.transform=`translate(${x}px,${y}px)`;d.style.color=col;const dist=Math.round(p.distanceTo(cam.position));setT(d,ic+(lab?' '+lab:'')+' '+dist+'m');i++}
  for(;i<this.mpool.length;i++)this.mpool[i].style.display='none'},
 minimap(){const g=this.mmc,S=120,c=P.mode=='air'?P.air.e.p:P.mode=='veh'?P.veh.p:P.mode=='drone'?P.dr.p:P.p,sc=S/2/90,yaw=P.mode=='air'?P.air.yaw:P.mode=='veh'?P.veh.ty:P.mode=='drone'?P.dr.yaw:P.yaw;
  g.clearRect(0,0,S,S);g.fillStyle='rgba(10,14,20,.55)';g.beginPath();g.arc(S/2,S/2,S/2,0,6.283);g.fill();g.save();g.translate(S/2,S/2);g.rotate(yaw);
  const dot=(p,col,r)=>{const x=(p.x-c.x)*sc,y=(p.z-c.z)*sc;if(x*x+y*y>S*S/4)return;g.fillStyle=col;g.fillRect(x-r,y-r,r*2,r*2)};
  for(const e of ENTS){if(!e.alive)continue;if(e.k=='tgt')dot(e.p,'#ffd040',3.5);else if(e.k=='boss')dot(e.p,'#ff3030',5);else if(e.team=='e'&&(e.spot>0||e.air||(e.los&&e.alert&&e.cool<.3)))dot(e.p,'#ff5050',2.2);else if(e.team=='p'||e.team=='a')dot(e.p,'#60c0ff',e.team=='a'?2.2:3)}
  g.restore();g.fillStyle='#fff';g.beginPath();g.moveTo(S/2,S/2-6);g.lineTo(S/2-4,S/2+4);g.lineTo(S/2+4,S/2+4);g.fill()},
 // ---- input polling (keyboard state, gamepad) ----
 poll(dt){let mx=0,my=0;if(KEYS.has('KeyW'))my+=1;if(KEYS.has('KeyS'))my-=1;if(KEYS.has('KeyD'))mx+=1;if(KEYS.has('KeyA'))mx-=1;
  if(KEYS.has('ArrowLeft')&&G.mode=='play')I.lx-=600*dt;if(KEYS.has('ArrowRight')&&G.mode=='play')I.lx+=600*dt;if(KEYS.has('ArrowUp')&&G.mode=='play')I.ly-=400*dt;if(KEYS.has('ArrowDown')&&G.mode=='play')I.ly+=400*dt;
  if(STICK.id!=null){mx+=STICK.x;my-=STICK.y}I.fire=KEYS.has('mouse0')||KEYS.has('KeyJ')||!!LOOK.fire;I.ads=KEYS.has('mouse2')||KEYS.has('KeyK')||!!LOOK.ads;I.jump=KEYS.has('Space')||!!LOOK.jump;I.crouch=KEYS.has('KeyC')||KEYS.has('ControlLeft')||!!LOOK.crouch;I.sprint=KEYS.has('ShiftLeft')||STICK.y<-.92;
  const gp=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g):null;if(gp){const dz=v=>Math.abs(v)<.18?0:v;const b=i=>gp.buttons[i]&&gp.buttons[i].pressed;this.gpPrev=this.gpPrev||[];
   const edge=i=>b(i)&&!this.gpPrev[i];if(G.mode=='play'){mx+=dz(gp.axes[0]);my-=dz(gp.axes[1]);I.lx+=dz(gp.axes[2])*dt*900*Math.abs(dz(gp.axes[2]));I.ly+=dz(gp.axes[3])*dt*700*Math.abs(dz(gp.axes[3]));
    if(b(7)){I.fire=true;if(edge(7)){press('fire1');press('firePress')}}if(b(6))I.ads=true;if(b(0))I.jump=true;if(edge(0))press('jump');if(edge(1))press('crouch');if(b(1))I.crouch=true;if(edge(2))press('reload');if(edge(3))press('swap');if(edge(5))press('gren');if(edge(4))press('gadget');if(edge(12))press('use');if(edge(13))press('med');if(edge(15))press('tact');if(edge(9))press('pause');if(b(10))I.sprint=true}
   else if(G.mode!='play'){const ay=dz(gp.axes[1]);if(edge(12)||edge(14)||(ay<-.5&&!this.gpAy))this.nav(-1);if(edge(13)||edge(15)||(ay>.5&&!this.gpAy))this.nav(1);this.gpAy=Math.abs(ay)>.5;if(edge(0))this.clickF();if(edge(1))this.back();if(edge(9)&&G.mode=='pause')this.act('resume')}
   this.gpPrev=gp.buttons.map(x=>x.pressed)}
  const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}I.mx=mx;I.my=my},
 nav(d){const n=document.querySelectorAll('#menu .b').length;if(!n)return;this.focus=(this.focus+d+n)%n;this.hl()},clickF(){const b=document.querySelectorAll('#menu .b')[this.focus];if(b)b.click()}};
function modTxt(a){const m=a.m,o=[];const nm={d:'Dmg',rof:'RoF',sp:'Spread',rec:'Recoil',rng:'Range',mob:'Mobility',ads:'ADS time',mag:'Mag',rel:'Reload'};for(const k in m){if(k=='q'){o.push('Suppressed');continue}if(k=='mel'){o.push('Melee');continue}const p=Math.round((m[k]-1)*100);o.push(`${nm[k]||k} ${p>0?'+':''}${p}%`)}if(a.z&&a.z>1.3)o.push(a.z+'x');if(a.gl)o.push('40mm GL');return o.join(' · ')||'—'}
// ---- keyboard & mouse ----
function lockPtr(){if(!TOUCH&&G.mode=='play'&&document.pointerLockElement==null&&!QS.has('test')){try{const r=$('#c').requestPointerLock();r&&r.catch&&r.catch(()=>{})}catch(e){}}}
const KMAP={KeyR:'reload',KeyQ:'swap',Digit1:'w0',Digit2:'w1',Digit3:'w2',KeyG:'gren',KeyT:'tact',KeyE:'gadget',KeyF:'use',KeyH:'med',Space:'jump',KeyC:'crouch',ControlLeft:'crouch',Escape:'pause',KeyP:'pause'};
addEventListener('keydown',e=>{audioInit();if(G.mode!='play'){if(e.code=='ArrowDown'||e.code=='ArrowRight'||e.code=='Tab'){UI.nav(1);e.preventDefault()}else if(e.code=='ArrowUp'||e.code=='ArrowLeft'){UI.nav(-1);e.preventDefault()}else if(e.code=='Enter'||e.code=='Space')UI.clickF();else if(e.code=='Escape'||e.code=='Backspace')UI.back();return}
 if(e.repeat)return;KEYS.add(e.code);if(KMAP[e.code])press(KMAP[e.code]);if(e.code=='KeyJ'){press('fire1');press('firePress')}if(e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>KEYS.delete(e.code));
addEventListener('mousedown',e=>{if(TOUCH&&e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents)return;if(G.mode!='play'||e.target.id!='c')return;if(!document.pointerLockElement&&!QS.has('test')){lockPtr();return}KEYS.add('mouse'+e.button);if(e.button==0){press('fire1');press('firePress')}});
addEventListener('mouseup',e=>KEYS.delete('mouse'+e.button));addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(document.pointerLockElement){I.lx+=e.movementX;I.ly+=e.movementY}});
addEventListener('wheel',e=>{if(G.mode=='play')press('swap')},{passive:true});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&G.mode=='play'&&!TOUCH&&!QS.has('test'))UI.pause()});
// ---- touch ----
function initTouch(){const t=$('#touch');const opts={passive:false};const btns=[...t.querySelectorAll('[data-k]')];
 t.addEventListener('touchstart',ev=>{ev.preventDefault();audioInit();for(const c of ev.changedTouches){const el=document.elementFromPoint(c.clientX,c.clientY);const b=el&&el.closest('[data-k]');
  if(b){const k=b.dataset.k;b.classList.add('dn');LOOK[c.identifier]={k,x:c.clientX,y:c.clientY,b};if(k=='fire'){LOOK.fire=1;press('fire1');press('firePress')}else if(k=='ads'){LOOK.ads=LOOK.ads?0:1;if(P.mode!='foot')LOOK.ads=1}else if(k=='jump'){LOOK.jump=1;press('jump')}else if(k=='crouch'){if(P.mode=='foot')press('crouch');else LOOK.crouch=1}else press(k);continue}
  if(c.clientX<innerWidth*.4&&STICK.id==null){STICK.id=c.identifier;STICK.ox=c.clientX;STICK.oy=c.clientY;STICK.x=STICK.y=0;const s=$('#stick');s.style.display='block';s.style.left=c.clientX-60+'px';s.style.top=c.clientY-60+'px';$('#knob').style.transform='translate(0,0)'}
  else LOOK[c.identifier]={k:'look',x:c.clientX,y:c.clientY}}},opts);
 t.addEventListener('touchmove',ev=>{ev.preventDefault();for(const c of ev.changedTouches){if(c.identifier===STICK.id){let dx=(c.clientX-STICK.ox)/50,dy=(c.clientY-STICK.oy)/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}STICK.x=dx;STICK.y=dy;$('#knob').style.transform=`translate(${dx*42}px,${dy*42}px)`;continue}
  const L=LOOK[c.identifier];if(L&&(L.k=='look'||L.k=='fire'||L.k=='ads')){const s=1.6;I.lx+=(c.clientX-L.x)*s;I.ly+=(c.clientY-L.y)*s;L.x=c.clientX;L.y=c.clientY}}},opts);
 const end=ev=>{ev.preventDefault();for(const c of ev.changedTouches){if(c.identifier===STICK.id){STICK.id=null;STICK.x=STICK.y=0;$('#stick').style.display='none';continue}const L=LOOK[c.identifier];if(L){if(L.b)L.b.classList.remove('dn');if(L.k=='fire')LOOK.fire=0;if(L.k=='jump')LOOK.jump=0;if(L.k=='crouch')LOOK.crouch=0;if(L.k=='ads'&&P.mode!='foot')LOOK.ads=0;delete LOOK[c.identifier]}}};
 t.addEventListener('touchend',end,opts);t.addEventListener('touchcancel',end,opts);document.addEventListener('gesturestart',e=>e.preventDefault())}
// ---- boot ----
window.addEventListener('load',()=>{if(TOUCH)document.body.classList.add('touch');loadLO();GLOW=glowTex();SMK=smokeTex();initRender();SHOW.init();UI.initHUD();initTouch();UI.show('title');requestAnimationFrame(frame);
 if('serviceWorker' in navigator&&!QS.has('nosw'))navigator.serviceWorker.register('sw.js').catch(()=>{})});
// ---- test hooks ----
window.AOE={G,P,I,ERAS,LO,UI,get ENTS(){return ENTS},start:(e,m)=>startMission(e,m),god:()=>G.god=1,
 toBoss(){G.kills=G.mission.kill;for(const e of ENTS)if(e.k=='tgt'&&e.alive)kill(e)},
 face(ent){const t=ent.p.clone();t.y+=(ent.hy||1);const d=t.sub(eyePos());P.yaw=Math.atan2(-d.x,-d.z);P.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z))},
 nearEnemy(dist=14){const e=ENTS.find(x=>x.k=='sol'&&x.alive);if(!e)return;e.p.set(P.p.x+Math.sin(P.yaw+.15)*-dist,0,P.p.z-Math.cos(P.yaw+.15)*dist);pushOut(e.p,.4,1.8);e.p.y=groundAt(e.p.x,e.p.z);e.alert=1;this.face(e);return e},
 nearBoss(d=38){const b=G.boss;if(!b)return;let a=Math.atan2(P.p.z-b.p.z,P.p.x-b.p.x);for(let k=0;k<24;k++){P.p.set(b.p.x+Math.cos(a)*d,0,b.p.z+Math.sin(a)*d);P.p.y=groundAt(P.p.x,P.p.z);pushOut(P.p,.4,1.6);const c=b.p.clone();c.y+=(b.hy||1);if(sees(eyePos(),c))break;a+=.5}this.face(b)},
 enterAir:()=>enterAir(G.pair),enterVeh:()=>G.brad&&enterVeh(G.brad),drone:k=>deployDrone(k||'fpv'),setLo:(o)=>{Object.assign(LO[G.era.id],o)},setAtt:(w,c,v)=>{const lo=LO[G.era.id];lo.att[w]=lo.att[w]||{};lo.att[w][c]=v},
 era:i=>{UI.selEra=i;G.era=ERAS[i]},press,setTier,QUAL,cam:()=>cam,scene:()=>scene,WORLD,mp:(id,e)=>MP.start(id,e==null?2:e),MP,info:()=>({calls:G.calls,tris:G.tris,tier:QUAL.tier,ents:ENTS.length})};
