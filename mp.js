'use strict';
// ===== Multiplayer modes (offline vs AI bots). Netcode-ready: all mode rules live in MP, all player input goes through I,
// and MP.snapshot()/MP.applySnapshot() serialise the authoritative state so a real transport (WebSocket/WebRTC) can be plugged into NET later.
const NET={transport:null,connected:false,connect(url){/* future: open WebSocket, send inputs, receive snapshots */return Promise.reject(new Error('Online play not available yet — offline bots only'))},send(msg){if(this.transport)this.transport.send(JSON.stringify(msg))}};
const ALLY_UNI={ww2:{body:0x6b6a48,pants:0x5a5a40,helm:0x515a3a,helmT:'ssh',skin:0xd2a684,gear:0x4a4030},cold:{body:0x4a5a3a,pants:0x3e4c32,helm:0x485838,helmT:'mod',skin:0xd2a684,gear:0x3a3a2a},
 modern:{body:0x6a6e58,pants:0x5e624e,helm:0x5a5e4a,helmT:'mod',skin:0xd2a684,gear:0x3e4234},future:{body:0xc8ccd2,pants:0x9aa0a8,helm:0xd0d4da,helmT:'visor',skin:0x1e1e22,gear:0x2a4a8a,emit:0x40a0ff},space:{body:0xe0e4ea,pants:0xb0b6be,helm:0xeef0f4,helmT:'visor',skin:0x1e1e22,gear:0x2a4a8a,emit:0x40a0ff}};
const MODES=[
 {id:'tdm',n:'Team Deathmatch',d:'6v6. First team to 40 kills.',size:'6v6'},
 {id:'ffa',n:'Free-for-All',d:'12 players, everyone for themselves. First to 20 kills.',size:'12 FFA'},
 {id:'snd',n:'Search & Destroy',d:'6v6, no respawns. Plant the charge at site A (hold USE) or wipe the enemy team. First to 3 rounds.',size:'6v6'},
 {id:'ctf',n:'Capture the Flag',d:'6v6. Grab the enemy flag and bring it to your base. First to 3 captures.',size:'6v6'},
 {id:'inf',n:'Infected',d:'Survivors vs the infected. Killed survivors turn. Survive 150 s.',size:'6 + infected'},
 {id:'btb',n:'Big Team Battle',d:'63v63 with land, air and sea vehicles. 150 tickets per team. Far battles are simulated.',size:'63v63'},
 {id:'dog',n:'Dogfight',d:'20v20 aircraft only. First team to 30 kills.',size:'20v20'},
 {id:'veh',n:'Armor Battle',d:'20v20 tanks & IFVs (Bradley in Modern). First team to 25 kills.',size:'20v20'},
 {id:'br',n:'Battle Royale',d:'120 players, shrinking zone, loot crates. Be the last one standing.',size:'120'}];
const MP={pDead:false,
 start(modeId,ei){audioInit();clearMission();const md=MODES.find(m=>m.id==modeId);G.ei=ei;G.era=ERAS[ei];G.mi=0;
  const mis={n:md.n,brief:md.d,time:'day',kill:0,tgt:{n:0,t:'',name:''},boss:{n:''},water:modeId=='btb'};if(G.era.id=='space')mis.time='space';G.mission=mis;
  G.t=0;G.phase=0;G.kills=0;G.score=0;G.shots=0;G.hits=0;G.boss=null;G.loud=0;G.lives=99;G.pair=null;G.brad=null;
  buildWorld(scene,G.era,mis,0);setTier(QUAL.tier,1);vmScene.userData.dl.color.copy(WORLD.sun.color);
  const tier=QUAL.tier;this.m={id:modeId,md,sc:{p:0,e:0},t:0,round:1,vb:[],cap:[8,12,16,16][tier],deaths:0,events:[]};G.mp=this.m;this.pDead=false;
  P.v.set(0,0,0);P.mode='foot';P.veh=null;P.air=null;P.ads=0;P.crouch=0;P.chute=0;P.shield=0;vmRoot.visible=true;equipLoadout();P.hp=100;
  this.baseA=new T.Vector3(0,0,112);this.baseB=new T.Vector3(0,0,-112);this.placeP(this.baseA);
  this['init_'+modeId]();G.mode='play';UI.show(null);UI.mode();UI.brief(G.era,{n:md.n,brief:md.d})},
 placeP(b){P.p.set(b.x+rnd(-6,6),0,b.z+rnd(-4,4));pushOut(P.p,.4,1.6);P.p.y=groundAt(P.p.x,P.p.z);P.yaw=b.z>0?0:Math.PI;P.pitch=0},
 bot(team,fac,pos,x={}){const s=spawnSoldier(false,{pos,uni:team=='a'?ALLY_UNI[G.era.id]:x.uni,x:Object.assign({team,fac,alert:0},x)});s.team=team;s.fac=fac;s.losT=0;return s},
 baseOf(team){return team=='a'?this.baseA:this.baseB},
 spawnAt(team){const b=this.baseOf(team);return new T.Vector3(b.x+rnd(-30,30),0,b.z+(team=='a'?rnd(-8,4):rnd(-4,8)))},
 // ---- target choice shared by all bots ----
 pick(e,range=130){let best=null,bd=range*range;if(e.fac!=='p'&&!this.pDead&&G.mode=='play'){const tp=targetPos(),d=(tp.x-e.p.x)**2+(tp.z-e.p.z)**2;if(d<bd){bd=d;best={pl:1}}}
  for(const o of ENTS){if(!o.alive||o===e||o.fac==null||o.fac===e.fac||o.team=='p')continue;if(o.k!='sol'&&o.k!='tank'&&o.k!='boat'&&o.k!='air')continue;if(e.k=='sol'&&o.k=='air')continue;if(e.k=='air'&&!e.gr&&o.k!='air')continue;
   const d=(o.p.x-e.p.x)**2+(o.p.z-e.p.z)**2;if(d<bd){bd=d;best={ent:o}}}return best},
 botShot(e,from,t){const to=tmp.copy(t.p);to.y+=t.k=='sol'?1.3:(t.hy||1);const d=from.distanceTo(to);const hit=Math.random()<e.acc*(1-d/140)*(t.k=='sol'?1:.8);if(!hit)to.add(new T.Vector3(rnd(-1.5,1.5),rnd(-1,1),rnd(-1.5,1.5)));
  tracer(from,to.clone(),e.team=='a'?0xa0d0ff:(G.era.id=='space'||G.era.id=='future'?0xff4030:0xffd070));if(Math.random()<.3)sfx('shot',.25,P.p.distanceTo(from));if(hit)this.botHit(e,t,e.dmg*(t.k=='sol'?1:(t.ba??.2)))},
 botHit(e,t,d){if(!t.alive)return;t.hp-=d;if(t.hp<=0){t.alive=false;t.dieT=0;this.onKill(t,e.fac)}},
 onKill(v,by,head){const m=this.m;if(!m)return;const byP=by==='p'||by==='a';const pkill=by==='p';
  if(v.k=='sol'||v.k=='tank'||v.k=='air'||v.k=='boat'){if(v.k!='sol'&&v.k!='boat'||v.k=='boat')explode(v.p.clone().add(new T.Vector3(0,1,0)),v.k=='air'?6:5,0,'p');if(v.k=='air')v.mpFall=1}
  if(pkill){G.kills++;G.score+=100;UI.hitMark();UI.feed((head?'Headshot · ':'')+'Eliminated '+(v.name||'enemy')+' +100')}
  if(v.vb){v.vb.alive=false;v.vb.ent=null;v.vb.dt=G.t}
  const f=this['kill_'+m.id];if(f)f.call(this,v,by)},
 playerDown(){const m=this.m;m.deaths++;UI.toast('You were eliminated');if(P.mode=='drone')endDrone();if(P.mode=='veh')exitVeh();if(P.mode=='air'){P.air.e.alive=false;P.air.e.o.visible=false;P.mode='foot';P.air=null;vmRoot.visible=true;UI.mode()}
  const f=this['pdown_'+m.id];if(f&&f.call(this)===false)return;this.pDead=true;P.hp=100;this.respT=3;P.p.y=-50},
 respawnPlayer(){this.pDead=false;P.hp=100;P.armor=LO[G.era.id].armor?50:0;this.placeP(this.baseA);P.v.set(0,0,0);if(this.m.id=='dog')this.playerPlane();if(this.m.id=='veh')this.playerTank()},
 step(dt){const m=this.m;m.t+=dt;if(this.pDead){P.v.set(0,0,0);this.respT-=dt;if(this.respT<=0&&this.m.respawn!==false)this.respawnPlayer()}
  G.loud=Math.max(0,G.loud-dt);const f=this['step_'+m.id];if(f)f.call(this,dt);this.respawnBots(dt);if(m.vb.length)this.simVirtual(dt)},
 end(win,txt){if(G.mode!='play')return;this.m.result=txt;missionEnd(win)},
 // ---- team respawn for instantiated-bot modes ----
 respawnBots(dt){const m=this.m;if(m.respawn===false||m.vb.length)return;m.rq=m.rq||[];for(let i=m.rq.length-1;i>=0;i--){const r=m.rq[i];r.t-=dt;if(r.t<=0){m.rq.splice(i,1);r.fn()}}},
 queue(fn,t=4){(this.m.rq=this.m.rq||[]).push({fn,t})},
 hudText(){const m=this.m,sc=m.sc;const id=m.id;
  if(id=='ffa'){const top=Math.max(0,...Object.values(m.ffa||{}));return `FREE-FOR-ALL · first to 20\nYou ${G.kills} · best bot ${top}`}
  if(id=='br'){return `BATTLE ROYALE\nAlive ${m.alive} / 120 · zone ${Math.round(m.zr)} m${m.zr>m.zt+1?' (shrinking)':''}\nKills ${G.kills}`}
  if(id=='inf'){return `INFECTED · survive ${Math.max(0,Math.ceil(150-m.t))} s\nSurvivors ${1+ENTS.filter(e=>e.alive&&e.team=='a').length} · Infected ${ENTS.filter(e=>e.alive&&e.melee).length}`}
  if(id=='snd')return `SEARCH & DESTROY · round ${m.round}\nUs ${sc.p} – ${sc.e} Them · ${m.bomb?'CHARGE PLANTED '+Math.ceil(m.bomb)+'s':m.plantT>0?'Planting… '+Math.round(m.plantT/3*100)+'%':'Plant at site A or eliminate all'}\nAlive: us ${(this.pDead?0:1)+ENTS.filter(e=>e.alive&&e.team=='a').length} · them ${ENTS.filter(e=>e.alive&&e.team=='e'&&e.k=='sol').length}`;
  if(id=='btb')return `BIG TEAM BATTLE 63v63\nTickets: us ${m.tk.a} – ${m.tk.e} them\nSoldiers alive: ${m.vb.filter(v=>v.alive&&v.team=='a').length+1} vs ${m.vb.filter(v=>v.alive&&v.team=='e').length} (${ENTS.filter(e=>e.k=='sol'&&e.alive).length} rendered)`;
  const lim={tdm:40,ctf:3,dog:30,veh:25}[id];return `${m.md.n.toUpperCase()} · ${m.md.size}\nUs ${sc.p} – ${sc.e} Them (to ${lim})${m.sizeNote?'\n'+m.sizeNote:''}`},
 // ===== TDM =====
 init_tdm(){for(let i=0;i<5;i++)this.bot('a','p',this.spawnAt('a'));for(let i=0;i<6;i++)this.bot('e','e',this.spawnAt('e'))},
 kill_tdm(v,by){if(v.k!='sol')return;if(v.team=='e')this.m.sc.p++;else this.m.sc.e++;const team=v.team;this.queue(()=>this.bot(team,team=='a'?'p':'e',this.spawnAt(team)))},
 pdown_tdm(){this.m.sc.e++},
 step_tdm(){const s=this.m.sc;if(s.p>=40)this.end(true);if(s.e>=40)this.end(false);this.objTo('a',this.baseB,'e',this.baseA)},
 objTo(ta,pa,tb,pb){if(Math.random()>.02)return;for(const e of ENTS)if(e.k=='sol'&&e.alive&&!e.tg&&!e.obj){const p=e.team==ta?pa:pb;e.obj=new T.Vector3(p.x+rnd(-50,50),0,p.z*rnd(.2,1))}},
 // ===== FFA =====
 init_ffa(){this.m.ffa={};for(let i=0;i<11;i++){const a=i/11*6.283;const fac='b'+i;this.m.ffa[fac]=0;this.bot('e',fac,new T.Vector3(Math.cos(a)*90,0,Math.sin(a)*90),{name:'Bot '+(i+1)})}},
 kill_ffa(v,by){if(v.k!='sol')return;if(by!=='p'&&this.m.ffa[by]!=null)this.m.ffa[by]++;const fac=v.fac;this.queue(()=>{const a=Math.random()*6.283;this.bot('e',fac,new T.Vector3(Math.cos(a)*100,0,Math.sin(a)*100),{name:v.name})})},
 pdown_ffa(){},
 step_ffa(){if(G.kills>=20)this.end(true);if(Object.values(this.m.ffa).some(v=>v>=20))this.end(false);if(Math.random()<.02)for(const e of ENTS)if(e.k=='sol'&&e.alive&&!e.tg&&!e.obj)e.obj=new T.Vector3(rnd(-100,100),0,rnd(-100,100))},
 // ===== Search & Destroy =====
 init_snd(){const m=this.m;m.respawn=false;m.site=new T.Vector3(WORLD.spots[0]?WORLD.spots[0][0]:0,0,-70);m.site.y=WORLD.H(m.site.x,m.site.z);
  const o=new T.Group();box(o,sm(0xd04020,.6),0,.6,0,2.4,1.2,2.4);box(o,sm(0xffffff,.4,0,{emissive:0xff4020,emissiveIntensity:1}),0,1.3,0,.6,.2,.6);o.position.copy(m.site);scene.add(o);m.siteO=o;this.round()},
 round(){const m=this.m;for(const e of ENTS.filter(e=>e.k=='sol')){scene.remove(e.o)}ENTS=ENTS.filter(e=>e.k!='sol');m.bomb=0;m.plantT=0;m.rt=120;this.pDead=false;P.hp=100;this.placeP(this.baseA);
  for(let i=0;i<5;i++)this.bot('a','p',this.spawnAt('a'));for(let i=0;i<6;i++){const s=this.bot('e','e',new T.Vector3(m.site.x+rnd(-25,25),0,m.site.z+rnd(-25,15)));s.home=m.site}UI.toast('Round '+m.round+' — attack site A')},
 pdown_snd(){return},
 roundEnd(win,why){const m=this.m;if(win)m.sc.p++;else m.sc.e++;UI.toast((win?'Round won':'Round lost')+' — '+why);m.round++;if(m.sc.p>=3)return this.end(true);if(m.sc.e>=3)return this.end(false);m.pause=3},
 step_snd(dt){const m=this.m;if(m.pause>0){m.pause-=dt;if(m.pause<=0)this.round();return}m.rt-=dt;
  const ea=ENTS.filter(e=>e.k=='sol'&&e.alive&&e.team=='e'),aa=ENTS.filter(e=>e.k=='sol'&&e.alive&&e.team=='a');
  if(!ea.length&&!m.bomb)return this.roundEnd(true,'enemy eliminated');if(this.pDead&&!aa.length)return this.roundEnd(false,'team eliminated');
  if(m.bomb){m.bomb-=dt;const df=ea.find(e=>e.p.distanceTo(m.site)<3);if(df){m.def=(m.def||0)+dt;if(m.def>5)return this.roundEnd(false,'charge defused')}else m.def=0;if(m.bomb<=0){explode(m.site.clone().add(new T.Vector3(0,1,0)),14,300,'p');return this.roundEnd(true,'target destroyed')}
   if(Math.random()<.03)for(const e of ea)e.obj=m.site.clone()}
  else{if(m.rt<=0)return this.roundEnd(false,'time expired');if(!this.pDead&&P.mode=='foot'&&P.p.distanceTo(m.site)<3.2&&(I.pr.has('use')||KEYS.has('KeyF')||m.plantT>0&&(KEYS.has('KeyF')||LOOK.use))){m.plantT+=dt;I.pr.delete('use');if(m.plantT>=3){m.bomb=30;UI.toast('Charge planted! Defend the site (30 s)')}}else m.plantT=Math.max(0,m.plantT-dt*.5);
   if(Math.random()<.02)for(const e of aa)if(!e.tg)e.obj=m.site.clone()}},
 // ===== CTF =====
 init_ctf(){const m=this.m;m.flags={};for(const t of['a','e']){const b=this.baseOf(t).clone();b.y=WORLD.H(b.x,b.z);const o=new T.Group();cyl(o,sm(0xcccccc,.4,.6),0,1.6,0,.05,3.2,'y');box(o,sm(t=='a'?0x2060ff:0xff3020,.6,0,{emissive:t=='a'?0x1030a0:0xa01010,emissiveIntensity:.6}),.5,2.8,0,1,.6,.04);o.position.copy(b);
   const f=addEnt({k:'flag',team:'p',fac:null,o,p:b.clone(),home:b.clone(),side:t,hits:[],carrier:null});m.flags[t]=f}
  for(let i=0;i<5;i++)this.bot('a','p',this.spawnAt('a'));for(let i=0;i<6;i++)this.bot('e','e',this.spawnAt('e'))},
 stepFlag(f,dt){const m=this.m;const c=f.carrier;if(c==='P'){if(this.pDead){f.carrier=null;f.p.copy(f.home);UI.toast('Flag returned')}else f.p.set(P.p.x,P.p.y+.5,P.p.z)}else if(c){if(!c.alive){f.carrier=null;f.p.copy(f.home)}else f.p.set(c.p.x,c.p.y+.5,c.p.z)}
  f.o.position.copy(f.p);f.o.rotation.y+=dt;const enemyFlagOf=f.side=='e';
  if(!c){if(enemyFlagOf&&!this.pDead&&P.p.distanceTo(f.p)<2.2&&P.mode=='foot'){f.carrier='P';UI.toast('You have the enemy flag! Return to base')}
   for(const e of ENTS)if(e.k=='sol'&&e.alive&&e.team!=(f.side=='a'?'a':'e')&&e.p.distanceTo(f.p)<2){f.carrier=e;e.obj=this.baseOf(e.team).clone();UI.toast(e.team=='a'?'Ally has the enemy flag':'Enemy has OUR flag!');break}}
  else{const team=c==='P'?'a':c.team;const home=this.baseOf(team);const pos=c==='P'?P.p:c.p;if(Math.hypot(pos.x-home.x,pos.z-home.z)<5){if(team=='a')m.sc.p++;else m.sc.e++;UI.toast(team=='a'?'FLAG CAPTURED!':'Enemy captured our flag');f.carrier=null;f.p.copy(f.home)}else if(c!=='P'&&Math.random()<.05)c.obj=home.clone()}},
 kill_ctf(v){this.kill_tdm(v);this.m.sc[v.team=='e'?'p':'e']--},
 pdown_ctf(){},
 step_ctf(){const m=this.m;if(m.sc.p>=3)this.end(true);if(m.sc.e>=3)this.end(false);if(Math.random()<.02){const fa=m.flags.e,fb=m.flags.a;const run=(team,f)=>{const r=ENTS.find(e=>e.k=='sol'&&e.alive&&e.team==team&&!e.tg);if(r)r.obj=f.p.clone()};run('a',fa);run('e',fb)}},
 // ===== Infected =====
 init_inf(){for(let i=0;i<5;i++)this.bot('a','p',this.spawnAt('a'));this.infect(this.spawnAt('e'));this.infect(this.spawnAt('e'));this.m.respawn=false},
 infect(pos){const s=this.bot('e','e',pos,{melee:1,hp:120,uni:{body:0x3a4a2a,pants:0x2a3420,helm:0x30402a,helmT:'robot',skin:0x405030,gear:0x203018,emit:0x60ff30},name:'Infected'});s.alert=1;s.cool=0;s.p.y=groundAt(s.p.x,s.p.z);return s},
 kill_inf(v,by){if(v.team=='a'&&v.k=='sol'){const p=v.p.clone();setTimeout(()=>{if(G.mp&&G.mp.id=='inf')this.infect(p)},1500);UI.feed('A survivor was infected')}else if(v.melee)setTimeout(()=>{if(G.mp&&G.mp.id=='inf'&&G.mode=='play')this.infect(this.spawnAt('e'))},4000)},
 pdown_inf(){this.end(false,'infected');return false},
 step_inf(dt){if(this.m.t>=150)this.end(true);for(const e of ENTS)if(e.melee&&e.alive){e.losT=Math.min(e.losT,.2)}},
 // ===== Big Team Battle (virtual bots + LOD) =====
 init_btb(){const m=this.m;m.tk={a:150,e:150};for(let i=0;i<63;i++){if(i<62)m.vb.push(this.vrec('a','p'));m.vb.push(this.vrec('e','e'))}
  spawnPlayerVehicles();const ap=G.pair;if(ap){ap.p.set(20,WORLD.H(20,104)+1.4,104)}if(!G.brad){const bo=buildTank(G.era,'ifv');const bp=new T.Vector3(-12,0,103);bp.y=WORLD.H(bp.x,bp.z);G.brad=addEnt({k:'pveh',team:'p',o:bo,p:bp,hp:900,hits:[[0,1.3,0,2.6,1]],R:3,hy:1.3,yaw:0,ty:0,tp:0,spd:0,tow:2,towT:0});bo.position.copy(bp)}
  // player boat on the coast
  const bp=new T.Vector3(-112,-1.4,80);const bt=buildBoat(0);G.boat=addEnt({k:'pveh',team:'p',o:bt,p:bp,hp:600,hits:[],R:3,hy:1,yaw:0,ty:0,tp:0,spd:0,tow:2,towT:0,boat:1});bt.position.copy(bp);
  for(const t of['a','e']){for(let i=0;i<3;i++)this.tank(t,new T.Vector3(rnd(-60,60),0,t=='a'?90-i*6:-90+i*6));for(let i=0;i<2;i++)this.plane(t);for(let i=0;i<2;i++)this.boat(t,new T.Vector3(-122+i*8,-1.4,t=='a'?60:-60))}
  m.sizeNote='';this.lodT=0},
 vrec(team,fac){const s=this.spawnAt(team);return{team,fac,x:s.x,z:s.z,alive:true,ent:null,hp:80}},
 kill_btb(v){const m=this.m;if(v.team=='e')m.tk.e--;else if(v.team=='a')m.tk.a--},
 pdown_btb(){this.m.tk.a--},
 step_btb(dt){const m=this.m;if(m.tk.e<=0)this.end(true);if(m.tk.a<=0)this.end(false);this.respawnVehicles(dt)},
 respawnVehicles(dt){const m=this.m;m.vt=(m.vt||0)-dt;if(m.vt>0)return;m.vt=15;for(const t of['a','e']){const c=k=>ENTS.filter(e=>e.k==k&&e.alive&&e.team==t).length;if(c('tank')<3)this.tank(t,this.spawnAt(t));if(c('air')<2)this.plane(t);if(m.id=='btb'&&c('boat')<2)this.boat(t,new T.Vector3(-122,-1.4,t=='a'?60:-60))}},
 // virtual-bot simulation: nearest bots become real AI soldiers, far bots are simulated cheaply
 simVirtual(dt){const m=this.m;this.lodT-=dt;if(this.lodT>0)return;this.lodT=1;const pp=this.pDead?this.baseA:P.p;const zone=m.id=='br';
  for(const v of m.vb){if(v.ent){if(v.ent.alive){v.x=v.ent.p.x;v.z=v.ent.p.z}continue}if(!v.alive){if(!zone&&G.t-(v.dt||0)>6&&m.tk[v.team]>0){Object.assign(v,this.vrec(v.team,v.fac))}continue}
   const tgt=zone?new T.Vector3(m.zc.x+rnd(-m.zr*.6,m.zr*.6),0,m.zc.z+rnd(-m.zr*.6,m.zr*.6)):(v.team=='a'?this.baseB:this.baseA);const dx=tgt.x-v.x,dz=tgt.z-v.z,l=Math.hypot(dx,dz)||1;if(l>20){v.x+=dx/l*3;v.z+=dz/l*3}else{v.x+=rnd(-3,3);v.z+=rnd(-3,3)}}
  // far combat (statistical)
  const far=m.vb.filter(v=>v.alive&&!v.ent);for(const v of far){let n=0,k=null;for(const o of m.vb){if(!o.alive||o.fac===v.fac)continue;if(Math.abs(o.x-v.x)<35&&Math.abs(o.z-v.z)<35){n++;k=o}}if(n&&Math.random()<(zone?.006:.025)*Math.min(n,4)){v.alive=false;v.dt=G.t;if(!zone){m.tk[v.team]--}}}
  if(zone)for(const v of far)if(v.alive&&Math.hypot(v.x-m.zc.x,v.z-m.zc.z)>m.zr&&Math.random()<.08){v.alive=false}
  // LOD: instantiate nearest
  const alive=m.vb.filter(v=>v.alive);alive.sort((a,b)=>((a.x-pp.x)**2+(a.z-pp.z)**2)-((b.x-pp.x)**2+(b.z-pp.z)**2));const want=new Set(alive.slice(0,m.cap));
  for(const v of alive){if(v.ent&&!want.has(v)&&((v.x-pp.x)**2+(v.z-pp.z)**2)>110*110){scene.remove(v.ent.o);ENTS.splice(ENTS.indexOf(v.ent),1);v.ent=null}
   else if(!v.ent&&want.has(v)){const s=this.bot(v.team,v.fac,new T.Vector3(v.x,0,v.z),zone?{name:'Player '+(m.vb.indexOf(v)+2)}:{});s.vb=v;s.alert=1;v.ent=s}}
  m.rendered=ENTS.filter(e=>e.k=='sol'&&e.alive).length},
 // ---- vehicles AI ----
 tank(team,pos){const o=buildTank(G.era,G.era.bradley&&Math.random()<.5?'ifv':'mbt');if(team=='a')o.traverse(c=>{if(c.isMesh&&c.material.map)c.material=c.material.clone(),c.material.color.multiplyScalar(.8)});pos.y=WORLD.H(pos.x,pos.z);
  return addEnt({k:'tank',team,fac:team=='a'?'p':'e',o,p:pos,hp:700,hits:[[0,1.2,0,2.4,1],[0,1.2,-2.4,2,1],[0,1.2,2.4,2,1]],R:3.2,hy:1.4,ba:.08,cool:rnd(2,5),yaw:team=='a'?0:Math.PI,name:(team=='a'?'Allied':'Enemy')+' tank'})},
 plane(team,pos){const e=G.era;const o=buildAircraft(team=='a'?e.air.model:e.enemyAir.model,team=='e',e);const a=Math.random()*6.283;const p=pos||new T.Vector3(Math.cos(a)*120,rnd(50,90),(team=='a'?1:-1)*rnd(60,140));
  return addEnt({k:'air',mp:1,air:1,team,fac:team=='a'?'p':'e',o,p,hp:260,hits:[[0,0,0,2,1],[0,0,-3,1.5,1],[0,0,3,1.5,1]],R:3,hy:0,ba:.6,hd:new T.Vector3(rnd(-1,1),0,rnd(-1,1)).normalize(),spd:e.id=='ww2'?45:65,cool:0,gr:this.m.id=='btb'&&Math.random()<.5,name:(team=='a'?'Allied ':'Enemy ')+(team=='a'?e.air.n:e.enemyAir.n)})},
 boat(team,pos){const o=buildBoat(team=='e');return addEnt({k:'boat',team,fac:team=='a'?'p':'e',o,p:pos,hp:380,hits:[[0,1,0,2,1],[0,1,2.5,1.6,1],[0,1,-2.5,1.6,1]],R:3,hy:1,ba:.3,cool:2,yaw:0,ph:Math.random()*6,name:(team=='a'?'Allied':'Enemy')+' patrol boat'})},
 stepVeh(e,dt){if(!e.alive){e.dieT=(e.dieT||0)+dt;if(e.k=='boat'){e.p.y-=dt*.8;e.o.position.copy(e.p)}if(Math.random()<dt*2)sprite(tmp.copy(e.p).add(new T.Vector3(0,3,0)),0x4a4642,3,3,0,UP.clone().multiplyScalar(1.5),2);if(e.dieT>8)return 'rm';return}
  e.losT=(e.losT||0)-dt;if(e.losT<=0){e.losT=.6;e.tg=this.pick(e,170)}const tg=e.tg&&(e.tg.pl||e.tg.ent.alive)?e.tg:null;const tp=tg?(tg.pl?targetPos():tg.ent.p.clone().add(new T.Vector3(0,1.5,0))):(e.team=='a'?this.baseB:this.baseA).clone();
  const d=Math.hypot(tp.x-e.p.x,tp.z-e.p.z);e.cool-=dt;
  if(e.k=='tank'){const hy=Math.atan2(-(tp.x-e.p.x),-(tp.z-e.p.z));e.yaw+=clamp(((hy-e.yaw+Math.PI*3)%(Math.PI*2))-Math.PI,-dt*.6,dt*.6);if(d>(tg?35:8)){e.p.x-=Math.sin(e.yaw)*dt*5;e.p.z-=Math.cos(e.yaw)*dt*5;pushOut(e.p,2.6,2)}
   e.p.y=WORLD.H(e.p.x,e.p.z);e.o.position.copy(e.p);e.o.rotation.y=e.yaw;const tur=e.o.userData.tur;tur.rotation.y=hy-e.yaw;
   if(tg&&e.cool<=0&&d<150){e.cool=rnd(3.5,5.5);const mz=V3();tur.userData.gun.localToWorld(mz.set(0,0,-3));const v=tp.clone().add(new T.Vector3(rnd(-2.5,2.5),0,rnd(-2.5,2.5))).sub(mz);const fl=v.length();v.normalize().multiplyScalar(70);v.y+=fl/70*G.era.grav*.15;spawnProj('shell',mz,v,e.team=='a'?'p':'e',{dmg:e.team=='a'?120:45,rad:5});sprite(mz,0xffc070,3,.2,1);sfx('big',.7,P.p.distanceTo(mz))}}
  else{e.ph+=dt*.3;const goal=tg&&!tg.pl&&tg.ent.k=='boat'?tp:new T.Vector3(-122+Math.sin(e.ph)*12,0,(e.team=='a'?40:-40)+Math.cos(e.ph*.7)*70);const dx=goal.x-e.p.x,dz=goal.z-e.p.z,l=Math.hypot(dx,dz)||1;if(l>20){const nx=e.p.x+dx/l*dt*9,nz=e.p.z+dz/l*dt*9;if(WORLD.H(nx,nz)<-1.8){e.p.x=nx;e.p.z=nz}e.yaw=Math.atan2(-dx,-dz)}
   e.p.y=-1.4+Math.sin(G.t*2+e.ph)*.12;e.o.position.copy(e.p);e.o.rotation.y=e.yaw;e.o.rotation.z=Math.sin(G.t*1.5+e.ph)*.04;if(tg&&e.cool<=0&&d<90){e.cool=.25;e.burst=(e.burst||0)+1;if(e.burst>6){e.burst=0;e.cool=2}const mz=e.p.clone().add(new T.Vector3(0,2.2,0));if(tg.pl)enemyShot(e,mz,6,.3);else this.botShot(Object.assign(e,{acc:.35,dmg:14}),mz,tg.ent)}}},
 stepAir(e,dt){if(!e.alive){if(!e.mpFall)e.mpFall=1;e.p.addScaledVector(e.hd,e.spd*dt);e.p.y-=dt*25;e.o.position.copy(e.p);e.o.rotation.z+=dt*2;if(Math.random()<.5)sprite(e.p,0x302c2a,3,2,0,null,2);if(e.p.y<WORLD.H(e.p.x,e.p.z)){explode(e.p.clone(),8,0,'p');this.m.id!='btb'&&this.m.id!='dog'||0;return 'rm'}return}
  e.losT=(e.losT||0)-dt;if(e.losT<=0){e.losT=.7;e.tg=this.pick(e,400)}const tg=e.tg&&(e.tg.pl||e.tg.ent.alive)?e.tg:null;let goal;
  if(tg){goal=tg.pl?targetPos():tg.ent.p.clone();if(!tg.pl&&tg.ent.k!='air')goal.y+=0}else{const ang=G.t*.2+e.p.x*.01;goal=new T.Vector3(Math.cos(ang)*110,70,Math.sin(ang)*110)}
  const fw=tmp.copy(goal).sub(e.p);const d=fw.length();fw.normalize();const want=fw.clone();if(e.p.y<WORLD.H(e.p.x,e.p.z)+30)want.y=Math.max(want.y,.5);if(d<35&&tg)want.y+=.6;const prev=e.hd.clone();e.hd.lerp(want.normalize(),clamp(dt*1.1,0,1)).normalize();e.p.addScaledVector(e.hd,e.spd*dt);
  e.p.x=clamp(e.p.x,-250,250);e.p.z=clamp(e.p.z,-250,250);e.p.y=Math.min(e.p.y,220);
  e.o.position.copy(e.p);e.o.lookAt(tmp2.copy(e.p).sub(e.hd));const turn=prev.cross(e.hd).y;e.roll=(e.roll||0)*.95+clamp(-turn*40,-1.2,1.2)*.05;e.o.rotateZ(e.roll);e.o.userData.rot.forEach(r=>r&&(r.rotation.z+=dt*40));
  e.cool-=dt;if(tg&&e.cool<=0&&d<170&&fw.dot(e.hd)>.95){e.cool=.18;const mz=e.p.clone().addScaledVector(e.hd,5);if(tg.pl)enemyShot(e,mz,7,.32);else this.botShot(Object.assign(e,{acc:.3,dmg:22}),mz,tg.ent)}},
 // ===== Dogfight =====
 init_dog(){const m=this.m;const n=[8,12,20,20][QUAL.tier];m.n=n;m.sizeNote=`${n}v${n} aircraft (scaled for this device)`;m.n=n;for(let i=0;i<n-1;i++)this.plane('a');for(let i=0;i<n;i++)this.plane('e');this.playerPlane()},
 playerPlane(){const e=G.era;const air=e.air;const o=buildAircraft(air.model,0,e);const p=new T.Vector3(rnd(-30,30),80,120);if(G.pair){scene.remove(G.pair.o);ENTS.splice(ENTS.indexOf(G.pair),1)}
  const pa=addEnt({k:'pair',team:'p',o,p,hp:air.t=='heli'?350:300,info:air.t=='heli'?{id:'f4',n:'Fighter',t:'jet',model:'jet'}:air,home:p.clone(),hits:[],R:5,hy:1});G.pair=pa;enterAir(pa);P.air.yaw=0;P.air.pitch=0;P.air.spd=60},
 kill_dog(v){if(v.k!='air')return;if(v.team=='e')this.m.sc.p++;else this.m.sc.e++;const t=v.team;this.queue(()=>this.plane(t),5)},
 pdown_dog(){this.m.sc.e++},
 step_dog(){const m=this.m;if(m.sc.p>=30)this.end(true);if(m.sc.e>=30)this.end(false);if(P.mode=='foot'&&!this.pDead){this.pDead=true;this.respT=3;P.p.y=-50;m.sc.e++}},
 // ===== Armor battle =====
 init_veh(){const m=this.m;const n=[8,12,20,20][QUAL.tier];m.sizeNote=`${n}v${n} vehicles (scaled for this device)`;for(let i=0;i<n-1;i++)this.tank('a',this.spawnAt('a'));for(let i=0;i<n;i++)this.tank('e',this.spawnAt('e'));this.playerTank()},
 playerTank(){const e=G.era;if(G.brad){scene.remove(G.brad.o);ENTS.splice(ENTS.indexOf(G.brad),1)}const bo=buildTank(e,e.bradley?'ifv':'mbt');const bp=this.spawnAt('a');bp.y=WORLD.H(bp.x,bp.z);
  G.brad=addEnt({k:'pveh',team:'p',o:bo,p:bp,hp:e.bradley?900:1200,hits:[[0,1.3,0,2.6,1]],R:3,hy:1.3,yaw:0,ty:0,tp:0,spd:0,tow:2,towT:0});bo.position.copy(bp);enterVeh(G.brad)},
 kill_veh(v){if(v.k!='tank')return;if(v.team=='e')this.m.sc.p++;else this.m.sc.e++;const t=v.team;this.queue(()=>this.tank(t,this.spawnAt(t)),6)},
 pdown_veh(){this.m.sc.e++},
 step_veh(){const m=this.m;if(m.sc.p>=25)this.end(true);if(m.sc.e>=25)this.end(false);if(P.mode=='foot'&&!this.pDead){this.pDead=true;this.respT=3;P.p.y=-50}},
 // ===== Battle Royale =====
 init_br(){const m=this.m;m.respawn=false;m.zc=new T.Vector3(rnd(-40,40),0,rnd(-40,40));m.zr=150;m.zt=150;m.zs=0;m.alive=120;
  for(let i=0;i<119;i++){const a=Math.random()*6.283,r=rnd(10,140);m.vb.push({team:'e',fac:'r'+i,x:Math.cos(a)*r,z:Math.sin(a)*r,alive:true,ent:null,hp:80})}
  // drop in: player starts with sidearm only
  P.w[0].mag=0;P.w[0].res=0;P.w[2].mag=0;P.w[2].res=0;P.cur=1;setVM();P.armor=0;P.le=0;P.ta=0;P.gad=0;P.med=0;const a=Math.random()*6.283;P.p.set(Math.cos(a)*80,0,Math.sin(a)*80);P.p.y=groundAt(P.p.x,P.p.z);
  m.loot=[];const lm=sm(0x2a6a9a,.5,.3,{emissive:0x103050,emissiveIntensity:.8});for(let i=0;i<45;i++){const x=rnd(-135,135),z=rnd(-135,135);const o=new T.Group();box(o,lm,0,.4,0,1,.8,.7);box(o,sm(0xffc040,.4,0,{emissive:0xffa020,emissiveIntensity:1.5}),0,.82,0,.9,.05,.6);const p=new T.Vector3(x,groundAt(x,z),z);o.position.copy(p);scene.add(o);m.loot.push({o,p})}
  const zm=new T.Mesh(new T.CylinderGeometry(1,1,120,64,1,true),new T.MeshBasicMaterial({color:0x40a0ff,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false}));scene.add(zm);m.zm=zm;UI.toast('Loot the crates (walk over them). Stay inside the blue zone!')},
 kill_br(v){},
 pdown_br(){const m=this.m;this.end(false,'eliminated — placed #'+m.alive);return false},
 step_br(dt){const m=this.m;m.zs+=dt;const phase=Math.floor(m.zs/45);m.zt=Math.max(8,150-phase*28);m.zr+= (m.zt-m.zr)*clamp(dt*.08,0,1);m.zm.position.set(m.zc.x,40,m.zc.z);m.zm.scale.set(m.zr,1,m.zr);
  if(Math.hypot(P.p.x-m.zc.x,P.p.z-m.zc.z)>m.zr&&!this.pDead){m.zd=(m.zd||0)+dt;if(m.zd>1){m.zd=0;hurtPlayer(6+phase*2);UI.toast('Outside the zone!')}}
  for(let i=m.loot.length-1;i>=0;i--){const l=m.loot[i];l.o.rotation.y+=dt;if(P.mode=='foot'&&P.p.distanceTo(l.p)<1.8){scene.remove(l.o);m.loot.splice(i,1);this.lootPick()}}
  for(const e of ENTS)if(e.k=='sol'&&e.alive&&!e.tg&&(!e.obj||Math.random()<.01))e.obj=new T.Vector3(m.zc.x+rnd(-m.zr*.5,m.zr*.5),0,m.zc.z+rnd(-m.zr*.5,m.zr*.5));
  m.alive=1+m.vb.filter(v=>v.alive).length;if(m.alive<=1)this.end(true,'WINNER — last one standing')},
 lootPick(){const e=G.era,r=Math.random();if(r<.35){const w=e.prim[Math.random()*e.prim.length|0];P.w[0]=mkWeapon(w,{});P.cur=0;setVM();UI.toast('Picked up '+w.n)}else if(r<.5){const w=e.lau[0];P.w[2]=mkWeapon(w,{});UI.toast('Picked up '+w.n)}
  else if(r<.65){P.armor=Math.min(100,P.armor+50);UI.toast('Armor +50')}else if(r<.8){P.med++;P.le++;UI.toast('Medkit + grenade')}else{for(const w of P.w)w.res+=w.st.mag*2;P.gad++;UI.toast('Ammo + '+P.gadT.n)}},
 // ===== netcode-ready state (de)serialisation =====
 snapshot(){return{t:G.t,mode:this.m&&this.m.id,sc:this.m&&this.m.sc,player:{p:P.p.toArray(),yaw:P.yaw,pitch:P.pitch,hp:P.hp,mode:P.mode},ents:ENTS.filter(e=>e.k!='tgt').map((e,i)=>({i,k:e.k,team:e.team,fac:e.fac,p:e.p.toArray().map(v=>+v.toFixed(2)),yaw:+(e.yaw||0).toFixed(3),hp:Math.round(e.hp),alive:e.alive}))}},
 applySnapshot(s){/* future: reconcile remote entity states (interpolate positions, apply hp/alive) */}};
function buildBoat(enemy){const g=new T.Group(),M=sm(enemy?0x5a5e64:0x6a7058,.6,.3),D=sm(0x222428,.6,.4);box(g,M,0,.6,0,3,1.2,9);const bow=new T.Mesh(CONEG,M);bow.scale.set(3.4,3,1.2);bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.position.set(0,.6,-5.6);g.add(bow);box(g,M,0,1.8,1,2.2,1.4,3);box(g,sm(0x203040,.1,.4),0,2.1,-.55,2,.6,.05);
 const tur=new T.Group();tur.position.set(0,2.6,-2.6);g.add(tur);box(tur,D,0,.2,0,.8,.4,.8);const gun=new T.Group();gun.position.set(0,.3,-.3);tur.add(gun);cyl(gun,D,0,0,-.8,.06,1.6);tur.userData.gun=gun;g.userData.tur=tur;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
